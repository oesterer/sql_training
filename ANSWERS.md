# Answer key

See [EXERCISES.md](EXERCISES.md) for the unified ERD, seed data, and questions. CSV results below use the unchanged seed; empty CSV fields represent NULL.

## 1. First SELECT

Return every column and row in customers, ordered by customer ID.

```sql
SELECT * FROM customers ORDER BY customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,city,email
1,Alice Chen,Seattle,alice@example.com
2,Ben Ortiz,Portland,ben@example.com
3,Cara Singh,Seattle,NULL
4,Diego Rossi,Austin,diego@example.com
5,Emma Wilson,Boston,NULL
6,Alice Chen,Austin,alice6@example.com
```

## 2. Choose columns

Return only transaction IDs and amounts, ordered by transaction ID.

```sql
SELECT transaction_id, amount FROM transactions ORDER BY transaction_id;

```

Expected result (CSV):

```text
transaction_id,amount
101,600.00
102,650.00
103,400.00
104,600.00
105,250.00
106,500.00
107,1000.01
108,100.00
109,25.00
110,0.00
```

## 3. Filter one customer

Find customer ID 2.

```sql
SELECT * FROM customers WHERE customer_id = 2;

```

Expected result (CSV):

```text
customer_id,customer_name,city,email
2,Ben Ortiz,Portland,ben@example.com
```

## 4. Filter amounts

List transactions strictly above $500, ordered by amount and then transaction ID.

```sql
SELECT * FROM transactions WHERE amount > 500 ORDER BY amount, transaction_id;

```

Expected result (CSV):

```text
transaction_id,customer_id,amount,transaction_date,status
101,1,600.00,2026-01-05,completed
104,2,600.00,2026-02-02,pending
102,1,650.00,2026-01-10,completed
107,4,1000.01,2026-02-12,completed
```

## 5. Aliases and arithmetic

Show each transaction amount and its amount plus a 5% fee, rounded to two decimals. Name the calculated column amount_with_fee.

```sql
SELECT transaction_id, amount, ROUND(amount * 1.05, 2) AS amount_with_fee
FROM transactions ORDER BY transaction_id;

```

Expected result (CSV):

```text
transaction_id,amount,amount_with_fee
101,600.00,630.00
102,650.00,682.50
103,400.00,420.00
104,600.00,630.00
105,250.00,262.50
106,500.00,525.00
107,1000.01,1050.01
108,100.00,105.00
109,25.00,26.25
110,0.00,0.00
```

## 6. Sorting and LIMIT

Find the three largest transactions. Break ties by transaction ID.

```sql
SELECT * FROM transactions ORDER BY amount DESC, transaction_id LIMIT 3;

```

Expected result (CSV):

```text
transaction_id,customer_id,amount,transaction_date,status
107,4,1000.01,2026-02-12,completed
102,1,650.00,2026-01-10,completed
101,1,600.00,2026-01-05,completed
```

## 7. IN and BETWEEN

Find transactions for customer IDs 1 or 2 with amounts between $400 and $600 inclusive.

```sql
SELECT * FROM transactions
WHERE customer_id IN (1, 2) AND amount BETWEEN 400 AND 600
ORDER BY transaction_id;

```

Expected result (CSV):

```text
transaction_id,customer_id,amount,transaction_date,status
101,1,600.00,2026-01-05,completed
103,2,400.00,2026-01-15,completed
104,2,600.00,2026-02-02,pending
```

## 8. Text matching

Find customers whose names start with Alice, using LIKE.

```sql
SELECT * FROM customers WHERE customer_name LIKE 'Alice%' ORDER BY customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,city,email
1,Alice Chen,Seattle,alice@example.com
6,Alice Chen,Austin,alice6@example.com
```

## 9. DISTINCT

List distinct customer names alphabetically. Does this tell you how many customers there are?

```sql
SELECT DISTINCT customer_name FROM customers ORDER BY customer_name;

```

Expected result (CSV):

```text
customer_name
Alice Chen
Ben Ortiz
Cara Singh
Diego Rossi
Emma Wilson
```

## 10. COUNT

Return the number of customers, then the number of transactions, as two separate queries.

```sql
SELECT COUNT(*) AS customer_count FROM customers;
SELECT COUNT(*) AS transaction_count FROM transactions;

```

Expected result (CSV):

```text
customer_count
6
transaction_count
10
```

## 11. Distinct counts

In one query, count transactions and count customers who have transactions.

```sql
SELECT COUNT(*) AS transaction_count, COUNT(DISTINCT customer_id) AS active_customers
FROM transactions;

```

Expected result (CSV):

```text
transaction_count,active_customers
10,5
```

## 12. Basic aggregates

Find the sum, minimum, maximum, and average transaction amount. Round the average to two decimals.

```sql
SELECT SUM(amount) AS total, MIN(amount) AS minimum, MAX(amount) AS maximum,
       ROUND(AVG(amount), 2) AS average
FROM transactions;

```

Expected result (CSV):

```text
total,minimum,maximum,average
4125.01,0.00,1000.01,412.5
```

## 13. INNER JOIN

List transactions with matching customers, showing customer ID, customer name, and amount. Explain which transactions are excluded.

```sql
SELECT t.transaction_id, c.customer_id, c.customer_name, t.amount
FROM customers c INNER JOIN transactions t ON t.customer_id = c.customer_id
ORDER BY t.transaction_id;

```

Expected result (CSV):

```text
transaction_id,customer_id,customer_name,amount
101,1,Alice Chen,600.00
102,1,Alice Chen,650.00
103,2,Ben Ortiz,400.00
104,2,Ben Ortiz,600.00
105,3,Cara Singh,250.00
106,3,Cara Singh,500.00
107,4,Diego Rossi,1000.01
108,6,Alice Chen,100.00
```

## 14. LEFT JOIN

List every customer and any matching transaction IDs and amounts. Preserve customers without transactions.

```sql
SELECT c.customer_id, c.customer_name, t.transaction_id, t.amount
FROM customers c LEFT JOIN transactions t ON t.customer_id = c.customer_id
ORDER BY c.customer_id, t.transaction_id;

```

Expected result (CSV):

```text
customer_id,customer_name,transaction_id,amount
1,Alice Chen,101,600.00
1,Alice Chen,102,650.00
2,Ben Ortiz,103,400.00
2,Ben Ortiz,104,600.00
3,Cara Singh,105,250.00
3,Cara Singh,106,500.00
4,Diego Rossi,107,1000.01
5,Emma Wilson,NULL,NULL
6,Alice Chen,108,100.00
```

## 15. Find missing matches

Use LEFT JOIN to find customers with no transactions.

```sql
SELECT c.customer_id, c.customer_name
FROM customers c LEFT JOIN transactions t ON t.customer_id = c.customer_id
WHERE t.transaction_id IS NULL ORDER BY c.customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name
5,Emma Wilson
```

## 16. RIGHT and FULL joins

Rewrite question 14 using RIGHT JOIN. Then use FULL OUTER JOIN and explain which extra rows it returns compared with the left join.

```sql
SELECT c.customer_id, c.customer_name, t.transaction_id, t.amount
FROM transactions t RIGHT JOIN customers c ON c.customer_id = t.customer_id
ORDER BY c.customer_id, t.transaction_id;

SELECT c.customer_id, c.customer_name, t.transaction_id, t.amount
FROM customers c FULL OUTER JOIN transactions t ON t.customer_id = c.customer_id
ORDER BY c.customer_id, t.transaction_id;

```

Expected result (CSV):

```text
customer_id,customer_name,transaction_id,amount
1,Alice Chen,101,600.00
1,Alice Chen,102,650.00
2,Ben Ortiz,103,400.00
2,Ben Ortiz,104,600.00
3,Cara Singh,105,250.00
3,Cara Singh,106,500.00
4,Diego Rossi,107,1000.01
5,Emma Wilson,NULL,NULL
6,Alice Chen,108,100.00
customer_id,customer_name,transaction_id,amount
1,Alice Chen,101,600.00
1,Alice Chen,102,650.00
2,Ben Ortiz,103,400.00
2,Ben Ortiz,104,600.00
3,Cara Singh,105,250.00
3,Cara Singh,106,500.00
4,Diego Rossi,107,1000.01
5,Emma Wilson,NULL,NULL
6,Alice Chen,108,100.00
NULL,NULL,109,25.00
NULL,NULL,110,0.00
```

## 17. GROUP BY

Return the transaction count and total amount per customer ID, using only transactions.

```sql
SELECT customer_id, COUNT(*) AS transaction_count, SUM(amount) AS total
FROM transactions GROUP BY customer_id ORDER BY customer_id;

```

Expected result (CSV):

```text
customer_id,transaction_count,total
1,2,1250.00
2,2,1000.00
3,2,750.00
4,1,1000.01
6,1,100.00
NULL,2,25.00
```

## 18. Group joined data

Return each customer ID and name with their transaction count and total, including zeroes for customers without transactions.

```sql
SELECT c.customer_id, c.customer_name, COUNT(t.transaction_id) AS transaction_count,
       COALESCE(SUM(t.amount), 0.00) AS total
FROM customers c LEFT JOIN transactions t ON t.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name ORDER BY c.customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,transaction_count,total
1,Alice Chen,2,1250.00
2,Ben Ortiz,2,1000.00
3,Cara Singh,2,750.00
4,Diego Rossi,1,1000.01
5,Emma Wilson,0,0.00
6,Alice Chen,1,100.00
```

## 19. HAVING: the interview question

Return each customer's total transaction amount, including only customers with totals above $1,000. Show customer ID and name; sort by total descending.

```sql
SELECT c.customer_id, c.customer_name, SUM(t.amount) AS total_transaction_amount
FROM customers c JOIN transactions t ON t.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING SUM(t.amount) > 1000.00
ORDER BY total_transaction_amount DESC, c.customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,total_transaction_amount
1,Alice Chen,1250.00
4,Diego Rossi,1000.01
```

## 20. Multiple group conditions

Find customers with at least two transactions and a total of at least $1,000.

```sql
SELECT c.customer_id, c.customer_name, COUNT(*) AS transaction_count, SUM(t.amount) AS total
FROM customers c JOIN transactions t ON t.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(*) >= 2 AND SUM(t.amount) >= 1000
ORDER BY c.customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,transaction_count,total
1,Alice Chen,2,1250.00
2,Ben Ortiz,2,1000.00
```

## 21. WHERE versus HAVING

Consider only transactions of at least $500. Among those transactions, return customer IDs whose total is above $1,000. Explain why this differs from question 19.

```sql
SELECT customer_id, SUM(amount) AS qualifying_total
FROM transactions WHERE amount >= 500
GROUP BY customer_id HAVING SUM(amount) > 1000
ORDER BY customer_id;

```

Expected result (CSV):

```text
customer_id,qualifying_total
1,1250.00
4,1000.01
```

## 22. ON versus WHERE

List every customer with a count of their transactions above $500, including zero counts. Put the amount filter in the join condition.

```sql
SELECT c.customer_id, c.customer_name, COUNT(t.transaction_id) AS large_transaction_count
FROM customers c LEFT JOIN transactions t
  ON t.customer_id = c.customer_id AND t.amount > 500
GROUP BY c.customer_id, c.customer_name ORDER BY c.customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,large_transaction_count
1,Alice Chen,2
2,Ben Ortiz,1
3,Cara Singh,0
4,Diego Rossi,1
5,Emma Wilson,0
6,Alice Chen,0
```

## 23. CASE

Label each transaction Large if its amount is at least $600, otherwise Small.

```sql
SELECT transaction_id, amount,
       CASE WHEN amount >= 600 THEN 'Large' ELSE 'Small' END AS size
FROM transactions ORDER BY transaction_id;

```

Expected result (CSV):

```text
transaction_id,amount,size
101,600.00,Large
102,650.00,Large
103,400.00,Small
104,600.00,Large
105,250.00,Small
106,500.00,Small
107,1000.01,Large
108,100.00,Small
109,25.00,Small
110,0.00,Small
```

## 24. Conditional aggregation

For each customer, count transactions at least $600 and transactions below $600. Include customers with no transactions.

```sql
SELECT c.customer_id, c.customer_name,
       SUM(CASE WHEN t.amount >= 600 THEN 1 ELSE 0 END) AS large_count,
       SUM(CASE WHEN t.amount < 600 THEN 1 ELSE 0 END) AS small_count
FROM customers c LEFT JOIN transactions t ON t.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name ORDER BY c.customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,large_count,small_count
1,Alice Chen,2,0
2,Ben Ortiz,1,1
3,Cara Singh,0,2
4,Diego Rossi,1,0
5,Emma Wilson,0,0
6,Alice Chen,0,1
```

## 25. Scalar subquery

Find transactions above the overall average amount. Compare against the unrounded average.

```sql
SELECT * FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions)
ORDER BY transaction_id;

```

Expected result (CSV):

```text
transaction_id,customer_id,amount,transaction_date,status
101,1,600.00,2026-01-05,completed
102,1,650.00,2026-01-10,completed
104,2,600.00,2026-02-02,pending
106,3,500.00,2026-02-08,completed
107,4,1000.01,2026-02-12,completed
```

## 26. EXISTS and NOT EXISTS

Find customers with transactions using EXISTS, then customers without transactions using NOT EXISTS.

```sql
SELECT c.* FROM customers c
WHERE EXISTS (SELECT 1 FROM transactions t WHERE t.customer_id = c.customer_id)
ORDER BY c.customer_id;

SELECT c.* FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM transactions t WHERE t.customer_id = c.customer_id)
ORDER BY c.customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,city,email
1,Alice Chen,Seattle,alice@example.com
2,Ben Ortiz,Portland,ben@example.com
3,Cara Singh,Seattle,NULL
4,Diego Rossi,Austin,diego@example.com
6,Alice Chen,Austin,alice6@example.com
customer_id,customer_name,city,email
5,Emma Wilson,Boston,NULL
```

## 27. CTE and average customer totals

Use a CTE to calculate every customer total, treating no transactions as zero. Return customers whose totals exceed the average of all six customer totals.

```sql
WITH totals AS (
    SELECT c.customer_id, c.customer_name, COALESCE(SUM(t.amount), 0.00) AS total
    FROM customers c LEFT JOIN transactions t ON t.customer_id = c.customer_id
    GROUP BY c.customer_id, c.customer_name
)
SELECT * FROM totals WHERE total > (SELECT AVG(total) FROM totals)
ORDER BY total DESC, customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,total
1,Alice Chen,1250.00
4,Diego Rossi,1000.01
2,Ben Ortiz,1000.00
3,Cara Singh,750.00
```

## 28. Window aggregate

Show each transaction beside its customer total without collapsing transaction rows.

```sql
SELECT transaction_id, customer_id, amount,
       SUM(amount) OVER (PARTITION BY customer_id) AS customer_total
FROM transactions ORDER BY customer_id, transaction_id;

```

Expected result (CSV):

```text
transaction_id,customer_id,amount,customer_total
101,1,600.00,1250.00
102,1,650.00,1250.00
103,2,400.00,1000.00
104,2,600.00,1000.00
105,3,250.00,750.00
106,3,500.00,750.00
107,4,1000.01,1000.01
108,6,100.00,100.00
109,NULL,25.00,25.00
110,NULL,0.00,25.00
```

## 29. Ranking

Rank every customer by total amount, highest first, including customers without transactions. Use DENSE_RANK so tied totals would share a rank.

```sql
WITH totals AS (
    SELECT c.customer_id, c.customer_name, COALESCE(SUM(t.amount), 0.00) AS total
    FROM customers c LEFT JOIN transactions t ON t.customer_id = c.customer_id
    GROUP BY c.customer_id, c.customer_name
)
SELECT *, DENSE_RANK() OVER (ORDER BY total DESC) AS total_rank
FROM totals ORDER BY total_rank, customer_id;

```

Expected result (CSV):

```text
customer_id,customer_name,total,total_rank
1,Alice Chen,1250.00,1
4,Diego Rossi,1000.01,2
2,Ben Ortiz,1000.00,3
3,Cara Singh,750.00,4
6,Alice Chen,100.00,5
5,Emma Wilson,0.00,6
```

## 30. Running totals

Show a running amount per customer ordered by transaction ID. Use an explicit ROWS window frame. This demonstrates ID order. For a chronological running total, order by transaction_date and transaction_id instead. Guest transactions share a NULL partition; that partition does not identify one person.

```sql
SELECT transaction_id, customer_id, amount,
       SUM(amount) OVER (PARTITION BY customer_id ORDER BY transaction_id
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM transactions ORDER BY customer_id, transaction_id;

```

Expected result (CSV):

```text
transaction_id,customer_id,amount,running_total
101,1,600.00,600.00
102,1,650.00,1250.00
103,2,400.00,400.00
104,2,600.00,1000.00
105,3,250.00,250.00
106,3,500.00,750.00
107,4,1000.01,1000.01
108,6,100.00,100.00
109,NULL,25.00,25.00
110,NULL,0.00,25.00
```

## 31–36. Reasoning answers

31. Grouping by name combines IDs 1 and 6 into a false 1350.00 total. Group by customer identity and the selected name.
32. A left join preserves Emma's customer row. COUNT(*) counts that row; COUNT(t.transaction_id) ignores its NULL transaction ID.
33. WHERE keeps only true predicates. An unmatched right-side value is NULL, so comparisons are unknown and the row is removed. Put the filter in ON to retain every customer.
34. Guest transactions introduce NULL into the subquery, causing NOT IN to reject unmatched IDs too. Use NOT EXISTS or exclude NULL customer IDs in the subquery.
35. A nullable foreign key allows guest transactions 109 and 110 with NULL customer IDs. It still rejects nonexistent non-NULL IDs. FULL JOIN preserves these guest rows as well as Emma's unmatched customer row; LEFT JOIN from customers excludes guests.
36. NOT EXISTS or a left anti-join finds no transactions. HAVING COALESCE(SUM(t.amount), 0) = 0 finds zero totals, which could also include a customer with zero-amount transactions.

## 37. Stored NULLs

List customers without email, displaying (not supplied), and count all customers versus known emails.

```sql
SELECT customer_id, COALESCE(email, '(not supplied)') AS email
FROM customers WHERE email IS NULL ORDER BY customer_id;
SELECT COUNT(*) AS customers, COUNT(email) AS known_emails FROM customers;
```

Expected result (CSV):

```text
customer_id,email
3,(not supplied)
5,(not supplied)
customers,known_emails
6,4
```

## 38. ILIKE and Boolean filters

Find customers in Seattle or Austin whose names do not start with Diego (case-insensitive).

```sql
SELECT customer_id, customer_name FROM customers
WHERE (city = 'Seattle' OR city = 'Austin') AND NOT customer_name ILIKE 'diego%'
ORDER BY customer_id;
```

Expected result (CSV):

```text
customer_id,customer_name
1,Alice Chen
3,Cara Singh
6,Alice Chen
```

## 39. Dates

List February transactions with a half-open date range.

```sql
SELECT transaction_id, transaction_date FROM transactions
WHERE transaction_date >= DATE '2026-02-01' AND transaction_date < DATE '2026-03-01'
ORDER BY transaction_date, transaction_id;
```

Expected result (CSV):

```text
transaction_id,transaction_date
104,2026-02-02
105,2026-02-05
106,2026-02-08
107,2026-02-12
```

## 40. Monthly sales

Report completed transaction counts and amounts by month, including guests.

```sql
SELECT CAST(DATE_TRUNC('month', transaction_date) AS DATE) AS month,
       COUNT(*) AS transaction_count, SUM(amount) AS sales
FROM transactions WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date) ORDER BY month;
```

Expected result (CSV):

```text
month,transaction_count,sales
2026-01-01,3,1650.00
2026-02-01,2,1500.01
2026-03-01,2,125.00
```

## 41. IN subquery and NULL trap

Use IN with a subquery to find customers with completed transactions. Then demonstrate the NOT IN NULL trap and fix it.

```sql
SELECT customer_id, customer_name FROM customers
WHERE customer_id IN (SELECT customer_id FROM transactions WHERE status = 'completed')
ORDER BY customer_id;
SELECT customer_id FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM transactions) ORDER BY customer_id;
SELECT customer_id FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM transactions WHERE customer_id IS NOT NULL)
ORDER BY customer_id;
```

Expected result (CSV):

```text
customer_id,customer_name
1,Alice Chen
2,Ben Ortiz
3,Cara Singh
4,Diego Rossi
6,Alice Chen
customer_id
customer_id
5
```

## 42. Three-table join

List completed transaction items with product names, quantities, historical unit prices, and calculated line totals. Include guest purchases.

```sql
SELECT t.transaction_id, p.product_name, i.quantity, i.unit_price,
       i.quantity * i.unit_price AS line_total
FROM transactions t JOIN transaction_items i ON i.transaction_id = t.transaction_id
JOIN products p ON p.product_id = i.product_id
WHERE t.status = 'completed' ORDER BY t.transaction_id, p.product_id;
```

Expected result (CSV):

```text
transaction_id,product_name,quantity,unit_price,line_total
101,Monitor,2,300.00,600.00
102,Desk,1,650.00,650.00
103,Monitor,1,300.00,300.00
103,Keyboard,1,100.00,100.00
106,Chair,2,250.00,500.00
107,Gift card,1,1000.01,1000.01
108,Keyboard,1,100.00,100.00
109,Notebook,5,5.00,25.00
```

## 43. Reconcile totals

Compare every recorded transaction amount with its item total, including transactions with no items.

```sql
SELECT t.transaction_id, t.amount, COALESCE(SUM(i.quantity * i.unit_price), 0) AS item_total,
       t.amount - COALESCE(SUM(i.quantity * i.unit_price), 0) AS difference
FROM transactions t LEFT JOIN transaction_items i ON i.transaction_id = t.transaction_id
GROUP BY t.transaction_id, t.amount ORDER BY t.transaction_id;
```

Expected result (CSV):

```text
transaction_id,amount,item_total,difference
101,600.00,600.00,0.00
102,650.00,650.00,0.00
103,400.00,400.00,0.00
104,600.00,600.00,0.00
105,250.00,250.00,0.00
106,500.00,500.00,0.00
107,1000.01,1000.01,0.00
108,100.00,100.00,0.00
109,25.00,25.00,0.00
110,0.00,0.00,0.00
```

## 44. Sales by category

Calculate completed item sales for every catalog category, including zero for categories with no completed sales. Use historical prices.

```sql
WITH sales AS (
    SELECT p.category, SUM(i.quantity * i.unit_price) AS sales
    FROM products p JOIN transaction_items i ON i.product_id = p.product_id
    JOIN transactions t ON t.transaction_id = i.transaction_id
    WHERE t.status = 'completed' GROUP BY p.category
)
SELECT c.category, COALESCE(s.sales, 0) AS sales
FROM (SELECT DISTINCT category FROM products) c
LEFT JOIN sales s ON s.category = c.category ORDER BY c.category;
```

Expected result (CSV):

```text
category,sales
Electronics,1100.00
Furniture,1150.00
Gifts,1000.01
Home,0.00
Stationery,25.00
```

## 45. Never ordered

Find products that have never appeared in any transaction, regardless of status.

```sql
SELECT p.product_id, p.product_name FROM products p
WHERE NOT EXISTS (SELECT 1 FROM transaction_items i WHERE i.product_id = p.product_id)
ORDER BY p.product_id;
```

Expected result (CSV):

```text
product_id,product_name
7,Desk lamp
```

## 46. Row multiplication

For completed transactions with items, compare joined item rows, distinct transactions, SUM(transaction amount), and SUM(line total). Explain the inflated sum.

```sql
SELECT COUNT(*) AS item_rows, COUNT(DISTINCT t.transaction_id) AS transactions,
       SUM(t.amount) AS inflated_amount, SUM(i.quantity * i.unit_price) AS actual_sales
FROM transactions t JOIN transaction_items i ON i.transaction_id = t.transaction_id
WHERE t.status = 'completed';
```

Expected result (CSV):

```text
item_rows,transactions,inflated_amount,actual_sales
8,7,3675.01,3275.01
```

## 47. CROSS JOIN

Generate every combination of distinct product categories and the statuses completed and pending.

```sql
SELECT c.category, s.status FROM (SELECT DISTINCT category FROM products) c
CROSS JOIN (VALUES ('completed'), ('pending')) s(status) ORDER BY c.category, s.status;
```

Expected result (CSV):

```text
category,status
Electronics,completed
Electronics,pending
Furniture,completed
Furniture,pending
Gifts,completed
Gifts,pending
Home,completed
Home,pending
Stationery,completed
Stationery,pending
```

## 48. Set operations

Find customer IDs appearing in completed or pending transactions using UNION. Then try UNION ALL, INTERSECT, and EXCEPT. Exclude guests in each input.

```sql
SELECT customer_id FROM transactions WHERE status = 'completed' AND customer_id IS NOT NULL
UNION
SELECT customer_id FROM transactions WHERE status = 'pending' AND customer_id IS NOT NULL
ORDER BY customer_id;
```

Expected result (CSV):

```text
customer_id
1
2
3
4
6
```

UNION ALL:

```sql
SELECT customer_id FROM transactions WHERE status = 'completed' AND customer_id IS NOT NULL
UNION ALL
SELECT customer_id FROM transactions WHERE status = 'pending' AND customer_id IS NOT NULL
ORDER BY customer_id;
```

```text
customer_id
1
1
2
2
3
4
6
```

INTERSECT:

```sql
SELECT customer_id FROM transactions WHERE status = 'completed' AND customer_id IS NOT NULL
INTERSECT
SELECT customer_id FROM transactions WHERE status = 'pending' AND customer_id IS NOT NULL
ORDER BY customer_id;
```

```text
customer_id
2
```

EXCEPT:

```sql
SELECT customer_id FROM transactions WHERE status = 'completed' AND customer_id IS NOT NULL
EXCEPT
SELECT customer_id FROM transactions WHERE status = 'pending' AND customer_id IS NOT NULL
ORDER BY customer_id;
```

```text
customer_id
1
3
4
6
```

## 49. Reversible data changes

In one transaction, insert customer 99, update their city, select them, delete them, and roll back. Use explicit column lists.

```sql
BEGIN TRANSACTION;
INSERT INTO customers (customer_id, customer_name, city, email)
VALUES (99, 'Practice Customer', 'Denver', NULL);
UPDATE customers SET city = 'Boulder' WHERE customer_id = 99;
SELECT * FROM customers WHERE customer_id = 99;
DELETE FROM customers WHERE customer_id = 99;
ROLLBACK;
SELECT COUNT(*) AS practice_rows FROM customers WHERE customer_id = 99;
```

Expected result (CSV):

```text
customer_id,customer_name,city,email
99,Practice Customer,Boulder,NULL
practice_rows
0
```

## Interpretation notes

- The dataset has 6 customers, 10 transactions (2 guests), 7 products, and 10 item rows.
- INNER JOIN to customers excludes guests; LEFT JOIN from customers returns 9 rows; FULL JOIN returns 11 rows.
- COUNT(DISTINCT customer_id) ignores NULL: there are 5 identified customers with transactions.
- The interview answer is unchanged: Alice (ID 1) = 1250.00 and Diego = 1000.01, across all statuses.
- SUM(transaction amount) after joining items repeats amounts for multi-item transactions. Aggregate items per transaction first or sum line totals; SUM(DISTINCT amount) is not a general fix because unrelated transactions can have equal amounts.
- Completed sales include guests, while customer-total averages consider the six identified customers, including Emma's zero.
- For question 48, UNION removes duplicates, UNION ALL retains them, INTERSECT keeps common IDs, and EXCEPT keeps IDs in the first input but absent from the second. Inputs need compatible columns.
- Question 49 intentionally rolls back; COMMIT would persist changes. UPDATE or DELETE without WHERE affects every row.
- Duplicate primary keys, nonexistent foreign keys, negative amounts, invalid statuses, and nonpositive quantities are rejected. Cross-table amount reconciliation is a query, not an enforced constraint.

SQL uses single quotes for text and double quotes for identifiers. LIKE uses % for any number of characters and _ for one; ILIKE ignores case. BETWEEN includes both endpoints. NULL is tested with IS NULL, not = NULL. COUNT returns zero on empty input; SUM and AVG return NULL. WHERE filters rows, HAVING filters groups. A useful conceptual clause order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT; the optimizer may execute differently.
