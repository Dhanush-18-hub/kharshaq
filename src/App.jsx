import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth, api } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import PromoSection from './components/PromoSection';
import BestSellers from './components/BestSellers';
import BottomFeatures from './components/BottomFeatures';
import FeaturedProducts from './components/FeaturedProducts';
import TrendingProducts from './components/TrendingProducts';
import NewArrivals from './components/NewArrivals';
import SeasonalCollections from './components/SeasonalCollections';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
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

function CategoryRouteWrapper(props) {
  const { categoryName } = useParams();
  const cleanCat = categoryName ? categoryName.toLowerCase().replace(/\s+/g, '') : '';
  return <CategoryPage type={cleanCat} {...props} />;
}

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
  const { user, token, syncCartItems, categories, refreshUserProfile, homepageData } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  // Scroll to top of window on page navigation (route changes)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Sync cart items to database automatically when user is logged in
  useEffect(() => {
    syncCartItems(cartItems);
  }, [cartItems]);

  // Sync wishlist items to database automatically when user is logged in
  useEffect(() => {
    const syncWishlist = async () => {
      if (token) {
        const currentUser = userRef.current;
        if (!currentUser) return;
        if (JSON.stringify(wishlist) === JSON.stringify(currentUser.wishlist)) return;
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
  }, [wishlist, token]);

  // Sync addresses to database automatically when user is logged in
  useEffect(() => {
    const syncAddresses = async () => {
      if (token) {
        const currentUser = userRef.current;
        if (!currentUser) return;

        // Skip syncing if state contains guest mock records (both initial and logout states)
        const hasGuestMock = addresses.some(a => ['addr1', 'addr2', 'addr3', 'a1', 'a2', 'a3', 'a4'].includes(a.id));
        if (hasGuestMock) return;

        if (JSON.stringify(addresses) === JSON.stringify(currentUser.addresses)) return;

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
  }, [addresses, token]);

  // Sync payment methods to database automatically when user is logged in
  useEffect(() => {
    const syncPaymentMethods = async () => {
      if (token) {
        const currentUser = userRef.current;
        if (!currentUser) return;

        // Skip syncing if state contains guest mock records
        const hasGuestMock = paymentMethods.some(pm => ['pm1', 'pm2', 'pm3', 'pm4'].includes(pm.id));
        if (hasGuestMock) return;

        if (JSON.stringify(paymentMethods) === JSON.stringify(currentUser.payment_methods)) return;

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
  }, [paymentMethods, token]);

  // Sync reward points to database automatically when user is logged in
  useEffect(() => {
    const syncRewardPoints = async () => {
      if (token) {
        const currentUser = userRef.current;
        if (!currentUser) return;

        if (rewardPoints === currentUser.reward_points) return;
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
  }, [rewardPoints, token]);

  // Sync reward transactions to database automatically when user is logged in
  useEffect(() => {
    const syncRewardTransactions = async () => {
      if (token) {
        const currentUser = userRef.current;
        if (!currentUser) return;
        
        // Skip guest mockup transaction records
        const hasGuestMock = rewardTransactions.some(t => ['rt1', 'rt2', 'rt3', 'rt4'].includes(t.id));
        if (hasGuestMock) return;

        if (JSON.stringify(rewardTransactions) === JSON.stringify(currentUser.reward_transactions)) return;
        try {
          await api.post('/api/cart/sync', { 
            reward_transactions: rewardTransactions 
          });
        } catch (err) {
          console.error('Failed to sync reward transactions to db:', err);
        }
      }
    };
    syncRewardTransactions();
  }, [rewardTransactions, token]);

  // Sync reward vouchers to database automatically when user is logged in
  useEffect(() => {
    const syncRewardVouchers = async () => {
      if (token) {
        const currentUser = userRef.current;
        if (!currentUser) return;
        
        // Skip guest mockup voucher records
        const hasGuestMock = rewardVouchers.some(v => ['rv1', 'rv2', 'rv3'].includes(v.id));
        if (hasGuestMock) return;

        if (JSON.stringify(rewardVouchers) === JSON.stringify(currentUser.reward_vouchers)) return;
        try {
          await api.post('/api/cart/sync', { 
            reward_vouchers: rewardVouchers 
          });
        } catch (err) {
          console.error('Failed to sync reward vouchers to db:', err);
        }
      }
    };
    syncRewardVouchers();
  }, [rewardVouchers, token]);

  // Auto redirect admin user to admin dashboard if they try to access standard pages
  useEffect(() => {
    if (user && user.role === 'admin' && !location.pathname.startsWith('/admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // Listen to user changes (login/logout) to load user-specific rewards
  useEffect(() => {
    if (user) {
      setAddresses(user.addresses || []);
      setPaymentMethods(user.payment_methods || []);
      setRewardPoints(user.reward_points !== undefined ? user.reward_points : 0);
      setRewardTransactions(user.reward_transactions || []);
      setRewardVouchers(user.reward_vouchers || []);
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

      setNotifications([]);
    }
  }, [user]);

  // Load and periodically refresh notifications and user profile updates
  const fetchNotificationsAndProfile = useCallback(async () => {
    const currentUser = userRef.current;
    try {
      const res = await api.get('/api/notifications');
      if (res.data) {
        const readIds = JSON.parse(localStorage.getItem('read_notification_ids') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('deleted_notification_ids') || '[]');

        const backendNotifs = res.data
          .filter(n => !deletedIds.includes(n.id))
          .map(n => ({
            ...n,
            isRead: readIds.includes(n.id)
          }));

        const userNotifs = (currentUser && currentUser.notifications)
          ? currentUser.notifications
              .filter(n => !deletedIds.includes(n.id))
              .map(n => ({
                ...n,
                isRead: readIds.includes(n.id)
              }))
          : [];

        setNotifications(prev => {
          const filteredPrev = prev.filter(n => !deletedIds.includes(n.id));
          const combined = [...backendNotifs, ...userNotifs, ...filteredPrev];
          const unique = [];
          const seen = new Set();
          for (const item of combined) {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              unique.push(item);
            }
          }
          return unique;
        });
      }
    } catch (err) {
      console.error('Failed to load system notifications:', err);
    }

    // Periodically refresh profile/orders if token is valid and user is logged in
    if (token && refreshUserProfile) {
      try {
        await refreshUserProfile();
      } catch (err) {
        console.error('Failed to auto-refresh user profile:', err);
      }
    }
  }, [token, refreshUserProfile]);

  // Fetch once on login, and poll at a maximum of once every 60 seconds
  useEffect(() => {
    if (!token) return;

    fetchNotificationsAndProfile(); // Initial fetch on login

    const interval = setInterval(fetchNotificationsAndProfile, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, [token, fetchNotificationsAndProfile]);

  // Fetch once when the Notifications page is opened
  useEffect(() => {
    if (location.pathname === '/notifications' && token) {
      fetchNotificationsAndProfile();
    }
  }, [location.pathname, token, fetchNotificationsAndProfile]);

  // Synchronize read notifications status to localStorage
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const readIds = notifications.filter(n => n.isRead).map(n => n.id);
      localStorage.setItem('read_notification_ids', JSON.stringify(readIds));
    }
  }, [notifications]);

  // Map route pathnames to active tabs in the Navbar
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/offers') return 'Offers';
    if (path === '/about-us') return 'About Us';
    if (path === '/cart') return 'Cart';
    if (path === '/login') return 'Login';
    if (path === '/signup') return 'SignUp';
    if (path === '/wishlist') return 'Wishlist';
    
    const cleanPath = path.replace('/', '').toLowerCase().trim();
    const categoriesNames = categories && categories.length > 0
      ? categories.map(c => c.name.toLowerCase().replace(/\s+/g, ''))
      : ['fruits', 'vegetables', 'spices', 'dryfruits'];
      
    if (categoriesNames.includes(cleanPath)) {
      return 'Products';
    }
    return 'Home';
  };

  // Navigations triggered from the Navbar
  const handleSetActiveTab = (tab) => {
    const cleanTab = (tab || '').trim().toLowerCase().replace(/\s+/g, '');
    const tabToPathMap = {
      'home': '/',
      'wishlist': '/wishlist',
      'offers': '/offers',
      'aboutus': '/about-us',
      'cart': '/cart',
      'login': '/login',
      'signup': '/signup'
    };
    navigate(tabToPathMap[cleanTab] || `/${cleanTab}`);
  };

  const renderHomepageSections = () => {
    const layoutOrder = homepageData?.layout_order || [];
    
    const props = {
      addToCart,
      getItemQuantity,
      updateQuantity,
      toggleWishlist,
      isInWishlist,
      setActiveTab: handleSetActiveTab
    };

    if (layoutOrder.length === 0) {
      return (
        <>
          <Hero />
          <Categories setActiveTab={handleSetActiveTab} />
          <PromoSection />
          <BestSellers {...props} />
          <BottomFeatures />
        </>
      );
    }

    return layoutOrder.map((section) => {
      if (!section.is_visible) return null;

      switch (section.section_id) {
        case 'hero':
          return <Hero key="hero" />;
        case 'categories':
          return <Categories key="categories" setActiveTab={handleSetActiveTab} />;
        case 'promos':
          return <PromoSection key="promos" />;
        case 'bestsellers':
          return <BestSellers key="bestsellers" {...props} />;
        case 'featured_products':
          return <FeaturedProducts key="featured_products" {...props} />;
        case 'trending_products':
          return <TrendingProducts key="trending_products" {...props} />;
        case 'new_arrivals':
          return <NewArrivals key="new_arrivals" {...props} />;
        case 'seasonal_collections':
          return <SeasonalCollections key="seasonal_collections" {...props} />;
        case 'testimonials':
          return <Testimonials key="testimonials" />;
        case 'newsletter':
          return <Newsletter key="newsletter" />;
        case 'bottom_features':
          return <BottomFeatures key="bottom_features" />;
        default:
          return null;
      }
    });
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
          <Route path="/" element={renderHomepageSections()} />



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
                addresses={addresses}
                setAddresses={setAddresses}
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

           {/* Dynamic Category Page Route */}
          <Route path="/:categoryName" element={
            <CategoryRouteWrapper
              addToCart={addToCart} 
              getItemQuantity={getItemQuantity} 
              updateQuantity={updateQuantity} 
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              toggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
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
  const [cartItems, setCartItems] = useState([]);

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

  const [notifications, setNotifications] = useState([]);

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
