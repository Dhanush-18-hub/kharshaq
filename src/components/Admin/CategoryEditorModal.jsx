import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import {
  X, Layers, Settings, Image, FileText, Sparkles, Plus, Trash2,
  ArrowUp, ArrowDown, Search, Eye, Link2, HelpCircle, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoryEditorModal({ category, onClose, refresh }) {
  const { products: globalProducts, refetchProducts } = useAuth();
  const isEdit = !!category;

  const [activeTab, setActiveTab] = useState('general');

  // General State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [navbarOrder, setNavbarOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Hero State
  const [heroBadge, setHeroBadge] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [gradient, setGradient] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('');
  const [features, setFeatures] = useState([]);

  // Subcategories State
  const [subcategories, setSubcategories] = useState([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubSlug, setNewSubSlug] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('');

  // SEO State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Products assignment state
  const [assignedProductIds, setAssignedProductIds] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  // Load category properties on mount/change
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setImage(category.image || '');
      setNavbarOrder(category.navbarOrder || 0);
      setIsVisible(category.isVisible ?? true);

      setHeroBadge(category.heroBadge || '');
      setHeroTitle(category.heroTitle || '');
      setHeroSubtitle(category.heroSubtitle || '');
      setHeroImage(category.heroImage || '');
      setBackgroundImage(category.backgroundImage || '');
      setBackgroundColor(category.backgroundColor || '#F9FAF0');
      setGradient(category.gradient || '');
      setButtonText(category.buttonText || 'Shop Now');
      setButtonLink(category.buttonLink || '');
      setFeatures(category.features || []);

      setSubcategories(category.subcategories || []);

      setMetaTitle(category.metaTitle || '');
      setMetaDescription(category.metaDescription || '');

      // Identify products matching this category slug
      const matchingIds = (globalProducts || [])
        .filter(p => p.category?.toLowerCase() === category.slug?.toLowerCase())
        .map(p => p.id);
      setAssignedProductIds(matchingIds);
    } else {
      // Default feature cards for new categories
      setFeatures([
        { title: 'Farm Fresh', desc: 'Picked Daily', icon: 'Leaf' },
        { title: 'No Chemicals', desc: '100% Natural', icon: 'ShieldCheck' },
        { title: 'Premium Quality', desc: 'Hand Selected', icon: 'Star' },
        { title: 'Delivered Fresh', desc: 'At Your Doorstep', icon: 'Truck' }
      ]);
      setSubcategories([
        { name: 'All', slug: 'all', icon: '/category_fruits.png', sortOrder: 0, isVisible: true }
      ]);
    }
  }, [category, globalProducts]);

  // Handle features card list modifications
  const handleAddFeature = () => {
    setFeatures([...features, { title: 'New Feature', desc: 'Description', icon: 'Star' }]);
  };

  const handleEditFeature = (index, field, value) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  const handleMoveFeature = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === features.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...features];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFeatures(updated);
  };

  // Subcategory Actions
  const handleAddSubcategory = () => {
    if (!newSubName.trim()) return toast.error('Subcategory name is required.');
    const targetSlug = newSubSlug.trim() || newSubName.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (subcategories.some(s => s.slug === targetSlug)) {
      return toast.error('A subcategory with this slug already exists.');
    }

    const newSub = {
      name: newSubName.trim(),
      slug: targetSlug,
      icon: newSubIcon.trim() || image || '/category_fruits.png',
      sortOrder: subcategories.length,
      isVisible: true
    };

    setSubcategories([...subcategories, newSub]);
    setNewSubName('');
    setNewSubSlug('');
    setNewSubIcon('');
    toast.success('Subcategory added to draft list!');
  };

  const handleRemoveSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, idx) => idx !== index));
  };

  const handleMoveSubcategory = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === subcategories.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...subcategories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSubcategories(updated);
  };

  // Products Selection Action
  const toggleProductAssignment = (prodId) => {
    if (assignedProductIds.includes(prodId)) {
      setAssignedProductIds(assignedProductIds.filter(id => id !== prodId));
    } else {
      setAssignedProductIds([...assignedProductIds, prodId]);
    }
  };

  const handleBulkAssign = (mode) => {
    if (mode === 'all') {
      const allIds = (globalProducts || []).map(p => p.id);
      setAssignedProductIds(allIds);
      toast.success('Assigned all catalog products to draft.');
    } else if (mode === 'clear') {
      setAssignedProductIds([]);
      toast.success('Cleared all product assignments.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category Name is required.');
    
    const finalSlug = slug.trim().toLowerCase().replace(/\s+/g, '-') || name.trim().toLowerCase().replace(/\s+/g, '-');

    const payload = {
      name: name.trim(),
      slug: finalSlug,
      image: image.trim(),
      heroBadge: heroBadge.trim(),
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      heroImage: heroImage.trim() || image.trim(),
      backgroundImage: backgroundImage.trim(),
      backgroundColor: backgroundColor.trim(),
      gradient: gradient.trim(),
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim() || `/category/${finalSlug}`,
      metaTitle: metaTitle.trim() || name.trim(),
      metaDescription: metaDescription.trim() || heroSubtitle.trim(),
      navbarOrder: parseInt(navbarOrder),
      isVisible: isVisible,
      features: features,
      subcategories: subcategories
    };

    try {
      let savedCategory;
      if (isEdit) {
        const res = await api.put(`/api/admin/categories/${category.slug}`, payload);
        savedCategory = res.data.category;
        toast.success('Category updated successfully!');
      } else {
        const res = await api.post('/api/admin/categories', payload);
        savedCategory = res.data.category;
        toast.success('Category created successfully!');
      }

      // Re-assign products on backend
      for (const prod of (globalProducts || [])) {
        const isSelected = assignedProductIds.includes(prod.id);
        const wasSelected = prod.category?.toLowerCase() === finalSlug;

        if (isSelected && !wasSelected) {
          // Assign to this category
          await api.put(`/api/admin/products/${prod.id}`, {
            ...prod,
            category: finalSlug,
            subcat: prod.subcat || 'all'
          });
        } else if (!isSelected && wasSelected) {
          // Remove from this category - set to 'others' or clear
          await api.put(`/api/admin/products/${prod.id}`, {
            ...prod,
            category: 'others',
            subcat: 'all'
          });
        }
      }

      if (refetchProducts) await refetchProducts();
      refresh();
      onClose();
    } catch (err) {
      console.error('Failed to submit category:', err);
      toast.error(err.response?.data?.error || 'Failed to save category CMS content.');
    }
  };

  const filteredProducts = (globalProducts || []).filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              {isEdit ? `Edit Category CMS: ${category.name}` : 'Create Premium CMS Category'}
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Build premium, database-driven customer layouts dynamically</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 py-1.5 gap-1.5 select-none overflow-x-auto scrollbar-none">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'hero', label: 'Hero Layout', icon: Image },
            { id: 'subcategories', label: 'Subcategories', icon: Layers },
            { id: 'products', label: 'Products Assignment', icon: Check },
            { id: 'seo', label: 'SEO & Metadata', icon: FileText },
            { id: 'preview', label: 'Live Preview', icon: Eye }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs text-gray-700">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category Name *</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="e.g. Milk & Dairy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">URL Slug (lowercase)</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="e.g. milk-dairy"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category Icon Image Path / URL</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="e.g. /category_combooffers.png"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Navigation Order (Navbar display priority)</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="e.g. 5"
                  value={navbarOrder}
                  onChange={(e) => setNavbarOrder(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 p-4 rounded-xl md:col-span-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="isVisible" className="text-[13px] font-bold text-gray-800 cursor-pointer">Visible in Store & Navigation Links</label>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Toggle to hide this category from customers while configuring layout drafts</p>
                </div>
              </div>
            </div>
          )}

          {/* HERO TAB */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Badge Text</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="e.g. 100% FARM FRESH or NEW IN STORE"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Main Title</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="e.g. Pure cow milk from healthy farms"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Description / Subtitle</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-sans"
                    placeholder="Provide description detail for the category banner section..."
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Large Float Image Path/URL</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="e.g. /hero_fruits.png"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Background Banner Image URL (optional)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="Background texture URL"
                    value={backgroundImage}
                    onChange={(e) => setBackgroundImage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Background Theme Color</label>
                  <div className="flex gap-2.5">
                    <input
                      type="color"
                      className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer bg-transparent"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      placeholder="e.g. #F9FAF0"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Custom Gradient Overlay CSS (optional)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="linear-gradient(to right, ...)"
                    value={gradient}
                    onChange={(e) => setGradient(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Banner Action Button Text</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="Shop Fruits"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Banner Action Button Link</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="/category/fruits"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                  />
                </div>
              </div>

              {/* Feature Cards CMS */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 select-none">
                  <h4 className="font-extrabold text-[13px] text-gray-800">Banner Feature Cards Highlights</h4>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Highlight Card
                  </button>
                </div>

                <div className="space-y-3">
                  {features.map((feat, idx) => (
                    <div key={idx} className="bg-gray-50/50 border border-gray-150 p-4 rounded-2xl flex items-center gap-3">
                      <div className="flex flex-col gap-1 select-none">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveFeature(idx, 'up')}
                          className="p-1 hover:bg-white border rounded disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === features.length - 1}
                          onClick={() => handleMoveFeature(idx, 'down')}
                          className="p-1 hover:bg-white border rounded disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Title</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 focus:outline-none"
                            value={feat.title}
                            onChange={(e) => handleEditFeature(idx, 'title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 focus:outline-none"
                            value={feat.desc}
                            onChange={(e) => handleEditFeature(idx, 'desc', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lucide Icon Name</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 focus:outline-none"
                            value={feat.icon}
                            placeholder="e.g. Leaf, Truck, ShieldCheck, Star"
                            onChange={(e) => handleEditFeature(idx, 'icon', e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 border border-transparent rounded-xl transition cursor-pointer self-end"
                        title="Remove Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBCATEGORIES TAB */}
          {activeTab === 'subcategories' && (
            <div className="space-y-6">
              {/* Draft List */}
              <div>
                <h4 className="font-extrabold text-[13px] text-gray-800 mb-3 select-none">Active Subcategories List ({subcategories.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subcategories.map((sub, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-emerald-100 transition">
                      <div className="flex items-center gap-3.5">
                        <div className="flex flex-col gap-1 select-none">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSubcategory(idx, 'up')}
                            className="p-0.5 border rounded bg-gray-55 hover:bg-white disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === subcategories.length - 1}
                            onClick={() => handleMoveSubcategory(idx, 'down')}
                            className="p-0.5 border rounded bg-gray-55 hover:bg-white disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        </div>
                        <img src={sub.icon} alt={sub.name} className="w-10 h-10 object-cover rounded-lg border bg-gray-50" />
                        <div>
                          <h5 className="font-extrabold text-[13px] text-gray-800">{sub.name}</h5>
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Slug: {sub.slug}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {subcategories.length === 0 && (
                    <div className="sm:col-span-2 text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-gray-400 font-semibold select-none">
                      No subcategories configured yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Subcategory Form */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-extrabold text-[13px] text-gray-800 mb-4 select-none">Add Subcategory</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 border border-gray-150 p-5 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subcategory Name *</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="e.g. Organic Milk"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subcategory Slug</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="e.g. organic-milk"
                      value={newSubSlug}
                      onChange={(e) => setNewSubSlug(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Icon Path / URL</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 focus:outline-none"
                      placeholder="Image URL"
                      value={newSubIcon}
                      onChange={(e) => setNewSubIcon(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="sm:col-span-3 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer hover:bg-emerald-700 active:scale-95 transition"
                  >
                    Add Subcategory
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none">
                <div>
                  <h4 className="font-extrabold text-[13px] text-gray-800">Assign Catalog Products ({assignedProductIds.length} assigned)</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Toggle checkboxes to assign products to this dynamic category page</p>
                </div>
                <div className="flex gap-2 self-end">
                  <button
                    type="button"
                    onClick={() => handleBulkAssign('all')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg cursor-pointer text-[11px]"
                  >
                    Assign All Products
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkAssign('clear')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg cursor-pointer text-[11px]"
                  >
                    Unassign All
                  </button>
                </div>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search catalog products by name or category..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 font-semibold text-gray-800 focus:outline-none focus:bg-white transition"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              {/* Checkbox Catalog List */}
              <div className="border border-gray-100 rounded-2xl max-h-[300px] overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
                {filteredProducts.map((p) => {
                  const isAssigned = assignedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProductAssignment(p.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition select-none ${
                        isAssigned ? 'bg-emerald-50/40 border border-emerald-100' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg border bg-white" />
                        <div>
                          <h5 className="font-extrabold text-[12.5px] text-gray-800">{p.name}</h5>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Price: ₹{p.price} | Current Category: <span className="uppercase text-[9.5px] text-emerald-600 font-black">{p.category}</span></span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        readOnly
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEO TAB */}
          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">SEO Meta Title</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="e.g. Buy Fresh Cow Milk & Dairy Online | Karshaq"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">SEO Meta Description</label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-sans"
                  placeholder="Provide brief SEO descriptive pitch (150-160 chars) for search results..."
                  rows={4}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="space-y-6 select-none bg-gray-50 p-4 border rounded-2xl">
              <span className="text-[9.5px] font-black uppercase text-emerald-600 tracking-wider">Live Customer Screen Mockup</span>
              
              {/* Mockup Header Hero */}
              <div
                style={{ backgroundColor: backgroundColor || '#F9FAF0', backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }}
                className="w-full rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border shadow-sm relative overflow-hidden"
              >
                {gradient && <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: gradient }} />}
                
                <div className="flex-1 text-left z-10">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px] tracking-wide mb-3 uppercase">
                    {heroBadge || '100% QUALITY ASSURED'}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-gray-800 leading-tight mb-2">
                    {heroTitle || 'Premium Seeding Banner'}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-lg mb-4">
                    {heroSubtitle || 'Fill banner subtitles to preview customer greeting message details.'}
                  </p>
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    {buttonText || 'Shop Now'}
                  </button>
                </div>
                
                <div className="w-36 h-36 flex items-center justify-center shrink-0 z-10">
                  <img
                    src={heroImage || image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260'}
                    alt="Hero mockup"
                    className="max-h-full max-w-full object-contain drop-shadow-md animate-float"
                  />
                </div>
              </div>

              {/* Feature Cards Mockup */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {features.map((feat, i) => (
                  <div key={i} className="bg-white border border-gray-100 p-3.5 rounded-xl shadow-xs text-center flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h5 className="font-extrabold text-[11.5px] text-gray-800">{feat.title}</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{feat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Subcategories Mockup */}
              <div>
                <h5 className="font-bold text-[11px] text-gray-500 uppercase mb-3">Shop By Subcategory</h5>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {subcategories.map((sub, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center p-1.5 shadow-sm hover:border-emerald-500 transition">
                        <img src={sub.icon} alt={sub.name} className="max-h-full object-contain rounded-full" />
                      </div>
                      <span className="text-[10.5px] font-bold text-gray-600">{sub.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit controls */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 select-none mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-655 font-bold rounded-xl cursor-pointer transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer transition shadow-md hover:shadow-emerald-500/10 active:scale-95 text-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
