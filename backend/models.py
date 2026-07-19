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
    reward_transactions = db.Column(db.JSON, default=list, nullable=False)
    reward_vouchers = db.Column(db.JSON, default=list, nullable=False)
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
            'reward_transactions': self.reward_transactions,
            'reward_vouchers': self.reward_vouchers,
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
    trending = db.Column(db.Boolean, default=False)
    new_arrival = db.Column(db.Boolean, default=False)
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
            'trending': self.trending,
            'new_arrival': self.new_arrival,
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

class HomepageSettings(db.Model):
    __tablename__ = 'homepage_settings'
    id = db.Column(db.Integer, primary_key=True)
    best_sellers_max = db.Column(db.Integer, default=8)
    best_sellers_sort = db.Column(db.String(50), default='default')
    best_sellers_slider = db.Column(db.Boolean, default=True)
    best_sellers_autoplay = db.Column(db.Boolean, default=False)
    
    featured_products_max = db.Column(db.Integer, default=8)
    featured_products_sort = db.Column(db.String(50), default='default')
    featured_products_slider = db.Column(db.Boolean, default=True)
    featured_products_autoplay = db.Column(db.Boolean, default=False)
    
    trending_products_max = db.Column(db.Integer, default=8)
    trending_products_sort = db.Column(db.String(50), default='default')
    trending_products_slider = db.Column(db.Boolean, default=True)
    trending_products_autoplay = db.Column(db.Boolean, default=False)
    
    new_arrivals_max = db.Column(db.Integer, default=8)
    new_arrivals_sort = db.Column(db.String(50), default='default')
    new_arrivals_slider = db.Column(db.Boolean, default=True)
    new_arrivals_autoplay = db.Column(db.Boolean, default=False)
    
    announcements_scrolling = db.Column(db.Boolean, default=True)
    announcements_speed = db.Column(db.Integer, default=20)

    def to_json(self):
        return {
            'id': self.id,
            'best_sellers_max': self.best_sellers_max,
            'best_sellers_sort': self.best_sellers_sort,
            'best_sellers_slider': self.best_sellers_slider,
            'best_sellers_autoplay': self.best_sellers_autoplay,
            
            'featured_products_max': self.featured_products_max,
            'featured_products_sort': self.featured_products_sort,
            'featured_products_slider': self.featured_products_slider,
            'featured_products_autoplay': self.featured_products_autoplay,
            
            'trending_products_max': self.trending_products_max,
            'trending_products_sort': self.trending_products_sort,
            'trending_products_slider': self.trending_products_slider,
            'trending_products_autoplay': self.trending_products_autoplay,
            
            'new_arrivals_max': self.new_arrivals_max,
            'new_arrivals_sort': self.new_arrivals_sort,
            'new_arrivals_slider': self.new_arrivals_slider,
            'new_arrivals_autoplay': self.new_arrivals_autoplay,
            
            'announcements_scrolling': self.announcements_scrolling,
            'announcements_speed': self.announcements_speed
        }

class HeroBanner(db.Model):
    __tablename__ = 'hero_banners'
    id = db.Column(db.Integer, primary_key=True)
    badge = db.Column(db.String(100), nullable=True)
    heading = db.Column(db.String(200), nullable=False)
    highlight_text = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)
    left_btn_text = db.Column(db.String(100), nullable=True)
    left_btn_link = db.Column(db.String(255), nullable=True)
    right_btn_text = db.Column(db.String(100), nullable=True)
    right_btn_link = db.Column(db.String(255), nullable=True)
    image = db.Column(db.Text, nullable=True)
    bg_gradient = db.Column(db.Text, nullable=True)
    bg_image = db.Column(db.Text, nullable=True)
    discount_percentage = db.Column(db.String(50), nullable=True)
    coupon_code = db.Column(db.String(100), nullable=True)
    offer_title = db.Column(db.String(100), nullable=True)
    offer_description = db.Column(db.Text, nullable=True)
    enable_floating_offer = db.Column(db.Boolean, default=True)

    def to_json(self):
        return {
            'id': self.id,
            'badge': self.badge,
            'heading': self.heading,
            'highlight_text': self.highlight_text,
            'description': self.description,
            'left_btn_text': self.left_btn_text,
            'left_btn_link': self.left_btn_link,
            'right_btn_text': self.right_btn_text,
            'right_btn_link': self.right_btn_link,
            'image': self.image,
            'bg_gradient': self.bg_gradient,
            'bg_image': self.bg_image,
            'discount_percentage': self.discount_percentage,
            'coupon_code': self.coupon_code,
            'offer_title': self.offer_title,
            'offer_description': self.offer_description,
            'enable_floating_offer': self.enable_floating_offer
        }

class Announcement(db.Model):
    __tablename__ = 'announcements'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    bg_color = db.Column(db.String(50), default='#1B5E20')
    text_color = db.Column(db.String(50), default='#FFFFFF')
    icon = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)

    def to_json(self):
        return {
            'id': self.id,
            'text': self.text,
            'bg_color': self.bg_color,
            'text_color': self.text_color,
            'icon': self.icon,
            'is_active': self.is_active,
            'sort_order': self.sort_order
        }

class HomepageFeature(db.Model):
    __tablename__ = 'homepage_features'
    id = db.Column(db.Integer, primary_key=True)
    icon = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(100), nullable=False)
    subtitle = db.Column(db.String(255), nullable=True)
    link = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)

    def to_json(self):
        return {
            'id': self.id,
            'icon': self.icon,
            'title': self.title,
            'subtitle': self.subtitle,
            'link': self.link,
            'is_active': self.is_active,
            'sort_order': self.sort_order
        }

class HomepageCategory(db.Model):
    __tablename__ = 'homepage_categories'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='CASCADE'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), nullable=False)
    image = db.Column(db.Text, nullable=True)
    sort_order = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)
    bg_color = db.Column(db.String(50), default='#FFFFFF')
    link = db.Column(db.String(255), nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'category_id': self.category_id,
            'name': self.name,
            'slug': self.slug,
            'image': self.image,
            'sort_order': self.sort_order,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'bg_color': self.bg_color,
            'link': self.link
        }

class PromoCard(db.Model):
    __tablename__ = 'promo_cards'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    discount = db.Column(db.String(50), nullable=True)
    image = db.Column(db.Text, nullable=True)
    btn_text = db.Column(db.String(100), default='Shop Now')
    btn_link = db.Column(db.String(255), default='/')
    bg_color = db.Column(db.String(50), default='#F9FAF0')
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'discount': self.discount,
            'image': self.image,
            'btn_text': self.btn_text,
            'btn_link': self.btn_link,
            'bg_color': self.bg_color,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active
        }

class Testimonial(db.Model):
    __tablename__ = 'testimonials'
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    photo = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, default=5)
    review = db.Column(db.Text, nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

    def to_json(self):
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'photo': self.photo,
            'rating': self.rating,
            'review': self.review,
            'sort_order': self.sort_order,
            'is_active': self.is_active
        }

class NewsletterSettings(db.Model):
    __tablename__ = 'newsletter_settings'
    id = db.Column(db.Integer, primary_key=True)
    heading = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    btn_text = db.Column(db.String(100), default='Subscribe')
    offer = db.Column(db.String(200), nullable=True)
    bg_image = db.Column(db.Text, nullable=True)
    bg_color = db.Column(db.String(50), default='#E8F5E9')

    def to_json(self):
        return {
            'id': self.id,
            'heading': self.heading,
            'description': self.description,
            'btn_text': self.btn_text,
            'offer': self.offer,
            'bg_image': self.bg_image,
            'bg_color': self.bg_color
        }

class HomepageLayout(db.Model):
    __tablename__ = 'homepage_layouts'
    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.String(100), unique=True, nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    is_visible = db.Column(db.Boolean, default=True)

    def to_json(self):
        return {
            'id': self.id,
            'section_id': self.section_id,
            'sort_order': self.sort_order,
            'is_visible': self.is_visible
        }

class SeasonalCollection(db.Model):
    __tablename__ = 'seasonal_collections'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    banner = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    product_ids = db.Column(db.JSON, default=list, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'banner': self.banner,
            'description': self.description,
            'product_ids': self.product_ids or [],
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active
        }

class FinancialExpense(db.Model):
    __tablename__ = 'financial_expenses'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False) # 'Delivery', 'Packaging', 'Marketing', 'Warehouse', 'Salary', 'Other'
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    description = db.Column(db.Text, nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'category': self.category,
            'amount': self.amount,
            'date': self.date.isoformat() if self.date else None,
            'description': self.description
        }

class GSTConfig(db.Model):
    __tablename__ = 'gst_config'
    id = db.Column(db.Integer, primary_key=True)
    gst_percent = db.Column(db.Float, default=18.0, nullable=False)


class Coupon(db.Model):
    __tablename__ = 'coupons'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    discount_type = db.Column(db.String(50), nullable=False) # 'fixed', 'percentage', 'free_delivery'
    discount_value = db.Column(db.Float, nullable=False, default=0.0)
    minimum_order = db.Column(db.Float, nullable=False, default=0.0)
    maximum_discount = db.Column(db.Float, nullable=True)
    usage_limit_global = db.Column(db.Integer, nullable=True)
    usage_count = db.Column(db.Integer, nullable=False, default=0)
    usage_limit_per_user = db.Column(db.Integer, nullable=True, default=1)
    is_welcome_coupon = db.Column(db.Boolean, nullable=False, default=False)
    device_restricted = db.Column(db.Boolean, nullable=False, default=False)
    phone_verification_required = db.Column(db.Boolean, nullable=False, default=False)
    applicable_categories = db.Column(db.JSON, nullable=True, default=list)
    applicable_products = db.Column(db.JSON, nullable=True, default=list)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'code': self.code,
            'description': self.description,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'minimum_order': self.minimum_order,
            'maximum_discount': self.maximum_discount,
            'usage_limit_global': self.usage_limit_global,
            'usage_count': self.usage_count,
            'usage_limit_per_user': self.usage_limit_per_user,
            'is_welcome_coupon': self.is_welcome_coupon,
            'device_restricted': self.device_restricted,
            'phone_verification_required': self.phone_verification_required,
            'applicable_categories': self.applicable_categories or [],
            'applicable_products': self.applicable_products or [],
            'is_active': self.is_active,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CouponUsage(db.Model):
    __tablename__ = 'coupon_usage'

    id = db.Column(db.Integer, primary_key=True)
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    device_id = db.Column(db.String(255), nullable=True, index=True)
    phone_number = db.Column(db.String(50), nullable=True, index=True)
    email = db.Column(db.String(120), nullable=True, index=True)
    order_id = db.Column(db.String(100), nullable=True, index=True)
    used_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    coupon = db.relationship('Coupon', backref=db.backref('usages', lazy=True, cascade='all, delete-orphan'))
    user = db.relationship('User', backref=db.backref('coupon_usages', lazy=True))

    def to_json(self):
        return {
            'id': self.id,
            'coupon_id': self.coupon_id,
            'user_id': self.user_id,
            'device_id': self.device_id,
            'phone_number': self.phone_number,
            'email': self.email,
            'order_id': self.order_id,
            'used_at': self.used_at.isoformat() if self.used_at else None
        }
