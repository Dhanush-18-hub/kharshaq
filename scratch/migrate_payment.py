import sqlite3
import os

db_path = 'karshaq.db'
if not os.path.exists(db_path):
    # Try parent directory or backend relative directory
    if os.path.exists('backend/karshaq.db'):
        db_path = 'backend/karshaq.db'
    elif os.path.exists('../karshaq.db'):
        db_path = '../karshaq.db'

print(f"Connecting to database at: {os.path.abspath(db_path)}")
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE users ADD COLUMN payment_methods JSON DEFAULT '[]'")
    conn.commit()
    print("Successfully added payment_methods column to users table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column payment_methods already exists. Skipping migration.")
    else:
        print(f"Error occurred: {e}")
finally:
    conn.close()
