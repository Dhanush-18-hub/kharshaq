import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app import create_app
from models import db, User
from flask_bcrypt import Bcrypt

app = create_app()
with app.app_context():
    users = User.query.all()
    print("--- Database Users ---")
    for u in users:
        print(f"ID: {u.id}, Name: {u.name}, Email: {u.email}, Phone: {u.phone}, Role: {u.role}")
        
    print("\n--- Checking admin@karshaq.com explicitly ---")
    admin = User.query.filter_by(email='admin@karshaq.com').first()
    if admin:
        print(f"Found user: {admin.email}")
        print(f"Role: {admin.role}")
        bcrypt = Bcrypt()
        is_correct = bcrypt.check_password_hash(admin.password_hash, 'AdminPassword123!')
        print(f"Password 'AdminPassword123!' is correct: {is_correct}")
        if not is_correct or admin.role != 'admin':
            print("Fixing admin credentials...")
            admin.role = 'admin'
            admin.password_hash = bcrypt.generate_password_hash('AdminPassword123!').decode('utf-8')
            db.session.commit()
            print("Admin credentials updated successfully!")
    else:
        print("admin@karshaq.com not found! Seeding now...")
        bcrypt = Bcrypt()
        password_hash = bcrypt.generate_password_hash('AdminPassword123!').decode('utf-8')
        new_admin = User(
            name='Admin User',
            email='admin@karshaq.com',
            phone='9876543210',
            password_hash=password_hash,
            role='admin',
            profile_image='https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'
        )
        db.session.add(new_admin)
        db.session.commit()
        print("Default admin created successfully!")
