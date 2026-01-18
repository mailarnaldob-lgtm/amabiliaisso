<?php
/**
 * AMABILIA NETWORK - Wallet Operations API
 * ==========================================
 * Handles wallet balance operations and transfers.
 * 
 * Actions:
 * - GET_BALANCE: Get wallet balance
 * - TRANSFER: Transfer between user's wallets
 * - CASH_OUT: Initiate withdrawal
 * 
 * Upload this file to: /api/wallet-operations.php on Hostinger
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
        case 'GET_BALANCE':
            getBalance($pdo, $body);
            break;
            
        case 'TRANSFER':
            transferBetweenWallets($pdo, $body);
            break;
            
        case 'GET_TRANSACTIONS':
            getTransactions($pdo, $body);
            break;
            
        default:
            sendError('Invalid action. Use: GET_BALANCE, TRANSFER, or GET_TRANSACTIONS', 400);
    }

} catch (Exception $e) {
    error_log('Wallet API Error: ' . $e->getMessage());
    sendError('Server error', 500);
}

/**
 * Get wallet balance
 */
function getBalance(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id']);

    $userId = $data['user_id'];
    $walletType = $data['wallet_type'] ?? null;

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    if ($walletType) {
        $stmt = $pdo->prepare('
            SELECT id, wallet_type, balance 
            FROM wallets 
            WHERE user_id = ? AND wallet_type = ?
        ');
        $stmt->execute([$userId, $walletType]);
        $wallet = $stmt->fetch();

        if (!$wallet) {
            sendError('Wallet not found', 404);
        }

        $wallet['balance'] = (float) $wallet['balance'];
        sendSuccess(['wallet' => $wallet]);
    } else {
        $stmt = $pdo->prepare('
            SELECT id, wallet_type, balance 
            FROM wallets 
            WHERE user_id = ?
        ');
        $stmt->execute([$userId]);
        $wallets = $stmt->fetchAll();

        foreach ($wallets as &$wallet) {
            $wallet['balance'] = (float) $wallet['balance'];
        }

        sendSuccess(['wallets' => $wallets]);
    }
}

/**
 * Transfer between user's own wallets
 */
function transferBetweenWallets(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'from_type', 'to_type', 'amount']);

    $userId = $data['user_id'];
    $fromType = $data['from_type'];
    $toType = $data['to_type'];
    $amount = (float) $data['amount'];

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    if ($amount <= 0) {
        sendError('Amount must be positive', 400);
    }

    if ($fromType === $toType) {
        sendError('Cannot transfer to the same wallet', 400);
    }

    $validTypes = ['task', 'royalty', 'main'];
    if (!in_array($fromType, $validTypes) || !in_array($toType, $validTypes)) {
        sendError('Invalid wallet type', 400);
    }

    $pdo->beginTransaction();

    try {
        // Lock and get source wallet
        $stmt = $pdo->prepare('
            SELECT id, balance 
            FROM wallets 
            WHERE user_id = ? AND wallet_type = ?
            FOR UPDATE
        ');
        $stmt->execute([$userId, $fromType]);
        $fromWallet = $stmt->fetch();

        if (!$fromWallet) {
            throw new Exception('Source wallet not found');
        }

        $fromBalance = (float) $fromWallet['balance'];
        if ($fromBalance < $amount) {
            throw new Exception('Insufficient balance');
        }

        // Lock and get destination wallet
        $stmt->execute([$userId, $toType]);
        $toWallet = $stmt->fetch();

        if (!$toWallet) {
            throw new Exception('Destination wallet not found');
        }

        // Update balances
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$amount, $fromWallet['id']]);

        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$amount, $toWallet['id']]);

        // Log transactions
        $txId1 = generateUUID();
        $txId2 = generateUUID();

        $stmt = $pdo->prepare('
            INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description)
            VALUES (?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([$txId1, $fromWallet['id'], $userId, -$amount, 'transfer_out', "Transfer to $toType wallet"]);
        $stmt->execute([$txId2, $toWallet['id'], $userId, $amount, 'transfer_in', "Transfer from $fromType wallet"]);

        $pdo->commit();

        sendSuccess([
            'from_balance' => $fromBalance - $amount,
            'amount' => $amount
        ], 'Transfer successful');

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

/**
 * Get wallet transactions
 */
function getTransactions(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id']);

    $userId = $data['user_id'];
    $limit = min((int) ($data['limit'] ?? 50), 100);
    $offset = (int) ($data['offset'] ?? 0);

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    $stmt = $pdo->prepare('
        SELECT 
            wt.id, wt.wallet_id, wt.amount, wt.transaction_type, 
            wt.description, wt.created_at, w.wallet_type
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE wt.user_id = ?
        ORDER BY wt.created_at DESC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute([$userId, $limit, $offset]);
    $transactions = $stmt->fetchAll();

    foreach ($transactions as &$tx) {
        $tx['amount'] = (float) $tx['amount'];
    }

    sendSuccess(['transactions' => $transactions]);
}
