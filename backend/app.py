import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.models import db, User, Product
from backend.routes.auth import auth_bp
from backend.routes.user import user_bp
from backend.routes.cart import cart_bp
from backend.routes.admin import admin_bp
from backend.routes.products import products_bp
from flask_bcrypt import Bcrypt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for React dev server (supporting credentials / headers)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize Database
    db.init_app(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Register JWT Error Handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Session Expired',
            'message': 'Your session has expired. Please log in again.'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid Token',
            'message': 'Signature verification failed. Access denied.'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization Required',
            'message': 'Request does not contain an access token.'
        }), 401

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(products_bp, url_prefix='/api')
    
    # Create DB tables and seed data
    with app.app_context():
        print("\n========== DATABASE USERS ==========")
        users = User.query.all()

        for u in users:
            print(f"ID={u.id} | {u.email} | {u.role}")

            print("====================================\n")
        db.create_all()
        
        # 1. Seed default admin user if not exists
        admin_user = User.query.filter_by(role='admin').first()
        if not admin_user:
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
            print("Seeded default admin user: admin@karshaq.com")
            
        # 2. Seed initial products list if empty
        if Product.query.count() == 0:
            SEED_PRODUCTS = [
                {
                    'id': 'f3', 'name': 'Alphonso Mango', 'weight': '1 kg', 'price': 149, 'original_price': 199,
                    'discount': '25% OFF', 'rating': 4.6, 'reviews': 128, 'image': '/product_mango.png', 'category': 'fruits', 'subcat': 'mangoes'
                },
                {
                    'id': 'f2', 'name': 'Banana - Robusta', 'weight': '1 kg', 'price': 49, 'original_price': 60,
                    'discount': '18% OFF', 'rating': 4.5, 'reviews': 96, 'image': '/product_bananas.png', 'category': 'fruits', 'subcat': 'bananas'
                },
                {
                    'id': 'v3', 'name': 'Tomato - Hybrid', 'weight': '1 kg', 'price': 32, 'original_price': 40,
                    'discount': '20% OFF', 'rating': 4.4, 'reviews': 76, 'image': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=260', 'category': 'vegetables', 'subcat': 'tomatoes'
                },
                {
                    'id': 'o1', 'name': 'Fresh Paneer', 'weight': '200 g', 'price': 74, 'original_price': 85,
                    'discount': '', 'rating': 4.7, 'reviews': 58, 'image': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=260', 'category': 'vegetables', 'subcat': 'dairy'
                },
                {
                    'id': 'v9', 'name': 'Potato', 'weight': '1 kg', 'price': 28, 'original_price': 35,
                    'discount': '20% OFF', 'rating': 4.4, 'reviews': 112, 'image': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=260', 'category': 'vegetables', 'subcat': 'roots'
                },
                {
                    'id': 's1', 'name': 'Turmeric Powder', 'weight': '200 g', 'price': 85, 'original_price': 110,
                    'discount': '23% OFF', 'rating': 4.6, 'reviews': 39, 'image': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=260', 'category': 'spices', 'subcat': 'powders'
                },
                {
                    'id': 'd1', 'name': 'Almonds', 'weight': '250 g', 'price': 255, 'original_price': 300,
                    'discount': '', 'rating': 4.8, 'reviews': 67, 'image': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d4b?auto=format&fit=crop&q=80&w=260', 'category': 'dryfruits', 'subcat': 'nuts'
                },
                {
                    'id': 'o2', 'name': 'Honey', 'weight': '500 g', 'price': 199, 'original_price': 240,
                    'discount': '', 'rating': 4.7, 'reviews': 53, 'image': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=260', 'category': 'others', 'subcat': 'honey'
                },
                {
                    'id': 'f_extra1', 'name': 'Fresh Strawberries', 'weight': '250 g', 'price': 120, 'original_price': 233,
                    'discount': '48% OFF', 'rating': 4.8, 'reviews': 42, 'image': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=260', 'category': 'fruits', 'subcat': 'berries'
                },
                {
                    'id': 'f_extra2', 'name': 'Fresh Kiwi', 'weight': '3 pcs', 'price': 130, 'original_price': 330,
                    'discount': '60% OFF', 'rating': 4.5, 'reviews': 29, 'image': 'https://images.unsplash.com/photo-1585052201332-b8c0ce30972f?auto=format&fit=crop&q=80&w=260', 'category': 'fruits', 'subcat': 'exotic'
                },
                {
                    'id': 'v_extra1', 'name': 'Fresh Broccoli', 'weight': '1 pc', 'price': 120, 'original_price': 120,
                    'discount': '', 'rating': 4.7, 'reviews': 64, 'image': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=260', 'category': 'vegetables', 'subcat': 'exotic'
                },
                {
                    'id': 's_extra1', 'name': 'Cardamom (Elaichi)', 'weight': '100 g', 'price': 85, 'original_price': 85,
                    'discount': '', 'rating': 4.9, 'reviews': 110, 'image': 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=260', 'category': 'spices', 'subcat': 'pods'
                }
            ]
            for p in SEED_PRODUCTS:
                prod = Product(
                    id=p['id'],
                    name=p['name'],
                    weight=p['weight'],
                    price=p['price'],
                    original_price=p['original_price'],
                    discount=p['discount'],
                    rating=p['rating'],
                    reviews=p['reviews'],
                    image=p['image'],
                    category=p['category'],
                    subcat=p['subcat'],
                    stock=100,
                    availability=True
                )
                db.session.add(prod)
            db.session.commit()
            print("Seeded database with initial products list.")
        
        # 3. Seed initial categories list if empty
        from backend.models import Category, SubCategory
        if Category.query.count() == 0:
            default_features = [
                {"title": "Farm Fresh", "desc": "Picked Daily", "icon": "Leaf"},
                {"title": "No Chemicals", "desc": "100% Natural", "icon": "ShieldCheck"},
                {"title": "Premium Quality", "desc": "Hand Selected", "icon": "Star"},
                {"title": "Delivered Fresh", "desc": "At Your Doorstep", "icon": "Truck"}
            ]
            SEED_CATEGORIES = [
                {
                    'name': 'Fruits',
                    'slug': 'fruits',
                    'image': '/category_fruits.png',
                    'heroBadge': '100% FARM FRESH',
                    'heroTitle': "Nature's Sweetest Gift, Just for You",
                    'heroSubtitle': 'Handpicked at peak ripeness from trusted farms. Enjoy the taste of real, natural fruits.',
                    'heroImage': '/hero_fruits.png',
                    'backgroundColor': '#F9FAF0',
                    'features': default_features,
                    'subcategories': [
                        {"name": "All Fruits", "slug": "all", "icon": "/category_fruits.png"},
                        {"name": "Apples", "slug": "apples", "icon": "/product_apples.png"},
                        {"name": "Bananas", "slug": "bananas", "icon": "/product_bananas.png"},
                        {"name": "Citrus", "slug": "citrus", "icon": "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Berries", "slug": "berries", "icon": "https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Mangoes", "slug": "mangoes", "icon": "/product_mango.png"},
                        {"name": "Grapes", "slug": "grapes", "icon": "/product_grapes.png"},
                        {"name": "Pomegranate", "slug": "pomegranate", "icon": "/product_pomegranate.png"}
                    ]
                },
                {
                    'name': 'Vegetables',
                    'slug': 'vegetables',
                    'image': '/category_vegetables.png',
                    'heroBadge': '100% ORGANIC',
                    'heroTitle': 'Fresh From Farms, Delivered with Care',
                    'heroSubtitle': 'Directly sourced from the soil to protect nutrients and health. Clean, chemical-free greens for your table.',
                    'heroImage': '/category_vegetables.png',
                    'backgroundColor': '#FAFAF2',
                    'features': default_features,
                    'subcategories': [
                        {"name": "All Veggies", "slug": "all", "icon": "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Leafy Greens", "slug": "leafy", "icon": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Tomatoes", "slug": "tomatoes", "icon": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Roots & Tubers", "slug": "roots", "icon": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Exotics", "slug": "exotic", "icon": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Dairy & Tofu", "slug": "dairy", "icon": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=260"}
                    ]
                },
                {
                    'name': 'Spices',
                    'slug': 'spices',
                    'image': '/category_spices.png',
                    'heroBadge': '100% PURE STONEGROUND',
                    'heroTitle': 'Aromatic Spices, Rich in Tradition',
                    'heroSubtitle': 'Bring authentic flavor and high medicinal value to your kitchen with our stone-ground, pure spices.',
                    'heroImage': '/category_spices.png',
                    'backgroundColor': '#FFFDEB',
                    'features': default_features,
                    'subcategories': [
                        {"name": "All Spices", "slug": "all", "icon": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Powder Spices", "slug": "powders", "icon": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Whole Seeds", "slug": "seeds", "icon": "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Whole Pods", "slug": "pods", "icon": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=260"}
                    ]
                },
                {
                    'name': 'Dry Fruits',
                    'slug': 'dryfruits',
                    'image': '/category_dryfruits.png',
                    'heroBadge': '100% PREMIUM QUALITY',
                    'heroTitle': 'Premium Dry Fruits, Powerhouse of Energy',
                    'heroSubtitle': 'Naturally dried, crunchy, and loaded with essential nutrients. Perfect daily snack for healthy lifestyles.',
                    'heroImage': '/category_dryfruits.png',
                    'backgroundColor': '#FFF5F6',
                    'features': default_features,
                    'subcategories': [
                        {"name": "All Dry Fruits", "slug": "all", "icon": "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Nuts", "slug": "nuts", "icon": "https://images.unsplash.com/photo-1508061253366-f7da158b6d4b?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Raisins & Dates", "slug": "raisins", "icon": "https://images.unsplash.com/photo-1569596082827-c5e8990496cb?auto=format&fit=crop&q=80&w=260"}
                    ]
                },
                {
                    'name': 'Others',
                    'slug': 'others',
                    'image': '/category_combooffers.png',
                    'heroBadge': 'DAILY ESSENTIALS',
                    'heroTitle': 'Daily Grocery Needs & Extras',
                    'heroSubtitle': 'Find other household needs, organic oils, pure honeys, and everyday kitchen essentials.',
                    'heroImage': '/category_combooffers.png',
                    'backgroundColor': '#FFFCEB',
                    'features': default_features,
                    'subcategories': [
                        {"name": "All Others", "slug": "all", "icon": "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=260"},
                        {"name": "Honey & Oils", "slug": "honey", "icon": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=260"}
                    ]
                }
            ]
            for c in SEED_CATEGORIES:
                cat = Category(
                    name=c['name'],
                    slug=c['slug'],
                    image=c['image'],
                    heroBadge=c['heroBadge'],
                    heroTitle=c['heroTitle'],
                    heroSubtitle=c['heroSubtitle'],
                    heroImage=c['heroImage'],
                    backgroundColor=c['backgroundColor'],
                    buttonText='Shop Now',
                    buttonLink=f'/category/{c["slug"]}',
                    features=c['features'],
                    promos=[]
                )
                db.session.add(cat)
                db.session.flush()
                
                for idx, sub in enumerate(c['subcategories']):
                    sc = SubCategory(
                        categoryId=cat.id,
                        name=sub['name'],
                        slug=sub['slug'],
                        icon=sub['icon'],
                        sortOrder=idx,
                        isVisible=True
                    )
                    db.session.add(sc)
            db.session.commit()
            print("Seeded database with initial categories & subcategories.")

        # 4. Seed initial offers list if empty
        from backend.models import Offer
        if Offer.query.count() == 0:
            SEED_OFFERS = [
                {
                    'title': 'Monsoon Mega Sale', 
                    'description': 'Sweet. Juicy. Fresh.', 
                    'discount': '25% OFF', 
                    'image': '/product_mango.png'
                },
                {
                    'title': 'Premium Dry Fruits Special', 
                    'description': 'Pure spices for flavorful meals.', 
                    'discount': '15% OFF', 
                    'image': '/category_spices.png'
                }
            ]
            for o in SEED_OFFERS:
                off = Offer(title=o['title'], description=o['description'], discount=o['discount'], image=o['image'])
                db.session.add(off)
            db.session.commit()
            print("Seeded database with initial offers.")
        
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'healthy', 'database': app.config['SQLALCHEMY_DATABASE_URI'].split('://')[0]}), 200

    return app

if __name__ == '__main__':
    app = create_app()
    # Read port from environment or run on 5000
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
