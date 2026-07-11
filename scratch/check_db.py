from backend.app import create_app
from backend.models import db
import os

app = create_app()
with app.app_context():
    # Print the database uri and engine details
    print("SQLALCHEMY_DATABASE_URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    # Try to inspect SQLAlchemy engine configuration
    try:
        from sqlalchemy import inspect
        engine = db.engine
        print("Engine URL:", engine.url)
        # Let's inspect users table columns
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('users')]
        print("Columns in 'users' table:", columns)
    except Exception as e:
        print("Error inspecting engine:", e)
