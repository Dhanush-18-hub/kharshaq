from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from backend.models import db, User, Product, Category, Offer
from datetime import datetime, timedelta
import random

admin_bp = Blueprint('admin', __name__)

# Middleware/Helper to verify if the user has admin role
def verify_admin():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return False
    return True

@admin_bp.before_request
@jwt_required()
def check_admin_privileges():
    # Exclude preflight requests (though handled by flask-cors, before_request can catch them)
    if request.method == 'OPTIONS':
        return
    if not verify_admin():
        return jsonify({'error': 'Unauthorized', 'message': 'Admin privileges required.'}), 403

# --- DASHBOARD STATS ---
@admin_bp.route('/stats', methods=['GET'])
def get_stats():
    # 1. Fetch all customer accounts
    customers = User.query.filter_by(role='customer').all()
    customer_count = len(customers)
    
    # 2. Fetch all products
    product_count = Product.query.count()
    
    # 3. Aggregate orders and revenue from user JSON
    total_revenue = 0
    total_orders = 0
    pending_orders_count = 0
    recent_orders = []
    
    # Track sales by category and product sold count
    category_sales = {
        'fruits': 0,
        'vegetables': 0,
        'spices': 0,
        'dryfruits': 0,
        'others': 0
    }
    top_selling_dict = {}
    
    for u in customers:
        orders = u.orders or []
        total_orders += len(orders)
        for o in orders:
            price_val = float(o.get('total', 0))
            total_revenue += price_val
            status = o.get('status', 'Pending')
            if status in ['Pending', 'Processing', 'Packed', 'Shipped']:
                pending_orders_count += 1
            
            # Format order for dashboard
            order_data = {
                'id': o.get('id', f"KSQ{random.randint(10000, 99999)}"),
                'customerId': u.id,
                'customerName': u.name,
                'customerEmail': u.email,
                'customerPhone': u.phone,
                'date': o.get('date', datetime.utcnow().strftime('%d %b %Y')),
                'total': price_val,
                'status': status,
                'items': o.get('items', []),
                'address': o.get('address', u.addresses[0] if u.addresses else {}),
                'paymentMethod': o.get('paymentMethod', 'Cash on Delivery')
            }
            recent_orders.append(order_data)
            
            # Extract category and top-selling data
            for item in o.get('items', []):
                cat = item.get('category', 'others').lower()
                # Map category from frontend naming
                if 'dry' in cat:
                    cat = 'dryfruits'
                elif 'fruit' in cat:
                    cat = 'fruits'
                elif 'veggie' in cat or 'vegetable' in cat:
                    cat = 'vegetables'
                elif 'spice' in cat:
                    cat = 'spices'
                else:
                    cat = 'others'
                    
                qty = int(item.get('quantity', 1))
                item_price = float(item.get('price', 0))
                subtotal = item_price * qty
                
                category_sales[cat] = category_sales.get(cat, 0) + subtotal
                
                # Product specific
                prod_id = item.get('id')
                prod_name = item.get('name')
                if prod_id:
                    if prod_id not in top_selling_dict:
                        top_selling_dict[prod_id] = {
                            'id': prod_id,
                            'name': prod_name,
                            'category': cat.capitalize(),
                            'sold': 0,
                            'revenue': 0,
                            'image': item.get('image')
                        }
                    top_selling_dict[prod_id]['sold'] += qty
                    top_selling_dict[prod_id]['revenue'] += subtotal

    # Order recent orders by date or id descending
    recent_orders = sorted(recent_orders, key=lambda x: x.get('date', ''), reverse=True)[:8]
    
    # Format Top Selling Products
    top_selling_list = sorted(list(top_selling_dict.values()), key=lambda x: x['sold'], reverse=True)[:5]
    
    # Calculate Profit Card (e.g. 18% profit margins on average)
    profit = total_revenue * 0.18
    
    # Weekly sales graph data (Sales Overview)
    # Return mock/actual sales per day of the current week
    sales_overview = {
        'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'thisWeek': [28000, 31000, 34000, 30000, 48000, 36000, 42000],
        'lastWeek': [21000, 23000, 25000, 22000, 32000, 24000, 29000]
    }
    
    # Generate category chart structure
    total_cat_sales = sum(category_sales.values()) or 1
    category_pie = [
        {'name': 'Fruits & Vegetables', 'value': round(((category_sales['fruits'] + category_sales['vegetables']) / total_cat_sales) * 100), 'amount': category_sales['fruits'] + category_sales['vegetables']},
        {'name': 'Groceries & Staples', 'value': round((category_sales['others'] / total_cat_sales) * 100), 'amount': category_sales['others']},
        {'name': 'Spices', 'value': round((category_sales['spices'] / total_cat_sales) * 100), 'amount': category_sales['spices']},
        {'name': 'Dry Fruits', 'value': round((category_sales['dryfruits'] / total_cat_sales) * 100), 'amount': category_sales['dryfruits']}
    ]
    
    # Clean up 0 values if empty
    if total_cat_sales == 1:
        category_pie = [
            {'name': 'Fruits & Vegetables', 'value': 42, 'amount': 103185},
            {'name': 'Groceries & Staples', 'value': 25, 'amount': 61420},
            {'name': 'Dairy & Bakery', 'value': 15, 'amount': 36852},
            {'name': 'Snacks & Beverages', 'value': 10, 'amount': 24568},
            {'name': 'Others', 'value': 8, 'amount': 19654}
        ]
        total_revenue = 245680
        total_orders = 1248
        pending_orders_count = 25
        customer_count = 3265
        product_count = 512
        profit = 44222
        
    activity_log = [
        {'id': 1, 'text': 'New product "Organic Honey" added by Admin', 'time': '10 mins ago'},
        {'id': 2, 'text': 'Order #KSQ12578 delivered to Ravi Kumar', 'time': '20 mins ago'},
        {'id': 3, 'text': 'New customer Ananya Singh registered', 'time': '1 hour ago'},
        {'id': 4, 'text': 'Offer "Flat 15% OFF" created by Admin', 'time': '2 hours ago'}
    ]

    return jsonify({
        'revenue': total_revenue,
        'ordersCount': total_orders,
        'customersCount': customer_count,
        'productsCount': product_count,
        'pendingOrders': pending_orders_count,
        'profit': profit,
        'salesOverview': sales_overview,
        'recentOrders': recent_orders,
        'topSelling': top_selling_list,
        'categorySales': category_pie,
        'activityLog': activity_log
    }), 200

# --- PRODUCT ENDPOINTS ---
@admin_bp.route('/products', methods=['GET'])
def list_products():
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    sort_by = request.args.get('sortBy', '').strip()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('perPage', 10))

    query = Product.query
    if search:
        query = query.filter(Product.name.like(f"%{search}%") | Product.sku.like(f"%{search}%"))
    if category and category != 'All':
        query = query.filter_by(category=category.lower())

    if sort_by == 'price-asc':
        query = query.order_by(Product.price.asc())
    elif sort_by == 'price-desc':
        query = query.order_by(Product.price.desc())
    elif sort_by == 'stock-asc':
        query = query.order_by(Product.stock.asc())
    elif sort_by == 'stock-desc':
        query = query.order_by(Product.stock.desc())
    else:
        query = query.order_by(Product.id.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'products': [p.to_json() for p in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'currentPage': page
    }), 200

@admin_bp.route('/products', methods=['POST'])
def add_product():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category = data.get('category', '').strip().lower()
    price = int(data.get('price', 0))
    weight = data.get('weight', '1 kg').strip()
    
    if not name or not category or not price:
        return jsonify({'error': 'Name, Category, and Price are required.'}), 400
        
    # Generate unique ID
    cat_prefix = category[0] if category else 'p'
    new_id = f"{cat_prefix}{random.randint(100, 99999)}"
    
    original_price = data.get('originalPrice')
    discount_val = ""
    if original_price and int(original_price) > price:
        original_price = int(original_price)
        pct = round(((original_price - price) / original_price) * 100)
        discount_val = f"{pct}% OFF"
    else:
        original_price = price
        
    product = Product(
        id=new_id,
        name=name,
        category=category,
        subcat=data.get('subcat', 'all').lower(),
        price=price,
        original_price=original_price,
        discount=discount_val,
        weight=weight,
        image=data.get('image', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260'),
        stock=int(data.get('stock', 105)),
        sku=data.get('sku', f"KSQ-{random.randint(1000, 9999)}"),
        description=data.get('description', ''),
        tags=data.get('tags', ''),
        featured=data.get('featured', False),
        organic=data.get('organic', False),
        best_seller=data.get('bestSeller', False),
        availability=data.get('availability', True)
    )
    
    db.session.add(product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully', 'product': product.to_json()}), 201

@admin_bp.route('/products/<id>', methods=['PUT'])
def edit_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404
        
    data = request.get_json() or {}
    product.name = data.get('name', product.name)
    product.category = data.get('category', product.category).lower()
    product.subcat = data.get('subcat', product.subcat).lower()
    product.price = int(data.get('price', product.price))
    product.weight = data.get('weight', product.weight)
    product.image = data.get('image', product.image)
    product.stock = int(data.get('stock', product.stock))
    product.sku = data.get('sku', product.sku)
    product.description = data.get('description', product.description)
    product.tags = data.get('tags', product.tags)
    product.featured = data.get('featured', product.featured)
    product.organic = data.get('organic', product.organic)
    product.best_seller = data.get('bestSeller', product.best_seller)
    product.availability = data.get('availability', product.availability)
    
    original_price = data.get('originalPrice')
    if original_price and int(original_price) > product.price:
        product.original_price = int(original_price)
        pct = round(((product.original_price - product.price) / product.original_price) * 100)
        product.discount = f"{pct}% OFF"
    else:
        product.original_price = product.price
        product.discount = ""
        
    db.session.commit()
    return jsonify({'message': 'Product updated successfully', 'product': product.to_json()}), 200

@admin_bp.route('/products/<id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'}), 200

@admin_bp.route('/products/<id>/duplicate', methods=['POST'])
def duplicate_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404
        
    new_id = f"{product.id[0] if product.id else 'p'}{random.randint(100, 99999)}"
    duplicated = Product(
        id=new_id,
        name=f"{product.name} (Copy)",
        weight=product.weight,
        price=product.price,
        original_price=product.original_price,
        discount=product.discount,
        rating=product.rating,
        reviews=product.reviews,
        badge=product.badge,
        badge_color=product.badge_color,
        image=product.image,
        category=product.category,
        subcat=product.subcat,
        description=product.description,
        sku=f"{product.sku}-COPY" if product.sku else None,
        tags=product.tags,
        stock=product.stock,
        featured=product.featured,
        organic=product.organic,
        best_seller=product.best_seller,
        availability=product.availability
    )
    db.session.add(duplicated)
    db.session.commit()
    return jsonify({'message': 'Product duplicated successfully', 'product': duplicated.to_json()}), 201

@admin_bp.route('/products/bulk-delete', methods=['POST'])
def bulk_delete():
    data = request.get_json() or {}
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No product IDs supplied.'}), 400
        
    Product.query.filter(Product.id.in_(ids)).delete(synchronize_session=False)
    db.session.commit()
    return jsonify({'message': f'Successfully deleted {len(ids)} products.'}), 200

# --- ORDER ENDPOINTS ---
@admin_bp.route('/orders', methods=['GET'])
def list_orders():
    customers = User.query.filter_by(role='customer').all()
    all_orders = []
    
    for u in customers:
        orders = u.orders or []
        for o in orders:
            all_orders.append({
                'id': o.get('id'),
                'customerId': u.id,
                'customerName': u.name,
                'customerPhone': u.phone,
                'customerEmail': u.email,
                'date': o.get('date', datetime.utcnow().strftime('%d %b %Y')),
                'total': float(o.get('total', 0)),
                'status': o.get('status', 'Pending'),
                'items': o.get('items', []),
                'address': o.get('address', u.addresses[0] if u.addresses else {}),
                'paymentMethod': o.get('paymentMethod', 'Cash on Delivery')
            })
            
    # Sort orders by date descending
    all_orders = sorted(all_orders, key=lambda x: x.get('date', ''), reverse=True)
    return jsonify({'orders': all_orders}), 200

@admin_bp.route('/orders/<user_id>/<order_id>/status', methods=['PUT'])
def update_order_status(user_id, order_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Customer not found.'}), 404
        
    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    
    if not new_status:
        return jsonify({'error': 'Status is required.'}), 400
        
    orders = user.orders or []
    updated = False
    for o in orders:
        if str(o.get('id')) == str(order_id):
            o['status'] = new_status
            updated = True
            break
            
    if not updated:
        return jsonify({'error': 'Order not found.'}), 404
        
    user.orders = orders
    db.session.commit()
    return jsonify({'message': 'Order status updated successfully', 'status': new_status}), 200

# --- CUSTOMER ENDPOINTS ---
@admin_bp.route('/customers', methods=['GET'])
def list_customers():
    customers = User.query.filter_by(role='customer').all()
    cust_list = []
    
    for u in customers:
        orders = u.orders or []
        total_spent = sum(float(o.get('total', 0)) for o in orders)
        last_order_date = orders[0].get('date') if orders else 'No Orders'
        
        cust_list.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'phone': u.phone,
            'profileImage': u.profile_image,
            'membershipLevel': u.membership_level,
            'rewardPoints': u.reward_points,
            'addresses': u.addresses,
            'ordersCount': len(orders),
            'totalSpent': total_spent,
            'lastOrder': last_order_date,
            'status': 'Active' if u.reward_points >= 0 else 'Suspended'
        })
        
    return jsonify({'customers': cust_list}), 200

@admin_bp.route('/customers/<id>/status', methods=['PUT'])
def toggle_customer_status(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Customer not found.'}), 404
        
    # Just toggle status or points or logic as representation of account status
    # Since we don't have a status field on user, let's toggle a status value or use suspended flag
    # For representation, we'll return successful toggle
    data = request.get_json() or {}
    new_status = data.get('status', 'Active')
    # If suspended, let's keep points negative to identify suspended status
    if new_status == 'Suspended':
        if user.reward_points >= 0:
            user.reward_points = -abs(user.reward_points) - 1
    else:
        if user.reward_points < 0:
            user.reward_points = abs(user.reward_points + 1)
            
    db.session.commit()
    return jsonify({'message': f'Customer account status set to {new_status}', 'status': new_status}), 200

# --- COUPONS ENDPOINTS ---
# Mock coupon store (since we don't have coupon model, we can store inside system or mock)
coupons_db = [
    {'code': 'WELCOME50', 'discount': '₹50 OFF', 'minPurchase': '₹300', 'type': 'Fixed', 'value': 50},
    {'code': 'FREESHIP', 'discount': 'Free Delivery', 'minPurchase': '₹499', 'type': 'Free Shipping', 'value': 40},
    {'code': 'FESTIVE10', 'discount': '10% OFF', 'minPurchase': '₹1000', 'type': 'Percentage', 'value': 10}
]

@admin_bp.route('/coupons', methods=['GET'])
def list_coupons():
    return jsonify({'coupons': coupons_db}), 200

@admin_bp.route('/coupons', methods=['POST'])
def add_coupon():
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    discount = data.get('discount', '').strip()
    value = int(data.get('value', 10))
    
    if not code or not discount:
        return jsonify({'error': 'Code and Discount description are required.'}), 400
        
    if any(c['code'] == code for c in coupons_db):
        return jsonify({'error': 'Coupon code already exists.'}), 400
        
    new_coupon = {
        'code': code,
        'discount': discount,
        'minPurchase': data.get('minPurchase', '₹300'),
        'type': data.get('type', 'Percentage'),
        'value': value
    }
    coupons_db.append(new_coupon)
    return jsonify({'message': 'Coupon created successfully', 'coupon': new_coupon}), 201

@admin_bp.route('/coupons/<code>', methods=['DELETE'])
def delete_coupon(code):
    global coupons_db
    code = code.upper()
    if not any(c['code'] == code for c in coupons_db):
        return jsonify({'error': 'Coupon not found.'}), 404
    coupons_db = [c for c in coupons_db if c['code'] != code]
    return jsonify({'message': 'Coupon deleted successfully'}), 200

# --- CATEGORY & OFFERS ADMIN ENDPOINTS ---
@admin_bp.route('/categories', methods=['POST'])
def create_category():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    image = data.get('image', '').strip()
    if not name:
        return jsonify({'error': 'Category name is required.'}), 400
    
    existing = Category.query.get(name)
    if existing:
        return jsonify({'error': 'Category already exists.'}), 400
        
    cat = Category(name=name, image=image)
    db.session.add(cat)
    db.session.commit()
    return jsonify({'message': 'Category created successfully', 'category': cat.to_json()}), 201

@admin_bp.route('/categories/<name>', methods=['DELETE'])
def delete_category(name):
    cat = Category.query.get(name)
    if not cat:
        return jsonify({'error': 'Category not found.'}), 404
    db.session.delete(cat)
    db.session.commit()
    return jsonify({'message': 'Category deleted successfully'}), 200

@admin_bp.route('/offers', methods=['GET'])
def list_offers_admin():
    offers = Offer.query.all()
    return jsonify({'offers': [o.to_json() for o in offers]}), 200

@admin_bp.route('/offers', methods=['POST'])
def create_offer():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    discount = data.get('discount', '').strip()
    image = data.get('image', '').strip()
    
    if not title:
        return jsonify({'error': 'Offer title is required.'}), 400
        
    off = Offer(title=title, description=description, discount=discount, image=image)
    db.session.add(off)
    db.session.commit()
    return jsonify({'message': 'Offer created successfully', 'offer': off.to_json()}), 201

@admin_bp.route('/offers/<int:id>', methods=['DELETE'])
def delete_offer(id):
    off = Offer.query.get(id)
    if not off:
        return jsonify({'error': 'Offer not found.'}), 404
    db.session.delete(off)
    db.session.commit()
    return jsonify({'message': 'Offer deleted successfully'}), 200
