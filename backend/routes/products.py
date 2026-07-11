from flask import Blueprint, jsonify, request
from backend.models import db, Product, Category, Offer

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
    categories = Category.query.all()
    output = []
    for c in categories:
        count = Product.query.filter(Product.category.ilike(c.name)).count()
        output.append({
            'name': c.name,
            'image': c.image,
            'count': count,
            'activeOffers': 0
        })
    return jsonify(output), 200

@products_bp.route('/offers', methods=['GET'])
def list_offers():
    offers = Offer.query.all()
    return jsonify([o.to_json() for o in offers]), 200
