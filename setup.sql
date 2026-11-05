-- Unified SQL teaching dataset. Reset deletes and recreates all four tables.
BEGIN TRANSACTION;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    customer_name VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    email VARCHAR UNIQUE
);
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0)
);
CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    transaction_date DATE NOT NULL,
    status VARCHAR NOT NULL CHECK (status IN ('completed', 'pending', 'cancelled'))
);
CREATE TABLE transaction_items (
    transaction_id INTEGER REFERENCES transactions(transaction_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (transaction_id, product_id)
);
INSERT INTO customers VALUES
    (1, 'Alice Chen', 'Seattle', 'alice@example.com'),
    (2, 'Ben Ortiz', 'Portland', 'ben@example.com'),
    (3, 'Cara Singh', 'Seattle', NULL),
    (4, 'Diego Rossi', 'Austin', 'diego@example.com'),
    (5, 'Emma Wilson', 'Boston', NULL),
    (6, 'Alice Chen', 'Austin', 'alice6@example.com');
INSERT INTO products VALUES
    (1, 'Monitor', 'Electronics', 320.00),
    (2, 'Keyboard', 'Electronics', 100.00),
    (3, 'Desk', 'Furniture', 650.00),
    (4, 'Chair', 'Furniture', 250.00),
    (5, 'Notebook', 'Stationery', 5.00),
    (6, 'Gift card', 'Gifts', 1000.01),
    (7, 'Desk lamp', 'Home', 30.00);
INSERT INTO transactions VALUES
    (101, 1, 600.00, DATE '2026-01-05', 'completed'),
    (102, 1, 650.00, DATE '2026-01-10', 'completed'),
    (103, 2, 400.00, DATE '2026-01-15', 'completed'),
    (104, 2, 600.00, DATE '2026-02-02', 'pending'),
    (105, 3, 250.00, DATE '2026-02-05', 'cancelled'),
    (106, 3, 500.00, DATE '2026-02-08', 'completed'),
    (107, 4, 1000.01, DATE '2026-02-12', 'completed'),
    (108, 6, 100.00, DATE '2026-03-01', 'completed'),
    (109, NULL, 25.00, DATE '2026-03-03', 'completed'),
    (110, NULL, 0.00, DATE '2026-03-04', 'pending');
-- Amount is the transaction's recorded value, regardless of status.
-- Seed item totals equal amount, but this cross-table rule is not a constraint.
-- Catalog prices can differ from historical unit prices.
INSERT INTO transaction_items VALUES
    (101, 1, 2, 300.00),
    (102, 3, 1, 650.00),
    (103, 1, 1, 300.00),
    (103, 2, 1, 100.00),
    (104, 1, 2, 300.00),
    (105, 4, 1, 250.00),
    (106, 4, 2, 250.00),
    (107, 6, 1, 1000.01),
    (108, 2, 1, 100.00),
    (109, 5, 5, 5.00);
COMMIT;
