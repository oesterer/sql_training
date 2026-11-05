# Learn SQL with DuckDB: customers and transactions

One online-shop schema supports a two-table interview question and progressively broader SQL lessons. Start with customers and transactions; add products and transaction_items for many-to-many relationships and sales analysis.

## Run

From the repository root:

```sh
duckdb interview.duckdb < setup.sql
duckdb interview.duckdb < query.sql
duckdb interview.duckdb
```

Paste practice queries in the interactive session; `.quit` exits. **Reset warning:** setup.sql drops and recreates the four teaching tables. Use a dedicated practice database. Rerunning setup.sql restores the original data. The former shop lesson is now part of this same schema; no second setup is needed.

## Files

- [setup.sql](setup.sql): all four tables, constraints, and fictional seed data.
- [query.sql](query.sql): the interview solution.
- [EXERCISES.md](EXERCISES.md): ERD, column rules, full seed data, and 49 progressive questions.
- [ANSWERS.md](ANSWERS.md): runnable solutions, expected results, and explanations.

## Interview question

> Given customers and transactions, return each customer's total transaction amount, including only customers with totals above $1,000.

Only two tables are needed:

```sql
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
```

| customer_id | customer_name | total_transaction_amount |
| ---: | --- | ---: |
| 1 | Alice Chen | 1250.00 |
| 4 | Diego Rossi | 1000.01 |

SUM adds transactions within each customer group; HAVING filters the resulting totals. Include the ID in GROUP BY because two customers share the name Alice Chen. Strict > excludes Ben's exactly 1000.00. WHERE amount > 1000 would incorrectly discard Alice's two smaller transactions before adding them.

The interview totals include **all statuses**. Completed-sales exercises explicitly filter status = 'completed'. Guest transactions have NULL customer IDs and are excluded by the interview's INNER JOIN. The original identified customer totals remain unchanged.

## Learning path

Questions 1–12 cover SELECT, filtering, aliases, sorting, COUNT, and aggregates. Questions 13–22 introduce inner and outer joins, GROUP BY, HAVING, and filtering in ON versus WHERE. Questions 23–36 add CASE, conditional aggregation, subqueries, CTEs, windows, and reasoning about NULLs. Questions 37–49 extend the same data with dates, monthly sales, three-table joins, historical prices, reconciliation, CROSS JOIN, set operations, and reversible data changes.

The seed data includes customers without transactions, guest transactions, missing emails, duplicate names, an empty transaction, and a product never ordered. It demonstrates unmatched rows on both sides of a full join and the NOT IN / NULL trap without a separate database.
