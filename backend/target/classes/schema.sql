-- SplitMoney Database Schema
-- Run this once to create all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Wallets table (one per user)
CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    amount_inr DECIMAL(15,2) NOT NULL,
    category VARCHAR(50) DEFAULT 'Others',
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_expenses_user (user_id),
    INDEX idx_expenses_date (expense_date),
    INDEX idx_expenses_category (category)
) ENGINE=InnoDB;

-- Friends table (offline friends owned by user)
CREATE TABLE IF NOT EXISTS friends (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_user_friend (user_id, name),
    INDEX idx_friends_user (user_id)
) ENGINE=InnoDB;

-- Transactions table (money owed between user and offline friend)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    is_i_owe_friend BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(300),
    category VARCHAR(50) DEFAULT 'Others',
    transaction_date DATE NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES friends(id) ON DELETE CASCADE,
    INDEX idx_txn_user (user_id),
    INDEX idx_txn_friend (friend_id),
    INDEX idx_txn_settled (is_settled)
) ENGINE=InnoDB;

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    destination VARCHAR(200),
    start_date DATE,
    end_date DATE,
    created_by BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trips_creator (created_by),
    INDEX idx_trips_status (status)
) ENGINE=InnoDB;

-- Trip Members table
CREATE TABLE IF NOT EXISTS trip_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_trip_member (trip_id, user_id),
    INDEX idx_trip_members_trip (trip_id)
) ENGINE=InnoDB;

-- Trip Expenses table
CREATE TABLE IF NOT EXISTS trip_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    paid_by BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    split_type VARCHAR(20) DEFAULT 'EQUAL',
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trip_exp_trip (trip_id)
) ENGINE=InnoDB;

-- Trip Expense Splits table
CREATE TABLE IF NOT EXISTS trip_expense_splits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_expense_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    share_amount DECIMAL(15,2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (trip_expense_id) REFERENCES trip_expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_splits_expense (trip_expense_id),
    INDEX idx_splits_user (user_id)
) ENGINE=InnoDB;

-- Payments table (Razorpay)
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    razorpay_order_id VARCHAR(200),
    razorpay_payment_id VARCHAR(200),
    status VARCHAR(30) DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    description VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_sender (sender_id),
    INDEX idx_payments_receiver (receiver_id),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB;

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_budget (user_id, category, month, year),
    INDEX idx_budgets_user (user_id)
) ENGINE=InnoDB;
