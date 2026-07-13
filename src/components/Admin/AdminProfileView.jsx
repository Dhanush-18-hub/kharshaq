import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, Mail, Phone, Lock, Camera, ShieldCheck 
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
  const { user, updateSettings, updateAvatar } = useAuth();
  const [newAvatarSeed, setNewAvatarSeed] = useState('');
  const [generating, setGenerating] = useState(false);

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
    </div>
  );
}
