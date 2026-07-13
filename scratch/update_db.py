import sqlite3
import os
from flask_bcrypt import Bcrypt

def main():
    db_path = 'karshaq.db'
    if not os.path.exists(db_path):
        db_path = 'backend/karshaq.db'
        
    print(f"Connecting to database: {os.path.abspath(db_path)}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Add trending and new_arrival columns to products table if missing
    columns = [
        ('trending', 'BOOLEAN DEFAULT 0'),
        ('new_arrival', 'BOOLEAN DEFAULT 0')
    ]
    
    # Get current columns in products table
    cursor.execute("PRAGMA table_info(products)")
    existing_cols = [row[1] for row in cursor.fetchall()]
    print(f"Existing columns in products: {existing_cols}")
    
    for col_name, col_type in columns:
        if col_name not in existing_cols:
            try:
                print(f"Adding column {col_name} to products table...")
                cursor.execute(f"ALTER TABLE products ADD COLUMN {col_name} {col_type}")
                conn.commit()
                print("Column added successfully!")
            except Exception as e:
                print(f"Failed to add column {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists in products.")

    # 2. Add homepage_settings new columns if missing
    settings_columns = [
        ('featured_products_max', 'INTEGER DEFAULT 8'),
        ('featured_products_sort', 'VARCHAR(50) DEFAULT \'default\''),
        ('featured_products_slider', 'BOOLEAN DEFAULT 1'),
        ('featured_products_autoplay', 'BOOLEAN DEFAULT 0'),
        
        ('trending_products_max', 'INTEGER DEFAULT 8'),
        ('trending_products_sort', 'VARCHAR(50) DEFAULT \'default\''),
        ('trending_products_slider', 'BOOLEAN DEFAULT 1'),
        ('trending_products_autoplay', 'BOOLEAN DEFAULT 0'),
        
        ('new_arrivals_max', 'INTEGER DEFAULT 8'),
        ('new_arrivals_sort', 'VARCHAR(50) DEFAULT \'default\''),
        ('new_arrivals_slider', 'BOOLEAN DEFAULT 1'),
        ('new_arrivals_autoplay', 'BOOLEAN DEFAULT 0')
    ]
    
    # Get current columns in homepage_settings table
    cursor.execute("PRAGMA table_info(homepage_settings)")
    existing_settings_cols = [row[1] for row in cursor.fetchall()]
    print(f"Existing columns in homepage_settings: {existing_settings_cols}")
    
    for col_name, col_type in settings_columns:
        if col_name not in existing_settings_cols:
            try:
                print(f"Adding column {col_name} to homepage_settings table...")
                cursor.execute(f"ALTER TABLE homepage_settings ADD COLUMN {col_name} {col_type}")
                conn.commit()
                print("Column added successfully!")
            except Exception as e:
                print(f"Failed to add column {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists in homepage_settings.")

    # 3. Reset admin password to AdminPassword123! and role to 'admin'
    bcrypt = Bcrypt()
    password_hash = bcrypt.generate_password_hash('AdminPassword123!').decode('utf-8')
    
    # Check if admin user exists
    cursor.execute("SELECT * FROM users WHERE email = 'admin@karshaq.com'")
    admin = cursor.fetchone()
    if admin:
        print("Found admin user, resetting password and ensuring role is 'admin'...")
        cursor.execute(
            "UPDATE users SET role = 'admin', password_hash = ? WHERE email = 'admin@karshaq.com'",
            (password_hash,)
        )
        conn.commit()
        print("Admin user updated successfully.")
    else:
        print("Admin user not found in DB! Seeding via SQL...")
        cursor.execute(
            "INSERT INTO users (name, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, ?, ?)",
            ('Admin User', 'admin@karshaq.com', '9876543210', password_hash, 'admin', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin')
        )
        conn.commit()
        print("Admin user seeded successfully.")
        
    conn.close()
    print("Database updates completed successfully.")

if __name__ == '__main__':
    main()
