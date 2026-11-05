-- Return one row per customer whose combined transactions exceed $1,000.
SELECT
    c.customer_id,
    c.customer_name,
    SUM(t.amount) AS total_transaction_amount
FROM customers AS c
INNER JOIN transactions AS t ON t.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING SUM(t.amount) > 1000.00
ORDER BY total_transaction_amount DESC, c.customer_id;
