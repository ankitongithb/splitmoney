-- Seed Data for SplitMoney
-- Test credentials: alice@test.com / Test@1234  |  bob@test.com / Test@1234

-- Password hash for 'Test@1234' using BCrypt
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT IGNORE INTO users (id, name, email, password, phone, currency) VALUES
(1, 'Alice Johnson', 'alice@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91-9876543210', 'INR'),
(2, 'Bob Smith',    'bob@test.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91-9876543211', 'INR'),
(3, 'Carol White',  'carol@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91-9876543212', 'INR');

-- Wallets
INSERT IGNORE INTO wallets (user_id, balance) VALUES
(1, 5000.00),
(2, 2500.00),
(3, 1000.00);

-- Friends (Offline per user)
INSERT IGNORE INTO friends (id, user_id, name, email) VALUES
(1, 1, 'Bob Smith', 'bob@test.com'),
(2, 2, 'Alice Johnson', 'alice@test.com'),
(3, 1, 'Carol White', 'carol@test.com'),
(4, 3, 'Alice Johnson', 'alice@test.com'),
(5, 2, 'Carol White', 'carol@test.com'),
(6, 3, 'Bob Smith', 'bob@test.com');

-- Sample Expenses for Alice
INSERT IGNORE INTO expenses (user_id, title, amount, currency, amount_inr, category, description, expense_date) VALUES
(1, 'Lunch at Cafe', 350.00, 'INR', 350.00, 'Food', 'Team lunch', '2026-03-01'),
(1, 'Uber to Office', 180.00, 'INR', 180.00, 'Travel', 'Morning commute', '2026-03-02'),
(1, 'Electricity Bill', 1200.00, 'INR', 1200.00, 'Bills', 'Monthly bill', '2026-03-05'),
(1, 'Amazon Shopping', 2500.00, 'INR', 2500.00, 'Shopping', 'Books and accessories', '2026-03-10'),
(1, 'Netflix Subscription', 649.00, 'INR', 649.00, 'Entertainment', 'Monthly OTT', '2026-03-15'),
(1, 'Grocery Store', 890.00, 'INR', 890.00, 'Food', 'Weekly groceries', '2026-03-18'),
(1, 'Flight ticket NYC', 85.00, 'USD', 7055.00, 'Travel', 'Business trip', '2026-03-20'),
(2, 'Pizza Night', 450.00, 'INR', 450.00, 'Food', 'Dinner with friends', '2026-03-05'),
(2, 'Metro Card', 500.00, 'INR', 500.00, 'Travel', 'Monthly metro', '2026-03-01'),
(3, 'Coffee Shop', 280.00, 'INR', 280.00, 'Food', 'Work from cafe', '2026-03-12');

-- Friend Transactions
INSERT IGNORE INTO transactions (user_id, friend_id, amount, is_i_owe_friend, description, category, transaction_date, is_settled) VALUES
(2, 2, 500.00, FALSE, 'Lunch split last week', 'Food', '2026-03-10', FALSE),
(1, 3, 250.00, TRUE, 'Movie tickets', 'Entertainment', '2026-03-15', FALSE),
(3, 6, 300.00, TRUE, 'Shared cab', 'Travel', '2026-03-18', FALSE);

-- Sample Trip
INSERT IGNORE INTO trips (id, name, description, destination, start_date, end_date, created_by, status, total_amount) VALUES
(1, 'Goa Trip 2026', 'Fun beach vacation with friends', 'Goa, India', '2026-04-01', '2026-04-05', 1, 'ACTIVE', 12000.00);

INSERT IGNORE INTO trip_members (trip_id, user_id) VALUES
(1, 1), (1, 2), (1, 3);

INSERT IGNORE INTO trip_expenses (trip_id, paid_by, title, amount, split_type, description, expense_date) VALUES
(1, 1, 'Hotel Booking', 6000.00, 'EQUAL', 'Beach Resort 4 nights', '2026-04-01'),
(1, 2, 'Rented Bikes', 3000.00, 'EQUAL', '3 bikes for 4 days', '2026-04-02'),
(1, 3, 'Dinner at Shacks', 1500.00, 'EQUAL', 'Seafood at beach shack', '2026-04-03');

INSERT IGNORE INTO trip_expense_splits (trip_expense_id, user_id, share_amount) VALUES
(1, 1, 2000.00), (1, 2, 2000.00), (1, 3, 2000.00),
(2, 1, 1000.00), (2, 2, 1000.00), (2, 3, 1000.00),
(3, 1, 500.00),  (3, 2, 500.00),  (3, 3, 500.00);

-- Budgets for Alice
INSERT IGNORE INTO budgets (user_id, category, amount, month, year) VALUES
(1, 'Food', 3000.00, 3, 2026),
(1, 'Travel', 2000.00, 3, 2026),
(1, 'Bills', 2000.00, 3, 2026),
(1, 'Shopping', 5000.00, 3, 2026),
(1, 'Entertainment', 1000.00, 3, 2026);
