import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

// Configure axios default client
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

export function AuthProvider({
  children,
  cartItems,
  setCartItems,
  wishlist,
  setWishlist,
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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic products, categories, and offers states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await api.get('/api/products');
      if (res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch public products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      if (res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await api.get('/api/offers');
      if (res.data) {
        setOffers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOffers();
  }, []);

  // Setup request interceptor to attach JWT token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('karshaq_token') || sessionStorage.getItem('karshaq_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor to handle session expiration (401)
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Verify it's not a login attempt returning 401
          const url = error.config.url || '';
          if (!url.includes('/auth/login') && !url.includes('/auth/phone/verify-otp')) {
            logout();
            toast.error('Session Expired. Please log in again.');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Load profile / check token on startup (Auto Login)
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('karshaq_token') || sessionStorage.getItem('karshaq_token');
      if (storedToken) {
        try {
          setToken(storedToken);
          // Set authorization header manually for this initial check request
          const res = await api.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.data && res.data.user) {
            setUser(res.data.user);
            // Sync cart, wishlist & addresses immediately
            if (setCartItems) {
              setCartItems(res.data.user.cart || []);
            }
            if (setWishlist && res.data.user.wishlist) {
              setWishlist(res.data.user.wishlist);
            }
            if (setAddresses) {
              setAddresses(res.data.user.addresses || []);
            }
            if (setPaymentMethods) {
              setPaymentMethods(res.data.user.payment_methods || []);
            }
          }
        } catch (err) {
          console.error('Auto login check failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Merge local cart & wishlist with database data upon login/signup
  const mergeGuestCartAndWishlist = async (authToken, currentCart, currentWishlist) => {
    try {
      const res = await api.post('/api/cart/sync', {
        cart: currentCart,
        wishlist: currentWishlist
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data) {
        if (setCartItems && res.data.cart) {
          setCartItems(res.data.cart);
        }
        if (setWishlist && res.data.wishlist) {
          setWishlist(res.data.wishlist);
        }
        if (setAddresses) {
          setAddresses(res.data.addresses || []);
        }
        if (setPaymentMethods) {
          setPaymentMethods(res.data.payment_methods || []);
        }
        return res.data;
      }
    } catch (err) {
      console.error('Failed to merge guest data:', err);
    }
  };

  // Helper to handle login credentials
  const handleAuthSuccess = async (authToken, userData, rememberMe, currentCart, currentWishlist = wishlist) => {
    setToken(authToken);
    setUser(userData);

    if (rememberMe) {
      localStorage.setItem('karshaq_token', authToken);
    } else {
      sessionStorage.setItem('karshaq_token', authToken);
    }

    // Merge guest cart & wishlist ONLY!
    await mergeGuestCartAndWishlist(authToken, currentCart, currentWishlist);
  };

  // Email Sign Up
  const signup = async (formData, currentCart = cartItems) => {
    try {
      const res = await api.post('/api/auth/signup', formData);
      if (res.data && res.data.token) {
        await handleAuthSuccess(res.data.token, res.data.user, true, currentCart);
        toast.success('Signup Successful!');
        return res.data.user;
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Signup failed. Please try again.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Email Login
  const login = async (email, password, rememberMe, currentCart = cartItems) => {
    try {
      const res = await api.post('/api/auth/login', { email, password, rememberMe });
      if (res.data && res.data.token) {
        await handleAuthSuccess(res.data.token, res.data.user, rememberMe, currentCart);
        toast.success('Login Successful!');
        return res.data.user;
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Incorrect email or password.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Google Login / OAuth
  const googleLogin = async (credential, currentCart = cartItems) => {
    try {
      const res = await api.post('/api/auth/google', { credential });
      if (res.data && res.data.token) {
        await handleAuthSuccess(res.data.token, res.data.user, true, currentCart);
        toast.success('Login Successful with Google!');
        return res.data.user;
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Google login failed.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Mobile Send OTP
  const sendOtp = async (phone) => {
    try {
      // For ease of local dev, we append ?dev=true to return the generated OTP in the response
      const res = await api.post(`/api/auth/phone/send-otp?dev=true`, { phone });
      toast.success('OTP Sent!');

      // If dev OTP is available in response (development fallback), let developer know
      if (res.data.dev_otp) {
        toast((t) => (
          <span>
            <b>Dev Mode OTP:</b> <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-bold">{res.data.dev_otp}</code> (also printed to server terminal)
          </span>
        ), { duration: 8000, icon: '🔑' });
      }
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to send OTP.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Mobile Verify OTP
  const verifyOtp = async (phone, otp, currentCart = cartItems) => {
    try {
      const res = await api.post('/api/auth/phone/verify-otp', { phone, otp });
      if (res.data && res.data.token) {
        await handleAuthSuccess(res.data.token, res.data.user, true, currentCart);
        toast.success('OTP Verified. Welcome!');
        return res.data.user;
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid OTP.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Forgot Password request OTP
  const requestForgotPassword = async (email) => {
    try {
      const res = await api.post('/api/auth/forgot-password?dev=true', { email });
      toast.success('OTP Sent!');
      if (res.data.dev_otp) {
        toast((t) => (
          <span>
            <b>Dev Reset OTP:</b> <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-bold">{res.data.dev_otp}</code> (also printed to server terminal)
          </span>
        ), { duration: 8000, icon: '🔑' });
      }
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.error || 'No account found.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Reset Password using OTP
  const resetPassword = async (email, otp, password) => {
    try {
      const res = await api.post('/api/auth/reset-password', { email, otp, password });
      toast.success('Password Changed! Redirecting to login...');
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.error || 'Password reset failed.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Update Settings
  const updateSettings = async (formData) => {
    try {
      const res = await api.put('/api/user/settings', formData);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        toast.success('Account Settings Updated');
        return res.data.user;
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update settings.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Update Avatar
  const updateAvatar = async (avatarUrl) => {
    try {
      const res = await api.post('/api/user/avatar', { avatarUrl });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        toast.success('Profile Picture Updated');
        return res.data.user;
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update avatar.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Delete Account
  const deleteAccount = async () => {
    try {
      await api.delete('/api/user/account');
      logout();
      toast.success('Account Deleted Successfully');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to delete account.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('karshaq_token');
    sessionStorage.removeItem('karshaq_token');
    if (setCartItems) {
      setCartItems([]);
    }
    if (setWishlist) {
      setWishlist([]);
    }
    toast.success('Logged out successfully.');
  };

  // Sync Cart to db when items change locally and user is logged in
  const syncCartItems = async (items) => {
    if (user && token) {
      try {
        await api.post('/api/cart/sync', { cart: items });
      } catch (err) {
        console.error('Failed to sync cart to db:', err);
      }
    }
  };

  // Place an order, sync with db, and clear cart
  const placeOrder = async (order) => {
    if (user && token) {
      const updatedOrders = [order, ...(user.orders || [])];
      try {
        const res = await api.post('/api/cart/sync', { orders: updatedOrders, cart: [] });
        if (res.data) {
          // Update local user state
          setUser(prev => ({
            ...prev,
            orders: res.data.orders || updatedOrders,
            cart: res.data.cart || []
          }));
          // Empty cart state locally
          if (setCartItems) {
            setCartItems([]);
          }
          return res.data;
        }
      } catch (err) {
        console.error('Failed to place order in db:', err);
        throw err;
      }
    } else {
      throw new Error("Authentication required to place an order.");
    }
  };

  const refreshUserProfile = async () => {
    const storedToken = localStorage.getItem('karshaq_token') || sessionStorage.getItem('karshaq_token');
    if (storedToken) {
      try {
        const res = await api.get('/api/user/profile');
        if (res.data && res.data.user) {
          setUser(res.data.user);
          return res.data.user;
        }
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      googleLogin,
      sendOtp,
      verifyOtp,
      requestForgotPassword,
      resetPassword,
      updateSettings,
      updateAvatar,
      deleteAccount,
      logout,
      syncCartItems,
      placeOrder,
      refreshUserProfile,
      rewardPoints,
      setRewardPoints,
      rewardTransactions,
      setRewardTransactions,
      rewardVouchers,
      setRewardVouchers,
      notifications,
      setNotifications,
      products,
      fetchProducts,
      categories,
      fetchCategories,
      offers,
      fetchOffers,
      productsLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
