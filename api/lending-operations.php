<?php
/**
 * AMABILIA NETWORK - Lending Operations API
 * ==========================================
 * Handles P2P lending marketplace operations.
 * 
 * Actions:
 * - GET_OFFERS: List available pending loan offers
 * - GET_MY_LOANS: Get user's loans (as lender or borrower)
 * - POST_OFFER: Create a new loan offer
 * - TAKE_OFFER: Accept a loan offer
 * - CANCEL_OFFER: Cancel pending offer
 * - REPAY_LOAN: Repay an active loan
 * 
 * Upload this file to: /api/lending-operations.php on Hostinger
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
        case 'GET_OFFERS':
            getOffers($pdo, $body);
            break;
            
        case 'GET_MY_LOANS':
            getMyLoans($pdo, $body);
            break;
            
        case 'POST_OFFER':
            postOffer($pdo, $body);
            break;
            
        case 'TAKE_OFFER':
            takeOffer($pdo, $body);
            break;
            
        case 'CANCEL_OFFER':
            cancelOffer($pdo, $body);
            break;
            
        case 'REPAY_LOAN':
            repayLoan($pdo, $body);
            break;
            
        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    error_log('Lending API Error: ' . $e->getMessage());
    sendError('Server error', 500);
}

/**
 * Get available pending loan offers
 */
function getOffers(PDO $pdo, array $data): void {
    $userId = $data['user_id'] ?? null;

    $sql = '
        SELECT 
            l.id, l.principal_amount, l.interest_rate, l.interest_amount,
            l.total_repayment, l.term_days, l.created_at
        FROM loans l
        WHERE l.status = "pending"
    ';

    // Exclude user's own offers if user_id provided
    if ($userId && isValidUUID($userId)) {
        $sql .= ' AND l.lender_id != ?';
        $stmt = $pdo->prepare($sql . ' ORDER BY l.created_at DESC');
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->prepare($sql . ' ORDER BY l.created_at DESC');
        $stmt->execute();
    }

    $offers = $stmt->fetchAll();

    foreach ($offers as &$offer) {
        $offer['principal_amount'] = (float) $offer['principal_amount'];
        $offer['interest_rate'] = (float) $offer['interest_rate'];
        $offer['interest_amount'] = (float) $offer['interest_amount'];
        $offer['total_repayment'] = (float) $offer['total_repayment'];
    }

    sendSuccess(['offers' => $offers]);
}

/**
 * Get user's loans (as lender or borrower)
 */
function getMyLoans(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id']);

    $userId = $data['user_id'];

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    $stmt = $pdo->prepare('
        SELECT 
            l.*,
            CASE WHEN l.lender_id = ? THEN "lender" ELSE "borrower" END as role
        FROM loans l
        WHERE l.lender_id = ? OR l.borrower_id = ?
        ORDER BY l.created_at DESC
    ');
    $stmt->execute([$userId, $userId, $userId]);
    $loans = $stmt->fetchAll();

    foreach ($loans as &$loan) {
        $loan['principal_amount'] = (float) $loan['principal_amount'];
        $loan['interest_rate'] = (float) $loan['interest_rate'];
        $loan['interest_amount'] = $loan['interest_amount'] ? (float) $loan['interest_amount'] : null;
        $loan['processing_fee'] = $loan['processing_fee'] ? (float) $loan['processing_fee'] : null;
        $loan['total_repayment'] = $loan['total_repayment'] ? (float) $loan['total_repayment'] : null;
    }

    sendSuccess(['loans' => $loans]);
}

/**
 * Verify user is Elite + KYC verified
 */
function verifyEliteKyc(PDO $pdo, string $userId): array {
    $stmt = $pdo->prepare('
        SELECT membership_tier, is_kyc_verified, full_name 
        FROM profiles 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();

    if (!$profile) {
        throw new Exception('Profile not found');
    }

    if ($profile['membership_tier'] !== 'elite') {
        throw new Exception('Elite membership required');
    }

    if (!$profile['is_kyc_verified']) {
        throw new Exception('KYC verification required');
    }

    return $profile;
}

/**
 * Post a new loan offer
 */
function postOffer(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'principal_amount']);

    $userId = $data['user_id'];
    $principalAmount = (float) $data['principal_amount'];
    $interestRate = (float) ($data['interest_rate'] ?? 3.0);
    $termDays = (int) ($data['term_days'] ?? 7);

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    // Validate amounts
    if ($principalAmount < 100 || $principalAmount > 100000) {
        sendError('Principal amount must be between 100 and 100,000', 400);
    }

    if ($interestRate < 0 || $interestRate > 100) {
        sendError('Interest rate must be between 0 and 100', 400);
    }

    if ($termDays < 1 || $termDays > 365) {
        sendError('Term must be between 1 and 365 days', 400);
    }

    $pdo->beginTransaction();

    try {
        // Verify Elite + KYC
        verifyEliteKyc($pdo, $userId);

        // Calculate amounts
        $processingFee = $principalAmount * 0.008; // 0.8%
        $totalRequired = $principalAmount + $processingFee;
        $interestAmount = $principalAmount * ($interestRate / 100);
        $totalRepayment = $principalAmount + $interestAmount;

        // Lock and check wallet balance
        $stmt = $pdo->prepare('
            SELECT id, balance FROM wallets 
            WHERE user_id = ? AND wallet_type = "main"
            FOR UPDATE
        ');
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch();

        if (!$wallet) {
            throw new Exception('Wallet not found');
        }

        $balance = (float) $wallet['balance'];
        if ($balance < $totalRequired) {
            throw new Exception("Insufficient balance. Need ₳$totalRequired (including 0.8% fee)");
        }

        // Deduct from wallet
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$totalRequired, $wallet['id']]);

        // Create loan
        $loanId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO loans (
                id, lender_id, principal_amount, interest_rate, interest_amount,
                processing_fee, total_repayment, term_days, status, escrow_wallet_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending", ?)
        ');
        $stmt->execute([
            $loanId, $userId, $principalAmount, $interestRate, $interestAmount,
            $processingFee, $totalRepayment, $termDays, $wallet['id']
        ]);

        // Log transactions
        $txId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO loan_transactions (id, loan_id, user_id, from_wallet_id, amount, transaction_type, description)
            VALUES (?, ?, ?, ?, ?, "escrow_deposit", ?)
        ');
        $stmt->execute([$txId, $loanId, $userId, $wallet['id'], $principalAmount, "Loan offer created - ₳$principalAmount locked"]);

        $feeTxId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description, reference_id)
            VALUES (?, ?, ?, ?, "lending_fee", "Lending processing fee (0.8%)", ?)
        ');
        $stmt->execute([$feeTxId, $wallet['id'], $userId, -$processingFee, $loanId]);

        $pdo->commit();

        sendSuccess([
            'loan_id' => $loanId,
            'principal_amount' => $principalAmount,
            'interest_rate' => $interestRate,
            'interest_amount' => $interestAmount,
            'processing_fee' => $processingFee,
            'total_repayment' => $totalRepayment,
            'term_days' => $termDays,
            'new_balance' => $balance - $totalRequired
        ], 'Loan offer created');

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

/**
 * Take (accept) a loan offer
 */
function takeOffer(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'loan_id']);

    $userId = $data['user_id'];
    $loanId = $data['loan_id'];

    if (!isValidUUID($userId) || !isValidUUID($loanId)) {
        sendError('Invalid ID format', 400);
    }

    $pdo->beginTransaction();

    try {
        // Verify Elite + KYC
        verifyEliteKyc($pdo, $userId);

        // Lock loan
        $stmt = $pdo->prepare('SELECT * FROM loans WHERE id = ? FOR UPDATE');
        $stmt->execute([$loanId]);
        $loan = $stmt->fetch();

        if (!$loan) {
            throw new Exception('Loan not found');
        }

        if ($loan['status'] !== 'pending') {
            throw new Exception('Loan is no longer available');
        }

        if ($loan['lender_id'] === $userId) {
            throw new Exception('Cannot borrow from your own offer');
        }

        // Lock borrower wallet
        $stmt = $pdo->prepare('SELECT id, balance FROM wallets WHERE user_id = ? AND wallet_type = "main" FOR UPDATE');
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch();

        if (!$wallet) {
            throw new Exception('Wallet not found');
        }

        $principalAmount = (float) $loan['principal_amount'];
        $dueDate = date('Y-m-d H:i:s', strtotime("+{$loan['term_days']} days"));

        // Update loan
        $stmt = $pdo->prepare('
            UPDATE loans 
            SET borrower_id = ?, status = "active", accepted_at = NOW(), due_at = ?
            WHERE id = ?
        ');
        $stmt->execute([$userId, $dueDate, $loanId]);

        // Credit borrower wallet
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$principalAmount, $wallet['id']]);

        // Log transactions
        $txId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO loan_transactions (id, loan_id, user_id, to_wallet_id, amount, transaction_type, description)
            VALUES (?, ?, ?, ?, ?, "disbursement", ?)
        ');
        $stmt->execute([$txId, $loanId, $userId, $wallet['id'], $principalAmount, "Loan disbursed - ₳$principalAmount"]);

        $walletTxId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description, reference_id)
            VALUES (?, ?, ?, ?, "loan_received", "Loan received", ?)
        ');
        $stmt->execute([$walletTxId, $wallet['id'], $userId, $principalAmount, $loanId]);

        $pdo->commit();

        sendSuccess([
            'loan_id' => $loanId,
            'principal_amount' => $principalAmount,
            'interest_amount' => (float) $loan['interest_amount'],
            'total_repayment' => (float) $loan['total_repayment'],
            'due_at' => $dueDate,
            'new_balance' => (float) $wallet['balance'] + $principalAmount
        ], 'Loan accepted');

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

/**
 * Cancel a pending loan offer
 */
function cancelOffer(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'loan_id']);

    $userId = $data['user_id'];
    $loanId = $data['loan_id'];

    if (!isValidUUID($userId) || !isValidUUID($loanId)) {
        sendError('Invalid ID format', 400);
    }

    $pdo->beginTransaction();

    try {
        // Lock loan
        $stmt = $pdo->prepare('SELECT * FROM loans WHERE id = ? FOR UPDATE');
        $stmt->execute([$loanId]);
        $loan = $stmt->fetch();

        if (!$loan) {
            throw new Exception('Loan not found');
        }

        if ($loan['lender_id'] !== $userId) {
            throw new Exception('You can only cancel your own offers');
        }

        if ($loan['status'] !== 'pending') {
            throw new Exception('Only pending offers can be cancelled');
        }

        $principalAmount = (float) $loan['principal_amount'];

        // Lock wallet
        $stmt = $pdo->prepare('SELECT id, balance FROM wallets WHERE user_id = ? AND wallet_type = "main" FOR UPDATE');
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch();

        // Update loan status
        $stmt = $pdo->prepare('UPDATE loans SET status = "cancelled" WHERE id = ?');
        $stmt->execute([$loanId]);

        // Refund principal (fee is non-refundable)
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$principalAmount, $wallet['id']]);

        // Log transactions
        $txId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO loan_transactions (id, loan_id, user_id, to_wallet_id, amount, transaction_type, description)
            VALUES (?, ?, ?, ?, ?, "escrow_release", ?)
        ');
        $stmt->execute([$txId, $loanId, $userId, $wallet['id'], $principalAmount, "Loan cancelled - ₳$principalAmount returned"]);

        $walletTxId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description, reference_id)
            VALUES (?, ?, ?, ?, "escrow_refund", "Escrow refund for cancelled loan", ?)
        ');
        $stmt->execute([$walletTxId, $wallet['id'], $userId, $principalAmount, $loanId]);

        $pdo->commit();

        sendSuccess([
            'refunded_amount' => $principalAmount,
            'new_balance' => (float) $wallet['balance'] + $principalAmount
        ], 'Loan offer cancelled');

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

/**
 * Repay an active loan
 */
function repayLoan(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'loan_id']);

    $userId = $data['user_id'];
    $loanId = $data['loan_id'];

    if (!isValidUUID($userId) || !isValidUUID($loanId)) {
        sendError('Invalid ID format', 400);
    }

    $pdo->beginTransaction();

    try {
        // Lock loan
        $stmt = $pdo->prepare('SELECT * FROM loans WHERE id = ? FOR UPDATE');
        $stmt->execute([$loanId]);
        $loan = $stmt->fetch();

        if (!$loan) {
            throw new Exception('Loan not found');
        }

        if ($loan['borrower_id'] !== $userId) {
            throw new Exception('You can only repay your own loans');
        }

        if ($loan['status'] !== 'active') {
            throw new Exception('Only active loans can be repaid');
        }

        $repaymentAmount = (float) $loan['total_repayment'];
        $lenderId = $loan['lender_id'];

        // Lock borrower wallet
        $stmt = $pdo->prepare('SELECT id, balance FROM wallets WHERE user_id = ? AND wallet_type = "main" FOR UPDATE');
        $stmt->execute([$userId]);
        $borrowerWallet = $stmt->fetch();

        if ((float) $borrowerWallet['balance'] < $repaymentAmount) {
            throw new Exception("Insufficient balance. Need ₳$repaymentAmount to repay");
        }

        // Lock lender wallet
        $stmt = $pdo->prepare('SELECT id, balance FROM wallets WHERE user_id = ? AND wallet_type = "main" FOR UPDATE');
        $stmt->execute([$lenderId]);
        $lenderWallet = $stmt->fetch();

        // Deduct from borrower
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$repaymentAmount, $borrowerWallet['id']]);

        // Credit lender
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$repaymentAmount, $lenderWallet['id']]);

        // Update loan
        $stmt = $pdo->prepare('UPDATE loans SET status = "repaid", repaid_at = NOW() WHERE id = ?');
        $stmt->execute([$loanId]);

        // Log loan transaction
        $txId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO loan_transactions (id, loan_id, user_id, from_wallet_id, to_wallet_id, amount, transaction_type, description)
            VALUES (?, ?, ?, ?, ?, ?, "repayment", ?)
        ');
        $desc = "Loan repaid - ₳$repaymentAmount (Principal: ₳{$loan['principal_amount']}, Interest: ₳{$loan['interest_amount']})";
        $stmt->execute([$txId, $loanId, $userId, $borrowerWallet['id'], $lenderWallet['id'], $repaymentAmount, $desc]);

        // Log wallet transactions
        $borrowerTxId = generateUUID();
        $lenderTxId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO wallet_transactions (id, wallet_id, user_id, amount, transaction_type, description, reference_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$borrowerTxId, $borrowerWallet['id'], $userId, -$repaymentAmount, 'loan_repayment', 'Loan repayment', $loanId]);
        $stmt->execute([$lenderTxId, $lenderWallet['id'], $lenderId, $repaymentAmount, 'loan_received_repayment', 'Loan repayment received', $loanId]);

        $pdo->commit();

        sendSuccess([
            'loan_id' => $loanId,
            'principal_amount' => (float) $loan['principal_amount'],
            'interest_amount' => (float) $loan['interest_amount'],
            'total_repaid' => $repaymentAmount,
            'new_balance' => (float) $borrowerWallet['balance'] - $repaymentAmount
        ], 'Loan repaid successfully');

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}
