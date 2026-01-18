<?php
/**
 * AMABILIA NETWORK - Response Helper
 * ===================================
 * Standardized JSON response functions for the API.
 * 
 * Upload this file to: /api/helpers/response.php on Hostinger
 */

// Prevent direct access
if (!defined('AMABILIA_API')) {
    http_response_code(403);
    die(json_encode(['success' => false, 'error' => 'Direct access not allowed']));
}

/**
 * Send JSON response with proper headers
 */
function sendJsonResponse(array $data, int $statusCode = 200): void {
    // Clear any previous output
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Set headers
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send success response
 */
function sendSuccess(array $data = [], string $message = 'Success'): void {
    sendJsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], 200);
}

/**
 * Send error response
 */
function sendError(string $message, int $statusCode = 400, array $details = []): void {
    $response = [
        'success' => false,
        'error' => $message
    ];
    
    if (!empty($details)) {
        $response['details'] = $details;
    }
    
    sendJsonResponse($response, $statusCode);
}

/**
 * Handle CORS preflight request
 */
function handleCors(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
        http_response_code(204);
        exit;
    }
}

/**
 * Get JSON request body
 */
function getJsonBody(): array {
    $rawBody = file_get_contents('php://input');
    
    if (empty($rawBody)) {
        return [];
    }
    
    $data = json_decode($rawBody, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON body', 400);
    }
    
    return $data ?? [];
}

/**
 * Validate required fields
 */
function validateRequired(array $data, array $fields): void {
    $missing = [];
    
    foreach ($fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }
}

/**
 * Validate UUID format
 */
function isValidUUID(string $uuid): bool {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid) === 1;
}
