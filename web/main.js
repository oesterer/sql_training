import { formatValue } from './format.js';
// DuckDB's browser ESM bundle and worker/Wasm assets use the same pinned version.
const DUCKDB_VERSION = '1.30.0';
const CDN = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_VERSION}/dist/`;
let duckdb, setupSQL;
async function readText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}: HTTP ${response.status}`);
  return response.text();
}


const $ = (id) => document.getElementById(id);
const editor = $('sql');
const examples = [
  ['First SELECT', 'SELECT * FROM customers ORDER BY customer_id;'],
  ['Count transactions', 'SELECT COUNT(*) AS transaction_count FROM transactions;'],
  ['Join customers & transactions', 'SELECT c.customer_name, t.transaction_id, t.amount\nFROM customers c\nJOIN transactions t ON t.customer_id = c.customer_id\nORDER BY t.transaction_id;'],
  ['Totals above $1,000', ''],
  ['Include every customer', 'SELECT c.customer_id, c.customer_name,\n       COALESCE(SUM(t.amount), 0) AS total\nFROM customers c\nLEFT JOIN transactions t ON t.customer_id = c.customer_id\nGROUP BY c.customer_id, c.customer_name\nORDER BY c.customer_id;'],
  ['Monthly completed sales', "SELECT DATE_TRUNC('month', transaction_date) AS month,\n       SUM(amount) AS sales\nFROM transactions\nWHERE status = 'completed'\nGROUP BY month ORDER BY month;"],
];
for (const [index, [name]] of examples.entries()) {
  $('examples').add(new Option(name, String(index)));
}
try { editor.value = localStorage.getItem('sql-lab-draft') || examples[0][1]; }
catch { editor.value = examples[0][1]; }
editor.addEventListener('input', () => {
  try { localStorage.setItem('sql-lab-draft', editor.value); } catch { /* Storage is optional. */ }
});
$('examples').disabled = true;
$('examples').addEventListener('change', (event) => {
  if (event.target.value === '') return;
  editor.value = examples[Number(event.target.value)][1];
  editor.dispatchEvent(new Event('input'));
  editor.focus();
});
let db, connection, worker, workerURL;
let busy = true;
function setBusy(value) {
  busy = value;
  $('run').disabled = value;
  $('reset').disabled = value;
  $('examples').disabled = value;
  document.querySelectorAll('[data-table]').forEach((button) => { button.disabled = value; });
}
function status(message, kind = '') {
  $('status').textContent = message;
  $('status').className = kind;
}
function showError(error) {
  const box = document.createElement('pre');
  box.className = 'error-box';
  box.textContent = error instanceof Error ? error.message : String(error);
  $('result').replaceChildren(box);
  $('metrics').textContent = 'Query failed';
}
function render(table, index, count) {
  const fragment = document.createDocumentFragment();
  if (count > 1) {
    const label = document.createElement('div');
    label.className = 'result-label';
    label.textContent = `Statement ${index + 1} · ${table.numRows.toLocaleString()} rows`;
    fragment.append(label);
  }
  if (!table.numRows) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Query completed. No rows returned.';
    fragment.append(empty);
  }
  const grid = document.createElement('table');
  const head = grid.createTHead().insertRow();
  table.schema.fields.forEach((field) => {
    const cell = document.createElement('th');
    cell.scope = 'col'; cell.textContent = field.name; head.append(cell);
  });
  const body = grid.createTBody();
  for (let row = 0; row < Math.min(table.numRows, 1000); row++) {
    const tr = body.insertRow();
    table.schema.fields.forEach((field, column) => {
      const value = table.getChildAt(column).get(row);
      const cell = tr.insertCell();
      cell.textContent = formatValue(value, field);
      if (value === null) cell.className = 'null';
    });
  }
  fragment.append(grid);
  if (table.numRows > 1000) {
    const note = document.createElement('div'); note.className = 'result-label';
    note.textContent = `Showing the first 1,000 of ${table.numRows.toLocaleString()} rows. Use LIMIT to narrow your query.`;
    fragment.append(note);
  }
  return fragment;
}
async function refreshSchema() {
  const rows = await connection.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'main' ORDER BY table_name, ordinal_position");
  const tables = new Map();
  for (const row of rows.toArray()) {
    if (!tables.has(row.table_name)) tables.set(row.table_name, []);
    tables.get(row.table_name).push([row.column_name, row.data_type]);
  }
  $('tables').replaceChildren();
  for (const [name, columns] of tables) {
    const details = document.createElement('details'); details.open = true;
    const summary = document.createElement('summary'); summary.append(name);
    const button = document.createElement('button'); button.textContent = 'Query';
    button.dataset.table = name; button.setAttribute('aria-label', `Query ${name}`);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      editor.value = `SELECT * FROM "${name.replaceAll('"', '""')}" LIMIT 100;`;
      editor.dispatchEvent(new Event('input'));
      void execute();
    });
    summary.append(button); details.append(summary);
    const list = document.createElement('ul');
    for (const [column, type] of columns) {
      const li = document.createElement('li');
      for (const text of [column, type]) { const span = document.createElement('span'); span.textContent = text; li.append(span); }
      list.append(li);
    }
    details.append(list); $('tables').append(details);
  }
}
async function execute(sqlOverride) {
  if (busy) return;
  const selection = editor.value.slice(editor.selectionStart, editor.selectionEnd).trim();
  const sql = sqlOverride || selection || editor.value.trim();
  if (!sql) { showError(new Error('Write a SQL query first.')); return; }
  setBusy(true); status('Running query…');
  const start = performance.now();
  try {
    // DuckDB handles SQL batches; the last statement supplies the displayed result.
    const results = [await connection.query(sql)];
    const output = document.createDocumentFragment();
    results.forEach((result, i) => output.append(render(result, i, results.length)));
    $('result').replaceChildren(output);
    $('metrics').textContent = `${results.reduce((sum, r) => sum + r.numRows, 0).toLocaleString()} rows · ${Math.round(performance.now() - start)} ms`;
    await refreshSchema();
    status('DuckDB ready', 'ready');
  } catch (error) { showError(error); status('DuckDB ready · check your SQL', 'ready'); }
  finally { setBusy(false); }
}
async function createDatabase() {
  if (connection) { await connection.close().catch(() => {}); connection = null; }
  if (db) { await db.terminate().catch(() => {}); db = null; }
  worker?.terminate();
  if (workerURL) URL.revokeObjectURL(workerURL);
  const bundle = await duckdb.selectBundle({mvp: {mainModule: CDN + 'duckdb-mvp.wasm', mainWorker: CDN + 'duckdb-browser-mvp.worker.js'}, eh: {mainModule: CDN + 'duckdb-eh.wasm', mainWorker: CDN + 'duckdb-browser-eh.worker.js'}});
  workerURL = URL.createObjectURL(new Blob([`importScripts('${bundle.mainWorker}');`], {type: 'text/javascript'}));
  worker = new Worker(workerURL);
  db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING), worker);
  await db.instantiate(bundle.mainModule);
  connection = await db.connect();
  await connection.query(setupSQL);
  await refreshSchema();
}
$('run').addEventListener('click', () => void execute());
editor.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void execute(); }
  if (event.key === 'Tab') {
    event.preventDefault(); editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
    editor.dispatchEvent(new Event('input'));
  }
});
$('reset').addEventListener('click', async () => {
  if (busy || !confirm('Restore all tables and seed data? Changes to the database will be discarded. Your SQL draft will remain.')) return;
  setBusy(true); status('Restoring teaching data…');
  try { await createDatabase(); setBusy(false); await execute(examples[0][1]); }
  catch (error) { showError(error); status('Reset failed · reload to retry', 'error'); }
});
try {
  const assets = await Promise.all([import(`https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_VERSION}/+esm`), readText('./setup.sql'), readText('./query.sql')]);
  [duckdb, setupSQL] = assets;
  examples[3][1] = assets[2];
  await createDatabase(); setBusy(false); await execute(examples[0][1]);
} catch (error) { showError(error); status('Could not start DuckDB · check internet and reload', 'error'); }
