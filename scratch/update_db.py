import sqlite3

def main():
    db_path = 'backend/karshaq.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    updates = [
        ('/category_fruits.png', 'Fruits'),
        ('/category_vegetables.png', 'Vegetables'),
        ('/category_spices.png', 'Spices'),
        ('/category_dryfruits.png', 'Dry Fruits'),
        ('/category_combooffers.png', 'Others')
    ]
    
    for img, name in updates:
        cursor.execute("UPDATE categories SET image = ? WHERE name = ?", (img, name))
        
    conn.commit()
    print("Database updated successfully.")
    
    # Query back to verify
    cursor.execute("SELECT * FROM categories")
    print("Current categories table content:")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == '__main__':
    main()
