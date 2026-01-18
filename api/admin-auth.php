<?php
/**
 * AMABILIA NETWORK - Admin Authentication API
 * =============================================
 * Handles admin login and session validation.
 * 
 * Actions:
 * - LOGIN: Authenticate admin user
 * - VALIDATE: Validate admin session token
 * - LOGOUT: Invalidate session
 * 
 * Upload this file to: /api/admin-auth.php on Hostinger
 */

// Define API constant
define('AMABILIA_API', true);

// Error reporting
error_reporting(0);
ini_set('display_errors', 0);

// Include dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';

// Handle CORS
handleCors();

try {
    $body = getJsonBody();
    $action = $body['action'] ?? $_GET['action'] ?? '';

    $pdo = getDbConnection();

    switch (strtoupper($action)) {
        case 'LOGIN':
            adminLogin($pdo, $body);
            break;
            
        case 'VALIDATE':
            validateSession($pdo, $body);
            break;
            
        case 'CHECK_ROLE':
            checkUserRole($pdo, $body);
            break;
            
        default:
            sendError('Invalid action. Use: LOGIN, VALIDATE, or CHECK_ROLE', 400);
    }

} catch (Exception $e) {
    error_log('Admin Auth Error: ' . $e->getMessage());
    sendError('Server error', 500);
}

/**
 * Admin login
 */
function adminLogin(PDO $pdo, array $data): void {
    validateRequired($data, ['username', 'password']);

    $username = trim($data['username']);
    $password = $data['password'];

    // Get admin by username
    $stmt = $pdo->prepare('
        SELECT id, username, password_hash, is_active 
        FROM admins 
        WHERE username = ?
    ');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin) {
        sendError('Invalid credentials', 401);
    }

    if (!$admin['is_active']) {
        sendError('Account is disabled', 403);
    }

    // Verify password
    if (!password_verify($password, $admin['password_hash'])) {
        sendError('Invalid credentials', 401);
    }

    // Update last login
    $stmt = $pdo->prepare('UPDATE admins SET last_login_at = NOW() WHERE id = ?');
    $stmt->execute([$admin['id']]);

    // Generate session token (in production, use proper JWT)
    $token = bin2hex(random_bytes(32));
    
    sendSuccess([
        'admin_id' => $admin['id'],
        'username' => $admin['username'],
        'token' => $token
    ], 'Login successful');
}

/**
 * Validate admin session
 */
function validateSession(PDO $pdo, array $data): void {
    validateRequired($data, ['admin_id']);

    $adminId = $data['admin_id'];

    if (!isValidUUID($adminId)) {
        sendError('Invalid admin ID', 400);
    }

    $stmt = $pdo->prepare('
        SELECT id, username, is_active 
        FROM admins 
        WHERE id = ? AND is_active = 1
    ');
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch();

    if (!$admin) {
        sendError('Invalid or inactive session', 401);
    }

    sendSuccess([
        'valid' => true,
        'admin_id' => $admin['id'],
        'username' => $admin['username']
    ]);
}

/**
 * Check if user has a specific role
 */
function checkUserRole(PDO $pdo, array $data): void {
    validateRequired($data, ['user_id', 'role']);

    $userId = $data['user_id'];
    $role = strtolower($data['role']);

    if (!isValidUUID($userId)) {
        sendError('Invalid user ID', 400);
    }

    $validRoles = ['admin', 'moderator', 'member'];
    if (!in_array($role, $validRoles)) {
        sendError('Invalid role', 400);
    }

    $stmt = $pdo->prepare('
        SELECT COUNT(*) 
        FROM user_roles 
        WHERE user_id = ? AND role = ?
    ');
    $stmt->execute([$userId, $role]);
    $hasRole = $stmt->fetchColumn() > 0;

    sendSuccess(['has_role' => $hasRole]);
}
