import React, { useState } from 'react';
import { Leaf, Search, ShoppingCart, MapPin, ChevronDown, Menu, X, User, ShoppingBag, Heart, Star, CreditCard, LogOut, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ activeTab, setActiveTab, cartCount, addToCart, setSelectedProductId }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, logout, products, categories } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  // Flat list of all products for global search
  const allProducts = products || [];

  const matchingProducts = searchQuery.trim() === ''
    ? []
    : allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Derive categories dynamically from database categories
  const dynamicCategories = categories && categories.length > 0
    ? categories
        .filter(c => c.name.toLowerCase() !== 'others') // Hide generic 'others' tab from Navbar to prevent clutter
        .map(c => {
          if (c.name.toLowerCase() === 'dryfruits') return 'Dry Fruits';
          return c.name.charAt(0).toUpperCase() + c.name.slice(1);
        })
    : ['Fruits', 'Vegetables', 'Spices', 'Dry Fruits'];

  const navItems = [
    'Home',
    ...dynamicCategories,
    'Offers',
    'About Us'
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white">
      {/* Top Announcement Bar */}
      <div className="w-full bg-dark-green text-white py-2.5 px-4 text-center text-[14px] font-medium tracking-wide flex justify-center items-center select-none">
        <span>🚚 Free delivery on orders above ₹499 &nbsp;|&nbsp; Farm Fresh. &nbsp;|&nbsp; Chemical Free. 🌿</span>
      </div>

      {/* Main Navbar */}
      <div className="w-full border-b border-border-color bg-white/95 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto h-[90px] px-6 lg:px-12 flex items-center justify-between">

          {/* Left Side: Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-light-green p-2 rounded-xl">
              <Leaf className="w-8 h-8 text-primary-green stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[28px] font-extrabold text-dark-green leading-none tracking-tight block">
                Karshaq
              </span>
              <span className="text-[11px] font-medium text-gray-500 tracking-wider uppercase block mt-0.5">
                Farm Fresh. Delivered to You
              </span>
            </div>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`relative py-2 text-[16px] font-semibold transition-colors duration-200 cursor-pointer ${activeTab === item ? 'text-primary-green font-bold' : 'text-gray-600 hover:text-primary-green'
                  }`}
              >
                {item}
                {activeTab === item && (
                  <span className="absolute bottom-[-18px] left-0 right-0 h-[3px] bg-primary-green rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Side: Location, Icons, Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Delivery Location Selector */}
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
              <MapPin className="w-5 h-5 text-primary-green" />
              <div className="text-left">
                <span className="text-[11px] block text-gray-400 font-semibold uppercase leading-none">Deliver to</span>
                <span className="text-[14px] font-bold text-gray-800 flex items-center gap-1">
                  Hyderabad, TS <ChevronDown className="w-4 h-4 text-gray-500" />
                </span>
              </div>
            </div>

            {/* Actions: Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center gap-2 bg-gray-50 border border-border-color rounded-xl px-2.5 py-1.5 transition-all w-[200px] sm:w-[240px] md:w-[280px]">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search fresh items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-gray-400 hover:text-gray-600 text-[11px] font-black cursor-pointer px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                >
                  <Search className="w-5.5 h-5.5" />
                </button>
              )}

              {/* Live search results overlay card */}
              {isSearchOpen && searchQuery.trim() !== '' && (
                <div className="absolute right-0 top-[115%] w-[320px] bg-white border border-border-color rounded-2xl shadow-premium z-50 p-4 max-h-[380px] overflow-y-auto select-none">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5 text-left px-1">
                    Matching Products ({matchingProducts.length})
                  </h4>
                  {matchingProducts.length === 0 ? (
                    <p className="text-[13px] text-gray-400 font-semibold text-center py-6">
                      No products found
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {matchingProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                          onClick={() => {
                            // Navigate to category page
                            const catMap = {
                              fruits: 'Fruits',
                              vegetables: 'Vegetables',
                              spices: 'Spices',
                              dryfruits: 'Dry Fruits'
                            };
                            if (catMap[prod.category]) {
                              setSelectedProductId(prod.id);
                              setActiveTab(catMap[prod.category]);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }
                          }}
                        >
                          {/* Image & Title */}
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-gray-100 shrink-0">
                              <img src={prod.image} alt={prod.name} className="max-h-8 object-cover mix-blend-multiply rounded-full" />
                            </div>
                            <div>
                              <h5 className="text-[13px] font-black text-gray-800 leading-tight group-hover:text-primary-green transition-colors">
                                {prod.name}
                              </h5>
                              <span className="text-[11px] text-gray-400 font-semibold">{prod.weight} • ₹{prod.price}</span>
                            </div>
                          </div>

                          {/* Quick Add Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent navigation trigger
                              addToCart({
                                id: prod.id,
                                name: prod.name,
                                weight: prod.weight,
                                price: prod.price,
                                image: prod.image,
                                badge: prod.badge,
                                source: 'Farm Fresh'
                              });
                            }}
                            className="px-2.5 py-1.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart with Badge */}
            <button
              onClick={() => setActiveTab('Cart')}
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              <span className="absolute top-1.5 right-1.5 bg-primary-green text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cartCount}
              </span>
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-4 py-1.5 border border-border-color bg-white hover:bg-gray-50 text-gray-700 rounded-2xl transition-all cursor-pointer select-none shadow-sm"
                >
                  <div className="w-9 h-9 rounded-full bg-light-green border border-emerald-100 flex items-center justify-center text-primary-green shrink-0 font-sans">
                    {user.profile_image ? (
                      <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[#2E7D32]" />
                    )}
                  </div>
                  <div className="text-left flex flex-col justify-center font-sans">
                    <span className="text-[12px] text-gray-500 font-medium leading-tight">
                      Hi, {user.name.split(' ')[0]} 👋
                    </span>
                    <span className="text-[13.5px] font-bold text-gray-800 flex items-center gap-1 leading-tight">
                      My Account <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-[115%] w-[250px] bg-white border border-border-color rounded-3xl shadow-premium z-[100] overflow-hidden py-3 select-none text-left font-sans">
                    {/* Greeting & Header */}
                    <div className="px-5 py-3">
                      <span className="text-[12px] text-gray-400 font-semibold block leading-tight">
                        {getGreeting()},
                      </span>
                      <span className="text-[15.5px] font-black text-primary-green block mt-0.5 leading-tight">
                        {user.name}
                      </span>
                    </div>

                    <div className="h-[1px] bg-gray-100 mx-5 mb-2" />

                    {/* Menu items */}
                    <div className="flex flex-col gap-0.5 px-3">
                      <button
                        onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <User className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => { navigate('/orders'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <ShoppingBag className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                        <span>My Orders</span>
                      </button>

                      <button
                        onClick={() => { navigate('/wishlist'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <Heart className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                        <span>My Wishlist</span>
                      </button>

                      <button
                        onClick={() => { navigate('/addresses'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <MapPin className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                        <span>My Addresses</span>
                      </button>

                      <button
                        onClick={() => { navigate('/rewards'); setDropdownOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3.5">
                          <Star className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                          <span>My Rewards</span>
                        </div>
                        <span className="bg-primary-green text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                          {user.reward_points !== undefined ? user.reward_points : 120}
                        </span>
                      </button>

                      <button
                        onClick={() => { navigate('/payments'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <CreditCard className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                        <span>Payment Methods</span>
                      </button>

                      <button
                        onClick={() => { navigate('/notifications'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <Bell className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                        <span>Notifications</span>
                      </button>

                      <button
                        onClick={() => { navigate('/help'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-light-green/50 text-[13.5px] font-bold text-gray-700 cursor-pointer transition-colors group"
                      >
                        <HelpCircle className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green transition-colors" />
                        <span>Help & Support</span>
                      </button>
                    </div>

                    <div className="h-[1px] bg-gray-100 mx-5 my-2" />

                    <div className="px-3">
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl hover:bg-red-50 text-[13.5px] font-black text-red-600 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4.5 h-4.5 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 border-2 border-primary-green text-primary-green font-semibold text-[15px] rounded-[14px] hover:bg-primary-green hover:text-white transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer font-sans whitespace-nowrap"
              >
                Login / Sign Up
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-4">
            <button
              onClick={() => setActiveTab('Cart')}
              className="relative p-2 text-gray-700 cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-0 right-0 bg-primary-green text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                {cartCount}
              </span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-700 cursor-pointer"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-0 right-0 bottom-0 w-[280px] bg-white p-6 shadow-2xl flex flex-col gap-6 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-color pb-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-primary-green" />
                <span className="text-[20px] font-bold text-dark-green">Karshaq</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Mobile Location */}
            <div className="flex items-center gap-2 bg-light-green/60 p-3.5 rounded-[14px]">
              <MapPin className="w-5 h-5 text-primary-green" />
              <div>
                <span className="text-[10px] block text-gray-500 uppercase leading-none font-semibold">Deliver to</span>
                <span className="text-[14px] font-bold text-gray-800 flex items-center gap-1">
                  Hyderabad, TS <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-4 mt-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-[16px] py-2 font-semibold ${activeTab === item ? 'text-primary-green border-l-4 border-primary-green pl-3' : 'text-gray-600 hover:text-primary-green pl-1'
                    } transition-all`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="mt-auto border-t border-border-color pt-6 flex flex-col gap-3">
              {user ? (
                <div className="flex flex-col gap-2.5 select-none text-left">
                  <div className="flex items-center gap-2.5 border border-border-color p-3 rounded-xl bg-light-green/30 text-left">
                    <img src={user.profile_image} alt={user.name} className="w-8 h-8 rounded-full object-cover border" />
                    <div>
                      <h4 className="text-[13px] font-black text-gray-800 leading-tight">👋 {getGreeting()}, {user.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{user.membership_level} Member</p>
                    </div>
                  </div>
                  <button onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-semibold text-gray-600 hover:text-primary-green pl-1 cursor-pointer">
                    My Orders
                  </button>
                  <button onClick={() => { navigate('/wishlist'); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-semibold text-gray-600 hover:text-primary-green pl-1 cursor-pointer">
                    Wishlist
                  </button>
                  <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-semibold text-gray-600 hover:text-primary-green pl-1 cursor-pointer">
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full py-3 mt-2 bg-red-50 text-red-600 font-bold text-[15px] rounded-[14px] hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-primary-green text-white font-semibold text-[16px] rounded-[14px] shadow-md hover:bg-dark-green transition-colors cursor-pointer"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
