const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const location =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : process.env.SQLITE_DB_LOCATION || path.join(__dirname, 'todo.db');

let db;

function init() {
  return new Promise((resolve, reject) => {

    if (db) {
      db.close(); // 🔥 close old connection
    }

    db = new sqlite3.Database(location, err => {
      if (err) return reject(err);

      db.run(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
        err => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });
}

function teardown() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();

    db.close(err => {
      if (err) return reject(err);
      db = null;
      resolve();
    });
  });
}

function getItems() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM todo_items', (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(item => ({ ...item, completed: item.completed === 1 })));
    });
  });
}

function getItem(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM todo_items WHERE id=?', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve({ ...row, completed: row.completed === 1 });
    });
  });
}

function storeItem(item) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
      [item.id, item.name, item.completed ? 1 : 0],
      err => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function updateItem(id, item) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE todo_items SET name=?, completed=? WHERE id=?',
      [item.name, item.completed ? 1 : 0, id],
      err => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function removeItem(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todo_items WHERE id=?', [id], err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  init,
  teardown,
  getItems,
  getItem,
  storeItem,
  updateItem,
  removeItem,
};
