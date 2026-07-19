import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ClipboardList,
  Users,
  Ticket,
  Star,
  Megaphone,
  BarChart3,
  Award,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Calendar,
  ChevronDown,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';

// Subviews
import DashboardView from './DashboardView';
import ProductManagementView from './ProductManagementView';
import OrderManagementView from './OrderManagementView';
import CustomerManagementView from './CustomerManagementView';
import OffersManagementView from './OffersManagementView';
import ReportsView from './ReportsView';
import HomePageManagementView from './HomePageManagementView';
import AdminProfileView from './AdminProfileView';

export default function AdminDashboard() {
  const { user, logout, products, categories } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const mainRef = React.useRef(null);

  // Search state across views
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchCustomers, setSearchCustomers] = useState([]);
  const [searchOrders, setSearchOrders] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasFetchedSearchData, setHasFetchedSearchData] = useState(false);

  const prefetchSearchData = async () => {
    if (hasFetchedSearchData) return;
    try {
      setSearchLoading(true);
      const [customersRes, ordersRes] = await Promise.all([
        api.get('/api/admin/customers'),
        api.get('/api/admin/orders')
      ]);
      if (customersRes.data?.customers) {
        setSearchCustomers(customersRes.data.customers);
      }
      if (ordersRes.data?.orders) {
        setSearchOrders(ordersRes.data.orders);
      }
      setHasFetchedSearchData(true);
    } catch (err) {
      console.error('Failed to prefetch search data:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setGlobalSearch(val);
    setShowSearchResults(true);
    prefetchSearchData();
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.global-search-container')) {
        setShowSearchResults(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // System Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const handleSendBroadcast = async () => {
    if (!broadcastMsg.trim()) {
      return toast.error('Please enter a notification message.');
    }
    try {
      setSendingBroadcast(true);
      await api.post('/api/admin/broadcast', {
        title: 'System Announcement',
        desc: broadcastMsg.trim(),
        category: 'Updates',
        link: '/',
        linkLabel: 'Explore'
      });
      toast.success('Broadcast notification sent to all users!');
      setBroadcastMsg('');
    } catch (err) {
      console.error('Failed to send broadcast:', err);
      toast.error('Failed to send system broadcast.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Fetch metrics data with filter parameters
  const fetchStats = async (filter = 'this-week', startDate = null, endDate = null) => {
    try {
      setLoadingStats(true);
      let url = `/api/admin/stats?filter=${filter}`;
      if (filter === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoadingStats(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats('this-week');
  }, []);

  // Reset workspace scroll to top when activeTab switches
  useEffect(() => {
    const scrollToTop = () => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
        mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
      window.scrollTo(0, 0);
    };

    scrollToTop();

    // Run on next tick to override asynchronous browser layout recalculations
    const timer = setTimeout(scrollToTop, 50);
    const animFrame = requestAnimationFrame(scrollToTop);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrame);
    };
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sidebar Menu Items definition
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Products', icon: ShoppingBag },
    { name: 'Categories', icon: Layers },
    { name: 'Home Page Management', icon: Settings },
    { name: 'Orders', icon: ClipboardList, badge: stats?.pendingOrders || 0 },
    { name: 'Customers', icon: Users },
    { name: 'Offers & Coupons', icon: Ticket },
    { name: 'Reviews', icon: Star },
    { name: 'Marketing', icon: Megaphone },
    { name: 'Reports & Analytics', icon: BarChart3 },
    { name: 'Rewards', icon: Award },
    { name: 'Notifications', icon: Bell },
    { name: 'Settings', icon: Settings },
    { name: 'Help & Support', icon: HelpCircle }
  ];

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center p-12 bg-gray-50/50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading dashboard view...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'Dashboard':
        return (
          <DashboardView 
            stats={stats} 
            loadingStats={loadingStats} 
            setActiveTab={setActiveTab} 
            refreshStats={fetchStats} 
          />
        );
      case 'Products':
        return <ProductManagementView globalSearch={globalSearch} />;
      case 'Categories':
        return <ProductManagementView initialTab="categories" globalSearch={globalSearch} />;
      case 'Home Page Management':
        return <HomePageManagementView />;
      case 'Orders':
        return <OrderManagementView globalSearch={globalSearch} />;
      case 'Customers':
        return <CustomerManagementView globalSearch={globalSearch} />;
      case 'Offers & Coupons':
      case 'Marketing':
        return <OffersManagementView globalSearch={globalSearch} />;
      case 'Reports & Analytics':
        return <ReportsView stats={stats} />;
      case 'Reviews':
        return (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
            <div className="divide-y divide-gray-100">
              {[
                { author: 'Siddharth M.', rating: 5, comment: 'Extremely fresh apples! Best packaging ever.', date: 'Today', product: 'Kashmir Apples' },
                { author: 'Meera Patel', rating: 4, comment: 'Tomatoes are fresh but delivery took slightly longer than normal.', date: 'Yesterday', product: 'Tomato - Hybrid' },
                { author: 'Vijay K.', rating: 5, comment: 'Spices have incredibly strong aroma. Will buy Elaichi again!', date: '3 days ago', product: 'Cardamom (Elaichi)' }
              ].map((rev, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-semibold text-sm text-gray-800">{rev.author}</span>
                      <span className="text-xs text-gray-400 ml-2">on {rev.product}</span>
                    </div>
                    <span className="text-xs text-gray-400">{rev.date}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 font-sans leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Rewards':
        return (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Membership Rewards System</h2>
            <p className="text-sm text-gray-500 mb-6">Manage reward distributions and multipliers.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Bronze Multiplier</span>
                <span className="text-2xl font-bold text-gray-800">1.0x</span>
                <span className="text-xs text-emerald-600 block mt-2">1 point per ₹100 spent</span>
              </div>
              <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Silver Multiplier</span>
                <span className="text-2xl font-bold text-gray-800">1.2x</span>
                <span className="text-xs text-emerald-600 block mt-2">Required: 1,000 pts</span>
              </div>
              <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Gold Multiplier</span>
                <span className="text-2xl font-bold text-gray-800">1.5x</span>
                <span className="text-xs text-emerald-600 block mt-2">Required: 5,000 pts</span>
              </div>
            </div>
          </div>
        );
      case 'Notifications':
        return (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Send System Broadcast</h2>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans text-sm mb-4"
              placeholder="Type message to send to all customer side notification centers..."
              rows={4}
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              disabled={sendingBroadcast}
            />
            <button
              onClick={handleSendBroadcast}
              disabled={sendingBroadcast}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
            >
              {sendingBroadcast ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        );
      case 'Settings':
        return (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">System Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Store Name</label>
                <input type="text" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-800" defaultValue="Karshaq E-Commerce" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Support Email</label>
                <input type="text" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-800" defaultValue="support@karshaq.com" />
              </div>
              <button
                onClick={() => toast.success('Settings saved!')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        );
      case 'Help & Support':
        return (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Help Center</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              Welcome to the Karshaq Admin console help center. From here you can manage customer profiles, adjust order statuses, add products, upload media, and manage discount tags. If you run into database replication issues, contact the dev team.
            </p>
          </div>
        );
      case 'Profile':
        return <AdminProfileView />;
      default:
        return <DashboardView stats={stats} setActiveTab={setActiveTab} refreshStats={fetchStats} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-[#FAFAF8] text-gray-800'}`}>
      {/* Sidebar Overlay for mobile screen */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-white border-r border-gray-100/80 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100/50">
              <span className="text-lg font-black text-emerald-600">K</span>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-gray-900 leading-none">Karshaq</h1>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest block mt-0.5">Admin Panel</span>
            </div>
          </div>
          <button className="lg:hidden p-1 text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-600/5'
                    : 'text-gray-500 hover:bg-gray-50/50 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Premium Upgrade banner card */}
        <div className="px-4 mb-4 select-none">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white relative overflow-hidden shadow-md shadow-emerald-900/10">
            <div className="absolute right-0 bottom-0 translate-x-2 translate-y-4 opacity-10">
              <ShoppingBag className="w-32 h-32 text-white" />
            </div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded-full">
                Enterprise
              </span>
            </div>
            <h4 className="font-bold text-sm tracking-tight mb-1">Karshaq Premium</h4>
            <p className="text-[11px] text-emerald-200/90 leading-normal mb-3 font-sans">
              Unlock advanced metrics, multi-vendor support & AI order predictions.
            </p>
            <button
              onClick={() => toast.success('Premium is active!')}
              className="w-full flex items-center justify-center gap-1 bg-white text-emerald-900 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-50 transition"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer / Profile setting indicator */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/20">
          <div className="flex items-center justify-between bg-white border border-gray-100 p-2.5 rounded-2xl shadow-sm">
            <div 
              onClick={() => setActiveTab('Profile')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition select-none"
            >
              <img
                src={user?.profile_image || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin"}
                alt="Admin Avatar"
                className="w-8 h-8 rounded-xl bg-gray-100 object-cover"
              />
              <div className="truncate w-[110px]">
                <h5 className="font-bold text-[12px] text-gray-900 leading-tight truncate">{user?.name || 'Admin User'}</h5>
                <span className="text-[10px] text-gray-400 truncate block mt-0.5">{user?.email || 'admin@karshaq.com'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8">
          {/* Top Left Search */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full group global-search-container">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-full bg-gray-50/50 border border-gray-100 pl-10 pr-12 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder-gray-400 text-gray-800"
                value={globalSearch}
                onChange={handleSearchChange}
                onFocus={() => { setShowSearchResults(true); prefetchSearchData(); }}
              />
              <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm select-none">
                ⌘ K
              </kbd>

              {showSearchResults && globalSearch.trim() && (() => {
                const filteredProducts = (products || []).filter(p =>
                  String(p.name).toLowerCase().includes(globalSearch.toLowerCase()) ||
                  String(p.category).toLowerCase().includes(globalSearch.toLowerCase()) ||
                  String(p.sku || '').toLowerCase().includes(globalSearch.toLowerCase())
                ).slice(0, 4);

                const filteredCategories = (categories || []).filter(c =>
                  String(c.name).toLowerCase().includes(globalSearch.toLowerCase()) ||
                  String(c.slug).toLowerCase().includes(globalSearch.toLowerCase())
                ).slice(0, 3);

                const filteredCustomers = (searchCustomers || []).filter(c =>
                  String(c.name).toLowerCase().includes(globalSearch.toLowerCase()) ||
                  String(c.email).toLowerCase().includes(globalSearch.toLowerCase()) ||
                  String(c.phone).toLowerCase().includes(globalSearch.toLowerCase())
                ).slice(0, 3);

                const filteredOrders = (searchOrders || []).filter(o =>
                  String(o.id).toLowerCase().includes(globalSearch.toLowerCase()) ||
                  String(o.customerName).toLowerCase().includes(globalSearch.toLowerCase()) ||
                  String(o.customerPhone || '').toLowerCase().includes(globalSearch.toLowerCase())
                ).slice(0, 3);

                const totalResultsCount = filteredProducts.length + filteredCategories.length + filteredCustomers.length + filteredOrders.length;

                return (
                  <div className="absolute top-full left-0 mt-2 w-[480px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[400px] text-left">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Search Results</span>
                      {searchLoading && <span className="animate-pulse text-emerald-600">Syncing data...</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                      {totalResultsCount === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400 font-semibold">
                          No matches found for "{globalSearch}"
                        </div>
                      ) : (
                        <>
                          {/* Categories Section */}
                          {filteredCategories.length > 0 && (
                            <div className="p-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-2">Categories</span>
                              <div className="space-y-1">
                                {filteredCategories.map(cat => (
                                  <button
                                    key={cat.id || cat.slug}
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('Categories');
                                      setGlobalSearch(cat.name);
                                      setShowSearchResults(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 p-2 hover:bg-emerald-50/50 text-xs font-semibold text-gray-700 hover:text-emerald-700 rounded-xl transition text-left cursor-pointer group"
                                  >
                                    <Layers className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                                    <span>{cat.name}</span>
                                    <span className="text-[10px] text-gray-400 font-sans ml-auto">Slug: {cat.slug}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Products Section */}
                          {filteredProducts.length > 0 && (
                            <div className="p-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-2">Products</span>
                              <div className="space-y-1">
                                {filteredProducts.map(prod => (
                                  <button
                                    key={prod.id}
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('Products');
                                      setGlobalSearch(prod.name);
                                      setShowSearchResults(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 p-2 hover:bg-emerald-50/50 text-xs font-semibold text-gray-700 hover:text-emerald-700 rounded-xl transition text-left cursor-pointer group"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                                    <span className="truncate max-w-[280px]">{prod.name}</span>
                                    <span className="text-[10px] text-gray-400 font-sans ml-auto shrink-0">₹{prod.price} • {prod.category}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Customers Section */}
                          {filteredCustomers.length > 0 && (
                            <div className="p-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-2">Customers</span>
                              <div className="space-y-1">
                                {filteredCustomers.map(cust => (
                                  <button
                                    key={cust.id}
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('Customers');
                                      setGlobalSearch(cust.name);
                                      setShowSearchResults(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 p-2 hover:bg-emerald-50/50 text-xs font-semibold text-gray-700 hover:text-emerald-700 rounded-xl transition text-left cursor-pointer group"
                                  >
                                    <Users className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                                    <span className="truncate max-w-[200px]">{cust.name}</span>
                                    <span className="text-[10px] text-gray-400 font-sans ml-auto shrink-0">{cust.email}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Orders Section */}
                          {filteredOrders.length > 0 && (
                            <div className="p-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-2">Orders</span>
                              <div className="space-y-1">
                                {filteredOrders.map(order => (
                                  <button
                                    key={order.id}
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('Orders');
                                      setGlobalSearch(String(order.id));
                                      setShowSearchResults(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 p-2 hover:bg-emerald-50/50 text-xs font-semibold text-gray-700 hover:text-emerald-700 rounded-xl transition text-left cursor-pointer group"
                                  >
                                    <ClipboardList className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                                    <span>Order #{order.id}</span>
                                    <span className="text-[10px] text-emerald-600 font-bold ml-1">({order.status})</span>
                                    <span className="text-[10px] text-gray-400 font-sans ml-auto shrink-0">{order.customerName} • ₹{order.total || order.totalAmount}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-4">
            {/* Dark Mode toggle */}
            <button
              className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setActiveTab('Notifications')}
                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
              </button>
            </div>

            {/* Date Display Card */}
            <div className="hidden sm:flex items-center gap-2.5 bg-gray-50/70 border border-gray-100 px-3.5 py-2 rounded-xl text-xs font-semibold select-none text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Jul 11 - Jul 18, 2026</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

            {/* Profile Avatar Tag */}
            <div 
              onClick={() => setActiveTab('Profile')}
              className="flex items-center gap-2.5 select-none pl-2 border-l border-gray-100 cursor-pointer hover:opacity-80 transition"
            >
              {user?.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt="Admin Avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-gray-100" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {(user?.name || 'A')[0]}
                </div>
              )}
              <div className="hidden md:block text-left">
                <span className="block text-[11px] font-bold text-gray-800 leading-tight">{user?.name || 'Admin'}</span>
                <span className="block text-[9px] text-gray-400 leading-none">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content workspace wrapper */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
