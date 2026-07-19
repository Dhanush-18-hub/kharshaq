import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app
from models import db, Coupon, CouponUsage, User
from routes.coupons import validate_coupon_logic
from datetime import datetime

app = create_app()
with app.app_context():
    print("Running Coupon validation system tests...")
    
    # 1. Retrieve or create test user
    user = User.query.filter_by(email='test_runner@karshaq.com').first()
    if not user:
        user = User(
            name='Test Runner',
            email='test_runner@karshaq.com',
            phone='+91 99999 88888',
            password_hash='pbkdf2:sha256:dummy',
            role='customer'
        )
        db.session.add(user)
        db.session.commit()
        
    # 2. Retrieve or create test coupon
    coupon = Coupon.query.filter_by(code='TEST_WELCOME').first()
    if coupon:
        db.session.delete(coupon)
        db.session.commit()
        
    coupon = Coupon(
        code='TEST_WELCOME',
        description='₹100 OFF on test purchase',
        discount_type='fixed',
        discount_value=100.0,
        minimum_order=499.0,
        usage_limit_global=10,
        usage_limit_per_user=1,
        is_welcome_coupon=True,
        device_restricted=True,
        phone_verification_required=True,
        is_active=True
    )
    db.session.add(coupon)
    db.session.commit()
    
    # Clean previous usage logs
    CouponUsage.query.filter_by(coupon_id=coupon.id).delete()
    db.session.commit()

    # TEST 1: Valid flow
    is_valid, msg, discount, free_delivery = validate_coupon_logic(
        coupon,
        user_id=user.id,
        device_id='device_test_1',
        phone_number=user.phone,
        email=user.email,
        subtotal=550.0,
        cart_items=[]
    )
    assert is_valid == True, f"Failed valid flow test: {msg}"
    assert discount == 100.0, f"Failed discount calculation test: {discount}"
    print("[OK] Test 1: Valid flow passed successfully.")

    # TEST 2: Minimum order restriction
    is_valid, msg, discount, free_delivery = validate_coupon_logic(
        coupon,
        user_id=user.id,
        device_id='device_test_1',
        phone_number=user.phone,
        email=user.email,
        subtotal=350.0,
        cart_items=[]
    )
    assert is_valid == False, "Failed minimum order restriction test"
    assert "Minimum order amount" in msg, f"Incorrect error message: {msg}"
    print("[OK] Test 2: Minimum order restriction passed successfully.")

    # TEST 3: Device abuse check
    # Add dummy usage log
    usage = CouponUsage(
        coupon_id=coupon.id,
        user_id=user.id,
        device_id='device_test_1',
        phone_number='9999988888',
        email=user.email
    )
    db.session.add(usage)
    db.session.commit()

    # Try applying with same device but different user
    is_valid, msg, discount, free_delivery = validate_coupon_logic(
        coupon,
        user_id=999,  # different user
        device_id='device_test_1',  # same device
        phone_number='+91 88888 77777',
        email='other@karshaq.com',
        subtotal=550.0,
        cart_items=[]
    )
    assert is_valid == False, "Failed device abuse restriction test"
    assert "already been used on this device" in msg, f"Incorrect error message: {msg}"
    print("[OK] Test 3: Device fingerprint abuse check passed successfully.")

    # TEST 4: Phone abuse check
    is_valid, msg, discount, free_delivery = validate_coupon_logic(
        coupon,
        user_id=999,
        device_id='device_new_fingerprint',
        phone_number='+91 99999 88888',  # same phone number
        email='other@karshaq.com',
        subtotal=550.0,
        cart_items=[]
    )
    assert is_valid == False, "Failed phone abuse restriction test"
    assert "already been claimed with this phone number" in msg, f"Incorrect error message: {msg}"
    print("[OK] Test 4: Phone number reuse abuse check passed successfully.")

    # Cleanup test coupon & test user
    db.session.delete(coupon)
    db.session.delete(user)
    db.session.commit()
    print("\nAll Coupon system unit tests completed successfully!")
