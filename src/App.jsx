import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, api } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import PromoSection from './components/PromoSection';
import BestSellers from './components/BestSellers';
import BottomFeatures from './components/BottomFeatures';
import AboutUs from './components/AboutUs';
import CategoryPage from './components/CategoryPage';
import Offers from './components/Offers';
import Cart from './components/Cart';
import Footer from './components/Footer';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileSettings from './components/ProfileSettings';
import MockProtectedPage from './components/MockProtectedPage';
import MyWishlist from './components/MyWishlist';
import MyAddresses from './components/MyAddresses';
import PaymentMethods from './components/PaymentMethods';
import MyRewards from './components/MyRewards';
import HelpSupport from './components/HelpSupport';
import Notifications from './components/Notifications';
import Checkout from './components/Checkout';
import MyOrders from './components/MyOrders';
import { Toaster, toast } from 'react-hot-toast';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/Admin/AdminDashboard';

function AppContent({ 
  cartItems, 
  _setCartItems, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  getItemQuantity, 
  cartCount,
  wishlist,
  _setWishlist,
  toggleWishlist,
  isInWishlist,
  addresses,
  setAddresses,
  paymentMethods,
  setPaymentMethods,
  rewardPoints,
  setRewardPoints,
  rewardTransactions,
  setRewardTransactions,
  rewardVouchers,
  setRewardVouchers,
  notifications,
  setNotifications
}) {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, syncCartItems } = useAuth();

  // Sync cart items to database automatically when user is logged in
  useEffect(() => {
    syncCartItems(cartItems);
  }, [cartItems]);

  // Sync wishlist items to database automatically when user is logged in
  useEffect(() => {
    const syncWishlist = async () => {
      if (user && token) {
        try {
          await api.post('/api/cart/sync', { 
            wishlist: wishlist, 
            overwrite_wishlist: true 
          });
        } catch (err) {
          console.error('Failed to sync wishlist to db:', err);
        }
      }
    };
    syncWishlist();
  }, [wishlist, user, token]);

  // Sync addresses to database automatically when user is logged in
  useEffect(() => {
    const syncAddresses = async () => {
      if (user && token) {
        // Skip syncing if state contains guest mock records
        const hasGuestMock = addresses.some(a => ['addr1', 'addr2', 'addr3'].includes(a.id));
        if (hasGuestMock) return;

        try {
          await api.post('/api/cart/sync', { 
            addresses: addresses 
          });
        } catch (err) {
          console.error('Failed to sync addresses to db:', err);
        }
      }
    };
    syncAddresses();
  }, [addresses, user, token]);

  // Sync payment methods to database automatically when user is logged in
  useEffect(() => {
    const syncPaymentMethods = async () => {
      if (user && token) {
        // Skip syncing if state contains guest mock records
        const hasGuestMock = paymentMethods.some(pm => ['pm1', 'pm2', 'pm3', 'pm4'].includes(pm.id));
        if (hasGuestMock) return;

        try {
          await api.post('/api/cart/sync', { 
            payment_methods: paymentMethods 
          });
        } catch (err) {
          console.error('Failed to sync payment methods to db:', err);
        }
      }
    };
    syncPaymentMethods();
  }, [paymentMethods, user, token]);

  // Sync reward points to database automatically when user is logged in
  useEffect(() => {
    const syncRewardPoints = async () => {
      if (user && token) {
        try {
          await api.post('/api/cart/sync', { 
            reward_points: rewardPoints 
          });
        } catch (err) {
          console.error('Failed to sync reward points to db:', err);
        }
      }
    };
    syncRewardPoints();
  }, [rewardPoints, user, token]);

  // Auto redirect admin user to admin dashboard if they try to access standard pages
  useEffect(() => {
    if (user && user.role === 'admin' && !location.pathname.startsWith('/admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // Listen to user changes (login/logout) to load user-specific rewards/notifications
  useEffect(() => {
    if (user) {
      setAddresses(user.addresses || []);
      setPaymentMethods(user.payment_methods || []);
      setRewardPoints(user.reward_points !== undefined ? user.reward_points : 0);
      setRewardTransactions([]);
      setRewardVouchers([]);
      setNotifications([]);
    } else {
      setAddresses([
        {
          id: 'addr1',
          name: 'Dhanush Kumar',
          tag: 'Home',
          addressLine: 'Flat 402, Green Meadows, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          country: 'India',
          phone: '+91 98765 43210',
          deliverNote: 'Deliver to security guard if not available',
          isDefault: true
        },
        {
          id: 'addr2',
          name: 'Dhanush Kumar',
          tag: 'Work',
          addressLine: 'Phase 2, Mindspace IT Park, Hitec City',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          country: 'India',
          phone: '+91 98765 43210',
          deliverNote: 'Call before delivery',
          isDefault: false
        },
        {
          id: 'addr3',
          name: 'Dhanush Kumar',
          tag: 'Other',
          addressLine: 'House 12, Road 4, Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500034',
          country: 'India',
          phone: '+91 98765 43210',
          deliverNote: 'Deliver here for Other deliveries',
          isDefault: false
        }
      ]);

      setPaymentMethods([
        {
          id: 'pm1',
          type: 'Card',
          brand: 'Visa',
          cardNo: 'Visa •••• 4242',
          expiry: '12/27',
          name: 'Dhanush Kumar',
          isDefault: true
        },
        {
          id: 'pm2',
          type: 'Card',
          brand: 'Mastercard',
          cardNo: 'Mastercard •••• 8888',
          expiry: '08/26',
          name: 'Dhanush Kumar',
          isDefault: false
        },
        {
          id: 'pm3',
          type: 'UPI',
          brand: 'Google Pay',
          upiId: 'dhanushkumar@okicici',
          isDefault: false
        },
        {
          id: 'pm4',
          type: 'UPI',
          brand: 'PhonePe',
          upiId: 'dhanushkumar@ybl',
          isDefault: false
        }
      ]);

      setRewardPoints(1250);
      setRewardTransactions([
        {
          id: 'rt1',
          type: 'Earned',
          details: 'Order #KSQ12876',
          points: 250,
          date: '18 May 2025'
        },
        {
          id: 'rt2',
          type: 'Earned',
          details: 'Order #KSQ12654',
          points: 150,
          date: '10 May 2025'
        },
        {
          id: 'rt3',
          type: 'Redeemed',
          details: '₹100 Off Voucher',
          points: -1000,
          date: '05 May 2025'
        },
        {
          id: 'rt4',
          type: 'Earned',
          details: 'Order #KSQ12411',
          points: 200,
          date: '05 May 2025'
        }
      ]);

      setRewardVouchers([
        {
          id: 'rv1',
          code: 'KSQ100OFF',
          title: '₹100 Off Voucher',
          value: 100,
          minPoints: 1000,
          date: 'Valid till 31 Dec 2026'
        },
        {
          id: 'rv2',
          code: 'KSQ250OFF',
          title: '₹250 Off Voucher',
          value: 250,
          minPoints: 2000,
          date: 'Valid till 31 Dec 2026'
        },
        {
          id: 'rv3',
          code: 'KSQFREEDEL',
          title: 'Free Delivery Voucher',
          value: 'Free Delivery',
          minPoints: 500,
          date: 'Valid till 31 Dec 2026'
        }
      ]);

      setNotifications([
        {
          id: 'n1',
          title: 'Your order #KSQ12876 has been delivered',
          desc: 'Your order has been delivered successfully. We hope you enjoy your fresh products!',
          category: 'Orders',
          date: '18 May 2025',
          time: '10:30 AM',
          isRead: false,
          link: '/orders',
          linkLabel: 'View Order'
        },
        {
          id: 'n2',
          title: 'You earned 250 reward points!',
          desc: "Great news! You've earned 250 points for your recent purchase.",
          category: 'Offers',
          date: '17 May 2025',
          time: '07:15 PM',
          isRead: false,
          link: '/rewards',
          linkLabel: 'View Rewards'
        },
        {
          id: 'n3',
          title: 'Weekend Special: Flat 15% OFF!',
          desc: 'Enjoy flat 15% off on all fruits & vegetables this weekend. Offer valid till 19 May 2025.',
          category: 'Offers',
          date: '17 May 2025',
          time: '09:00 AM',
          isRead: false,
          link: '/offers',
          linkLabel: 'Shop Now'
        },
        {
          id: 'n4',
          title: 'Your order #KSQ12654 is out for delivery',
          desc: 'Good news! Your order is on the way and will reach you soon.',
          category: 'Orders',
          date: '16 May 2025',
          time: '11:20 AM',
          isRead: true,
          link: '/orders',
          linkLabel: 'Track Order'
        },
        {
          id: 'n5',
          title: 'Price drop alert!',
          desc: 'The price of "Almonds 250g" has dropped. Grab it before it goes up again!',
          category: 'Updates',
          date: '15 May 2025',
          time: '06:45 PM',
          isRead: true,
          link: '/dryfruits',
          linkLabel: 'Shop Now'
        },
        {
          id: 'n6',
          title: 'You have a reward expiring soon',
          desc: '500 reward points will expire on 18 Oct 2025. Redeem them now!',
          category: 'Reminders',
          date: '15 May 2025',
          time: '03:30 PM',
          isRead: true,
          link: '/rewards',
          linkLabel: 'View Rewards'
        },
        {
          id: 'n7',
          title: 'Your order #KSQ12654 has been packed',
          desc: 'Your order has been packed successfully and is ready to be shipped.',
          category: 'Orders',
          date: '15 May 2025',
          time: '10:00 AM',
          isRead: true,
          link: '/orders',
          linkLabel: 'View Order'
        },
        {
          id: 'n8',
          title: 'Your order #KSQ12654 has been placed',
          desc: 'Thank you for shopping with us! Your order #KSQ12654 has been successfully placed.',
          category: 'Orders',
          date: '14 May 2025',
          time: '04:15 PM',
          isRead: true,
          link: '/orders',
          linkLabel: 'View Order'
        },
        {
          id: 'n9',
          title: 'Refer a friend and get 250 points!',
          desc: 'Invite your friends to shop at Karshaq and earn 250 reward points on their first purchase.',
          category: 'Offers',
          date: '14 May 2025',
          time: '11:00 AM',
          isRead: true,
          link: '/rewards',
          linkLabel: 'Refer Now'
        },
        {
          id: 'n10',
          title: 'New Category Added: Spices!',
          desc: 'Explore our fresh collection of organic spices sourced directly from local farmers.',
          category: 'Updates',
          date: '12 May 2025',
          time: '09:30 AM',
          isRead: true,
          link: '/spices',
          linkLabel: 'Explore Spices'
        },
        {
          id: 'n11',
          title: 'System Maintenance Completed',
          desc: 'Our system upgrade is complete. You can now experience faster checkouts and smooth navigation.',
          category: 'Updates',
          date: '10 May 2025',
          time: '02:00 AM',
          isRead: true,
          link: '/',
          linkLabel: 'Go Home'
        },
        {
          id: 'n12',
          title: 'Welcome to Karshaq!',
          desc: 'We are thrilled to have you here. Enjoy ₹50 off on your first purchase with coupon: WELCOME50.',
          category: 'Offers',
          date: '10 May 2025',
          time: '12:00 PM',
          isRead: true,
          link: '/',
          linkLabel: 'Shop Now'
        }
      ]);
    }
  }, [user]);

  // Map route pathnames to active tabs in the Navbar
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/fruits') return 'Fruits';
    if (path === '/vegetables') return 'Vegetables';
    if (path === '/spices') return 'Spices';
    if (path === '/dryfruits') return 'Dry Fruits';
    if (path === '/offers') return 'Offers';
    if (path === '/about-us') return 'About Us';
    if (path === '/cart') return 'Cart';
    if (path === '/login') return 'Login';
    if (path === '/signup') return 'SignUp';
    return 'Home';
  };

  // Navigations triggered from the Navbar
  const handleSetActiveTab = (tab) => {
    const cleanTab = (tab || '').trim().toLowerCase().replace(/\s+/g, '');
    const tabToPathMap = {
      'home': '/',
      'fruits': '/fruits',
      'vegetables': '/vegetables',
      'spices': '/spices',
      'dryfruits': '/dryfruits',
      'offers': '/offers',
      'aboutus': '/about-us',
      'cart': '/cart',
      'login': '/login',
      'signup': '/signup'
    };
    navigate(tabToPathMap[cleanTab] || '/');
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-brand-bg font-sans selection:bg-light-green selection:text-dark-green antialiased relative">
      {/* Navbar with route-bound tabs */}
      {!isAdminPage && (
        <Navbar 
          activeTab={getActiveTab()} 
          setActiveTab={handleSetActiveTab} 
          cartCount={cartCount} 
          addToCart={addToCart} 
          setSelectedProductId={setSelectedProductId} 
        />
      )}

      <main className={isAdminPage ? "w-full min-h-screen" : "w-full flex flex-col gap-2"}>
        <Routes>
          {/* Main Home Page */}
          <Route path="/" element={
            <>
              <Hero />
              <Categories setActiveTab={handleSetActiveTab} />
              <PromoSection />
              <BestSellers 
                addToCart={addToCart} 
                getItemQuantity={getItemQuantity} 
                updateQuantity={updateQuantity} 
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
              />
              <BottomFeatures />
            </>
          } />

          {/* Category Pages */}
          <Route path="/fruits" element={
            <CategoryPage 
              type="fruits" 
              addToCart={addToCart} 
              getItemQuantity={getItemQuantity} 
              updateQuantity={updateQuantity} 
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              toggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
          } />
          
          <Route path="/vegetables" element={
            <CategoryPage 
              type="vegetables" 
              addToCart={addToCart} 
              getItemQuantity={getItemQuantity} 
              updateQuantity={updateQuantity} 
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              toggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
          } />
          
          <Route path="/spices" element={
            <CategoryPage 
              type="spices" 
              addToCart={addToCart} 
              getItemQuantity={getItemQuantity} 
              updateQuantity={updateQuantity} 
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              toggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
          } />
          
          <Route path="/dryfruits" element={
            <CategoryPage 
              type="dryfruits" 
              addToCart={addToCart} 
              getItemQuantity={getItemQuantity} 
              updateQuantity={updateQuantity} 
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              toggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
          } />

          {/* Core Routes */}
          <Route path="/offers" element={<Offers setActiveTab={handleSetActiveTab} />} />
          <Route path="/about-us" element={<AboutUs />} />
          
          <Route path="/cart" element={
            <Cart 
              cartItems={cartItems} 
              addToCart={addToCart} 
              removeFromCart={removeFromCart} 
              updateQuantity={updateQuantity} 
              getItemQuantity={getItemQuantity}
              setActiveTab={handleSetActiveTab} 
            />
          } />

          <Route path="/login" element={<Auth initialMode="login" />} />
          <Route path="/signup" element={<Auth initialMode="signup" />} />

          {/* Secure Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout 
                cartItems={cartItems} 
                updateQuantity={updateQuantity} 
                removeFromCart={removeFromCart} 
              />
            </ProtectedRoute>
          } />
          
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <MyWishlist 
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
                getItemQuantity={getItemQuantity}
                updateQuantity={updateQuantity}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <MyOrders 
                cartItems={cartItems} 
                addToCart={addToCart} 
                getItemQuantity={getItemQuantity} 
                updateQuantity={updateQuantity} 
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/addresses" element={
            <ProtectedRoute>
              <MyAddresses 
                addresses={addresses}
                setAddresses={setAddresses}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <PaymentMethods 
                paymentMethods={paymentMethods}
                setPaymentMethods={setPaymentMethods}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/rewards" element={
            <ProtectedRoute>
              <MyRewards 
                rewardPoints={rewardPoints}
                setRewardPoints={setRewardPoints}
                rewardTransactions={rewardTransactions}
                setRewardTransactions={setRewardTransactions}
                rewardVouchers={rewardVouchers}
                setRewardVouchers={setRewardVouchers}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/help" element={
            <ProtectedRoute>
              <HelpSupport />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications 
                notifications={notifications}
                setNotifications={setNotifications}
              />
            </ProtectedRoute>
          } />

          {/* Admin routes protected by AdminRoute guard */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Catch-all fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
      
      {/* Toast provider container */}
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

export default function App() {
  // Local Cart State inside App so we can pass setter to AuthProvider
  const [cartItems, setCartItems] = useState([
    {
      id: 'f1',
      name: 'Red Kashmir Apples',
      weight: '1 kg',
      price: 149,
      originalPrice: 199,
      image: '/product_apples.png',
      badge: 'Fresh & Juicy',
      source: 'Farm Fresh',
      quantity: 1
    },
    {
      id: 'f2',
      name: 'Banana (Robusta)',
      weight: '1 dozen',
      price: 59,
      originalPrice: 79,
      image: '/product_bananas.png',
      badge: 'Naturally Sweet',
      source: 'Farm Fresh',
      quantity: 1
    },
    {
      id: 'f5',
      name: 'Pomegranate',
      weight: '1 kg',
      price: 129,
      originalPrice: 179,
      image: '/product_pomegranate.png',
      badge: 'Rich in Antioxidants',
      source: 'Farm Fresh',
      quantity: 1
    }
  ]);

  const [wishlist, setWishlist] = useState([]);

  const [addresses, setAddresses] = useState([
    {
      id: 'a1',
      name: 'Dhanush Kumar',
      tag: 'Home',
      customTag: '',
      street: 'H.No. 12-3-456/7, Flat 302, Green Meadows',
      area: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      country: 'India',
      phone: '+91 98765 43210',
      deliverNote: 'Deliver here for Home deliveries',
      isDefault: true
    },
    {
      id: 'a2',
      name: 'Dhanush Kumar',
      tag: 'Work',
      customTag: '',
      street: '4th Floor, Tech Park Building, Plot No. 22',
      area: 'Hitec City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      country: 'India',
      phone: '+91 98765 43210',
      deliverNote: 'Deliver here for Work deliveries',
      isDefault: false
    },
    {
      id: 'a3',
      name: 'Dhanush Kumar',
      tag: 'Other',
      customTag: "Parents' Home",
      street: 'H.No. 8-2-103/1, Street No. 5',
      area: 'Sainikpuri',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500094',
      country: 'India',
      phone: '+91 98765 43210',
      deliverNote: 'Deliver here for Family deliveries',
      isDefault: false
    },
    {
      id: 'a4',
      name: 'Dhanush Kumar',
      tag: 'Other',
      customTag: 'Other',
      street: 'Flat 101, Lotus Residency, Road No. 12',
      area: 'Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      country: 'India',
      phone: '+91 98765 43210',
      deliverNote: 'Deliver here for Other deliveries',
      isDefault: false
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm1',
      type: 'Card',
      brand: 'Visa',
      cardNo: 'Visa •••• 4242',
      expiry: '12/27',
      name: 'Dhanush Kumar',
      isDefault: true
    },
    {
      id: 'pm2',
      type: 'Card',
      brand: 'Mastercard',
      cardNo: 'Mastercard •••• 8888',
      expiry: '08/26',
      name: 'Dhanush Kumar',
      isDefault: false
    },
    {
      id: 'pm3',
      type: 'UPI',
      brand: 'Google Pay',
      upiId: 'dhanushkumar@okicici',
      isDefault: false
    },
    {
      id: 'pm4',
      type: 'UPI',
      brand: 'PhonePe',
      upiId: 'dhanushkumar@ybl',
      isDefault: false
    }
  ]);

  const [rewardPoints, setRewardPoints] = useState(1250);

  const [rewardTransactions, setRewardTransactions] = useState([
    {
      id: 'rt1',
      type: 'Earned',
      details: 'Order #KSQ12876',
      points: 250,
      date: '18 May 2025'
    },
    {
      id: 'rt2',
      type: 'Earned',
      details: 'Order #KSQ12654',
      points: 150,
      date: '10 May 2025'
    },
    {
      id: 'rt3',
      type: 'Redeemed',
      details: '₹100 Off Voucher',
      points: -1000,
      date: '05 May 2025'
    },
    {
      id: 'rt4',
      type: 'Earned',
      details: 'Order #KSQ12411',
      points: 200,
      date: '05 May 2025'
    }
  ]);

  const [rewardVouchers, setRewardVouchers] = useState([
    {
      id: 'rv1',
      code: 'KSQ100OFF',
      title: '₹100 Off Voucher',
      value: 100,
      minPoints: 1000,
      date: 'Valid till 31 Dec 2026'
    },
    {
      id: 'rv2',
      code: 'KSQ250OFF',
      title: '₹250 Off Voucher',
      value: 250,
      minPoints: 2000,
      date: 'Valid till 31 Dec 2026'
    },
    {
      id: 'rv3',
      code: 'KSQFREEDEL',
      title: 'Free Delivery Voucher',
      value: 'Free Delivery',
      minPoints: 500,
      date: 'Valid till 31 Dec 2026'
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Your order #KSQ12876 has been delivered',
      desc: 'Your order has been delivered successfully. We hope you enjoy your fresh products!',
      category: 'Orders',
      date: '18 May 2025',
      time: '10:30 AM',
      isRead: false,
      link: '/orders',
      linkLabel: 'View Order'
    },
    {
      id: 'n2',
      title: 'You earned 250 reward points!',
      desc: "Great news! You've earned 250 points for your recent purchase.",
      category: 'Offers',
      date: '17 May 2025',
      time: '07:15 PM',
      isRead: false,
      link: '/rewards',
      linkLabel: 'View Rewards'
    },
    {
      id: 'n3',
      title: 'Weekend Special: Flat 15% OFF!',
      desc: 'Enjoy flat 15% off on all fruits & vegetables this weekend. Offer valid till 19 May 2025.',
      category: 'Offers',
      date: '17 May 2025',
      time: '09:00 AM',
      isRead: false,
      link: '/offers',
      linkLabel: 'Shop Now'
    },
    {
      id: 'n4',
      title: 'Your order #KSQ12654 is out for delivery',
      desc: 'Good news! Your order is on the way and will reach you soon.',
      category: 'Orders',
      date: '16 May 2025',
      time: '11:20 AM',
      isRead: true,
      link: '/orders',
      linkLabel: 'Track Order'
    },
    {
      id: 'n5',
      title: 'Price drop alert!',
      desc: 'The price of "Almonds 250g" has dropped. Grab it before it goes up again!',
      category: 'Updates',
      date: '15 May 2025',
      time: '06:45 PM',
      isRead: true,
      link: '/dryfruits',
      linkLabel: 'Shop Now'
    },
    {
      id: 'n6',
      title: 'You have a reward expiring soon',
      desc: '500 reward points will expire on 18 Oct 2025. Redeem them now!',
      category: 'Reminders',
      date: '15 May 2025',
      time: '03:30 PM',
      isRead: true,
      link: '/rewards',
      linkLabel: 'View Rewards'
    },
    {
      id: 'n7',
      title: 'Your order #KSQ12654 has been packed',
      desc: 'Your order has been packed successfully and is ready to be shipped.',
      category: 'Orders',
      date: '15 May 2025',
      time: '10:00 AM',
      isRead: true,
      link: '/orders',
      linkLabel: 'View Order'
    },
    {
      id: 'n8',
      title: 'Your order #KSQ12654 has been placed',
      desc: 'Thank you for shopping with us! Your order #KSQ12654 has been successfully placed.',
      category: 'Orders',
      date: '14 May 2025',
      time: '04:15 PM',
      isRead: true,
      link: '/orders',
      linkLabel: 'View Order'
    },
    {
      id: 'n9',
      title: 'Refer a friend and get 250 points!',
      desc: 'Invite your friends to shop at Karshaq and earn 250 reward points on their first purchase.',
      category: 'Offers',
      date: '14 May 2025',
      time: '11:00 AM',
      isRead: true,
      link: '/rewards',
      linkLabel: 'Refer Now'
    },
    {
      id: 'n10',
      title: 'New Category Added: Spices!',
      desc: 'Explore our fresh collection of organic spices sourced directly from local farmers.',
      category: 'Updates',
      date: '12 May 2025',
      time: '09:30 AM',
      isRead: true,
      link: '/spices',
      linkLabel: 'Explore Spices'
    },
    {
      id: 'n11',
      title: 'System Maintenance Completed',
      desc: 'Our system upgrade is complete. You can now experience faster checkouts and smooth navigation.',
      category: 'Updates',
      date: '10 May 2025',
      time: '02:00 AM',
      isRead: true,
      link: '/',
      linkLabel: 'Go Home'
    },
    {
      id: 'n12',
      title: 'Welcome to Karshaq!',
      desc: 'We are thrilled to have you here. Enjoy ₹50 off on your first purchase with coupon: WELCOME50.',
      category: 'Offers',
      date: '10 May 2025',
      time: '12:00 PM',
      isRead: true,
      link: '/',
      linkLabel: 'Shop Now'
    }
  ]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleWishlist = (product) => {
    const isAlreadyWishlisted = wishlist.includes(product.id);
    if (isAlreadyWishlisted) {
      toast.success(`${product.name} removed from wishlist`);
      setWishlist(prev => prev.filter(id => id !== product.id));
    } else {
      toast.success(`${product.name} added to wishlist!`);
      setWishlist(prev => [...prev, product.id]);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <AuthProvider 
      cartItems={cartItems} 
      setCartItems={setCartItems} 
      wishlist={wishlist} 
      setWishlist={setWishlist}
      addresses={addresses}
      setAddresses={setAddresses}
      paymentMethods={paymentMethods}
      setPaymentMethods={setPaymentMethods}
      rewardPoints={rewardPoints}
      setRewardPoints={setRewardPoints}
      rewardTransactions={rewardTransactions}
      setRewardTransactions={setRewardTransactions}
      rewardVouchers={rewardVouchers}
      setRewardVouchers={setRewardVouchers}
      notifications={notifications}
      setNotifications={setNotifications}
    >
      <AppContent 
        cartItems={cartItems} 
        setCartItems={setCartItems}
        addToCart={addToCart} 
        removeFromCart={removeFromCart} 
        updateQuantity={updateQuantity} 
        getItemQuantity={getItemQuantity} 
        cartCount={cartCount} 
        wishlist={wishlist}
        setWishlist={setWishlist}
        toggleWishlist={toggleWishlist}
        isInWishlist={isInWishlist}
        addresses={addresses}
        setAddresses={setAddresses}
        paymentMethods={paymentMethods}
        setPaymentMethods={setPaymentMethods}
        rewardPoints={rewardPoints}
        setRewardPoints={setRewardPoints}
        rewardTransactions={rewardTransactions}
        setRewardTransactions={setRewardTransactions}
        rewardVouchers={rewardVouchers}
        setRewardVouchers={setRewardVouchers}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </AuthProvider>
  );
}
