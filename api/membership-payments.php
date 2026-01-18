<?php
/**
 * AMABILIA NETWORK - Membership Payment API
 * ===========================================
 * Handles membership upgrade payments and referral commissions.
 * 
 * Actions:
 * - GET_PAYMENTS: Get user's payment history
 * - SUBMIT_PAYMENT: Submit membership payment proof
 * - APPROVE_PAYMENT: Admin approve (with 40% referral commission)
 * - REJECT_PAYMENT: Admin reject payment
 * - GET_PENDING: Admin get all pending payments
 * 
 * Upload this file to: /api/membership-payments.php on Hostinger
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
        case 'GET_PAYMENTS':
            getPayments($pdo, $body);
            break;
            
        case 'SUBMIT_PAYMENT':
            submitPayment($pdo, $body);
            break;
            
        case 'APPROVE_PAYMENT':
            approvePayment($pdo, $body);
            break;
            
        case 'REJECT_PAYMENT':
            rejectPayment($pdo, $body);
            break;
            
        case 'GET_PENDING':
            getPendingPayments($pdo, $body);
            break;
            
        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    error_log('Membership API Error: ' . $e->getMessage());
    sendError('Server error', 500);
}

/**
 * Get user's payment history
 */
function getPayments(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id']);

    $userId = $data['user_id'];

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    $stmt = $pdo->prepare('
        SELECT id, tier, amount, status, payment_method, proof_url, 
               reference_number, rejection_reason, created_at, reviewed_at
        FROM membership_payments 
        WHERE user_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$userId]);
    $payments = $stmt->fetchAll();

    foreach ($payments as &$payment) {
        $payment['amount'] = (float) $payment['amount'];
    }

    sendSuccess(['payments' => $payments]);
}

/**
 * Submit membership payment proof
 */
function submitPayment(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'tier', 'amount', 'payment_method']);

    $userId = $data['user_id'];
    $tier = strtolower($data['tier']);
    $amount = (float) $data['amount'];
    $paymentMethod = $data['payment_method'];
    $proofUrl = $data['proof_url'] ?? null;
    $referenceNumber = $data['reference_number'] ?? null;

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    $validTiers = ['basic', 'pro', 'elite'];
    if (!in_array($tier, $validTiers)) {
        sendError('Invalid tier. Use: basic, pro, or elite', 400);
    }

    if ($amount <= 0) {
        sendError('Amount must be positive', 400);
    }

    // Check for existing pending payment
    $stmt = $pdo->prepare('
        SELECT id FROM membership_payments 
        WHERE user_id = ? AND status = "pending"
    ');
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
        sendError('You already have a pending payment. Please wait for review.', 400);
    }

    // Create payment record
    $paymentId = generateUUID();
    $stmt = $pdo->prepare('
        INSERT INTO membership_payments (id, user_id, tier, amount, payment_method, proof_url, reference_number, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, "pending")
    ');
    $stmt->execute([$paymentId, $userId, $tier, $amount, $paymentMethod, $proofUrl, $referenceNumber]);

    sendSuccess(['payment_id' => $paymentId], 'Payment submitted for review');
}

/**
 * Admin approve payment (with 40% referral commission)
 */
function approvePayment(PDO $pdo, array $data): void {
    validateRequired($data, ['admin_id', 'payment_id']);

    $adminId = $data['admin_id'];
    $paymentId = $data['payment_id'];

    if (!isValidUUID($adminId) || !isValidUUID($paymentId)) {
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
        // Lock payment
        $stmt = $pdo->prepare('SELECT * FROM membership_payments WHERE id = ? FOR UPDATE');
        $stmt->execute([$paymentId]);
        $payment = $stmt->fetch();

        if (!$payment) {
            throw new Exception('Payment not found');
        }

        if ($payment['status'] !== 'pending') {
            throw new Exception('Payment already reviewed');
        }

        $userId = $payment['user_id'];
        $tier = $payment['tier'];
        $amount = (float) $payment['amount'];

        // Update payment status
        $stmt = $pdo->prepare('
            UPDATE membership_payments 
            SET status = "approved", reviewed_at = NOW(), reviewed_by = ?
            WHERE id = ?
        ');
        $stmt->execute([$adminId, $paymentId]);

        // Update user's membership tier
        $stmt = $pdo->prepare('
            UPDATE profiles 
            SET membership_tier = ?, membership_amount = ?, updated_at = NOW()
            WHERE id = ?
        ');
        $stmt->execute([$tier, $amount, $userId]);

        // Handle 40% referral commission
        $commissionAmount = 0;
        $stmt = $pdo->prepare('SELECT referred_by FROM profiles WHERE id = ?');
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();

        if ($profile && $profile['referred_by']) {
            $referrerId = $profile['referred_by'];
            $commissionAmount = $amount * 0.40;

            // Check if commission already exists (idempotency)
            $stmt = $pdo->prepare('
                SELECT id FROM referral_commissions 
                WHERE referrer_id = ? AND referred_id = ? AND membership_tier = ?
            ');
            $stmt->execute([$referrerId, $userId, $tier]);
            
            if (!$stmt->fetch()) {
                // Create commission record
                $commissionId = generateUUID();
                $stmt = $pdo->prepare('
                    INSERT INTO referral_commissions (
                        id, referrer_id, referred_id, membership_tier, 
                        membership_amount, commission_amount, commission_rate, is_paid
                    ) VALUES (?, ?, ?, ?, ?, ?, 40.00, 0)
                ');
                $stmt->execute([$commissionId, $referrerId, $userId, $tier, $amount, $commissionAmount]);

                // Credit referrer's royalty wallet
                $stmt = $pdo->prepare('
                    UPDATE wallets SET balance = balance + ?, updated_at = NOW()
                    WHERE user_id = ? AND wallet_type = "royalty"
                ');
                $stmt->execute([$commissionAmount, $referrerId]);

                // Get royalty wallet ID
                $stmt = $pdo->prepare('SELECT id FROM wallets WHERE user_id = ? AND wallet_type = "royalty"');
                $stmt->execute([$referrerId]);
                $walletId = $stmt->fetchColumn();

                // Log transaction
                $txId = generateUUID();
                $stmt = $pdo->prepare('
                    INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description, reference_id)
                    VALUES (?, ?, ?, ?, "referral_commission", ?, ?)
                ');
                $stmt->execute([$txId, $walletId, $referrerId, $commissionAmount, "Referral commission for $tier membership", $paymentId]);
            }
        }

        $pdo->commit();

        sendSuccess([
            'tier' => $tier,
            'user_id' => $userId,
            'commission_credited' => $commissionAmount
        ], 'Payment approved');

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

/**
 * Admin reject payment
 */
function rejectPayment(PDO $pdo, array $data): void {
    validateRequired($data, ['admin_id', 'payment_id']);

    $adminId = $data['admin_id'];
    $paymentId = $data['payment_id'];
    $reason = $data['rejection_reason'] ?? 'Payment could not be verified';

    if (!isValidUUID($adminId) || !isValidUUID($paymentId)) {
        sendError('Invalid ID format', 400);
    }

    // Verify admin role
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role = "admin"');
    $stmt->execute([$adminId]);
    if ($stmt->fetchColumn() == 0) {
        sendError('Unauthorized: Admin role required', 403);
    }

    // Lock and check payment
    $stmt = $pdo->prepare('SELECT id, status FROM membership_payments WHERE id = ? FOR UPDATE');
    $stmt->execute([$paymentId]);
    $payment = $stmt->fetch();

    if (!$payment) {
        sendError('Payment not found', 404);
    }

    if ($payment['status'] !== 'pending') {
        sendError('Payment already reviewed', 400);
    }

    // Update payment
    $stmt = $pdo->prepare('
        UPDATE membership_payments 
        SET status = "rejected", reviewed_at = NOW(), reviewed_by = ?, rejection_reason = ?
        WHERE id = ?
    ');
    $stmt->execute([$adminId, $reason, $paymentId]);

    sendSuccess([], 'Payment rejected');
}

/**
 * Admin get all pending payments
 */
function getPendingPayments(PDO $pdo, array $data): void {
    validateRequired($data, ['admin_id']);

    $adminId = $data['admin_id'];

    if (!isValidUUID($adminId)) {
        sendError('Invalid admin ID', 400);
    }

    // Verify admin role
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role = "admin"');
    $stmt->execute([$adminId]);
    if ($stmt->fetchColumn() == 0) {
        sendError('Unauthorized: Admin role required', 403);
    }

    $stmt = $pdo->prepare('
        SELECT 
            mp.id, mp.user_id, mp.tier, mp.amount, mp.payment_method,
            mp.proof_url, mp.reference_number, mp.created_at,
            p.full_name, p.phone
        FROM membership_payments mp
        JOIN profiles p ON mp.user_id = p.id
        WHERE mp.status = "pending"
        ORDER BY mp.created_at ASC
    ');
    $stmt->execute();
    $payments = $stmt->fetchAll();

    foreach ($payments as &$payment) {
        $payment['amount'] = (float) $payment['amount'];
    }

    sendSuccess(['payments' => $payments]);
}
