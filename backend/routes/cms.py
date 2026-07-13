from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from backend.models import (
    db, Product, Category, HomepageSettings, HeroBanner, Announcement,
    HomepageFeature, HomepageCategory, PromoCard, Testimonial,
    NewsletterSettings, HomepageLayout, SeasonalCollection
)
from datetime import datetime

cms_bp = Blueprint('cms_bp', __name__)

# Admin Middleware Helper
def verify_admin():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return False
    return True

# Middleware to intercept and require admin role
def admin_required(f):
    @jwt_required()
    def decorated_function(*args, **kwargs):
        if not verify_admin():
            return jsonify({'error': 'Unauthorized', 'message': 'Admin privileges required.'}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# --- PUBLIC ENDPOINTS ---

@cms_bp.route('/homepage', methods=['GET'])
def get_homepage():
    # 1. Settings & Layout Order
    settings = HomepageSettings.query.first()
    settings_json = settings.to_json() if settings else {
        'best_sellers_max': 8,
        'best_sellers_sort': 'default',
        'best_sellers_slider': True,
        'best_sellers_autoplay': False,
        
        'featured_products_max': 8,
        'featured_products_sort': 'default',
        'featured_products_slider': True,
        'featured_products_autoplay': False,
        
        'trending_products_max': 8,
        'trending_products_sort': 'default',
        'trending_products_slider': True,
        'trending_products_autoplay': False,
        
        'new_arrivals_max': 8,
        'new_arrivals_sort': 'default',
        'new_arrivals_slider': True,
        'new_arrivals_autoplay': False,
        
        'announcements_scrolling': True,
        'announcements_speed': 20
    }

    layouts = HomepageLayout.query.order_by(HomepageLayout.sort_order.asc()).all()
    layout_json = [l.to_json() for l in layouts]

    # 2. Section Details
    hero = HeroBanner.query.first()
    hero_json = hero.to_json() if hero else {}

    announcements = Announcement.query.filter_by(is_active=True).order_by(Announcement.sort_order.asc()).all()
    announcements_json = [a.to_json() for a in announcements]

    features = HomepageFeature.query.filter_by(is_active=True).order_by(HomepageFeature.sort_order.asc()).all()
    features_json = [f.to_json() for f in features]

    categories = HomepageCategory.query.filter_by(is_active=True).order_by(HomepageCategory.sort_order.asc()).all()
    categories_json = [c.to_json() for c in categories]

    # Filter promos by current date scheduling
    now = datetime.utcnow()
    promos_all = PromoCard.query.filter_by(is_active=True).all()
    promos_filtered = []
    for p in promos_all:
        if p.start_date and p.start_date > now:
            continue
        if p.end_date and p.end_date < now:
            continue
        promos_filtered.append(p.to_json())

    testimonials = Testimonial.query.filter_by(is_active=True).order_by(Testimonial.sort_order.asc()).all()
    testimonials_json = [t.to_json() for t in testimonials]

    newsletter = NewsletterSettings.query.first()
    newsletter_json = newsletter.to_json() if newsletter else {}

    # 3. Dynamic Products Lists
    # Best Sellers query based on CMS sorting & limits
    bs_query = Product.query.filter_by(best_seller=True, availability=True)
    sort_mode = settings_json.get('best_sellers_sort', 'default')
    if sort_mode == 'price-low-high':
        bs_query = bs_query.order_by(Product.price.asc())
    elif sort_mode == 'price-high-low':
        bs_query = bs_query.order_by(Product.price.desc())
    elif sort_mode == 'rating':
        bs_query = bs_query.order_by(Product.rating.desc())
    elif sort_mode == 'alphabetical':
        bs_query = bs_query.order_by(Product.name.asc())
    else:
        bs_query = bs_query.order_by(Product.id.asc())
    
    bs_limit = settings_json.get('best_sellers_max', 8)
    best_sellers = bs_query.limit(bs_limit).all()
    best_sellers_json = [p.to_json() for p in best_sellers]

    # Featured Products
    feat_query = Product.query.filter_by(featured=True, availability=True)
    feat_sort = settings_json.get('featured_products_sort', 'default')
    if feat_sort == 'price-low-high':
        feat_query = feat_query.order_by(Product.price.asc())
    elif feat_sort == 'price-high-low':
        feat_query = feat_query.order_by(Product.price.desc())
    elif feat_sort == 'rating':
        feat_query = feat_query.order_by(Product.rating.desc())
    elif feat_sort == 'alphabetical':
        feat_query = feat_query.order_by(Product.name.asc())
    else:
        feat_query = feat_query.order_by(Product.id.asc())
    feat_limit = settings_json.get('featured_products_max', 8)
    featured = feat_query.limit(feat_limit).all()
    featured_json = [p.to_json() for p in featured]

    # Trending Products
    tr_query = Product.query.filter_by(trending=True, availability=True)
    tr_sort = settings_json.get('trending_products_sort', 'default')
    if tr_sort == 'price-low-high':
        tr_query = tr_query.order_by(Product.price.asc())
    elif tr_sort == 'price-high-low':
        tr_query = tr_query.order_by(Product.price.desc())
    elif tr_sort == 'rating':
        tr_query = tr_query.order_by(Product.rating.desc())
    elif tr_sort == 'alphabetical':
        tr_query = tr_query.order_by(Product.name.asc())
    else:
        tr_query = tr_query.order_by(Product.id.asc())
    tr_limit = settings_json.get('trending_products_max', 8)
    trending = tr_query.limit(tr_limit).all()
    trending_json = [p.to_json() for p in trending]

    # New Arrivals
    na_query = Product.query.filter_by(new_arrival=True, availability=True)
    na_sort = settings_json.get('new_arrivals_sort', 'default')
    if na_sort == 'price-low-high':
        na_query = na_query.order_by(Product.price.asc())
    elif na_sort == 'price-high-low':
        na_query = na_query.order_by(Product.price.desc())
    elif na_sort == 'rating':
        na_query = na_query.order_by(Product.rating.desc())
    elif na_sort == 'alphabetical':
        na_query = na_query.order_by(Product.name.asc())
    else:
        na_query = na_query.order_by(Product.id.asc())
    na_limit = settings_json.get('new_arrivals_max', 8)
    new_arrivals = na_query.limit(na_limit).all()
    new_arrivals_json = [p.to_json() for p in new_arrivals]

    # Seasonal campaigns filtering
    seasonal_all = SeasonalCollection.query.filter_by(is_active=True).all()
    seasonal_filtered = []
    for sc in seasonal_all:
        if sc.start_date and sc.start_date > now:
            continue
        if sc.end_date and sc.end_date < now:
            continue
        
        # Load products in this campaign
        p_ids = sc.product_ids or []
        prods = Product.query.filter(Product.id.in_(p_ids), Product.availability == True).all() if p_ids else []
        sc_json = sc.to_json()
        sc_json['products'] = [p.to_json() for p in prods]
        seasonal_filtered.append(sc_json)

    # Aggregate bottom feature items from dynamic HomepageFeature (or fallback if empty)
    # Bottom Features has a designated section in layout, we map active features
    
    return jsonify({
        'settings': settings_json,
        'layout_order': layout_json,
        'hero': hero_json,
        'announcements': announcements_json,
        'features': features_json,
        'categories': categories_json,
        'promos': promos_filtered,
        'testimonials': testimonials_json,
        'newsletter': newsletter_json,
        'best_sellers': best_sellers_json,
        'featured_products': featured_json,
        'trending_products': trending_json,
        'new_arrivals': new_arrivals_json,
        'seasonal_collections': seasonal_filtered
    }), 200

# --- ADMIN ENDPOINTS ---

@cms_bp.route('/admin/homepage/settings', methods=['PUT'])
@admin_required
def update_settings():
    data = request.get_json() or {}
    settings = HomepageSettings.query.first()
    if not settings:
        settings = HomepageSettings()
        db.session.add(settings)
    
    if 'best_sellers_max' in data:
        settings.best_sellers_max = int(data['best_sellers_max'])
    if 'best_sellers_sort' in data:
        settings.best_sellers_sort = str(data['best_sellers_sort'])
    if 'best_sellers_slider' in data:
        settings.best_sellers_slider = bool(data['best_sellers_slider'])
    if 'best_sellers_autoplay' in data:
        settings.best_sellers_autoplay = bool(data['best_sellers_autoplay'])
        
    for prefix in ['featured_products', 'trending_products', 'new_arrivals']:
        max_key = f"{prefix}_max"
        sort_key = f"{prefix}_sort"
        slider_key = f"{prefix}_slider"
        autoplay_key = f"{prefix}_autoplay"
        if max_key in data:
            setattr(settings, max_key, int(data[max_key]))
        if sort_key in data:
            setattr(settings, sort_key, str(data[sort_key]))
        if slider_key in data:
            setattr(settings, slider_key, bool(data[slider_key]))
        if autoplay_key in data:
            setattr(settings, autoplay_key, bool(data[autoplay_key]))
            
    if 'announcements_scrolling' in data:
        settings.announcements_scrolling = bool(data['announcements_scrolling'])
    if 'announcements_speed' in data:
        settings.announcements_speed = int(data['announcements_speed'])
        
    db.session.commit()
    return jsonify({'message': 'Settings updated successfully', 'settings': settings.to_json()}), 200

@cms_bp.route('/admin/homepage/hero', methods=['PUT'])
@admin_required
def update_hero():
    data = request.get_json() or {}
    hero = HeroBanner.query.first()
    if not hero:
        hero = HeroBanner(heading=data.get('heading', 'From Our Farms'))
        db.session.add(hero)
        
    if 'badge' in data: hero.badge = data['badge']
    if 'heading' in data: hero.heading = data['heading']
    if 'highlight_text' in data: hero.highlight_text = data['highlight_text']
    if 'description' in data: hero.description = data['description']
    if 'left_btn_text' in data: hero.left_btn_text = data['left_btn_text']
    if 'left_btn_link' in data: hero.left_btn_link = data['left_btn_link']
    if 'right_btn_text' in data: hero.right_btn_text = data['right_btn_text']
    if 'right_btn_link' in data: hero.right_btn_link = data['right_btn_link']
    if 'image' in data: hero.image = data['image']
    if 'bg_gradient' in data: hero.bg_gradient = data['bg_gradient']
    if 'bg_image' in data: hero.bg_image = data['bg_image']
    if 'discount_percentage' in data: hero.discount_percentage = data['discount_percentage']
    if 'coupon_code' in data: hero.coupon_code = data['coupon_code']
    if 'offer_title' in data: hero.offer_title = data['offer_title']
    if 'offer_description' in data: hero.offer_description = data['offer_description']
    if 'enable_floating_offer' in data: hero.enable_floating_offer = bool(data['enable_floating_offer'])
    
    db.session.commit()
    return jsonify({'message': 'Hero banner updated successfully', 'hero': hero.to_json()}), 200

@cms_bp.route('/admin/homepage/announcements', methods=['PUT'])
@admin_required
def update_announcements():
    data = request.get_json() or []
    # Clear existing
    Announcement.query.delete()
    
    for idx, a in enumerate(data):
        item = Announcement(
            text=a.get('text', '').strip(),
            bg_color=a.get('bg_color', '#1B5E20'),
            text_color=a.get('text_color', '#FFFFFF'),
            icon=a.get('icon', ''),
            is_active=a.get('is_active', True),
            sort_order=a.get('sort_order', idx)
        )
        db.session.add(item)
        
    db.session.commit()
    announcements = Announcement.query.order_by(Announcement.sort_order.asc()).all()
    return jsonify({'message': 'Announcements updated successfully', 'announcements': [a.to_json() for a in announcements]}), 200

@cms_bp.route('/admin/homepage/features', methods=['PUT'])
@admin_required
def update_features():
    data = request.get_json() or []
    HomepageFeature.query.delete()
    
    for idx, f in enumerate(data):
        item = HomepageFeature(
            icon=f.get('icon', ''),
            title=f.get('title', '').strip(),
            subtitle=f.get('subtitle', ''),
            link=f.get('link', ''),
            is_active=f.get('is_active', True),
            sort_order=f.get('sort_order', idx)
        )
        db.session.add(item)
        
    db.session.commit()
    features = HomepageFeature.query.order_by(HomepageFeature.sort_order.asc()).all()
    return jsonify({'message': 'Features strip updated successfully', 'features': [f.to_json() for f in features]}), 200

@cms_bp.route('/admin/homepage/categories', methods=['PUT'])
@admin_required
def update_categories():
    data = request.get_json() or []
    HomepageCategory.query.delete()
    
    for idx, c in enumerate(data):
        item = HomepageCategory(
            category_id=c.get('category_id'),
            name=c.get('name', '').strip(),
            slug=c.get('slug', '').strip(),
            image=c.get('image', ''),
            sort_order=c.get('sort_order', idx),
            is_featured=c.get('is_featured', True),
            is_active=c.get('is_active', True),
            bg_color=c.get('bg_color', '#FFFFFF'),
            link=c.get('link', '')
        )
        db.session.add(item)
        
    db.session.commit()
    categories = HomepageCategory.query.order_by(HomepageCategory.sort_order.asc()).all()
    return jsonify({'message': 'Categories list updated successfully', 'categories': [c.to_json() for c in categories]}), 200

@cms_bp.route('/admin/homepage/promos', methods=['PUT'])
@admin_required
def update_promos():
    data = request.get_json() or []
    PromoCard.query.delete()
    
    for idx, p in enumerate(data):
        # Handle string dates to Python datetime objects
        s_date = None
        if p.get('start_date'):
            try:
                s_date = datetime.fromisoformat(p['start_date'].replace('Z', ''))
            except Exception:
                pass
        e_date = None
        if p.get('end_date'):
            try:
                e_date = datetime.fromisoformat(p['end_date'].replace('Z', ''))
            except Exception:
                pass
                
        item = PromoCard(
            title=p.get('title', '').strip(),
            description=p.get('description', ''),
            discount=p.get('discount', ''),
            image=p.get('image', ''),
            btn_text=p.get('btn_text', 'Shop Now'),
            btn_link=p.get('btn_link', '/'),
            bg_color=p.get('bg_color', '#F9FAF0'),
            start_date=s_date,
            end_date=e_date,
            is_active=p.get('is_active', True)
        )
        db.session.add(item)
        
    db.session.commit()
    promos = PromoCard.query.all()
    return jsonify({'message': 'Promotional cards updated successfully', 'promos': [p.to_json() for p in promos]}), 200

@cms_bp.route('/admin/homepage/testimonials', methods=['PUT'])
@admin_required
def update_testimonials():
    data = request.get_json() or []
    Testimonial.query.delete()
    
    for idx, t in enumerate(data):
        item = Testimonial(
            customer_name=t.get('customer_name', '').strip(),
            photo=t.get('photo', ''),
            rating=int(t.get('rating', 5)),
            review=t.get('review', '').strip(),
            sort_order=t.get('sort_order', idx),
            is_active=t.get('is_active', True)
        )
        db.session.add(item)
        
    db.session.commit()
    testimonials = Testimonial.query.order_by(Testimonial.sort_order.asc()).all()
    return jsonify({'message': 'Testimonials updated successfully', 'testimonials': [t.to_json() for t in testimonials]}), 200

@cms_bp.route('/admin/homepage/newsletter', methods=['PUT'])
@admin_required
def update_newsletter():
    data = request.get_json() or {}
    newsletter = NewsletterSettings.query.first()
    if not newsletter:
        newsletter = NewsletterSettings(heading=data.get('heading', 'Subscribe to Our Newsletter'))
        db.session.add(newsletter)
        
    if 'heading' in data: newsletter.heading = data['heading']
    if 'description' in data: newsletter.description = data['description']
    if 'btn_text' in data: newsletter.btn_text = data['btn_text']
    if 'offer' in data: newsletter.offer = data['offer']
    if 'bg_image' in data: newsletter.bg_image = data['bg_image']
    if 'bg_color' in data: newsletter.bg_color = data['bg_color']
    
    db.session.commit()
    return jsonify({'message': 'Newsletter settings updated successfully', 'newsletter': newsletter.to_json()}), 200

@cms_bp.route('/admin/homepage/layout', methods=['PUT'])
@admin_required
def update_layout():
    data = request.get_json() or []
    HomepageLayout.query.delete()
    
    for idx, l in enumerate(data):
        item = HomepageLayout(
            section_id=l.get('section_id'),
            sort_order=idx,
            is_visible=l.get('is_visible', True)
        )
        db.session.add(item)
        
    db.session.commit()
    layouts = HomepageLayout.query.order_by(HomepageLayout.sort_order.asc()).all()
    return jsonify({'message': 'Homepage ordering layout updated successfully', 'layouts': [l.to_json() for l in layouts]}), 200

# --- SEASONAL COLLECTIONS CRUD ---

@cms_bp.route('/admin/homepage/seasonal-collections', methods=['GET'])
@admin_required
def list_seasonal():
    collections = SeasonalCollection.query.all()
    return jsonify([c.to_json() for c in collections]), 200

@cms_bp.route('/admin/homepage/seasonal-collections', methods=['POST'])
@admin_required
def create_seasonal():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400
        
    slug = data.get('slug', '').strip().lower().replace(' ', '-') or title.lower().replace(' ', '-')
    existing = SeasonalCollection.query.filter_by(slug=slug).first()
    if existing:
        return jsonify({'error': f'Collection slug {slug} already exists.'}), 400
        
    s_date = None
    if data.get('start_date'):
        try:
            s_date = datetime.fromisoformat(data['start_date'].replace('Z', ''))
        except Exception:
            pass
    e_date = None
    if data.get('end_date'):
        try:
            e_date = datetime.fromisoformat(data['end_date'].replace('Z', ''))
        except Exception:
            pass
            
    sc = SeasonalCollection(
        title=title,
        slug=slug,
        banner=data.get('banner', ''),
        description=data.get('description', ''),
        product_ids=data.get('product_ids', []),
        start_date=s_date,
        end_date=e_date,
        is_active=data.get('is_active', True)
    )
    db.session.add(sc)
    db.session.commit()
    return jsonify({'message': 'Seasonal campaign created successfully', 'collection': sc.to_json()}), 201

@cms_bp.route('/admin/homepage/seasonal-collections/<id>', methods=['PUT'])
@admin_required
def update_seasonal(id):
    sc = SeasonalCollection.query.get(id)
    if not sc:
        return jsonify({'error': 'Seasonal campaign not found'}), 404
        
    data = request.get_json() or {}
    if 'title' in data:
        sc.title = data['title'].strip()
    if 'slug' in data:
        slug_val = data['slug'].strip().lower().replace(' ', '-')
        if slug_val != sc.slug:
            existing = SeasonalCollection.query.filter_by(slug=slug_val).first()
            if existing:
                return jsonify({'error': 'Slug already in use'}), 400
            sc.slug = slug_val
    if 'banner' in data: sc.banner = data['banner']
    if 'description' in data: sc.description = data['description']
    if 'product_ids' in data: sc.product_ids = data['product_ids']
    
    if 'start_date' in data:
        if data['start_date']:
            try:
                sc.start_date = datetime.fromisoformat(data['start_date'].replace('Z', ''))
            except Exception:
                pass
        else:
            sc.start_date = None
            
    if 'end_date' in data:
        if data['end_date']:
            try:
                sc.end_date = datetime.fromisoformat(data['end_date'].replace('Z', ''))
            except Exception:
                pass
        else:
            sc.end_date = None
            
    if 'is_active' in data: sc.is_active = bool(data['is_active'])
    
    db.session.commit()
    return jsonify({'message': 'Seasonal campaign updated successfully', 'collection': sc.to_json()}), 200

@cms_bp.route('/admin/homepage/seasonal-collections/<id>', methods=['DELETE'])
@admin_required
def delete_seasonal(id):
    sc = SeasonalCollection.query.get(id)
    if not sc:
        return jsonify({'error': 'Seasonal campaign not found'}), 404
        
    db.session.delete(sc)
    db.session.commit()
    return jsonify({'message': 'Seasonal campaign deleted successfully'}), 200
