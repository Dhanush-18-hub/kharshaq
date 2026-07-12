from flask import Blueprint, jsonify, request
from backend.models import db, Product, Category, Offer, SubCategory, BroadcastNotification

products_bp = Blueprint('products_bp', __name__)

@products_bp.route('/products', methods=['GET'])
def list_products():
    search = request.args.get('search', '').strip()
    category = request.args.get('category', 'All').strip()
    sort_by = request.args.get('sortBy', 'default').strip()
    page = request.args.get('page', type=int)
    per_page = request.args.get('perPage', type=int)

    query = Product.query

    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))
    
    if category and category != 'All':
        query = query.filter(Product.category.ilike(category))

    if sort_by == 'price-low-high':
        query = query.order_by(Product.price.asc())
    elif sort_by == 'price-high-low':
        query = query.order_by(Product.price.desc())
    elif sort_by == 'rating':
        query = query.order_by(Product.rating.desc())
    elif sort_by == 'alphabetical':
        query = query.order_by(Product.name.asc())
    else:
        query = query.order_by(Product.id.asc())

    if page and per_page:
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return jsonify({
            'products': [p.to_json() for p in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages
        }), 200

    all_products = query.all()
    return jsonify([p.to_json() for p in all_products]), 200

@products_bp.route('/products/<id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_json()), 200

@products_bp.route('/categories', methods=['GET'])
def list_categories():
    include_all = request.args.get('all', 'false').lower() == 'true'
    if include_all:
        categories = Category.query.order_by(Category.navbarOrder.asc()).all()
    else:
        categories = Category.query.filter_by(isVisible=True).order_by(Category.navbarOrder.asc()).all()
        
    output = []
    for c in categories:
        count = Product.query.filter(Product.category.ilike(c.slug)).count()
        cat_json = c.to_json()
        cat_json['count'] = count
        cat_json['activeOffers'] = 0
        output.append(cat_json)
    return jsonify(output), 200

@products_bp.route('/category/<slug>', methods=['GET'])
def get_category_by_slug(slug):
    cat = Category.query.filter_by(slug=slug).first()
    if not cat:
        return jsonify({'error': 'Category not found.'}), 404
        
    products = Product.query.filter(Product.category.ilike(slug)).all()
    cat_json = cat.to_json()
    cat_json['products'] = [p.to_json() for p in products]
    return jsonify(cat_json), 200

@products_bp.route('/offers', methods=['GET'])
def list_offers():
    offers = Offer.query.all()
    return jsonify([o.to_json() for o in offers]), 200

@products_bp.route('/notifications', methods=['GET'])
def list_notifications():
    notifs = BroadcastNotification.query.order_by(BroadcastNotification.id.desc()).all()
    return jsonify([n.to_json() for n in notifs]), 200
