import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import {
  Layout,
  Type,
  Megaphone,
  Layers,
  Image as ImageIcon,
  Calendar,
  MessageSquare,
  Mail,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  RotateCw,
  Star,
  Settings,
  Sparkles,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUploadField from '../ImageUploadField';

export default function HomePageManagementView() {
  const { products, categories, fetchHomepageData } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('Layout'); // Layout, Hero, Announcements, Features, Promos, Seasonal, Testimonials, Newsletter, Settings, Preview
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // CMS States (replicated from backend structure)
  const [layoutOrder, setLayoutOrder] = useState([]);
  const [settings, setSettings] = useState({});
  const [hero, setHero] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [features, setFeatures] = useState([]);
  const [homepageCategories, setHomepageCategories] = useState([]);
  const [promos, setPromos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [newsletter, setNewsletter] = useState({});
  const [seasonalCollections, setSeasonalCollections] = useState([]);

  // Editor specific states
  const [newAnn, setNewAnn] = useState({ text: '', bg_color: '#1B5E20', text_color: '#FFFFFF', icon: 'Truck', is_active: true });
  const [newFeat, setNewFeat] = useState({ icon: 'Leaf', title: '', subtitle: '', link: '', is_active: true });
  const [newPromo, setNewPromo] = useState({ title: '', description: '', discount: '', image: '', btn_text: 'Shop Now', btn_link: '', bg_color: '#F9FAF0', start_date: '', end_date: '', is_active: true });
  const [newTestimonial, setNewTestimonial] = useState({ customer_name: '', photo: '', rating: 5, review: '', is_active: true });
  const [newSeasonal, setNewSeasonal] = useState({ title: '', slug: '', banner: '', description: '', product_ids: [], start_date: '', end_date: '', is_active: true });

  // Fetch complete CMS dataset
  const fetchCMSData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/homepage');
      if (res.data) {
        setLayoutOrder(res.data.layout_order || []);
        setSettings(res.data.settings || {});
        setHero(res.data.hero || {});
        setAnnouncements(res.data.announcements || []);
        setFeatures(res.data.features || []);
        setHomepageCategories(res.data.categories || []);
        setPromos(res.data.promos || []);
        setTestimonials(res.data.testimonials || []);
        setNewsletter(res.data.newsletter || {});
        
        // Fetch seasonal collections separately to include drafts/inactive
        const seasonalRes = await api.get('/api/admin/homepage/seasonal-collections');
        setSeasonalCollections(seasonalRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load CMS data:', err);
      toast.error('Failed to fetch Home Page CMS values.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  // Save Layout Order & Visibility
  const saveLayoutOrder = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/layout', layoutOrder);
      toast.success('Layout order and visibility saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save layout configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Save Settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/settings', settings);
      toast.success('Homepage settings saved successfully!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save global settings.');
    } finally {
      setSaving(false);
    }
  };

  // Save Hero Banner
  const saveHero = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/hero', hero);
      toast.success('Hero section details saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save hero section.');
    } finally {
      setSaving(false);
    }
  };

  // Save Announcements
  const saveAnnouncements = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/announcements', announcements);
      toast.success('Announcements list saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save announcements.');
    } finally {
      setSaving(false);
    }
  };

  // Save Feature Strip
  const saveFeatures = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/features', features);
      toast.success('Features list saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save features list.');
    } finally {
      setSaving(false);
    }
  };

  // Save Homepage Categories
  const saveHomepageCategories = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/categories', homepageCategories);
      toast.success('Homepage categories order and background colors saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save categories configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Save Promos
  const savePromos = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/promos', promos);
      toast.success('Promotional cards saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save promotional banners.');
    } finally {
      setSaving(false);
    }
  };

  // Save Testimonials
  const saveTestimonials = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/testimonials', testimonials);
      toast.success('Testimonials list saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save testimonials.');
    } finally {
      setSaving(false);
    }
  };

  // Save Newsletter
  const saveNewsletter = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/homepage/newsletter', newsletter);
      toast.success('Newsletter settings saved!');
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save newsletter configurations.');
    } finally {
      setSaving(false);
    }
  };

  // Reorder Item Handler
  const handleReorder = (list, setList, index, direction) => {
    const newList = [...list];
    if (direction === 'up' && index > 0) {
      const temp = newList[index];
      newList[index] = newList[index - 1];
      newList[index - 1] = temp;
    } else if (direction === 'down' && index < newList.length - 1) {
      const temp = newList[index];
      newList[index] = newList[index + 1];
      newList[index + 1] = temp;
    }
    // Update sort order field if present
    newList.forEach((item, idx) => {
      item.sort_order = idx;
    });
    setList(newList);
  };

  // Toggle Visibility Handler
  const handleToggleVisibility = (index) => {
    const newList = [...layoutOrder];
    newList[index].is_visible = !newList[index].is_visible;
    setLayoutOrder(newList);
  };

  // Seasonal CRUD helpers
  const handleCreateSeasonal = async (e) => {
    e.preventDefault();
    if (!newSeasonal.title.trim()) return toast.error('Campaign Title is required.');
    try {
      setSaving(true);
      await api.post('/api/admin/homepage/seasonal-collections', newSeasonal);
      toast.success('Seasonal campaign created!');
      setNewSeasonal({ title: '', slug: '', banner: '', description: '', product_ids: [], start_date: '', end_date: '', is_active: true });
      fetchCMSData();
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to create campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSeasonal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seasonal campaign?')) return;
    try {
      setSaving(true);
      await api.delete(`/api/admin/homepage/seasonal-collections/${id}`);
      toast.success('Seasonal campaign deleted.');
      fetchCMSData();
      if (fetchHomepageData) fetchHomepageData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete campaign.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/50 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-400 mt-3 animate-pulse">Loading CMS layout components...</p>
      </div>
    );
  }

  const subTabs = [
    { name: 'Layout', icon: Layout },
    { name: 'Hero', icon: Type },
    { name: 'Announcements', icon: Megaphone },
    { name: 'Features', icon: Layers },
    { name: 'Categories', icon: Layers },
    { name: 'Promos', icon: ImageIcon },
    { name: 'Seasonal Campaigns', icon: Calendar },
    { name: 'Testimonials', icon: MessageSquare },
    { name: 'Newsletter', icon: Mail },
    { name: 'Settings', icon: Settings },
    { name: 'Live Preview', icon: Smartphone }
  ];

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 text-left select-none max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Home Page Management <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-100" />
          </h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Build, order, schedule and customize your homepage layout dynamically
          </p>
        </div>
        <button
          onClick={fetchCMSData}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" /> Reload Data
        </button>
      </div>

      {/* Sub Tabs Container */}
      <div className="flex flex-wrap gap-2.5 border-b border-gray-100 pb-4">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveSubTab(tab.name)}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* CMS Subview Editor Grid */}
      <div className="w-full bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 lg:p-8 min-h-[400px]">
        
        {/* --- VIEW 1: LAYOUT & ORDERING --- */}
        {activeSubTab === 'Layout' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Homepage Section Ordering</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Drag, reorder, or toggle visibilities of layout blocks</p>
              </div>
              <button
                onClick={saveLayoutOrder}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Layout Order
              </button>
            </div>

            <div className="divide-y divide-gray-100 border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/20">
              {layoutOrder.map((section, idx) => (
                <div key={section.id || idx} className="flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50/40 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-bold w-6">{idx + 1}.</span>
                    <div>
                      <span className="text-[13px] font-extrabold text-gray-800 capitalize tracking-wide">
                        {section.section_id.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-sans block mt-0.5">
                        {section.is_visible ? 'Visible on Main Feed' : 'Hidden / Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(idx)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        section.is_visible
                          ? 'border-emerald-100 text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/60'
                          : 'border-gray-200 text-gray-400 hover:bg-gray-100'
                      }`}
                      title={section.is_visible ? "Hide Section" : "Show Section"}
                    >
                      {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Reorder Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleReorder(layoutOrder, setLayoutOrder, idx, 'up')}
                      className="p-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl transition disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Reorder Down */}
                    <button
                      type="button"
                      disabled={idx === layoutOrder.length - 1}
                      onClick={() => handleReorder(layoutOrder, setLayoutOrder, idx, 'down')}
                      className="p-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl transition disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 2: HERO BANNER --- */}
        {activeSubTab === 'Hero' && (
          <form onSubmit={(e) => { e.preventDefault(); saveHero(); }} className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Hero Section CMS Configurations</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Edit heading text, calls-to-action, floating widgets and custom images</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Hero Section
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Heading Parameters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Badge Text</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="e.g. 100% FARM FRESH"
                    value={hero.badge || ''}
                    onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Main Title Heading</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="e.g. From Our Farms"
                    value={hero.heading || ''}
                    onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Highlight Suffix Text</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="e.g. To Your Family"
                    value={hero.highlight_text || ''}
                    onChange={(e) => setHero({ ...hero, highlight_text: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description Subtext</label>
                  <textarea
                    rows="3"
                    className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
                    placeholder="Brief homepage description"
                    value={hero.description || ''}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                  />
                </div>

                {/* Left Button */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Left Button Text</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="Shop Now"
                      value={hero.left_btn_text || ''}
                      onChange={(e) => setHero({ ...hero, left_btn_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Left Button Link</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="#bestsellers"
                      value={hero.left_btn_link || ''}
                      onChange={(e) => setHero({ ...hero, left_btn_link: e.target.value })}
                    />
                  </div>
                </div>

                {/* Right Button */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Right Button Text</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="Explore"
                      value={hero.right_btn_text || ''}
                      onChange={(e) => setHero({ ...hero, right_btn_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Right Button Link</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="#categories"
                      value={hero.right_btn_link || ''}
                      onChange={(e) => setHero({ ...hero, right_btn_link: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Banner Images and floating discount widgets */}
              <div className="space-y-5 border-l border-gray-50 pl-0 md:pl-6">
                <ImageUploadField
                  label="Hero Showcase Image"
                  value={hero.image}
                  onChange={(b64) => setHero({ ...hero, image: b64 })}
                  onDelete={() => setHero({ ...hero, image: '' })}
                  recommendedWidth={1160}
                  recommendedHeight={800}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Custom Background Image (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="External image URL"
                      value={hero.bg_image || ''}
                      onChange={(e) => setHero({ ...hero, bg_image: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Background Gradient Class</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="from-[#C8]/40 to-transparent"
                      value={hero.bg_gradient || ''}
                      onChange={(e) => setHero({ ...hero, bg_gradient: e.target.value })}
                    />
                  </div>
                </div>

                {/* Floating offer box parameters */}
                <div className="border border-emerald-100 rounded-2xl p-5 bg-[#E8F5E9]/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Floating Promotion Widget</h4>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        checked={hero.enable_floating_offer ?? true}
                        onChange={(e) => setHero({ ...hero, enable_floating_offer: e.target.checked })}
                      />
                      <span className="text-[11px] font-bold text-gray-600">Enable</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Title</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                        placeholder="FLAT"
                        value={hero.offer_title || ''}
                        onChange={(e) => setHero({ ...hero, offer_title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Text</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                        placeholder="20% OFF"
                        value={hero.discount_percentage || ''}
                        onChange={(e) => setHero({ ...hero, discount_percentage: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coupon Code</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                        placeholder="KAR20"
                        value={hero.coupon_code || ''}
                        onChange={(e) => setHero({ ...hero, coupon_code: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Offer Subtitle</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                        placeholder="On First Order"
                        value={hero.offer_description || ''}
                        onChange={(e) => setHero({ ...hero, offer_description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* --- VIEW 3: ANNOUNCEMENTS --- */}
        {activeSubTab === 'Announcements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Top Announcement Lines</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Configure multiple scrollable alerts at the top header bar</p>
              </div>
              <button
                onClick={saveAnnouncements}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Announcements
              </button>
            </div>

            {/* List of existing */}
            <div className="space-y-3.5">
              {announcements.map((ann, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-150 rounded-2xl bg-white select-none">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
                        value={ann.text}
                        onChange={(e) => {
                          const list = [...announcements];
                          list[idx].text = e.target.value;
                          setAnnouncements(list);
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
                        value={ann.icon || ''}
                        onChange={(e) => {
                          const list = [...announcements];
                          list[idx].icon = e.target.value;
                          setAnnouncements(list);
                        }}
                      >
                        <option value="Truck">🚚 Truck</option>
                        <option value="Leaf">🌿 Leaf</option>
                        <option value="Clock">⚡ Clock</option>
                        <option value="ShieldCheck">🛡️ Secure</option>
                        <option value="">No Icon</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex gap-1">
                      <input
                        type="color"
                        className="h-9 w-10 border border-gray-200 rounded cursor-pointer"
                        value={ann.bg_color || '#1B5E20'}
                        onChange={(e) => {
                          const list = [...announcements];
                          list[idx].bg_color = e.target.value;
                          setAnnouncements(list);
                        }}
                        title="Background Color"
                      />
                      <input
                        type="color"
                        className="h-9 w-10 border border-gray-200 rounded cursor-pointer"
                        value={ann.text_color || '#FFFFFF'}
                        onChange={(e) => {
                          const list = [...announcements];
                          list[idx].text_color = e.target.value;
                          setAnnouncements(list);
                        }}
                        title="Text Color"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          checked={ann.is_active}
                          onChange={(e) => {
                            const list = [...announcements];
                            list[idx].is_active = e.target.checked;
                            setAnnouncements(list);
                          }}
                        />
                        <span className="text-[10px] font-bold text-gray-500">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleReorder(announcements, setAnnouncements, idx, 'up')}
                      className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === announcements.length - 1}
                      onClick={() => handleReorder(announcements, setAnnouncements, idx, 'down')}
                      className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this announcement alert?')) {
                          setAnnouncements(announcements.filter((_, i) => i !== idx));
                        }
                      }}
                      className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add new */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAnn.text.trim()) return;
                setAnnouncements([...announcements, { ...newAnn }]);
                setNewAnn({ text: '', bg_color: '#1B5E20', text_color: '#FFFFFF', icon: 'Truck', is_active: true });
              }}
              className="border border-dashed border-gray-250 rounded-2xl p-5 bg-gray-50/20 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
            >
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Add Announcement Banner Text</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none"
                  placeholder="🚚 Free shipping on orders above ₹499"
                  value={newAnn.text}
                  onChange={(e) => setNewAnn({ ...newAnn, text: e.target.value })}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Icon Prefix</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none"
                  value={newAnn.icon}
                  onChange={(e) => setNewAnn({ ...newAnn, icon: e.target.value })}
                >
                  <option value="Truck">🚚 Truck</option>
                  <option value="Leaf">🌿 Leaf</option>
                  <option value="Clock">⚡ Clock</option>
                  <option value="ShieldCheck">🛡️ Secure</option>
                  <option value="">No Icon</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bg Color</label>
                  <input
                    type="color"
                    className="h-10 w-12 border border-gray-200 rounded cursor-pointer bg-white p-1"
                    value={newAnn.bg_color}
                    onChange={(e) => setNewAnn({ ...newAnn, bg_color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Text Color</label>
                  <input
                    type="color"
                    className="h-10 w-12 border border-gray-200 rounded cursor-pointer bg-white p-1"
                    value={newAnn.text_color}
                    onChange={(e) => setNewAnn({ ...newAnn, text_color: e.target.value })}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Alert
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- VIEW 4: FEATURE STRIP --- */}
        {activeSubTab === 'Features' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Top Features Strip Editor</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Manage trust-building bullet points shown in the hero bottom banner</p>
              </div>
              <button
                onClick={saveFeatures}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Features List
              </button>
            </div>

            {/* List of existing */}
            <div className="space-y-3.5">
              {features.map((feat, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-150 rounded-2xl bg-white select-none">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                    <div className="sm:col-span-4">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Title</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                        value={feat.title}
                        onChange={(e) => {
                          const list = [...features];
                          list[idx].title = e.target.value;
                          setFeatures(list);
                        }}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Subtitle</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                        value={feat.subtitle || ''}
                        onChange={(e) => {
                          const list = [...features];
                          list[idx].subtitle = e.target.value;
                          setFeatures(list);
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Icon ID</label>
                      <select
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
                        value={feat.icon || ''}
                        onChange={(e) => {
                          const list = [...features];
                          list[idx].icon = e.target.value;
                          setFeatures(list);
                        }}
                      >
                        <option value="Truck">🚚 Truck</option>
                        <option value="Leaf">🌿 Leaf</option>
                        <option value="ShieldCheck">🛡️ Secure</option>
                        <option value="RotateCcw">↩️ Returns</option>
                        <option value="Clock">⚡ Clock</option>
                        <option value="Star">⭐️ Star</option>
                        <option value="Headset">📞 Support</option>
                        <option value="Flame">🔥 Flame</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1.5 pt-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          checked={feat.is_active}
                          onChange={(e) => {
                            const list = [...features];
                            list[idx].is_active = e.target.checked;
                            setFeatures(list);
                          }}
                        />
                        <span className="text-[10px] font-bold text-gray-500">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto pt-4">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleReorder(features, setFeatures, idx, 'up')}
                      className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === features.length - 1}
                      onClick={() => handleReorder(features, setFeatures, idx, 'down')}
                      className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this feature?')) {
                          setFeatures(features.filter((_, i) => i !== idx));
                        }
                      }}
                      className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add new */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFeat.title.trim()) return;
                setFeatures([...features, { ...newFeat }]);
                setNewFeat({ icon: 'Leaf', title: '', subtitle: '', link: '', is_active: true });
              }}
              className="border border-dashed border-gray-250 rounded-2xl p-5 bg-gray-50/20 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
            >
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Feature Title</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700"
                  placeholder="e.g. Free Delivery"
                  value={newFeat.title}
                  onChange={(e) => setNewFeat({ ...newFeat, title: e.target.value })}
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subtitle Description</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700"
                  placeholder="e.g. On orders above ₹499"
                  value={newFeat.subtitle}
                  onChange={(e) => setNewFeat({ ...newFeat, subtitle: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Icon Style</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none"
                  value={newFeat.icon}
                  onChange={(e) => setNewFeat({ ...newFeat, icon: e.target.value })}
                >
                  <option value="Truck">🚚 Truck</option>
                  <option value="Leaf">🌿 Leaf</option>
                  <option value="ShieldCheck">🛡️ Secure</option>
                  <option value="RotateCcw">↩️ Returns</option>
                  <option value="Clock">⚡ Clock</option>
                  <option value="Star">⭐️ Star</option>
                  <option value="Headset">📞 Support</option>
                  <option value="Flame">🔥 Flame</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- VIEW 5: CATEGORIES BACKGROUNDS & ORDER --- */}
        {activeSubTab === 'Categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Homepage Categories Configurations</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Control sorting sequence and background card accents of category circles</p>
              </div>
              <button
                onClick={saveHomepageCategories}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Categories Grid
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Sorting list */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Reorder Categories List</h4>
                {homepageCategories.map((c, idx) => (
                  <div key={c.id || idx} className="flex items-center justify-between p-3 border border-gray-150 rounded-xl bg-gray-50/20">
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div>
                        <span className="text-[12px] font-extrabold text-gray-800">{c.name}</span>
                        <span className="text-[9px] text-gray-400 block tracking-wide">{c.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        className="h-8 w-10 border border-gray-200 rounded cursor-pointer bg-white p-1"
                        value={c.bg_color || '#FFFFFF'}
                        onChange={(e) => {
                          const list = [...homepageCategories];
                          list[idx].bg_color = e.target.value;
                          setHomepageCategories(list);
                        }}
                        title="Card Accent Color"
                      />
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleReorder(homepageCategories, setHomepageCategories, idx, 'up')}
                        className="p-1 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === homepageCategories.length - 1}
                        onClick={() => handleReorder(homepageCategories, setHomepageCategories, idx, 'down')}
                        className="p-1 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra parameters info */}
              <div className="border border-emerald-100 rounded-2xl p-5 bg-[#E8F5E9]/10 space-y-4">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Category Automation Rules
                </h4>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Karshaq categories are fully integrated! If you publish a new category in the main <strong>Category Editor</strong> tab, it will automatically populate inside:
                </p>
                <ul className="text-xs text-gray-500 font-bold list-disc pl-5 space-y-1.5">
                  <li>Navbar dropdown catalog</li>
                  <li>Sidebar checkout filters</li>
                  <li>Homepage dynamic categories matrix</li>
                </ul>
                <p className="text-[11px] text-gray-400 font-sans italic mt-2 block border-t border-emerald-100/50 pt-2">
                  * Note: You can customize background HSL shades and specific grid display ordering using the controls on the left.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 6: PROMOS BANNER --- */}
        {activeSubTab === 'Promos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Promotional Banners & Cards</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Control visual campaign callouts, discount badges, and buttons</p>
              </div>
              <button
                onClick={savePromos}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Promos
              </button>
            </div>

            {/* List of existing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promos.map((promo, idx) => (
                <div key={idx} className="border border-gray-150 rounded-2xl p-5 space-y-4 bg-gray-50/10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[12px] font-black text-emerald-800 uppercase tracking-wider">Promo Banner #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this promo banner?')) {
                            setPromos(promos.filter((_, i) => i !== idx));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Title</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                          value={promo.title}
                          onChange={(e) => {
                            const list = [...promos];
                            list[idx].title = e.target.value;
                            setPromos(list);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Discount Badge</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                          value={promo.discount || ''}
                          placeholder="e.g. 25% OFF"
                          onChange={(e) => {
                            const list = [...promos];
                            list[idx].discount = e.target.value;
                            setPromos(list);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Description</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                        value={promo.description || ''}
                        onChange={(e) => {
                          const list = [...promos];
                          list[idx].description = e.target.value;
                          setPromos(list);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Button Text</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                          value={promo.btn_text || ''}
                          onChange={(e) => {
                            const list = [...promos];
                            list[idx].btn_text = e.target.value;
                            setPromos(list);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Button Link</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                          value={promo.btn_link || ''}
                          onChange={(e) => {
                            const list = [...promos];
                            list[idx].btn_link = e.target.value;
                            setPromos(list);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-end">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Start Date & End Date (Scheduling)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="date"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-sans text-gray-600 focus:outline-none"
                            value={promo.start_date ? promo.start_date.substring(0, 10) : ''}
                            onChange={(e) => {
                              const list = [...promos];
                              list[idx].start_date = e.target.value ? new Date(e.target.value).toISOString() : '';
                              setPromos(list);
                            }}
                          />
                          <input
                            type="date"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-sans text-gray-600 focus:outline-none"
                            value={promo.end_date ? promo.end_date.substring(0, 10) : ''}
                            onChange={(e) => {
                              const list = [...promos];
                              list[idx].end_date = e.target.value ? new Date(e.target.value).toISOString() : '';
                              setPromos(list);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Card Color</label>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            className="h-8 w-12 border border-gray-200 rounded cursor-pointer bg-white"
                            value={promo.bg_color || '#F9FAF0'}
                            onChange={(e) => {
                              const list = [...promos];
                              list[idx].bg_color = e.target.value;
                              setPromos(list);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <ImageUploadField
                      label="Promo Image Upload"
                      value={promo.image}
                      onChange={(b64) => {
                        const list = [...promos];
                        list[idx].image = b64;
                        setPromos(list);
                      }}
                      onDelete={() => {
                        const list = [...promos];
                        list[idx].image = '';
                        setPromos(list);
                      }}
                      recommendedWidth={360}
                      recommendedHeight={360}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Promo form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPromo.title.trim()) return;
                setPromos([...promos, { ...newPromo }]);
                setNewPromo({ title: '', description: '', discount: '', image: '', btn_text: 'Shop Now', btn_link: '', bg_color: '#F9FAF0', start_date: '', end_date: '', is_active: true });
                toast.success('Promo card added! Scroll up to save.');
              }}
              className="border border-dashed border-gray-250 rounded-3xl p-5 bg-gray-50/20 space-y-4"
            >
              <h4 className="text-xs font-bold text-gray-700 uppercase">Create New Promo Banner</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold"
                    placeholder="e.g. Summer Cooler"
                    value={newPromo.title}
                    onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold"
                    placeholder="Sweet, juicy and cooling"
                    value={newPromo.description}
                    onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Discount Text</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold"
                    placeholder="e.g. 20% OFF"
                    value={newPromo.discount}
                    onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="sm:col-span-2 flex gap-2">
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-sans text-gray-600 focus:outline-none"
                      value={newPromo.start_date}
                      onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-sans text-gray-600 focus:outline-none"
                      value={newPromo.end_date}
                      onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Button Link</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold"
                    placeholder="/category/fruits"
                    value={newPromo.btn_link}
                    onChange={(e) => setNewPromo({ ...newPromo, btn_link: e.target.value })}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Banner Card
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- VIEW 7: SEASONAL CAMPAIGNS --- */}
        {activeSubTab === 'Seasonal Campaigns' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-gray-800 text-base">Seasonal Campaigns Manager</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Publish Summer, Monsoon, Winter or Festive collections dynamically</p>
            </div>

            {/* List of existing collections */}
            <div className="space-y-4">
              {seasonalCollections.map((col) => (
                <div key={col.id} className="border border-gray-150 rounded-2xl p-5 bg-gray-50/10 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                    <div>
                      <span className="text-[14px] font-black text-gray-800">{col.title}</span>
                      <span className="text-[10px] text-gray-400 block tracking-wide">/{col.slug}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSeasonal(col.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        <strong>Description:</strong> {col.description || 'No description provided.'}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">
                        <strong>Product Count:</strong> {col.product_ids?.length || 0} products linked
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">
                        <strong>Validity Dates:</strong> {col.start_date?.substring(0, 10) || 'None'} to {col.end_date?.substring(0, 10) || 'None'}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">
                        <strong>Status:</strong> <span className={col.is_active ? 'text-emerald-600 font-bold' : 'text-gray-400 font-bold'}>{col.is_active ? 'Active' : 'Draft'}</span>
                      </p>
                    </div>

                    {col.banner && (
                      <div className="h-28 rounded-xl overflow-hidden border border-gray-100">
                        <img src={col.banner} alt={col.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create Seasonal campaign form */}
            <form onSubmit={handleCreateSeasonal} className="border border-dashed border-gray-250 rounded-3xl p-6 bg-gray-50/20 space-y-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase">Create New Campaign Collection</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                    placeholder="e.g. Monsoon Mega Fest"
                    value={newSeasonal.title}
                    onChange={(e) => setNewSeasonal({ ...newSeasonal, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Url Slug</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                    placeholder="monsoon-mega-fest"
                    value={newSeasonal.slug}
                    onChange={(e) => setNewSeasonal({ ...newSeasonal, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Campaign Description</label>
                  <textarea
                    rows="2"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold resize-none"
                    placeholder="Hot tea, fritters & fresh fruits collection"
                    value={newSeasonal.description}
                    onChange={(e) => setNewSeasonal({ ...newSeasonal, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Validity Start</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-sans text-gray-600 focus:outline-none"
                      value={newSeasonal.start_date}
                      onChange={(e) => setNewSeasonal({ ...newSeasonal, start_date: e.target.value })}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Validity End</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-sans text-gray-600 focus:outline-none"
                      value={newSeasonal.end_date}
                      onChange={(e) => setNewSeasonal({ ...newSeasonal, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Product linking selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link Products to Campaign</label>
                <div className="border border-gray-200 rounded-xl p-3 max-h-44 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white scrollbar-thin">
                  {products.map((p) => {
                    const isLinked = newSeasonal.product_ids.includes(p.id);
                    return (
                      <label key={p.id} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition text-xs select-none ${
                        isLinked ? 'border-primary-green bg-light-green/20 font-bold' : 'border-gray-100 hover:bg-gray-50'
                      }`}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                          checked={isLinked}
                          onChange={(e) => {
                            let list = [...newSeasonal.product_ids];
                            if (e.target.checked) {
                              list.push(p.id);
                            } else {
                              list = list.filter(id => id !== p.id);
                            }
                            setNewSeasonal({ ...newSeasonal, product_ids: list });
                          }}
                        />
                        <span className="line-clamp-1">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Campaign Promotional Banner"
                  value={newSeasonal.banner}
                  onChange={(b64) => setNewSeasonal({ ...newSeasonal, banner: b64 })}
                  onDelete={() => setNewSeasonal({ ...newSeasonal, banner: '' })}
                  recommendedWidth={1200}
                  recommendedHeight={300}
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" /> Publish Campaign
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- VIEW 8: TESTIMONIALS --- */}
        {activeSubTab === 'Testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Customer Reviews & Testimonials</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Edit customer stars rating, review comments and author photo</p>
              </div>
              <button
                onClick={saveTestimonials}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Testimonials
              </button>
            </div>

            {/* List of existing */}
            <div className="space-y-4">
              {testimonials.map((t, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-150 rounded-2xl bg-white select-none">
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-black text-emerald-800 uppercase tracking-wide">Testimonial Review #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this testimonial review?')) {
                            setTestimonials(testimonials.filter((_, i) => i !== idx));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-end">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Customer Name</label>
                        <input
                          type="text"
                          className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
                          value={t.customer_name}
                          onChange={(e) => {
                            const list = [...testimonials];
                            list[idx].customer_name = e.target.value;
                            setTestimonials(list);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Rating (Stars)</label>
                        <select
                          className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
                          value={t.rating}
                          onChange={(e) => {
                            const list = [...testimonials];
                            list[idx].rating = parseInt(e.target.value);
                            setTestimonials(list);
                          }}
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                          <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                          <option value="3">⭐⭐⭐ 3 Stars</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Review Feedback</label>
                      <textarea
                        rows="2"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 resize-none"
                        value={t.review}
                        onChange={(e) => {
                          const list = [...testimonials];
                          list[idx].review = e.target.value;
                          setTestimonials(list);
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-44 shrink-0 flex flex-col justify-end">
                    <ImageUploadField
                      label="Customer Photo"
                      value={t.photo}
                      onChange={(b64) => {
                        const list = [...testimonials];
                        list[idx].photo = b64;
                        setTestimonials(list);
                      }}
                      onDelete={() => {
                        const list = [...testimonials];
                        list[idx].photo = '';
                        setTestimonials(list);
                      }}
                      recommendedWidth={200}
                      recommendedHeight={200}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add new */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTestimonial.customer_name.trim() || !newTestimonial.review.trim()) return;
                setTestimonials([...testimonials, { ...newTestimonial }]);
                setNewTestimonial({ customer_name: '', photo: '', rating: 5, review: '', is_active: true });
                toast.success('Testimonial review card added! Click save changes above.');
              }}
              className="border border-dashed border-gray-250 rounded-3xl p-5 bg-gray-50/20 space-y-4"
            >
              <h4 className="text-xs font-bold text-gray-700 uppercase">Create Customer Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Customer Name *</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                    placeholder="e.g. Siddharth M."
                    value={newTestimonial.customer_name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Rating Rating</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                    value={newTestimonial.rating}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer animate-fadeIn"
                  >
                    <Plus className="w-4.5 h-4.5" /> Add Review Card
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Review Comments *</label>
                <textarea
                  rows="2"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold resize-none focus:outline-none"
                  placeholder="Very fresh apples! Best packing ever."
                  value={newTestimonial.review}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                  required
                />
              </div>

              <div>
                <ImageUploadField
                  label="Customer Avatar Photo"
                  value={newTestimonial.photo}
                  onChange={(b64) => setNewTestimonial({ ...newTestimonial, photo: b64 })}
                  onDelete={() => setNewTestimonial({ ...newTestimonial, photo: '' })}
                  recommendedWidth={200}
                  recommendedHeight={200}
                />
              </div>
            </form>
          </div>
        )}

        {/* --- VIEW 9: NEWSLETTER SECTION --- */}
        {activeSubTab === 'Newsletter' && (
          <form onSubmit={(e) => { e.preventDefault(); saveNewsletter(); }} className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Footer Newsletter Configurations</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Edit subscription headings, callout vouchers, and background colors</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Newsletter Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Main Title Heading</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                    placeholder="Subscribe to Our Newsletter"
                    value={newsletter.heading || ''}
                    onChange={(e) => setNewsletter({ ...newsletter, heading: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Voucher / Promotional Incentive Title</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                    placeholder="Get 10% off your next order!"
                    value={newsletter.offer || ''}
                    onChange={(e) => setNewsletter({ ...newsletter, offer: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description Subtext</label>
                  <textarea
                    rows="3"
                    className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none resize-none"
                    value={newsletter.description || ''}
                    onChange={(e) => setNewsletter({ ...newsletter, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Button Text</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="Subscribe"
                      value={newsletter.btn_text || ''}
                      onChange={(e) => setNewsletter({ ...newsletter, btn_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Background Card Color</label>
                    <div className="flex gap-1.5">
                      <input
                        type="color"
                        className="h-10 w-12 border border-gray-200 rounded cursor-pointer bg-white p-1"
                        value={newsletter.bg_color || '#E8F5E9'}
                        onChange={(e) => setNewsletter({ ...newsletter, bg_color: e.target.value })}
                      />
                      <input
                        type="text"
                        className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none"
                        value={newsletter.bg_color || '#E8F5E9'}
                        onChange={(e) => setNewsletter({ ...newsletter, bg_color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Newsletter Background Image (Optional)"
                  value={newsletter.bg_image}
                  onChange={(b64) => setNewsletter({ ...newsletter, bg_image: b64 })}
                  onDelete={() => setNewsletter({ ...newsletter, bg_image: '' })}
                  recommendedWidth={1000}
                  recommendedHeight={350}
                />
              </div>
            </div>
          </form>
        )}

        {/* --- VIEW 10: DYNAMIC SETTINGS --- */}
        {activeSubTab === 'Settings' && (
          <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }} className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">Global Catalog CMS Settings</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Control slider behavior, limits and scroll ticker speed settings</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save CMS Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {/* Best Sellers Section settings */}
              <div className="border border-gray-150 rounded-2xl p-5 space-y-4 bg-gray-50/10 shadow-sm">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <Settings className="w-4.5 h-4.5 text-primary-green" /> Best Sellers Configs
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Max products shown</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.best_sellers_max || 8}
                      onChange={(e) => setSettings({ ...settings, best_sellers_max: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sorting order</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.best_sellers_sort || 'default'}
                      onChange={(e) => setSettings({ ...settings, best_sellers_sort: e.target.value })}
                    >
                      <option value="default">Default ID</option>
                      <option value="price-low-high">Price: Low-High</option>
                      <option value="price-high-low">Price: High-Low</option>
                      <option value="rating">Rating</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.best_sellers_slider ?? true}
                      onChange={(e) => setSettings({ ...settings, best_sellers_slider: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Slider View</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.best_sellers_autoplay ?? false}
                      onChange={(e) => setSettings({ ...settings, best_sellers_autoplay: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Autoplay</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Featured Products Section settings */}
              <div className="border border-gray-150 rounded-2xl p-5 space-y-4 bg-gray-50/10 shadow-sm">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <Settings className="w-4.5 h-4.5 text-primary-green" /> Featured Configs
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Max products shown</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.featured_products_max || 8}
                      onChange={(e) => setSettings({ ...settings, featured_products_max: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sorting order</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.featured_products_sort || 'default'}
                      onChange={(e) => setSettings({ ...settings, featured_products_sort: e.target.value })}
                    >
                      <option value="default">Default ID</option>
                      <option value="price-low-high">Price: Low-High</option>
                      <option value="price-high-low">Price: High-Low</option>
                      <option value="rating">Rating</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.featured_products_slider ?? true}
                      onChange={(e) => setSettings({ ...settings, featured_products_slider: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Slider View</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.featured_products_autoplay ?? false}
                      onChange={(e) => setSettings({ ...settings, featured_products_autoplay: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Autoplay</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Trending Products Section settings */}
              <div className="border border-gray-150 rounded-2xl p-5 space-y-4 bg-gray-50/10 shadow-sm">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <Settings className="w-4.5 h-4.5 text-primary-green" /> Trending Configs
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Max products shown</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.trending_products_max || 8}
                      onChange={(e) => setSettings({ ...settings, trending_products_max: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sorting order</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.trending_products_sort || 'default'}
                      onChange={(e) => setSettings({ ...settings, trending_products_sort: e.target.value })}
                    >
                      <option value="default">Default ID</option>
                      <option value="price-low-high">Price: Low-High</option>
                      <option value="price-high-low">Price: High-Low</option>
                      <option value="rating">Rating</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.trending_products_slider ?? true}
                      onChange={(e) => setSettings({ ...settings, trending_products_slider: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Slider View</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.trending_products_autoplay ?? false}
                      onChange={(e) => setSettings({ ...settings, trending_products_autoplay: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Autoplay</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* New Arrivals Section settings */}
              <div className="border border-gray-150 rounded-2xl p-5 space-y-4 bg-gray-50/10 shadow-sm">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <Settings className="w-4.5 h-4.5 text-primary-green" /> New Arrivals Configs
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Max products shown</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.new_arrivals_max || 8}
                      onChange={(e) => setSettings({ ...settings, new_arrivals_max: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sorting order</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
                      value={settings.new_arrivals_sort || 'default'}
                      onChange={(e) => setSettings({ ...settings, new_arrivals_sort: e.target.value })}
                    >
                      <option value="default">Default ID</option>
                      <option value="price-low-high">Price: Low-High</option>
                      <option value="price-high-low">Price: High-Low</option>
                      <option value="rating">Rating</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.new_arrivals_slider ?? true}
                      onChange={(e) => setSettings({ ...settings, new_arrivals_slider: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Slider View</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={settings.new_arrivals_autoplay ?? false}
                      onChange={(e) => setSettings({ ...settings, new_arrivals_autoplay: e.target.checked })}
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-800">Autoplay</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Announcement ticker settings */}
              <div className="border border-gray-150 rounded-2xl p-5 space-y-4 bg-gray-50/10 shadow-sm">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <Megaphone className="w-4.5 h-4.5 text-primary-green" /> Announcement Bar configs
                </h4>

                <label className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-lg bg-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    checked={settings.announcements_scrolling ?? true}
                    onChange={(e) => setSettings({ ...settings, announcements_scrolling: e.target.checked })}
                  />
                  <div>
                    <span className="block text-[11px] font-bold text-gray-800">Enable Seamless Scrolling</span>
                  </div>
                </label>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Scrolling Speed (Seconds)</label>
                  <input
                    type="number"
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
                    placeholder="20"
                    value={settings.announcements_speed || 20}
                    onChange={(e) => setSettings({ ...settings, announcements_speed: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* --- VIEW 11: LIVE PREVIEW --- */}
        {activeSubTab === 'Live Preview' && (
          <div className="space-y-6">
            <div className="border-b border-gray-50 pb-4">
              <h3 className="font-extrabold text-gray-800 text-base">Unsaved Homepage CMS Live Simulator</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Preview styling, headings, banner imagery and floaters in real-time before clicking save</p>
            </div>

            {/* Simulating phone viewport or desktop catalog container */}
            <div className="w-full border border-gray-200 rounded-3xl overflow-hidden shadow-premium bg-[#FAFAF9] flex flex-col relative max-w-[1000px] mx-auto min-h-[500px]">
              
              {/* Simulated header */}
              <div className="w-full bg-white border-b border-gray-100 p-3.5 flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
                </div>
                <div className="bg-gray-100 rounded-full px-12 py-1 font-semibold text-gray-500 text-[10px]">
                  http://localhost:3000/
                </div>
                <div className="w-12" />
              </div>

              {/* Simulated top announcement ticker */}
              {announcements.length > 0 && announcements.some(a => a.is_active) && (
                <div
                  style={{ backgroundColor: announcements[0]?.bg_color || '#1B5E20' }}
                  className="w-full text-center py-2 text-[10px] font-bold tracking-wide"
                >
                  <span style={{ color: announcements[0]?.text_color || '#FFF' }}>
                    {announcements[0]?.text}
                  </span>
                </div>
              )}

              {/* Dynamic rendering simulator feed */}
              <div className="w-full overflow-y-auto max-h-[550px] scrollbar-thin flex flex-col gap-6 text-center select-none bg-brand-bg relative pb-8">
                
                {layoutOrder.map((section, idx) => {
                  if (!section.is_visible) return null;

                  if (section.section_id === 'hero') {
                    const heroStyle = {
                      backgroundImage: hero.bg_image ? `url(${hero.bg_image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    };
                    return (
                      <div
                        key="preview-hero"
                        style={heroStyle}
                        className="relative mx-4 mt-4 bg-white rounded-2xl border border-gray-150 p-6 flex flex-col md:flex-row items-center justify-between overflow-hidden text-left"
                      >
                        {!hero.bg_image && (
                          <div className="absolute right-[-10%] top-[-10%] w-[80%] h-[120%] bg-gradient-to-br from-emerald-100/40 to-transparent blur-2xl z-0" />
                        )}

                        <div className="max-w-md z-10 space-y-3.5">
                          {hero.badge && (
                            <span className="px-3 py-1 text-[9px] font-extrabold text-primary-green bg-light-green rounded-full uppercase tracking-wider">
                              {hero.badge}
                            </span>
                          )}
                          <h1 className="text-[26px] font-black text-gray-800 leading-tight">
                            {hero.heading || 'From Our Farms'} <span className="text-primary-green block sm:inline">{hero.highlight_text || 'To Your Family'}</span>
                          </h1>
                          <p className="text-[12px] text-gray-400 font-semibold leading-relaxed">
                            {hero.description || 'Handpicked fresh items.'}
                          </p>

                          <div className="flex gap-2">
                            {hero.left_btn_text && (
                              <button type="button" className="px-4 py-2 bg-primary-green text-white text-[11px] font-bold rounded-lg cursor-default">
                                {hero.left_btn_text}
                              </button>
                            )}
                            {hero.right_btn_text && (
                              <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold rounded-lg cursor-default">
                                {hero.right_btn_text}
                              </button>
                            )}
                          </div>
                        </div>

                        {hero.image && (
                          <div className="w-40 h-40 relative z-10 shrink-0 mt-4 md:mt-0 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <img src={hero.image} alt="Showcase" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (section.section_id === 'categories') {
                    return (
                      <div key="preview-categories" className="mx-4 text-left">
                        <h4 className="text-[14px] font-black text-gray-800 mb-3 tracking-tight">Shop by Category (Simulator)</h4>
                        <div className="grid grid-cols-4 gap-3.5">
                          {homepageCategories.map((c, i) => (
                            <div key={i} style={{ backgroundColor: c.bg_color || '#FFF' }} className="p-3 border border-gray-150 rounded-xl flex flex-col items-center gap-1.5 shadow-sm">
                              <img src={c.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                              <span className="text-[10px] font-extrabold text-gray-800 tracking-wide capitalize">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'promos') {
                    return (
                      <div key="preview-promos" className="mx-4 text-left space-y-3">
                        <h4 className="text-[14px] font-black text-gray-800 tracking-tight">Promotions Feed</h4>
                        <div className="grid grid-cols-2 gap-3.5">
                          {promos.slice(0, 2).map((p, i) => (
                            <div key={i} style={{ backgroundColor: p.bg_color || '#FFF' }} className="p-4 rounded-xl border border-gray-150 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                              <div>
                                <span className="text-[13px] font-extrabold text-gray-800 block">{p.title}</span>
                                <span className="text-[9px] text-gray-400 block mt-1">{p.description}</span>
                              </div>
                              <span className="text-[10px] text-primary-green font-bold flex items-center gap-0.5 mt-4">
                                {p.btn_text || 'Shop Now'} <ChevronRight className="w-3 h-3" />
                              </span>
                              {p.image && (
                                <img src={p.image} alt="" className="w-16 h-16 rounded-full absolute right-2 bottom-2 object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'bestsellers') {
                    return (
                      <div key="preview-bestsellers" className="mx-4 text-left">
                        <h4 className="text-[14px] font-black text-gray-800 mb-3 tracking-tight">Best Sellers Slider</h4>
                        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                          {products.slice(0, 3).map((p, i) => (
                            <div key={i} className="min-w-[140px] max-w-[140px] border border-gray-150 rounded-xl p-3 bg-white shadow-sm flex flex-col justify-between">
                              <img src={p.image} alt="" className="w-20 h-20 object-cover rounded-lg mx-auto bg-gray-50" />
                              <span className="text-[10px] font-bold text-gray-800 truncate block mt-2">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{p.weight}</span>
                              <span className="text-xs font-black text-gray-800 block mt-2">₹{p.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'testimonials') {
                    return (
                      <div key="preview-testimonials" className="mx-4 text-left">
                        <h4 className="text-[14px] font-black text-gray-800 mb-3 tracking-tight">Testimonials Grid</h4>
                        <div className="grid grid-cols-2 gap-3.5">
                          {testimonials.slice(0, 2).map((t, i) => (
                            <div key={i} className="p-4 border border-gray-150 rounded-xl bg-white shadow-sm space-y-2">
                              <p className="text-[10px] text-gray-500 font-sans italic leading-relaxed">"{t.review}"</p>
                              <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-50">
                                <span className="w-5 h-5 rounded-full bg-light-green/30 text-[10px] font-bold text-primary-green flex items-center justify-center">
                                  {t.customer_name.charAt(0)}
                                </span>
                                <span className="text-[9px] font-bold text-gray-700">{t.customer_name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'featured_products') {
                    return (
                      <div key="preview-featured" className="mx-4 text-left">
                        <h4 className="text-[14px] font-black text-gray-800 mb-3 tracking-tight">Featured Products</h4>
                        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                          {products.slice(0, 3).map((p, i) => (
                            <div key={i} className="min-w-[140px] max-w-[140px] border border-gray-150 rounded-xl p-3 bg-white shadow-sm flex flex-col justify-between">
                              <img src={p.image} alt="" className="w-20 h-20 object-cover rounded-lg mx-auto bg-gray-50" />
                              <span className="text-[10px] font-bold text-gray-800 truncate block mt-2">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{p.weight}</span>
                              <span className="text-xs font-black text-gray-800 block mt-2">₹{p.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'trending_products') {
                    return (
                      <div key="preview-trending" className="mx-4 text-left">
                        <h4 className="text-[14px] font-black text-gray-800 mb-3 tracking-tight">Trending Products</h4>
                        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                          {products.slice(0, 3).map((p, i) => (
                            <div key={i} className="min-w-[140px] max-w-[140px] border border-gray-150 rounded-xl p-3 bg-white shadow-sm flex flex-col justify-between">
                              <img src={p.image} alt="" className="w-20 h-20 object-cover rounded-lg mx-auto bg-gray-50" />
                              <span className="text-[10px] font-bold text-gray-800 truncate block mt-2">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{p.weight}</span>
                              <span className="text-xs font-black text-gray-800 block mt-2">₹{p.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'new_arrivals') {
                    return (
                      <div key="preview-newarrivals" className="mx-4 text-left">
                        <h4 className="text-[14px] font-black text-gray-800 mb-3 tracking-tight">New Arrivals</h4>
                        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                          {products.slice(0, 3).map((p, i) => (
                            <div key={i} className="min-w-[140px] max-w-[140px] border border-gray-150 rounded-xl p-3 bg-white shadow-sm flex flex-col justify-between">
                              <img src={p.image} alt="" className="w-20 h-20 object-cover rounded-lg mx-auto bg-gray-50" />
                              <span className="text-[10px] font-bold text-gray-800 truncate block mt-2">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{p.weight}</span>
                              <span className="text-xs font-black text-gray-800 block mt-2">₹{p.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'seasonal_collections') {
                    return (
                      <div key="preview-seasonal" className="mx-4 text-left space-y-3">
                        <h4 className="text-[14px] font-black text-gray-800 tracking-tight">Seasonal Campaigns</h4>
                        {seasonalCollections.slice(0, 1).map((col, idx) => (
                          <div key={idx} className="border border-gray-150 rounded-xl p-4 bg-white shadow-sm text-left">
                            <span className="text-xs font-bold text-gray-800 block mb-2">{col.title}</span>
                            {col.banner && (
                              <img src={col.banner} alt="" className="w-full h-24 object-cover rounded-lg mb-3" />
                            )}
                            <p className="text-[10px] text-gray-400 font-semibold">{col.description}</p>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (section.section_id === 'newsletter') {
                    return (
                      <div key="preview-newsletter" style={{ backgroundColor: newsletter.bg_color || '#E8F5E9' }} className="mx-4 rounded-xl p-6 border border-gray-150 text-left space-y-2 relative overflow-hidden">
                        {newsletter.bg_image && (
                          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${newsletter.bg_image})` }} />
                        )}
                        <div className="relative z-10 space-y-2.5">
                          <span className="text-[14px] font-black text-gray-800 block">{newsletter.heading || 'Subscribe to our newsletter'}</span>
                          <p className="text-[10px] text-gray-500 font-semibold max-w-[80%]">{newsletter.description || 'Sign up now.'}</p>
                          <div className="flex gap-2">
                            <input type="text" disabled placeholder="Enter your email" className="bg-white border border-gray-200 px-3 py-1.5 text-[10px] rounded-lg w-44" />
                            <button type="button" className="px-4 py-1.5 bg-primary-green text-white text-[10px] font-bold rounded-lg cursor-default">
                              {newsletter.btn_text || 'Subscribe'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (section.section_id === 'bottom_features') {
                    return (
                      <div key="preview-bottomfeatures" className="mx-4 p-4 border border-gray-150 rounded-xl bg-white shadow-sm flex justify-between text-left flex-wrap gap-4">
                        {features.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-light-green text-primary-green text-xs flex items-center justify-center font-bold">✓</span>
                            <div>
                              <span className="text-[10px] font-bold text-gray-800 block">{feat.title}</span>
                              <span className="text-[8px] text-gray-400 font-semibold block">{feat.subtitle}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
