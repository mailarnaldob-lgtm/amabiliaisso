# AMABILIA NETWORK - PHP API for Hostinger MySQL

This directory contains all the PHP files needed to connect your Hostinger server with the MySQL database.

## 📁 Directory Structure

```
api/
├── config/
│   └── database.php      # Database connection configuration
├── helpers/
│   └── response.php      # JSON response helper functions
├── .htaccess             # Apache security configuration
├── admin-auth.php        # Admin authentication API
├── get-user-data.php     # User profile & wallet data API
├── lending-operations.php # P2P lending marketplace API
├── task-operations.php   # Task & submission management API
├── wallet-operations.php # Wallet transfer & balance API
└── README.md             # This file
```

## 🚀 Deployment Instructions

### 1. Upload to Hostinger

Upload the entire `api/` folder to your Hostinger public_html directory:

```
/home/u325953503/public_html/api/
```

Or use your domain's api subdirectory:
```
https://www.amabilianetwork.com/api/
```

### 2. Configure Database Credentials

Edit `api/config/database.php` and update:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u325953503_MyAmabiliaDB');
define('DB_USER', 'u325953503_amabilia');
define('DB_PASS', 'YOUR_ACTUAL_PASSWORD_HERE');
```

### 3. Set File Permissions

```bash
chmod 644 api/*.php
chmod 644 api/config/*.php
chmod 644 api/helpers/*.php
chmod 644 api/.htaccess
```

### 4. Import Database Schema

Import `docs/mysql-schema.sql` into your phpMyAdmin to create all tables.

## 📡 API Endpoints

### User Data (`get-user-data.php`)

| Action | Description |
|--------|-------------|
| `GET_PROFILE` | Fetch user profile by ID |
| `GET_WALLETS` | Fetch user's wallet balances |
| `SYNC_USER` | Create profile & wallets if missing |

**Example:**
```json
POST /api/get-user-data.php
{
  "action": "GET_PROFILE",
  "user_id": "uuid-here"
}
```

### Wallet Operations (`wallet-operations.php`)

| Action | Description |
|--------|-------------|
| `GET_BALANCE` | Get wallet balance(s) |
| `TRANSFER` | Transfer between user's wallets |
| `GET_TRANSACTIONS` | Get transaction history |

### Task Operations (`task-operations.php`)

| Action | Description |
|--------|-------------|
| `GET_TASKS` | List active tasks |
| `GET_SUBMISSIONS` | Get user's submissions |
| `SUBMIT_TASK` | Submit task proof |
| `APPROVE_TASK` | Admin approve (with 8% royalty) |
| `REJECT_TASK` | Admin reject submission |

### Lending Operations (`lending-operations.php`)

| Action | Description |
|--------|-------------|
| `GET_OFFERS` | List pending loan offers |
| `GET_MY_LOANS` | Get user's loans |
| `POST_OFFER` | Create loan offer |
| `TAKE_OFFER` | Accept loan offer |
| `CANCEL_OFFER` | Cancel pending offer |
| `REPAY_LOAN` | Repay active loan |

### Admin Auth (`admin-auth.php`)

| Action | Description |
|--------|-------------|
| `LOGIN` | Admin login |
| `VALIDATE` | Validate session |
| `CHECK_ROLE` | Check if user has role |

## 🔒 Security Features

- PDO prepared statements (SQL injection prevention)
- Input validation and sanitization
- UUID format validation
- Role-based access control
- CORS headers configured
- Directory listing disabled
- Config files protected

## 🧪 Testing

Test the API using curl:

```bash
curl -X POST https://www.amabilianetwork.com/api/get-user-data.php \
  -H "Content-Type: application/json" \
  -d '{"action": "GET_TASKS"}'
```

## ⚠️ Important Notes

1. **NEVER commit database passwords to Git** - Update credentials only on the server
2. **Enable HTTPS** - The .htaccess forces HTTPS
3. **Log monitoring** - Check `/home/u325953503/logs/php_errors.log` for errors
4. **Backup regularly** - Use phpMyAdmin to export your database
