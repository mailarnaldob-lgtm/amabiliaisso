<?php
/**
 * AMABILIA NETWORK - User Data API
 * ==================================
 * Handles user profile and wallet data operations.
 * 
 * Actions:
 * - GET_PROFILE: Fetch user profile by ID
 * - GET_WALLETS: Fetch user wallets by user ID
 * - SYNC_USER: Initialize user profile and wallets if missing
 * 
 * Upload this file to: /api/get-user-data.php on Hostinger
 */

// Define API constant to allow includes
define('AMABILIA_API', true);

// Error reporting (disable in production)
error_reporting(0);
ini_set('display_errors', 0);

// Include dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';

// Handle CORS
handleCors();

try {
    // Get request data
    $body = getJsonBody();
    $action = $body['action'] ?? $_GET['action'] ?? '';
    $userId = $body['user_id'] ?? $_GET['user_id'] ?? '';

    // Validate user ID
    if (empty($userId) || !isValidUUID($userId)) {
        sendError('Valid user_id is required', 400);
    }

    // Get database connection
    $pdo = getDbConnection();

    switch (strtoupper($action)) {
        case 'GET_PROFILE':
            getProfile($pdo, $userId);
            break;
            
        case 'GET_WALLETS':
            getWallets($pdo, $userId);
            break;
            
        case 'SYNC_USER':
            syncUser($pdo, $userId, $body);
            break;
            
        default:
            sendError('Invalid action. Use: GET_PROFILE, GET_WALLETS, or SYNC_USER', 400);
    }

} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    sendError('Server error', 500);
}

/**
 * Get user profile
 */
function getProfile(PDO $pdo, string $userId): void {
    $stmt = $pdo->prepare('
        SELECT 
            id, full_name, phone, avatar_url, referral_code, referred_by,
            membership_tier, membership_amount, is_kyc_verified,
            created_at, updated_at
        FROM profiles 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();

    if (!$profile) {
        sendError('Profile not found', 404);
    }

    // Convert numeric strings to proper types
    $profile['membership_amount'] = (float) $profile['membership_amount'];
    $profile['is_kyc_verified'] = (bool) $profile['is_kyc_verified'];

    sendSuccess(['profile' => $profile]);
}

/**
 * Get user wallets
 */
function getWallets(PDO $pdo, string $userId): void {
    $stmt = $pdo->prepare('
        SELECT id, user_id, wallet_type, balance, created_at, updated_at
        FROM wallets 
        WHERE user_id = ?
        ORDER BY wallet_type ASC
    ');
    $stmt->execute([$userId]);
    $wallets = $stmt->fetchAll();

    // Convert balance to float
    foreach ($wallets as &$wallet) {
        $wallet['balance'] = (float) $wallet['balance'];
    }

    sendSuccess(['wallets' => $wallets]);
}

/**
 * Sync user - create profile and wallets if missing
 */
function syncUser(PDO $pdo, string $userId, array $data): void {
    $fullName = trim($data['full_name'] ?? 'User');
    $phone = isset($data['phone']) ? trim($data['phone']) : null;
    $referralCodeInput = isset($data['referral_code']) ? strtoupper(trim($data['referral_code'])) : null;

    // Validate full name
    if (strlen($fullName) > 200) {
        $fullName = substr($fullName, 0, 200);
    }
    $fullName = strip_tags($fullName);

    // Validate phone
    if ($phone) {
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        if (strlen($phone) > 20 || strlen($phone) < 10) {
            $phone = null;
        }
    }

    $pdo->beginTransaction();

    try {
        // Check if profile exists
        $stmt = $pdo->prepare('SELECT id FROM profiles WHERE id = ?');
        $stmt->execute([$userId]);
        $existingProfile = $stmt->fetch();

        if ($existingProfile) {
            // Profile exists, just return it
            $pdo->commit();
            getProfile($pdo, $userId);
            return;
        }

        // Find referrer if code provided
        $referrerId = null;
        if ($referralCodeInput) {
            $stmt = $pdo->prepare('SELECT id FROM profiles WHERE referral_code = ?');
            $stmt->execute([$referralCodeInput]);
            $referrer = $stmt->fetch();
            if ($referrer) {
                $referrerId = $referrer['id'];
            }
        }

        // Generate unique referral code
        $newReferralCode = generateReferralCode($pdo);

        // Create profile
        $stmt = $pdo->prepare('
            INSERT INTO profiles (id, full_name, phone, referral_code, referred_by, membership_tier, membership_amount, is_kyc_verified)
            VALUES (?, ?, ?, ?, ?, "basic", 0, 0)
        ');
        $stmt->execute([$userId, $fullName, $phone, $newReferralCode, $referrerId]);

        // Create 3 wallets
        $walletTypes = ['task', 'royalty', 'main'];
        $walletStmt = $pdo->prepare('
            INSERT INTO wallets (id, user_id, wallet_type, balance)
            VALUES (?, ?, ?, 0)
        ');

        foreach ($walletTypes as $type) {
            $walletId = generateUUID();
            $walletStmt->execute([$walletId, $userId, $type]);
        }

        // Create default member role
        $roleId = generateUUID();
        $stmt = $pdo->prepare('
            INSERT INTO user_roles (id, user_id, role)
            VALUES (?, ?, "member")
        ');
        $stmt->execute([$roleId, $userId]);

        $pdo->commit();

        // Return the new profile
        getProfile($pdo, $userId);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
