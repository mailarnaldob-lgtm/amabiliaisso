<?php
/**
 * AMABILIA NETWORK - Task Operations API
 * ========================================
 * Handles task listing and submission operations.
 * 
 * Actions:
 * - GET_TASKS: List active tasks
 * - GET_SUBMISSIONS: Get user's task submissions
 * - SUBMIT_TASK: Submit task proof
 * - APPROVE_TASK: Admin approve submission (with royalty)
 * - REJECT_TASK: Admin reject submission
 * 
 * Upload this file to: /api/task-operations.php on Hostinger
 */

define('AMABILIA_API', true);

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';

handleCors();

try {
    $body = getJsonBody();
    $action = $body['action'] ?? $_GET['action'] ?? '';

    $pdo = getDbConnection();

    switch (strtoupper($action)) {
        case 'GET_TASKS':
            getTasks($pdo, $body);
            break;
            
        case 'GET_SUBMISSIONS':
            getSubmissions($pdo, $body);
            break;
            
        case 'SUBMIT_TASK':
            submitTask($pdo, $body);
            break;
            
        case 'APPROVE_TASK':
            approveTask($pdo, $body);
            break;
            
        case 'REJECT_TASK':
            rejectTask($pdo, $body);
            break;
            
        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    error_log('Task API Error: ' . $e->getMessage());
    sendError('Server error', 500);
}

/**
 * Get active tasks
 */
function getTasks(PDO $pdo, array $data): void {
    $stmt = $pdo->prepare('
        SELECT id, title, description, category, reward, required_level, proof_type, created_at
        FROM tasks 
        WHERE is_active = 1
        ORDER BY created_at DESC
    ');
    $stmt->execute();
    $tasks = $stmt->fetchAll();

    foreach ($tasks as &$task) {
        $task['reward'] = (float) $task['reward'];
    }

    sendSuccess(['tasks' => $tasks]);
}

/**
 * Get user's task submissions
 */
function getSubmissions(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id']);

    $userId = $data['user_id'];

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    $stmt = $pdo->prepare('
        SELECT 
            ts.id, ts.task_id, ts.status, ts.proof_type, ts.proof_url,
            ts.reward_amount, ts.rejection_reason, ts.submitted_at, ts.reviewed_at,
            t.title as task_title, t.reward as task_reward
        FROM task_submissions ts
        JOIN tasks t ON ts.task_id = t.id
        WHERE ts.user_id = ?
        ORDER BY ts.submitted_at DESC
    ');
    $stmt->execute([$userId]);
    $submissions = $stmt->fetchAll();

    foreach ($submissions as &$sub) {
        $sub['reward_amount'] = $sub['reward_amount'] ? (float) $sub['reward_amount'] : null;
        $sub['task_reward'] = (float) $sub['task_reward'];
    }

    sendSuccess(['submissions' => $submissions]);
}

/**
 * Submit task proof
 */
function submitTask(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'task_id', 'proof_type']);

    $userId = $data['user_id'];
    $taskId = $data['task_id'];
    $proofType = $data['proof_type'];
    $proofUrl = $data['proof_url'] ?? null;

    if (!isValidUUID($userId) || !isValidUUID($taskId)) {
        sendError('Invalid ID format', 400);
    }

    // Verify task exists and is active
    $stmt = $pdo->prepare('SELECT id FROM tasks WHERE id = ? AND is_active = 1');
    $stmt->execute([$taskId]);
    if (!$stmt->fetch()) {
        sendError('Task not found or inactive', 404);
    }

    // Check for existing pending submission
    $stmt = $pdo->prepare('
        SELECT id FROM task_submissions 
        WHERE user_id = ? AND task_id = ? AND status = "pending"
    ');
    $stmt->execute([$userId, $taskId]);
    if ($stmt->fetch()) {
        sendError('You already have a pending submission for this task', 400);
    }

    // Create submission
    $submissionId = generateUUID();
    $stmt = $pdo->prepare('
        INSERT INTO task_submissions (id, task_id, user_id, proof_type, proof_url, status)
        VALUES (?, ?, ?, ?, ?, "pending")
    ');
    $stmt->execute([$submissionId, $taskId, $userId, $proofType, $proofUrl]);

    sendSuccess(['submission_id' => $submissionId], 'Task submitted successfully');
}

/**
 * Admin approve task submission (with 8% royalty for elite uplines)
 */
function approveTask(PDO $pdo, array $data): void {
    validateRequired($data, ['admin_id', 'submission_id']);

    $adminId = $data['admin_id'];
    $submissionId = $data['submission_id'];

    if (!isValidUUID($adminId) || !isValidUUID($submissionId)) {
        sendError('Invalid ID format', 400);
    }

    // Verify admin role
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role = "admin"');
    $stmt->execute([$adminId]);
    if ($stmt->fetchColumn() == 0) {
        sendError('Unauthorized: Admin role required', 403);
    }

    $pdo->beginTransaction();

    try {
        // Lock submission
        $stmt = $pdo->prepare('
            SELECT ts.*, t.reward as task_reward, t.title as task_title
            FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.id = ?
            FOR UPDATE
        ');
        $stmt->execute([$submissionId]);
        $submission = $stmt->fetch();

        if (!$submission) {
            throw new Exception('Submission not found');
        }

        if ($submission['status'] !== 'pending') {
            throw new Exception('Submission already reviewed');
        }

        $reward = (float) $submission['task_reward'];
        $userId = $submission['user_id'];

        // Update submission
        $stmt = $pdo->prepare('
            UPDATE task_submissions 
            SET status = "approved", reviewed_at = NOW(), reviewed_by = ?, reward_amount = ?
            WHERE id = ?
        ');
        $stmt->execute([$adminId, $reward, $submissionId]);

        // Credit user's task wallet
        $stmt = $pdo->prepare('
            UPDATE wallets SET balance = balance + ?, updated_at = NOW()
            WHERE user_id = ? AND wallet_type = "task"
        ');
        $stmt->execute([$reward, $userId]);

        // Get task wallet ID for transaction log
        $stmt = $pdo->prepare('SELECT id FROM wallets WHERE user_id = ? AND wallet_type = "task"');
        $stmt->execute([$userId]);
        $taskWalletId = $stmt->fetchColumn();

        // Log transaction
        $txId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description, reference_id)
            VALUES (?, ?, ?, ?, "task_reward", ?, ?)
        ');
        $stmt->execute([$txId, $taskWalletId, $userId, $reward, "Task: " . $submission['task_title'], $submissionId]);

        // Handle 8% royalty for elite upline
        $royalty = 0;
        $stmt = $pdo->prepare('SELECT referred_by, full_name FROM profiles WHERE id = ?');
        $stmt->execute([$userId]);
        $userProfile = $stmt->fetch();

        if ($userProfile && $userProfile['referred_by']) {
            $stmt = $pdo->prepare('SELECT id, membership_tier FROM profiles WHERE id = ?');
            $stmt->execute([$userProfile['referred_by']]);
            $upline = $stmt->fetch();

            if ($upline && $upline['membership_tier'] === 'elite') {
                $royalty = $reward * 0.08;

                // Credit upline's royalty wallet
                $stmt = $pdo->prepare('
                    UPDATE wallets SET balance = balance + ?, updated_at = NOW()
                    WHERE user_id = ? AND wallet_type = "royalty"
                ');
                $stmt->execute([$royalty, $upline['id']]);

                // Get royalty wallet ID
                $stmt = $pdo->prepare('SELECT id FROM wallets WHERE user_id = ? AND wallet_type = "royalty"');
                $stmt->execute([$upline['id']]);
                $royaltyWalletId = $stmt->fetchColumn();

                // Log royalty transaction
                $royaltyTxId = generateUUID();
                $stmt = $pdo->prepare('
                    INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description, reference_id)
                    VALUES (?, ?, ?, ?, "team_override", ?, ?)
                ');
                $stmt->execute([$royaltyTxId, $royaltyWalletId, $upline['id'], $royalty, "8% override from " . $userProfile['full_name'], $submissionId]);
            }
        }

        $pdo->commit();

        sendSuccess([
            'reward_credited' => $reward,
            'royalty_credited' => $royalty
        ], 'Task approved successfully');

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

/**
 * Admin reject task submission
 */
function rejectTask(PDO $pdo, array $data): void {
    validateRequired($data, ['admin_id', 'submission_id']);

    $adminId = $data['admin_id'];
    $submissionId = $data['submission_id'];
    $reason = $data['rejection_reason'] ?? 'Submission did not meet requirements';

    if (!isValidUUID($adminId) || !isValidUUID($submissionId)) {
        sendError('Invalid ID format', 400);
    }

    // Verify admin role
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role = "admin"');
    $stmt->execute([$adminId]);
    if ($stmt->fetchColumn() == 0) {
        sendError('Unauthorized: Admin role required', 403);
    }

    // Lock and check submission
    $stmt = $pdo->prepare('SELECT id, status FROM task_submissions WHERE id = ? FOR UPDATE');
    $stmt->execute([$submissionId]);
    $submission = $stmt->fetch();

    if (!$submission) {
        sendError('Submission not found', 404);
    }

    if ($submission['status'] !== 'pending') {
        sendError('Submission already reviewed', 400);
    }

    // Update submission
    $stmt = $pdo->prepare('
        UPDATE task_submissions 
        SET status = "rejected", reviewed_at = NOW(), reviewed_by = ?, rejection_reason = ?
        WHERE id = ?
    ');
    $stmt->execute([$adminId, $reason, $submissionId]);

    sendSuccess([], 'Task rejected');
}
