import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, Mail, Phone, Lock, Calendar, History, Trash2, Camera, ShieldAlert, BadgeInfo 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Zod schema for profile editing
const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (e.g. 9876543210).'),
  currentPassword: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine(data => {
  if (data.password && data.password.trim().length > 0) {
    // New password requested
    if (!data.currentPassword || data.currentPassword.trim().length === 0) return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password.',
  path: ['currentPassword']
}).refine(data => {
  if (data.password && data.password.trim().length > 0) {
    // Validate strength
    const pass = data.password;
    const strong = len => len >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass) && /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return strong(pass.length);
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

export default function ProfileSettings() {
  const { user, updateSettings, updateAvatar, deleteAccount } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newAvatarSeed, setNewAvatarSeed] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm({
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

  const passwordVal = watch('password') || '';

  // Get password strength progress
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, text: 'Weak 🔴', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Medium 🟡', color: 'bg-amber-500' };
    return { score, text: 'Strong 🟢', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passwordVal);

  // Fetch Login History
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get('/api/user/login-history');
        if (res.data && res.data.history) {
          setHistory(res.data.history);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      }
      setLoadingHistory(false);
    };
    fetchHistory();
  }, [user]);

  const onUpdateSettings = async (data) => {
    // Filter out passwords if empty
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
      // toast is triggered inside AuthContext
    }
  };

  const changeAvatar = async () => {
    if (!newAvatarSeed.trim()) {
      toast.error('Please enter a seed name');
      return;
    }
    const seedUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newAvatarSeed.trim())}`;
    try {
      await updateAvatar(seedUrl);
      setNewAvatarSeed('');
    } catch (err) {}
  };

  const handleDelete = async () => {
    const confirm = window.confirm('Are you absolutely sure you want to delete your account? This action is permanent.');
    if (confirm) {
      setIsDeleting(true);
      try {
        await deleteAccount();
      } catch (err) {}
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 pt-[130px]">
      <h1 className="text-[32px] font-black text-gray-800 tracking-tight text-left mb-8">
        Account Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Panel & Account Health Info */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Avatar settings card */}
          <div className="bg-white border border-border-color rounded-3xl p-6 text-center shadow-card select-none">
            <div className="relative w-32 h-32 mx-auto mb-4 bg-gray-50 rounded-full overflow-hidden border-2 border-primary-green flex items-center justify-center p-1">
              <img src={user?.profile_image} alt={user?.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <h3 className="text-[18px] font-black text-gray-800 leading-tight">{user?.name}</h3>
            <span className="text-[12px] bg-primary-green/10 text-primary-green font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mt-2.5 inline-block">
              {user?.membership_level} Member
            </span>
            <p className="text-[12px] text-gray-400 font-bold mt-1">Points: {user?.reward_points} pts</p>

            <div className="mt-6 border-t border-gray-100 pt-5 text-left">
              <label className="text-[12px] font-extrabold text-gray-500 block mb-1.5">Change Avatar (Enter Custom Seed)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newAvatarSeed}
                  onChange={(e) => setNewAvatarSeed(e.target.value)}
                  placeholder="e.g. AppleFresh" 
                  className="border border-border-color rounded-xl px-3 py-2 text-[13px] font-semibold text-gray-700 w-full focus:outline-none focus:border-primary-green"
                />
                <button 
                  onClick={changeAvatar}
                  className="bg-primary-green hover:bg-dark-green text-white px-4.5 rounded-xl text-[13px] font-bold transition-colors cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Account delete warning */}
          <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-left shadow-card">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[14px] font-black text-red-800 leading-tight">Danger Zone</h4>
                <p className="text-[12px] text-red-600/70 font-semibold mt-1">
                  Once deleted, your account cannot be recovered. All orders, points, and saved items will be deleted permanently.
                </p>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="mt-4 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Account settings form & Login History */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Settings form card */}
          <div className="bg-white border border-border-color rounded-3xl p-8 text-left shadow-card">
            <h3 className="text-[20px] font-black text-gray-800 mb-6 flex items-center gap-2">
              Update Profile Information <User className="w-5 h-5 text-primary-green" />
            </h3>

            <form onSubmit={handleSubmit(onUpdateSettings)} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-gray-500">Full Name</label>
                  <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Your full name"
                      {...register('name')}
                      className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                    />
                  </div>
                  {errors.name && <span className="text-[11px] text-red-500 font-bold">{errors.name.message}</span>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-gray-500">Email Address</label>
                  <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <input 
                      type="email" 
                      placeholder="Your email address"
                      {...register('email')}
                      className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                    />
                  </div>
                  {errors.email && <span className="text-[11px] text-red-500 font-bold">{errors.email.message}</span>}
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-gray-500">Phone Number</label>
                <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <input 
                    type="tel" 
                    placeholder="Your phone number"
                    {...register('phone')}
                    className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                  />
                </div>
                {errors.phone && <span className="text-[11px] text-red-500 font-bold">{errors.phone.message}</span>}
              </div>

              <div className="border-t border-gray-100 pt-5 mt-2">
                <h4 className="text-[15px] font-black text-gray-800 mb-4 flex items-center gap-1.5">
                  Change Password <Lock className="w-4 h-4 text-primary-green" />
                </h4>
                <p className="text-[12px] text-gray-400 font-bold mb-4">Leave fields blank if you do not wish to change your password.</p>

                <div className="flex flex-col gap-4">
                  {/* Current Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-gray-500">Current Password</label>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="password" 
                        placeholder="Required only to set a new password"
                        {...register('currentPassword')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                      />
                    </div>
                    {errors.currentPassword && <span className="text-[11px] text-red-500 font-bold">{errors.currentPassword.message}</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">New Password</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type="password" 
                          placeholder="New password"
                          {...register('password')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                      </div>
                      {passwordVal && (
                        <div className="mt-1 flex flex-col gap-1 select-none">
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div className={`h-full ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-gray-500">Password Strength: {strength.text}</span>
                        </div>
                      )}
                      {errors.password && <span className="text-[11px] text-red-500 font-bold">{errors.password.message}</span>}
                    </div>

                    {/* Confirm New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">Confirm New Password</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type="password" 
                          placeholder="Confirm new password"
                          {...register('confirmPassword')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                      </div>
                      {errors.confirmPassword && <span className="text-[11px] text-red-500 font-bold">{errors.confirmPassword.message}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] py-3 rounded-xl transition-all cursor-pointer shadow-md select-none disabled:opacity-50"
              >
                {isSubmitting ? 'Updating settings...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Login History card */}
          <div className="bg-white border border-border-color rounded-3xl p-8 text-left shadow-card select-none">
            <h3 className="text-[20px] font-black text-gray-800 mb-5 flex items-center gap-2">
              Recent Login History <History className="w-5 h-5 text-primary-green" />
            </h3>

            {loadingHistory ? (
              <p className="text-[13px] text-gray-400 font-semibold py-4 text-center">Loading login history...</p>
            ) : history.length === 0 ? (
              <p className="text-[13px] text-gray-400 font-semibold py-4 text-center">No record found.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2">
                {history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2.5 last:border-b-0">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
                      <div>
                        <h5 className="text-[13px] font-bold text-gray-700 leading-tight">
                          Logged in from {item.device || 'Desktop'}
                        </h5>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                          Browser: {item.browser || 'Chrome'} • IP: {item.ip_address}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-semibold">
                      {new Date(item.login_time).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
