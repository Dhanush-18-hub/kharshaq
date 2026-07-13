import sys
sys.path.append('.')

from backend.app import create_app
from backend.models import db, User, Product

app = create_app()
with app.app_context():
    user = User.query.filter_by(role='customer').first()
    product = Product.query.first()
    
    if not user or not product:
        print("Cannot run test, no user or product found.")
        sys.exit(0)
        
    initial_stock = product.stock
    print(f"Initial product stock for {product.name}: {initial_stock}")
    
    new_order = {
        'id': 'KSQ_TEST_STOCK_123',
        'date': '14 Jul 2026 • 01:00 AM',
        'total': product.price,
        'status': 'Processing',
        'items': [{
            'id': product.id,
            'name': product.name,
            'quantity': 2,
            'price': product.price
        }]
    }
    
    incoming_orders = [new_order] + (user.orders or [])
    
    existing_order_ids = {str(o.get('id', '')).strip() for o in (user.orders or []) if o.get('id')}
    new_orders = [o for o in incoming_orders if str(o.get('id', '')).strip() not in existing_order_ids]
    
    for new_o in new_orders:
        for item in new_o.get('items', []):
            pid = item.get('id')
            qty = int(item.get('quantity', 1))
            if pid:
                prod = Product.query.get(pid)
                if prod:
                    prod.stock = max(0, prod.stock - qty)
                    
    user.orders = incoming_orders
    db.session.commit()
    
    db.session.refresh(product)
    print("After placing order (quantity 2):")
    print("Stock is:", product.stock)
    print("Deducted correctly:", product.stock == initial_stock - 2)

    new_status = 'Cancelled'
    
    import copy
    orders = copy.deepcopy(user.orders or [])
    updated = False
    
    clean_order_id = 'KSQ_TEST_STOCK_123'.replace('#', '').replace('KSQ', '').strip()
    
    for o in orders:
        clean_o_id = str(o.get('id', '')).replace('#', '').replace('KSQ', '').strip()
        if clean_o_id == clean_order_id:
            old_status = o.get('status', 'Pending')
            if new_status in ['Cancelled', 'Refunded'] and old_status not in ['Cancelled', 'Refunded']:
                for item in o.get('items', []):
                    pid = item.get('id')
                    qty = int(item.get('quantity', 1))
                    if pid:
                        prod = Product.query.get(pid)
                        if prod:
                            prod.stock += qty
            o['status'] = new_status
            updated = True
            break
            
    user.orders = orders
    db.session.commit()
    
    db.session.refresh(product)
    print("After cancelling order:")
    print("Stock is:", product.stock)
    print("Restored correctly:", product.stock == initial_stock)
            
    user.orders = [o for o in user.orders if o.get('id') != 'KSQ_TEST_STOCK_123']
    db.session.commit()
