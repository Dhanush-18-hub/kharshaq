import React, { useState } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, Mail, Phone, Lock, Camera, ShieldCheck,
  Award, TrendingUp, Flame, Clock, Plus, Trash2, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Zod validation schema
const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (e.g. 9876543210).'),
  currentPassword: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine(data => {
  if (data.password && data.password.trim().length > 0) {
    if (!data.currentPassword || data.currentPassword.trim().length === 0) return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password.',
  path: ['currentPassword']
}).refine(data => {
  if (data.password && data.password.trim().length > 0) {
    const pass = data.password;
    const strong = pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass) && /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return strong;
  }
  return true;
}, {
  message: 'Password must be 8+ chars with uppercase, lowercase, digit, and special character.',
  path: ['password']
}).refine(data => {
  if (data.password !== data.confirmPassword) return false;
  return true;
}, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

export default function AdminProfileView() {
  const { user, updateSettings, updateAvatar, products = [], fetchProducts, fetchHomepageData } = useAuth();
  const [newAvatarSeed, setNewAvatarSeed] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeCollection, setActiveCollection] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingProductId, setUpdatingProductId] = useState(null);

  const handleToggleCollection = async (product, collectionKey, shouldBeInCollection) => {
    setUpdatingProductId(product.id);
    const apiField = collectionKey === 'best_seller' ? 'bestSeller' : 
                     collectionKey === 'new_arrival' ? 'newArrival' : 
                     collectionKey;
    try {
      await api.put(`/api/admin/products/${product.id}/collections`, {
        [apiField]: shouldBeInCollection
      });
      toast.success(
        shouldBeInCollection 
          ? `Added "${product.name}" to collection.`
          : `Removed "${product.name}" from collection.`
      );
      if (fetchProducts) await fetchProducts();
      if (fetchHomepageData) await fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product collections.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const currentCollectionProducts = products.filter(p => {
    if (activeCollection === 'featured') return p.featured;
    if (activeCollection === 'best_seller') return p.best_seller;
    if (activeCollection === 'trending') return p.trending;
    if (activeCollection === 'new_arrival') return p.new_arrival;
    return false;
  });

  const availableToAddingProducts = products.filter(p => {
    if (activeCollection === 'featured' && p.featured) return false;
    if (activeCollection === 'best_seller' && p.best_seller) return false;
    if (activeCollection === 'trending' && p.trending) return false;
    if (activeCollection === 'new_arrival' && p.new_arrival) return false;
    
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onUpdateSettings = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone
    };
    if (data.password && data.password.trim()) {
      payload.password = data.password;
      payload.currentPassword = data.currentPassword;
    }
    
    try {
      await updateSettings(payload);
      reset({
        ...payload,
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      // Errors are handled/displayed by the toast in context
    }
  };

  const changeAvatar = async () => {
    if (!newAvatarSeed.trim()) {
      toast.error('Please enter a seed name');
      return;
    }
    setGenerating(true);
    const seedUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newAvatarSeed.trim())}`;
    try {
      await updateAvatar(seedUrl);
      setNewAvatarSeed('');
    } catch (err) {
      toast.error('Failed to update avatar image.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Page Header */}
      <div className="select-none text-left">
        <h2 className="text-xl font-bold text-gray-800">Admin Account Profile</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Manage your administrative credentials, email alerts and profile picture</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm flex flex-col items-center select-none">
            <div className="relative w-32 h-32 mb-4 bg-gray-50 rounded-full overflow-hidden border-2 border-emerald-500 flex items-center justify-center p-1">
              <img 
                src={user?.profile_image || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin"} 
                alt={user?.name || "Admin"} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            
            <h3 className="text-base font-extrabold text-gray-900 leading-tight">{user?.name || 'Admin User'}</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mt-2.5 inline-block">
              Super Admin
            </span>
            <p className="text-[11px] text-gray-400 font-semibold mt-1">{user?.email}</p>

            {/* Avatar Generator */}
            <div className="mt-8 border-t border-gray-100 pt-6 w-full text-left">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Generate Custom Avatar
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newAvatarSeed}
                  onChange={(e) => setNewAvatarSeed(e.target.value)}
                  placeholder="Enter seed, e.g. AdminFresh" 
                  className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 w-full focus:outline-none focus:border-emerald-500 transition"
                />
                <button 
                  onClick={changeAvatar}
                  disabled={generating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {generating ? '...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 text-left shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2 select-none">
              Update Administrator Information <User className="w-4 h-4 text-emerald-600" />
            </h3>

            <form onSubmit={handleSubmit(onUpdateSettings)} className="space-y-6">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Administrator Name"
                  className="w-full bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-sm"
                />
                {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="admin@karshaq.com"
                    className="w-full bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-sm"
                  />
                  {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Phone className="w-3.5 h-3.5" /> Contact Number
                  </label>
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="9876543210"
                    className="w-full bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-sm"
                  />
                  {errors.phone && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-50 pt-6 space-y-6">
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest select-none">
                  Change Password
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Lock className="w-3.5 h-3.5" /> Current Password
                  </label>
                  <input
                    type="password"
                    {...register('currentPassword')}
                    placeholder="Enter current password to authorize changes"
                    className="w-full bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-sm"
                  />
                  {errors.currentPassword && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.currentPassword.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5" /> New Password
                    </label>
                    <input
                      type="password"
                      {...register('password')}
                      placeholder="Enter new strong password"
                      className="w-full bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-sm"
                    />
                    {errors.password && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5" /> Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="Repeat new password"
                      className="w-full bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-sm"
                    />
                    {errors.confirmPassword && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end pt-4 border-t border-gray-50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Homepage Collections Manager */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 text-left shadow-sm mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 select-none">
          <div>
            <h3 className="text-base font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              Homepage Collections Manager <Award className="w-5 h-5 text-emerald-600" />
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold mt-1">
              Control exactly which products are promoted in the featured, best seller, trending, and new arrivals sections of the shop.
            </p>
          </div>
        </div>

        {/* Tab selection buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { id: 'featured', label: 'Featured Products', icon: Award, color: 'text-amber-500 bg-amber-50 border-amber-100' },
            { id: 'best_seller', label: 'Best Sellers', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
            { id: 'trending', label: 'Trending Products', icon: Flame, color: 'text-rose-500 bg-rose-50 border-rose-100' },
            { id: 'new_arrival', label: 'New Arrivals', icon: Clock, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' }
          ].map((col) => {
            const ColIcon = col.icon;
            const isActive = activeCollection === col.id;
            const count = products.filter(p => {
              if (col.id === 'featured') return p.featured;
              if (col.id === 'best_seller') return p.best_seller;
              if (col.id === 'trending') return p.trending;
              if (col.id === 'new_arrival') return p.new_arrival;
              return false;
            }).length;

            return (
              <button
                key={col.id}
                onClick={() => {
                  setActiveCollection(col.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/55 shadow-sm shadow-emerald-500/5'
                    : 'border-gray-100 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  isActive ? col.color : 'text-gray-400 bg-gray-50 border-gray-100'
                }`}>
                  <ColIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-1">Collection</span>
                  <span className="block font-extrabold text-xs text-gray-800 leading-tight">{col.label}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">{count} active</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Collection details and edit area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
          {/* Left panel: Current Products list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between select-none">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">
                Current Products ({currentCollectionProducts.length})
              </h4>
            </div>

            <div className="border border-gray-100 rounded-2xl bg-gray-50/20 p-4 min-h-[350px]">
              {currentCollectionProducts.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Award className="w-6 h-6 text-gray-400" />
                  </div>
                  <h5 className="font-extrabold text-xs text-gray-700">No products here</h5>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1 max-w-[240px]">
                    This collection is currently empty on the storefront. Use the panel on the right to search and add products.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                  {currentCollectionProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260"}
                          alt={p.name}
                          className="w-11 h-11 object-cover rounded-xl bg-gray-50 border border-gray-50"
                        />
                        <div className="text-left">
                          <h5 className="font-bold text-xs text-gray-800 leading-tight">{p.name}</h5>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] text-gray-400 font-semibold">{p.weight}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-emerald-600">₹{p.price}</span>
                        <button
                          onClick={() => handleToggleCollection(p, activeCollection, false)}
                          disabled={updatingProductId === p.id}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                          title="Remove from collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Add Products search and catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between select-none">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">
                Search & Add Products
              </h4>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="border border-gray-100 rounded-2xl bg-gray-50/20 p-4 min-h-[350px]">
              {availableToAddingProducts.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h5 className="font-extrabold text-xs text-gray-700">No matching products</h5>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1 max-w-[240px]">
                    All matching products are already in this collection or no product matches your query.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                  {availableToAddingProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260"}
                          alt={p.name}
                          className="w-11 h-11 object-cover rounded-xl bg-gray-50 border border-gray-50"
                        />
                        <div className="text-left">
                          <h5 className="font-bold text-xs text-gray-800 leading-tight">{p.name}</h5>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] text-gray-400 font-semibold">{p.weight}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[9px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <span className="text-xs font-bold text-gray-800">₹{p.price}</span>
                        <button
                          onClick={() => handleToggleCollection(p, activeCollection, true)}
                          disabled={updatingProductId === p.id}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-[10px] font-black transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
