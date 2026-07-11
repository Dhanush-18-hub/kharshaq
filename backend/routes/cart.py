from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User

cart_bp = Blueprint('cart', __name__)

# --- SYNC / MERGE CART ---
@cart_bp.route('/sync', methods=['POST'])
@jwt_required()
def sync_cart():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
        
    data = request.get_json() or {}
    guest_cart = data.get('cart', [])
    guest_wishlist = data.get('wishlist', [])
    
    # 1. Merge Cart Items
    # db_cart is stored as a list of dicts. We want to convert guest_cart and db_cart into key-value structures
    merged_cart = {}
    
    # Load existing cart items
    db_cart = user.cart or []
    for item in db_cart:
        item_id = item.get('id')
        if item_id:
            merged_cart[item_id] = item
            
    # Merge guest cart items
    for item in guest_cart:
        item_id = item.get('id')
        if not item_id:
            continue
        if item_id in merged_cart:
            # Add quantities up
            merged_cart[item_id]['quantity'] = merged_cart[item_id].get('quantity', 0) + item.get('quantity', 1)
        else:
            merged_cart[item_id] = item
            
    user.cart = list(merged_cart.values())
    
    # 2. Merge Wishlist Items (keep unique IDs)
    if data.get('overwrite_wishlist', False):
        user.wishlist = data.get('wishlist', [])
    else:
        db_wishlist = user.wishlist or []
        merged_wishlist = list(set(db_wishlist + guest_wishlist))
        user.wishlist = merged_wishlist
    
    # Update orders if user sends them, or any additional details
    addresses = data.get('addresses')
    if addresses is not None:
        user.addresses = addresses
        
    orders = data.get('orders')
    if orders is not None:
        user.orders = orders
        
    payment_methods = data.get('payment_methods')
    if payment_methods is not None:
        user.payment_methods = payment_methods

    reward_points = data.get('reward_points')
    if reward_points is not None:
        user.reward_points = reward_points
        
    db.session.commit()
    
    return jsonify({
        'message': 'Cart Merged',
        'cart': user.cart,
        'wishlist': user.wishlist,
        'addresses': user.addresses,
        'orders': user.orders,
        'payment_methods': user.payment_methods,
        'reward_points': user.reward_points,
        'membership_level': user.membership_level
    }), 200
