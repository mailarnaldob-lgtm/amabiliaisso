<?php
/**
 * AMABILIA NETWORK - Database Configuration
 * ==========================================
 * This file contains the MySQL database connection configuration.
 * IMPORTANT: Update the credentials before deploying to Hostinger.
 * 
 * Upload this file to: /api/config/database.php on Hostinger
 */

// Prevent direct access
if (!defined('AMABILIA_API')) {
    http_response_code(403);
    die(json_encode(['success' => false, 'error' => 'Direct access not allowed']));
}

// Database Configuration
define('DB_HOST', 'localhost'); // Usually 'localhost' on Hostinger
define('DB_NAME', 'u325953503_MyAmabiliaDB');
define('DB_USER', 'u325953503_amabilia'); // Update with your Hostinger MySQL username
define('DB_PASS', ''); // UPDATE THIS: Add your Hostinger MySQL password
define('DB_CHARSET', 'utf8mb4');

/**
 * Get PDO Database Connection
 * Uses PDO for secure prepared statements
 */
function getDbConnection(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_NAME,
                DB_CHARSET
            );
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch (PDOException $e) {
            error_log('Database Connection Error: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }
    
    return $pdo;
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Generate unique referral code
 */
function generateReferralCode(PDO $pdo): string {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $length = 8;
    
    do {
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM profiles WHERE referral_code = ?');
        $stmt->execute([$code]);
        $exists = $stmt->fetchColumn() > 0;
        
    } while ($exists);
    
    return $code;
}
