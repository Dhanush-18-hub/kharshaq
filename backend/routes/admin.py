from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, User, Product, Category, Offer, SubCategory, BroadcastNotification, FinancialExpense, GSTConfig
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
    
    # Get parameters
    filter_type = request.args.get('filter', 'this-week').lower()
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')
    
    now = datetime.now()
    
    # Helper functions to parse dates
    def parse_order_date(date_str):
        if not date_str:
            return None
        try:
            clean_str = date_str.split('•')[0].strip()
            return datetime.strptime(clean_str, "%d %b %Y")
        except Exception:
            try:
                if 'T' in date_str:
                    date_str = date_str.split('T')[0]
                return datetime.strptime(date_str.strip(), "%Y-%m-%d")
            except Exception:
                return None

    def get_order_hour(date_str):
        if not date_str or ' • ' not in date_str:
            return 0
        try:
            parts = date_str.split(' • ')
            time_part = parts[1].strip()
            dt = datetime.strptime(time_part, "%I:%M %p")
            return dt.hour
        except Exception:
            return 0

    def parse_iso_date(d_str):
        if not d_str: return None
        try:
            if 'T' in d_str:
                d_str = d_str.split('T')[0]
            return datetime.strptime(d_str, "%Y-%m-%d")
        except Exception:
            return None

    # Determine start_dt, end_dt, labels and pre-initialize charts
    if filter_type == 'today':
        start_dt = datetime(now.year, now.month, now.day, 0, 0, 0)
        end_dt = datetime(now.year, now.month, now.day, 23, 59, 59)
        labels = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"]
        sales = [0.0] * 24
        orders_count = [0] * 24
    elif filter_type in ['this-week', 'week']:
        monday = now - timedelta(days=now.weekday())
        start_dt = datetime(monday.year, monday.month, monday.day, 0, 0, 0)
        end_dt = start_dt + timedelta(days=6, hours=23, minutes=59, seconds=59)
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        sales = [0.0] * 7
        orders_count = [0] * 7
    elif filter_type in ['this-month', 'month']:
        start_dt = datetime(now.year, now.month, 1, 0, 0, 0)
        next_month = datetime(now.year + 1, 1, 1) if now.month == 12 else datetime(now.year, now.month + 1, 1)
        end_dt = next_month - timedelta(seconds=1)
        days_count = (end_dt - start_dt).days + 1
        labels = [str(i) for i in range(1, days_count + 1)]
        sales = [0.0] * days_count
        orders_count = [0] * days_count
    elif filter_type in ['this-year', 'year']:
        start_dt = datetime(now.year, 1, 1, 0, 0, 0)
        end_dt = datetime(now.year, 12, 31, 23, 59, 59)
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        sales = [0.0] * 12
        orders_count = [0] * 12
    else: # custom
        s_dt = parse_iso_date(start_date_str)
        e_dt = parse_iso_date(end_date_str)
        if s_dt and e_dt:
            start_dt = datetime(s_dt.year, s_dt.month, s_dt.day, 0, 0, 0)
            end_dt = datetime(e_dt.year, e_dt.month, e_dt.day, 23, 59, 59)
            filter_type = 'custom'
        else:
            monday = now - timedelta(days=now.weekday())
            start_dt = datetime(monday.year, monday.month, monday.day, 0, 0, 0)
            end_dt = start_dt + timedelta(days=6, hours=23, minutes=59, seconds=59)
            filter_type = 'this-week'
            labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            sales = [0.0] * 7
            orders_count = [0] * 7
            
        if filter_type == 'custom':
            labels = []
            curr = start_dt
            while curr <= end_dt:
                labels.append(curr.strftime("%d %b"))
                curr += timedelta(days=1)
            sales = [0.0] * len(labels)
            orders_count = [0] * len(labels)

    # Variables for stats in range
    filtered_revenue = 0.0
    filtered_orders_count = 0
    pending_orders_count = 0
    recent_orders = []
    
    # Track sales by category and product sold count
    category_sales = {
        'fruits': 0.0,
        'vegetables': 0.0,
        'spices': 0.0,
        'dryfruits': 0.0,
        'others': 0.0
    }
    top_selling_dict = {}

    for u in customers:
        orders = u.orders or []
        for o in orders:
            status = o.get('status', 'Pending')
            
            # Count pending orders across all time
            if status in ['Pending', 'Processing', 'Packed', 'Shipped']:
                pending_orders_count += 1
                
            # Parse date
            o_date_str = o.get('date', '')
            o_dt = parse_order_date(o_date_str)
            if not o_dt:
                continue
                
            # Filter check
            is_in_range = (start_dt <= o_dt <= end_dt)
            if not is_in_range:
                continue

            price_val = float(o.get('total', 0))
            
            # Formatting for recent list (all status, but only in filter range)
            order_data = {
                'id': o.get('id', f"KSQ{random.randint(10000, 99999)}"),
                'customerId': u.id,
                'customerName': u.name,
                'customerEmail': u.email,
                'customerPhone': u.phone,
                'date': o_date_str,
                'total': price_val,
                'status': status,
                'items': o.get('items', []),
                'address': o.get('address', u.addresses[0] if u.addresses else {}),
                'paymentMethod': o.get('paymentMethod', 'Cash on Delivery')
            }
            recent_orders.append(order_data)

            # Accumulate stats ONLY if completed/delivered
            if status in ['Completed', 'Delivered']:
                filtered_revenue += price_val
                filtered_orders_count += 1
                
                # Plot onto graph array
                if filter_type == 'today':
                    hr = get_order_hour(o_date_str)
                    if 0 <= hr < 24:
                        sales[hr] += price_val
                        orders_count[hr] += 1
                elif filter_type in ['this-week', 'week']:
                    weekday = o_dt.weekday() # 0 is Monday, 6 is Sunday
                    if 0 <= weekday < 7:
                        sales[weekday] += price_val
                        orders_count[weekday] += 1
                elif filter_type in ['this-month', 'month']:
                    day_idx = o_dt.day - 1
                    if 0 <= day_idx < len(sales):
                        sales[day_idx] += price_val
                        orders_count[day_idx] += 1
                elif filter_type in ['this-year', 'year']:
                    month_idx = o_dt.month - 1
                    if 0 <= month_idx < 12:
                        sales[month_idx] += price_val
                        orders_count[month_idx] += 1
                else: # custom
                    day_offset = (o_dt - start_dt).days
                    if 0 <= day_offset < len(sales):
                        sales[day_offset] += price_val
                        orders_count[day_offset] += 1

                # Extract category and top-selling data
                for item in o.get('items', []):
                    cat = item.get('category', 'others').lower()
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
                    
                    prod_id = item.get('id')
                    prod_name = item.get('name')
                    if prod_id:
                        if prod_id not in top_selling_dict:
                            top_selling_dict[prod_id] = {
                                'id': prod_id,
                                'name': prod_name,
                                'category': cat.capitalize(),
                                'sold': 0,
                                'revenue': 0.0,
                                'image': item.get('image')
                            }
                        top_selling_dict[prod_id]['sold'] += qty
                        top_selling_dict[prod_id]['revenue'] += subtotal

    # Order recent orders by date or id descending
    recent_orders = sorted(recent_orders, key=lambda x: x.get('date', ''), reverse=True)[:8]
    top_selling_list = sorted(list(top_selling_dict.values()), key=lambda x: x['sold'], reverse=True)[:5]
    profit = filtered_revenue * 0.18

    # Weekly/custom sales graph data (Sales Overview)
    sales_overview = {
        'labels': labels,
        'sales': sales,
        'orders': orders_count
    }

    # Generate category chart structure
    total_cat_sales = sum(category_sales.values()) or 1
    category_pie = [
        {'name': 'Fruits & Vegetables', 'value': round(((category_sales['fruits'] + category_sales['vegetables']) / total_cat_sales) * 100), 'amount': category_sales['fruits'] + category_sales['vegetables']},
        {'name': 'Groceries & Staples', 'value': round((category_sales['others'] / total_cat_sales) * 100), 'amount': category_sales['others']},
        {'name': 'Spices', 'value': round((category_sales['spices'] / total_cat_sales) * 100), 'amount': category_sales['spices']},
        {'name': 'Dry Fruits', 'value': round((category_sales['dryfruits'] / total_cat_sales) * 100), 'amount': category_sales['dryfruits']}
    ]

    # Clean activity log dynamically
    activity_log = []
    for o in recent_orders[:3]:
        activity_log.append({
            'id': f"act_ord_{o['id']}",
            'text': f"Order #{o['id']} status updated to '{o['status']}'",
            'time': o['date'].split(' • ')[1] if ' • ' in o['date'] else 'Recent'
        })
    recent_customers = sorted(customers, key=lambda x: x.created_at, reverse=True)[:2]
    for rc in recent_customers:
        activity_log.append({
            'id': f"act_cust_{rc.id}",
            'text': f"New customer {rc.name} registered",
            'time': rc.created_at.strftime('%d %b') if rc.created_at else 'Recent'
        })

    return jsonify({
        'revenue': filtered_revenue,
        'ordersCount': filtered_orders_count,
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

# --- FINANCIAL ANALYTICS ENDPOINTS ---
@admin_bp.route('/financial-analytics', methods=['GET'])
def get_financial_analytics():
    filter_type = request.args.get('filter', 'this-month').lower()
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')
    status_param = request.args.get('status', 'Completed,Delivered')
    target_statuses = [s.strip() for s in status_param.split(',') if s.strip()]

    now = datetime.now()
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0)
    
    def parse_order_date(date_str):
        if not date_str:
            return None
        try:
            clean_str = date_str.split('•')[0].strip()
            return datetime.strptime(clean_str, "%d %b %Y")
        except Exception:
            try:
                if 'T' in date_str:
                    date_str = date_str.split('T')[0]
                return datetime.strptime(date_str.strip(), "%Y-%m-%d")
            except Exception:
                return None

    def get_order_hour(date_str):
        if not date_str or ' • ' not in date_str:
            return 0
        try:
            parts = date_str.split(' • ')
            time_part = parts[1].strip()
            dt = datetime.strptime(time_part, "%I:%M %p")
            return dt.hour
        except Exception:
            return 0

    def parse_iso_date(d_str):
        if not d_str: return None
        try:
            if 'T' in d_str:
                d_str = d_str.split('T')[0]
            return datetime.strptime(d_str, "%Y-%m-%d")
        except Exception:
            return None

    if filter_type == 'today':
        start_dt = today_start
        end_dt = datetime(now.year, now.month, now.day, 23, 59, 59)
        labels = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"]
        sales = [0.0] * 24
        orders_count_arr = [0] * 24
    elif filter_type == 'yesterday':
        yest = now - timedelta(days=1)
        start_dt = datetime(yest.year, yest.month, yest.day, 0, 0, 0)
        end_dt = datetime(yest.year, yest.month, yest.day, 23, 59, 59)
        labels = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"]
        sales = [0.0] * 24
        orders_count_arr = [0] * 24
    elif filter_type == 'last-7-days':
        start_dt = today_start - timedelta(days=6)
        end_dt = datetime(now.year, now.month, now.day, 23, 59, 59)
        labels = []
        curr = start_dt
        while curr <= end_dt:
            labels.append(curr.strftime("%d %b"))
            curr += timedelta(days=1)
        sales = [0.0] * len(labels)
        orders_count_arr = [0] * len(labels)
    elif filter_type in ['this-week', 'week']:
        monday = now - timedelta(days=now.weekday())
        start_dt = datetime(monday.year, monday.month, monday.day, 0, 0, 0)
        end_dt = start_dt + timedelta(days=6, hours=23, minutes=59, seconds=59)
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        sales = [0.0] * 7
        orders_count_arr = [0] * 7
    elif filter_type == 'last-week':
        monday = now - timedelta(days=now.weekday() + 7)
        start_dt = datetime(monday.year, monday.month, monday.day, 0, 0, 0)
        end_dt = start_dt + timedelta(days=6, hours=23, minutes=59, seconds=59)
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        sales = [0.0] * 7
        orders_count_arr = [0] * 7
    elif filter_type in ['this-month', 'month']:
        start_dt = datetime(now.year, now.month, 1, 0, 0, 0)
        next_month = datetime(now.year + 1, 1, 1) if now.month == 12 else datetime(now.year, now.month + 1, 1)
        end_dt = next_month - timedelta(seconds=1)
        days_count = (end_dt - start_dt).days + 1
        labels = [str(i) for i in range(1, days_count + 1)]
        sales = [0.0] * days_count
        orders_count_arr = [0] * days_count
    elif filter_type == 'last-month':
        prev_month_year = now.year if now.month > 1 else now.year - 1
        prev_month = now.month - 1 if now.month > 1 else 12
        start_dt = datetime(prev_month_year, prev_month, 1, 0, 0, 0)
        next_month = datetime(now.year, now.month, 1, 0, 0, 0)
        end_dt = next_month - timedelta(seconds=1)
        days_count = (end_dt - start_dt).days + 1
        labels = [str(i) for i in range(1, days_count + 1)]
        sales = [0.0] * days_count
        orders_count_arr = [0] * days_count
    elif filter_type in ['this-year', 'year']:
        start_dt = datetime(now.year, 1, 1, 0, 0, 0)
        end_dt = datetime(now.year, 12, 31, 23, 59, 59)
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        sales = [0.0] * 12
        orders_count_arr = [0] * 12
    elif filter_type == 'custom':
        s_dt = parse_iso_date(start_date_str)
        e_dt = parse_iso_date(end_date_str)
        if s_dt and e_dt:
            start_dt = datetime(s_dt.year, s_dt.month, s_dt.day, 0, 0, 0)
            end_dt = datetime(e_dt.year, e_dt.month, e_dt.day, 23, 59, 59)
        else:
            start_dt = today_start - timedelta(days=30)
            end_dt = datetime(now.year, now.month, now.day, 23, 59, 59)
            filter_type = 'custom'
        
        labels = []
        curr = start_dt
        while curr <= end_dt:
            labels.append(curr.strftime("%d %b"))
            curr += timedelta(days=1)
        sales = [0.0] * len(labels)
        orders_count_arr = [0] * len(labels)
    else:
        start_dt = datetime(now.year, now.month, 1, 0, 0, 0)
        next_month = datetime(now.year + 1, 1, 1) if now.month == 12 else datetime(now.year, now.month + 1, 1)
        end_dt = next_month - timedelta(seconds=1)
        days_count = (end_dt - start_dt).days + 1
        labels = [str(i) for i in range(1, days_count + 1)]
        sales = [0.0] * days_count
        orders_count_arr = [0] * days_count
        filter_type = 'this-month'

    customers = User.query.filter_by(role='customer').all()
    all_products = Product.query.all()
    
    product_stats = {
        p.id: {
            'id': p.id,
            'name': p.name,
            'sold': 0,
            'revenue': 0.0,
            'category': p.category,
            'stock': p.stock,
            'original_price': p.original_price or p.price,
            'price': p.price
        } for p in all_products
    }

    gross_revenue = 0.0
    completed_orders_count = 0
    new_customers_count = sum(1 for c in customers if start_dt <= c.created_at <= end_dt)
    total_customers_registered = len(customers)

    orders_by_status = {'Completed': 0, 'Delivered': 0, 'Pending': 0, 'Cancelled': 0, 'Refunded': 0, 'Refund Requested': 0, 'Refund Rejected': 0}
    
    refund_counts = {'Approved': 0, 'Rejected': 0, 'Requested': 0}
    refund_total_amount = 0.0

    discounts_total = 0.0
    discount_orders_count = 0
    coupon_usage = {}
    category_metrics = {}

    active_customers_in_period = set()
    returning_customers_in_period = set()
    customer_spends = {}

    payment_metrics = {
        'Cash on Delivery': {'amount': 0.0, 'orders': 0},
        'UPI': {'amount': 0.0, 'orders': 0},
        'Credit Card': {'amount': 0.0, 'orders': 0},
        'Debit Card': {'amount': 0.0, 'orders': 0},
        'Wallet': {'amount': 0.0, 'orders': 0},
        'Net Banking': {'amount': 0.0, 'orders': 0}
    }

    ledger_dict = {}

    for u in customers:
        orders = u.orders or []
        for o in orders:
            status = o.get('status', 'Pending')
            
            clean_status = 'Refunded' if status == 'Refund Approved' else status
            if clean_status in orders_by_status:
                orders_by_status[clean_status] += 1
            else:
                orders_by_status[status] = orders_by_status.get(status, 0) + 1

            o_date_str = o.get('date', '')
            o_dt = parse_order_date(o_date_str)
            if not o_dt:
                continue

            price_val = float(o.get('total', 0))

            if status in ['Completed', 'Delivered']:
                ledger_key = o_dt.strftime("%Y-%m")
                ledger_label = o_dt.strftime("%B %Y")
                if ledger_key not in ledger_dict:
                    ledger_dict[ledger_key] = {
                        'month': ledger_label,
                        'orders': 0,
                        'revenue': 0.0,
                    }
                ledger_dict[ledger_key]['orders'] += 1
                ledger_dict[ledger_key]['revenue'] += price_val

            is_in_range = (start_dt <= o_dt <= end_dt)
            
            if is_in_range:
                if status == 'Refund Requested':
                    refund_counts['Requested'] += 1
                elif status == 'Refund Rejected':
                    refund_counts['Rejected'] += 1
                elif status in ['Refunded', 'Refund Approved']:
                    refund_counts['Approved'] += 1
                    refund_total_amount += price_val

            if not is_in_range:
                continue

            if status in target_statuses:
                gross_revenue += price_val
                completed_orders_count += 1
                active_customers_in_period.add(u.id)

                has_prior_orders = False
                for other_o in orders:
                    other_status = other_o.get('status', 'Pending')
                    if other_status in target_statuses:
                        other_dt = parse_order_date(other_o.get('date', ''))
                        if other_dt and other_dt < start_dt:
                            has_prior_orders = True
                            break
                if has_prior_orders:
                    returning_customers_in_period.add(u.id)

                customer_spends[u.id] = customer_spends.get(u.id, 0.0) + price_val

                if filter_type == 'today' or filter_type == 'yesterday':
                    hr = get_order_hour(o_date_str)
                    if 0 <= hr < 24:
                        sales[hr] += price_val
                        orders_count_arr[hr] += 1
                elif filter_type == 'last-7-days' or filter_type == 'custom':
                    offset = (o_dt - start_dt).days
                    if 0 <= offset < len(sales):
                        sales[offset] += price_val
                        orders_count_arr[offset] += 1
                elif filter_type in ['this-week', 'week', 'last-week']:
                    weekday = o_dt.weekday()
                    if 0 <= weekday < 7:
                        sales[weekday] += price_val
                        orders_count_arr[weekday] += 1
                elif filter_type in ['this-month', 'month', 'last-month']:
                    day_idx = o_dt.day - 1
                    if 0 <= day_idx < len(sales):
                        sales[day_idx] += price_val
                        orders_count_arr[day_idx] += 1
                elif filter_type in ['this-year', 'year']:
                    month_idx = o_dt.month - 1
                    if 0 <= month_idx < 12:
                        sales[month_idx] += price_val
                        orders_count_arr[month_idx] += 1

                pm = o.get('paymentMethod', 'Cash on Delivery').lower()
                pm_key = 'Cash on Delivery'
                if 'cod' in pm or 'cash' in pm:
                    pm_key = 'Cash on Delivery'
                elif 'upi' in pm or 'google' in pm or 'phone' in pm:
                    pm_key = 'UPI'
                elif 'credit' in pm:
                    pm_key = 'Credit Card'
                elif 'debit' in pm:
                    pm_key = 'Debit Card'
                elif 'wallet' in pm:
                    pm_key = 'Wallet'
                elif 'banking' in pm or 'net' in pm:
                    pm_key = 'Net Banking'
                elif 'card' in pm or 'visa' in pm or 'master' in pm:
                    pm_key = 'Credit Card'
                else:
                    pm_key = 'UPI'

                payment_metrics[pm_key]['amount'] += price_val
                payment_metrics[pm_key]['orders'] += 1

                items = o.get('items', [])
                order_subtotal = 0.0
                for item in items:
                    pid = item.get('id')
                    qty = int(item.get('quantity', 1))
                    iprice = float(item.get('price', 0.0))
                    item_total = iprice * qty
                    order_subtotal += item_total

                    cat_name = item.get('category', 'others').lower()
                    if 'dry' in cat_name:
                        cat_name = 'dryfruits'
                    elif 'fruit' in cat_name:
                        cat_name = 'fruits'
                    elif 'veggie' in cat_name or 'vegetable' in cat_name:
                        cat_name = 'vegetables'
                    elif 'spice' in cat_name:
                        cat_name = 'spices'
                    else:
                        cat_name = 'others'

                    if cat_name not in category_metrics:
                        category_metrics[cat_name] = {'revenue': 0.0, 'orders': 0, 'qty': 0}
                    category_metrics[cat_name]['revenue'] += item_total
                    category_metrics[cat_name]['orders'] += 1
                    category_metrics[cat_name]['qty'] += qty

                    if pid in product_stats:
                        product_stats[pid]['sold'] += qty
                        product_stats[pid]['revenue'] += item_total

                shipping_fee = 0.0 if order_subtotal >= 499 else 40.0
                actual_discount = max(0.0, order_subtotal + shipping_fee - price_val)
                if actual_discount > 0:
                    discounts_total += actual_discount
                    discount_orders_count += 1

                coupon = o.get('couponCode') or o.get('coupon')
                if coupon:
                    coupon_usage[coupon] = coupon_usage.get(coupon, 0) + 1

    for pid, p in product_stats.items():
        p['profit'] = p['revenue'] * 0.40

    top_selling = sorted([p for p in product_stats.values() if p['sold'] > 0], key=lambda x: x['sold'], reverse=True)[:10]
    low_selling = sorted([p for p in product_stats.values() if p['sold'] > 0], key=lambda x: x['sold'])[:10]
    dead_inventory = [p for p in product_stats.values() if p['sold'] == 0]

    total_payment_rev = sum(v['amount'] for v in payment_metrics.values()) or 1.0
    payment_analytics = []
    for k, v in payment_metrics.items():
        payment_analytics.append({
            'method': k,
            'amount': v['amount'],
            'orders': v['orders'],
            'percentage': round((v['amount'] / total_payment_rev) * 100, 1)
        })

    expenses_db = FinancialExpense.query.filter(FinancialExpense.date >= start_dt).filter(FinancialExpense.date <= end_dt).all()
    total_expenses = sum(e.amount for e in expenses_db)
    
    expense_breakdown = {
        'Delivery': sum(e.amount for e in expenses_db if e.category == 'Delivery Charges'),
        'Packaging': sum(e.amount for e in expenses_db if e.category == 'Packaging Cost'),
        'Marketing': sum(e.amount for e in expenses_db if e.category == 'Marketing Cost'),
        'Warehouse': sum(e.amount for e in expenses_db if e.category == 'Warehouse Expenses'),
        'Salary': sum(e.amount for e in expenses_db if e.category == 'Employee Salary'),
        'Other': sum(e.amount for e in expenses_db if e.category == 'Other Expenses')
    }

    cfg = GSTConfig.query.first()
    gst_percent = cfg.gst_percent if cfg else 18.0
    gst_collected = gross_revenue * (gst_percent / (100.0 + gst_percent))
    taxable_revenue = gross_revenue - gst_collected
    net_revenue_after_tax = taxable_revenue

    product_cost_est = gross_revenue * 0.60
    shipping_cost_est = completed_orders_count * 40.0
    profit = gross_revenue - product_cost_est - shipping_cost_est - discounts_total - refund_total_amount - total_expenses
    profit_margin = round((profit / max(gross_revenue, 1.0)) * 100, 1)

    conv_rate_val = 0.0
    if total_customers_registered > 0:
        conv_rate_val = (completed_orders_count / total_customers_registered) * 100

    highest_coupon = max(coupon_usage, key=coupon_usage.get) if coupon_usage else 'None'
    avg_discount = discounts_total / max(discount_orders_count, 1)

    discount_analytics = {
        'totalDiscount': discounts_total,
        'couponUsageCount': sum(coupon_usage.values()),
        'highestUsedCoupon': highest_coupon,
        'discountCost': discounts_total,
        'averageDiscount': avg_discount,
        'couponList': [{'code': k, 'uses': v} for k, v in coupon_usage.items()]
    }

    refund_total_req = sum(refund_counts.values()) or 1
    refund_analytics = {
        'requests': sum(refund_counts.values()),
        'approved': refund_counts['Approved'],
        'rejected': refund_counts['Rejected'],
        'amount': refund_total_amount,
        'percentage': round((refund_counts['Approved'] / refund_total_req) * 100, 1)
    }

    category_pie = []
    for k, v in category_metrics.items():
        category_pie.append({
            'name': k.capitalize() if k != 'dryfruits' else 'Dry Fruits',
            'revenue': v['revenue'],
            'orders': v['orders'],
            'profit': v['revenue'] * 0.40
        })

    repeat_purchasers = sum(1 for cid in customer_spends if len([o for o in User.query.get(cid).orders if o.get('status') in target_statuses]) > 1)
    repeat_rate = round((repeat_purchasers / max(len(customer_spends), 1)) * 100, 1)
    highest_spending_id = max(customer_spends, key=customer_spends.get) if customer_spends else None
    highest_spending_cust = User.query.get(highest_spending_id).name if highest_spending_id else 'None'
    highest_spending_amount = customer_spends[highest_spending_id] if highest_spending_id else 0.0

    customer_analytics = {
        'newCustomers': new_customers_count,
        'returningCustomers': len(returning_customers_in_period),
        'repeatPurchaseRate': repeat_rate,
        'highestSpendingCustomer': highest_spending_cust,
        'highestSpendingAmount': highest_spending_amount,
        'averageSpend': gross_revenue / max(len(active_customers_in_period), 1),
        'lifetimeValue': sum(customer_spends.values()) / max(total_customers_registered, 1)
    }

    cur_month_start = datetime(now.year, now.month, 1)
    cur_month_end = datetime(now.year + 1, 1, 1) - timedelta(seconds=1) if now.month == 12 else datetime(now.year, now.month + 1, 1) - timedelta(seconds=1)
    prev_month_year = now.year if now.month > 1 else now.year - 1
    prev_month = now.month - 1 if now.month > 1 else 12
    prev_month_start = datetime(prev_month_year, prev_month, 1)
    prev_month_end = cur_month_start - timedelta(seconds=1)

    cur_rev = 0.0
    cur_orders = 0
    prev_rev = 0.0
    prev_orders = 0

    for u in customers:
        for o in u.orders or []:
            if o.get('status') in target_statuses:
                o_dt = parse_order_date(o.get('date', ''))
                if o_dt:
                    val = float(o.get('total', 0))
                    if cur_month_start <= o_dt <= cur_month_end:
                        cur_rev += val
                        cur_orders += 1
                    elif prev_month_start <= o_dt <= prev_month_end:
                        prev_rev += val
                        prev_orders += 1

    cur_prof = cur_rev * 0.18
    prev_prof = prev_rev * 0.18
    cur_aov_m = cur_rev / max(cur_orders, 1)
    prev_aov_m = prev_rev / max(prev_orders, 1)

    cur_cust_m = sum(1 for c in customers if cur_month_start <= c.created_at <= cur_month_end)
    prev_cust_m = sum(1 for c in customers if prev_month_start <= c.created_at <= prev_month_end)

    def calc_growth(cur, prev):
        if prev == 0:
            return 100.0 if cur > 0 else 0.0
        return round(((cur - prev) / prev) * 100, 1)

    monthly_comparison = {
        'revenueGrowth': calc_growth(cur_rev, prev_rev),
        'orderGrowth': calc_growth(cur_orders, prev_orders),
        'customerGrowth': calc_growth(cur_cust_m, prev_cust_m),
        'profitGrowth': calc_growth(cur_prof, prev_prof),
        'aovGrowth': calc_growth(cur_aov_m, prev_aov_m)
    }

    for m_key, val in ledger_dict.items():
        try:
            m_end = datetime.strptime(m_key + "-01", "%Y-%m-%d") + timedelta(days=32)
            m_end = datetime(m_end.year, m_end.month, 1) - timedelta(seconds=1)
        except Exception:
            m_end = datetime.now()
        cust_at_month = sum(1 for c in customers if c.created_at <= m_end)
        val['conversion'] = f"{round((val['orders'] / max(cust_at_month, 1)) * 100, 1)}%"
        val['revenue'] = round(val['revenue'])

    monthly_ledger = sorted(list(ledger_dict.values()), key=lambda x: datetime.strptime(x['month'], "%B %Y"), reverse=True)

    return jsonify({
        'revenue': gross_revenue,
        'ordersCount': completed_orders_count,
        'aov': gross_revenue / max(completed_orders_count, 1),
        'conversionRate': round(conv_rate_val, 2),
        'newRegisteredProfiles': new_customers_count,
        'ordersByStatus': orders_by_status,
        'monthlyLedger': monthly_ledger,
        'taxCalculation': {
            'gstCollected': gst_collected,
            'taxableRevenue': taxable_revenue,
            'netRevenueAfterTax': net_revenue_after_tax,
            'taxPercentage': gst_percent
        },
        'profitCalculation': {
            'grossRevenue': gross_revenue,
            'netRevenue': taxable_revenue,
            'productCost': product_cost_est,
            'shippingCost': shipping_cost_est,
            'discounts': discounts_total,
            'refunds': refund_total_amount,
            'expenses': total_expenses,
            'profit': profit,
            'profitMargin': profit_margin
        },
        'expenseTracking': {
            'totalExpenses': total_expenses,
            'breakdown': expense_breakdown
        },
        'discountAnalytics': discount_analytics,
        'refundAnalytics': refund_analytics,
        'topSelling': top_selling,
        'lowSelling': low_selling,
        'deadInventory': [{ 'name': p['name'], 'category': p['category'], 'stock': p['stock'] } for p in dead_inventory[:10]],
        'categoryRevenue': category_pie,
        'customerAnalytics': customer_analytics,
        'paymentAnalytics': payment_analytics,
        'monthlyComparison': monthly_comparison,
        'trends': {
            'labels': labels,
            'sales': sales,
            'orders': orders_count_arr
        }
    }), 200

# --- EXPENSES ENDPOINTS ---
@admin_bp.route('/expenses', methods=['GET'])
def list_expenses():
    expenses = FinancialExpense.query.order_by(FinancialExpense.date.desc()).all()
    return jsonify({'expenses': [e.to_json() for e in expenses]}), 200

@admin_bp.route('/expenses', methods=['POST'])
def create_expense():
    data = request.get_json() or {}
    category = data.get('category', '').strip()
    amount = float(data.get('amount', 0.0))
    description = data.get('description', '').strip()
    date_str = data.get('date')

    if not category or amount <= 0:
        return jsonify({'error': 'Category and valid amount are required.'}), 400

    exp_date = datetime.utcnow()
    if date_str:
        try:
            exp_date = datetime.fromisoformat(date_str.replace('Z', ''))
        except Exception:
            pass

    expense = FinancialExpense(category=category, amount=amount, date=exp_date, description=description)
    db.session.add(expense)
    db.session.commit()
    return jsonify({'message': 'Expense recorded successfully', 'expense': expense.to_json()}), 201

@admin_bp.route('/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    expense = FinancialExpense.query.get(id)
    if not expense:
        return jsonify({'error': 'Expense not found.'}), 404
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Expense deleted successfully'}), 200

# --- GST CONFIG ENDPOINTS ---
@admin_bp.route('/gst-config', methods=['GET'])
def get_gst():
    cfg = GSTConfig.query.first()
    if not cfg:
        cfg = GSTConfig(gst_percent=18.0)
        db.session.add(cfg)
        db.session.commit()
    return jsonify({'gst_percent': cfg.gst_percent}), 200

@admin_bp.route('/gst-config', methods=['POST'])
def update_gst():
    data = request.get_json() or {}
    percent = float(data.get('gst_percent', 18.0))
    if percent < 0 or percent > 100:
        return jsonify({'error': 'GST percentage must be between 0 and 100.'}), 400

    cfg = GSTConfig.query.first()
    if not cfg:
        cfg = GSTConfig(gst_percent=percent)
        db.session.add(cfg)
    else:
        cfg.gst_percent = percent
    db.session.commit()
    return jsonify({'message': 'GST configuration updated successfully', 'gst_percent': cfg.gst_percent}), 200

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
        trending=data.get('trending', False),
        new_arrival=data.get('newArrival', False),
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
    product.trending = data.get('trending', product.trending)
    product.new_arrival = data.get('newArrival', product.new_arrival)
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
        
    import copy
    orders = copy.deepcopy(user.orders or [])
    updated = False
    
    # Strip any common symbols to match IDs reliably
    clean_order_id = str(order_id).replace('#', '').replace('KSQ', '').strip()
    
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
            elif old_status in ['Cancelled', 'Refunded'] and new_status not in ['Cancelled', 'Refunded']:
                for item in o.get('items', []):
                    pid = item.get('id')
                    qty = int(item.get('quantity', 1))
                    if pid:
                        prod = Product.query.get(pid)
                        if prod:
                            prod.stock = max(0, prod.stock - qty)
            o['status'] = new_status
            updated = True
            break
            
    if not updated:
        return jsonify({'error': 'Order not found.'}), 404
        
    user.orders = orders
    
    # Generate and store user-specific notification
    notif_id = f"ord_{clean_order_id}_{int(datetime.utcnow().timestamp())}"
    notif = {
        'id': notif_id,
        'title': f"Order #{clean_order_id} Updated",
        'desc': f"Your order #{clean_order_id} status has been updated to '{new_status}'.",
        'category': 'Orders',
        'date': datetime.now().strftime("%d %b %Y"),
        'time': datetime.now().strftime("%I:%M %p"),
        'isRead': False,
        'link': '/orders',
        'linkLabel': 'View Order'
    }
    
    user_notifs = list(user.notifications or [])
    user_notifs.insert(0, notif)
    user.notifications = user_notifs
    
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
    image = data.get('image', '').strip() or '/category_fruits.png'
    
    if not name:
        return jsonify({'error': 'Category name is required.'}), 400
        
    slug = data.get('slug', '').strip().lower().replace(' ', '-')
    if not slug:
        slug = name.lower().replace(' ', '-')
        
    existing = Category.query.filter_by(slug=slug).first() or Category.query.filter_by(name=name).first()
    if existing:
        return jsonify({'error': 'Category name or slug already exists.'}), 400
        
    default_features = [
        {"title": "Farm Fresh", "desc": "Picked Daily", "icon": "Leaf"},
        {"title": "No Chemicals", "desc": "100% Natural", "icon": "ShieldCheck"},
        {"title": "Premium Quality", "desc": "Hand Selected", "icon": "Star"},
        {"title": "Delivered Fresh", "desc": "At Your Doorstep", "icon": "Truck"}
    ]
        
    cat = Category(
        name=name,
        slug=slug,
        image=image,
        heroBadge=data.get('heroBadge', '100% QUALITY ASSURED'),
        heroTitle=data.get('heroTitle', f'Fresh {name} Catalog'),
        heroSubtitle=data.get('heroSubtitle', f'Directly sourced premium {name.lower()} collection.'),
        heroImage=data.get('heroImage', image),
        backgroundImage=data.get('backgroundImage', ''),
        backgroundColor=data.get('backgroundColor', '#FFFFFF'),
        gradient=data.get('gradient', ''),
        buttonText=data.get('buttonText', 'Explore More'),
        buttonLink=data.get('buttonLink', f'/category/{slug}'),
        metaTitle=data.get('metaTitle', name),
        metaDescription=data.get('metaDescription', f'Premium {name} from Karshaq.'),
        navbarOrder=int(data.get('navbarOrder', 0)),
        isVisible=bool(data.get('isVisible', True)),
        features=data.get('features', default_features),
        promos=data.get('promos', [])
    )
    
    db.session.add(cat)
    db.session.commit()
    
    # Also seed a default "All" subcategory
    sub = SubCategory(
        categoryId=cat.id,
        name=f"All {name}",
        slug="all",
        icon=image,
        sortOrder=0,
        isVisible=True
    )
    db.session.add(sub)
    db.session.commit()
    
    return jsonify({'message': 'Category created successfully', 'category': cat.to_json()}), 201

@admin_bp.route('/categories/<name>', methods=['PUT'])
def update_category(name):
    cat = Category.query.filter_by(slug=name).first() or Category.query.filter_by(name=name).first() or Category.query.get(name)
    if not cat:
        return jsonify({'error': 'Category not found.'}), 404
        
    data = request.get_json() or {}
    
    # Update general
    if 'name' in data:
        cat.name = data['name'].strip()
    if 'slug' in data:
        slug_val = data['slug'].strip().lower().replace(' ', '-')
        if slug_val != cat.slug:
            existing = Category.query.filter_by(slug=slug_val).first()
            if existing:
                return jsonify({'error': 'Slug already in use.'}), 400
            old_slug = cat.slug
            cat.slug = slug_val
            if old_slug:
                products = Product.query.filter(Product.category.ilike(old_slug)).all()
                for p in products:
                    p.category = slug_val
    if 'image' in data:
        cat.image = data['image'].strip()
        
    # Update Hero
    if 'heroTitle' in data:
        cat.heroTitle = data['heroTitle']
    if 'heroSubtitle' in data:
        cat.heroSubtitle = data['heroSubtitle']
    if 'heroBadge' in data:
        cat.heroBadge = data['heroBadge']
    if 'heroImage' in data:
        cat.heroImage = data['heroImage']
    if 'backgroundImage' in data:
        cat.backgroundImage = data['backgroundImage']
    if 'backgroundColor' in data:
        cat.backgroundColor = data['backgroundColor']
    if 'gradient' in data:
        cat.gradient = data['gradient']
    if 'buttonText' in data:
        cat.buttonText = data['buttonText']
    if 'buttonLink' in data:
        cat.buttonLink = data['buttonLink']
        
    # Update SEO
    if 'metaTitle' in data:
        cat.metaTitle = data['metaTitle']
    if 'metaDescription' in data:
        cat.metaDescription = data['metaDescription']
        
    # Update Config
    if 'navbarOrder' in data:
        cat.navbarOrder = int(data['navbarOrder'])
    if 'isVisible' in data:
        cat.isVisible = bool(data['isVisible'])
    if 'features' in data:
        cat.features = data['features']
    if 'promos' in data:
        cat.promos = data['promos']
        
    # Update Subcategories if passed
    if 'subcategories' in data:
        # Delete existing ones
        for sub in cat.subcategories:
            db.session.delete(sub)
        # Add new ones
        for idx, sub_data in enumerate(data['subcategories']):
            sub = SubCategory(
                categoryId=cat.id,
                name=sub_data['name'],
                slug=sub_data.get('slug') or sub_data['name'].lower().replace(' ', '-'),
                icon=sub_data.get('icon') or cat.image,
                sortOrder=sub_data.get('sortOrder', idx),
                isVisible=sub_data.get('isVisible', True)
            )
            db.session.add(sub)
            
    db.session.commit()
    return jsonify({'message': 'Category updated successfully', 'category': cat.to_json()}), 200

@admin_bp.route('/categories/<name>', methods=['DELETE'])
def delete_category(name):
    cat = Category.query.filter_by(slug=name).first() or Category.query.filter_by(name=name).first() or Category.query.get(name)
    if not cat:
        return jsonify({'error': 'Category not found.'}), 404
        
    data = request.get_json() or {}
    action = data.get('action') # 'move' or 'delete_products'
    move_to = data.get('moveTo') # slug/name of destination category
    
    cat_slug = cat.slug or cat.name.lower().replace(' ', '')
    products_count = Product.query.filter(Product.category.ilike(cat_slug)).count()
    
    if products_count > 0 and not action:
        return jsonify({
            'requiresAction': True,
            'productsCount': products_count,
            'message': f'This category contains {products_count} products. Choose what to do with them.'
        }), 200
        
    if products_count > 0:
        if action == 'move':
            if not move_to:
                return jsonify({'error': 'Destination category is required to move products.'}), 400
            dest_cat = Category.query.filter_by(slug=move_to).first() or Category.query.filter_by(name=move_to).first()
            if not dest_cat:
                return jsonify({'error': 'Destination category not found.'}), 404
                
            dest_slug = dest_cat.slug or dest_cat.name.lower().replace(' ', '')
            products = Product.query.filter(Product.category.ilike(cat_slug)).all()
            for p in products:
                p.category = dest_slug
                p.subcat = 'all' # reset to default all
            db.session.commit()
        elif action == 'delete_products':
            products = Product.query.filter(Product.category.ilike(cat_slug)).all()
            for p in products:
                db.session.delete(p)
            db.session.commit()
            
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

@admin_bp.route('/broadcast', methods=['POST'])
def send_broadcast_notification():
    data = request.get_json() or {}
    desc = data.get('desc', '').strip()
    title = data.get('title', 'System Broadcast').strip()
    category = data.get('category', 'Updates').strip()
    link = data.get('link', '/').strip()
    link_label = data.get('linkLabel', 'Explore').strip()
    
    if not desc:
        return jsonify({'error': 'Notification message description is required.'}), 400
        
    now = datetime.now()
    date_str = now.strftime("%d %b %Y")
    time_str = now.strftime("%I:%M %p")
    
    notif = BroadcastNotification(
        title=title,
        desc=desc,
        category=category,
        date=date_str,
        time=time_str,
        link=link,
        link_label=link_label
    )
    db.session.add(notif)
    db.session.commit()
    
    return jsonify({'message': 'Broadcast sent successfully', 'notification': notif.to_json()}), 201
