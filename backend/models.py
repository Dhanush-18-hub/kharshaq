from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(15), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(128), nullable=True)
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    profile_image = db.Column(db.Text, nullable=True)
    
    # Store dynamic details as JSON for versatility
    addresses = db.Column(db.JSON, default=list, nullable=False)
    wishlist = db.Column(db.JSON, default=list, nullable=False)
    cart = db.Column(db.JSON, default=list, nullable=False)
    orders = db.Column(db.JSON, default=list, nullable=False)
    payment_methods = db.Column(db.JSON, default=list, nullable=False)
    notifications = db.Column(db.JSON, default=list, nullable=False)
    
    reward_points = db.Column(db.Integer, default=0, nullable=False)
    membership_level = db.Column(db.String(50), default='Bronze', nullable=False)
    role = db.Column(db.String(20), default='customer', nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
 
    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'google_id': self.google_id,
            'profile_image': self.profile_image,
            'addresses': self.addresses,
            'wishlist': self.wishlist,
            'cart': self.cart,
            'orders': self.orders,
            'payment_methods': self.payment_methods,
            'notifications': self.notifications,
            'reward_points': self.reward_points,
            'membership_level': self.membership_level,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class LoginHistory(db.Model):
    __tablename__ = 'login_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    login_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    device = db.Column(db.String(100), nullable=True)
    browser = db.Column(db.String(100), nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)

    user = db.relationship('User', backref=db.backref('login_histories', lazy=True, cascade='all, delete-orphan'))

class OTPStore(db.Model):
    __tablename__ = 'otp_store'

    phone = db.Column(db.String(15), primary_key=True)
    otp_code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    original_price = db.Column(db.Integer, nullable=True)
    discount = db.Column(db.String(20), nullable=True)
    rating = db.Column(db.Float, default=4.5)
    reviews = db.Column(db.Integer, default=50)
    badge = db.Column(db.String(50), nullable=True)
    badge_color = db.Column(db.String(50), nullable=True)
    image = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False)
    subcat = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    sku = db.Column(db.String(50), nullable=True)
    tags = db.Column(db.String(100), nullable=True)
    stock = db.Column(db.Integer, default=100)
    featured = db.Column(db.Boolean, default=False)
    organic = db.Column(db.Boolean, default=False)
    best_seller = db.Column(db.Boolean, default=False)
    availability = db.Column(db.Boolean, default=True)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'weight': self.weight,
            'price': self.price,
            'originalPrice': self.original_price,
            'discount': self.discount,
            'rating': self.rating,
            'reviews': self.reviews,
            'badge': self.badge,
            'badgeColor': self.badge_color,
            'image': self.image,
            'category': self.category,
            'subcat': self.subcat,
            'description': self.description,
            'sku': self.sku,
            'tags': self.tags,
            'stock': self.stock,
            'featured': self.featured,
            'organic': self.organic,
            'best_seller': self.best_seller,
            'availability': self.availability
        }

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    image = db.Column(db.Text, nullable=True) # for compatibility
    
    # Hero cms fields
    heroTitle = db.Column(db.Text, nullable=True)
    heroSubtitle = db.Column(db.Text, nullable=True)
    heroBadge = db.Column(db.String(100), nullable=True)
    heroImage = db.Column(db.Text, nullable=True)
    backgroundImage = db.Column(db.Text, nullable=True)
    backgroundColor = db.Column(db.String(50), nullable=True)
    gradient = db.Column(db.Text, nullable=True)
    buttonText = db.Column(db.String(100), nullable=True)
    buttonLink = db.Column(db.Text, nullable=True)
    
    # SEO fields
    metaTitle = db.Column(db.Text, nullable=True)
    metaDescription = db.Column(db.Text, nullable=True)
    
    # config fields
    navbarOrder = db.Column(db.Integer, default=0)
    isVisible = db.Column(db.Boolean, default=True)
    
    # features and promos stored as JSON
    features = db.Column(db.JSON, nullable=True) # list of {title, desc, icon}
    promos = db.Column(db.JSON, nullable=True) # list of {title, desc, image, btnText, bg}

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'image': self.image,
            'heroTitle': self.heroTitle,
            'heroSubtitle': self.heroSubtitle,
            'heroBadge': self.heroBadge,
            'heroImage': self.heroImage,
            'backgroundImage': self.backgroundImage,
            'backgroundColor': self.backgroundColor,
            'gradient': self.gradient,
            'buttonText': self.buttonText,
            'buttonLink': self.buttonLink,
            'metaTitle': self.metaTitle,
            'metaDescription': self.metaDescription,
            'navbarOrder': self.navbarOrder,
            'isVisible': self.isVisible,
            'features': self.features,
            'promos': self.promos,
            'subcategories': [sub.to_json() for sub in self.subcategories]
        }

class SubCategory(db.Model):
    __tablename__ = 'subcategories'
    id = db.Column(db.Integer, primary_key=True)
    categoryId = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.Text, nullable=True)
    sortOrder = db.Column(db.Integer, default=0)
    isVisible = db.Column(db.Boolean, default=True)

    # Relationship
    category = db.relationship('Category', backref=db.backref('subcategories', lazy=True, cascade='all, delete-orphan'))

    def to_json(self):
        return {
            'id': self.id,
            'categoryId': self.categoryId,
            'name': self.name,
            'slug': self.slug,
            'icon': self.icon,
            'sortOrder': self.sortOrder,
            'isVisible': self.isVisible
        }

class Offer(db.Model):
    __tablename__ = 'offers'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    discount = db.Column(db.String(20), nullable=True)
    image = db.Column(db.Text, nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'discount': self.discount,
            'image': self.image
        }

class BroadcastNotification(db.Model):
    __tablename__ = 'broadcast_notifications'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    desc = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='Updates', nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    link = db.Column(db.String(255), default='/', nullable=False)
    link_label = db.Column(db.String(50), default='Explore', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_json(self):
        return {
            'id': f"bn_{self.id}",
            'title': self.title,
            'desc': self.desc,
            'category': self.category,
            'date': self.date,
            'time': self.time,
            'link': self.link,
            'linkLabel': self.link_label,
            'isRead': False
        }
