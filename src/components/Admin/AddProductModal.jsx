import React, { useState } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import { X, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AddProductModal({ product, onClose, refresh }) {
  const { categories } = useAuth();

  const categoriesList = categories && categories.length > 0 ? categories : [
    { name: 'Fruits', slug: 'fruits', subcategories: [{ name: 'All Fruits', slug: 'all' }] },
    { name: 'Vegetables', slug: 'vegetables', subcategories: [{ name: 'All Veggies', slug: 'all' }] },
    { name: 'Spices', slug: 'spices', subcategories: [{ name: 'All Spices', slug: 'all' }] },
    { name: 'Dry Fruits', slug: 'dryfruits', subcategories: [{ name: 'All Dry Fruits', slug: 'all' }] },
    { name: 'Others', slug: 'others', subcategories: [{ name: 'All Others', slug: 'all' }] }
  ];

  const isEdit = !!product;
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || 'fruits');
  const [subcat, setSubcat] = useState(product?.subcat || 'all');
  const [price, setPrice] = useState(product?.price || '');
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || '');
  const [image, setImage] = useState(product?.image || '');
  const [stock, setStock] = useState(product?.stock || '100');
  const [sku, setSku] = useState(product?.sku || '');
  const [weight, setWeight] = useState(product?.weight || '1 kg');
  const [tags, setTags] = useState(product?.tags || '');
  const [featured, setFeatured] = useState(product?.featured || false);
  const [organic, setOrganic] = useState(product?.organic || false);
  const [bestSeller, setBestSeller] = useState(product?.best_seller || false);
  const [availability, setAvailability] = useState(product?.availability ?? true);

  const selectedCatObj = categoriesList.find(c => c.slug === category || c.name.toLowerCase().replace(/\s+/g, '') === category);
  const subcategoriesList = selectedCatObj && selectedCatObj.subcategories ? selectedCatObj.subcategories : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Product Name is required.');
    if (!price || parseFloat(price) <= 0) return toast.error('Valid Price is required.');

    const payload = {
      name,
      description,
      category,
      subcat,
      price: parseInt(price),
      originalPrice: originalPrice ? parseInt(originalPrice) : parseInt(price),
      image: image.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260',
      stock: parseInt(stock),
      sku: sku.trim() || undefined,
      weight,
      tags,
      featured,
      organic,
      bestSeller,
      availability
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await api.put(`/api/admin/products/${product.id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/api/admin/products', payload);
        toast.success('Product published successfully!');
      }
      refresh();
      onClose();
    } catch (err) {
      console.error('Failed to submit product:', err);
      toast.error('Failed to save product details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100/50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 tracking-tight flex items-center gap-1.5">
              {isEdit ? 'Modify Product Info' : 'Publish New Product'}
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{isEdit ? `ID: ${product.id}` : 'Fill in the catalog specification parameters'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Spec */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Product Name *</label>
              <input
                type="text"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="e.g. Alphonso Mangoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-sans"
                placeholder="Details of freshness, farming source or taste notes..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category *</label>
              <select
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  const catObj = categoriesList.find(c => c.slug === newCat || c.name.toLowerCase() === newCat);
                  if (catObj && catObj.subcategories && catObj.subcategories.length > 0) {
                    setSubcat(catObj.subcategories[0].slug);
                  } else {
                    setSubcat('all');
                  }
                }}
              >
                {categoriesList.map((c) => (
                  <option key={c.slug || c.name.toLowerCase()} value={c.slug || c.name.toLowerCase()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Subcategory</label>
              {subcategoriesList.length > 0 ? (
                <select
                  className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  value={subcat}
                  onChange={(e) => setSubcat(e.target.value)}
                >
                  {subcategoriesList.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="e.g. all, citrus, leafy..."
                  value={subcat}
                  onChange={(e) => setSubcat(e.target.value)}
                />
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price (₹) *</label>
              <input
                type="number"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="149"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Original Price (₹)</label>
              <input
                type="number"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="199"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Image URL</label>
              <input
                type="text"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Initial Stock</label>
              <input
                type="number"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Weight / Unit Spec</label>
              <input
                type="text"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="e.g. 1 kg, 500 g, 4 pcs"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">SKU ID</label>
              <input
                type="text"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="e.g. KSQ-FRUIT-09"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tags (Comma Separated)</label>
              <input
                type="text"
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="e.g. sweet, premium, seasonal"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Badges / Checkboxes Grid */}
          <div className="border-t border-gray-50 pt-5 space-y-4">
            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2.5">Catalog Placement & Badges</h4>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-gray-100/60 rounded-xl bg-gray-50/20 hover:bg-gray-50/50 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5"
                  checked={organic}
                  onChange={(e) => setOrganic(e.target.checked)}
                />
                <div>
                  <span className="block text-xs font-bold text-gray-800">Organic</span>
                  <span className="text-[10px] text-gray-400 font-sans block mt-0.5">Flags as 100% organic farm fresh</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-100/60 rounded-xl bg-gray-50/20 hover:bg-gray-50/50 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                />
                <div>
                  <span className="block text-xs font-bold text-gray-800">Best Seller</span>
                  <span className="text-[10px] text-gray-400 font-sans block mt-0.5">Adds a Best Seller catalog ribbon</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-100/60 rounded-xl bg-gray-50/20 hover:bg-gray-50/50 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <div>
                  <span className="block text-xs font-bold text-gray-800">Featured</span>
                  <span className="text-[10px] text-gray-400 font-sans block mt-0.5">Display on home promo spotlight</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-100/60 rounded-xl bg-gray-50/20 hover:bg-gray-50/50 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5"
                  checked={availability}
                  onChange={(e) => setAvailability(e.target.checked)}
                />
                <div>
                  <span className="block text-xs font-bold text-gray-800">Availability</span>
                  <span className="text-[10px] text-gray-400 font-sans block mt-0.5">Allow users to add to cart</span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3.5 border-t border-gray-50 pt-5 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Publish Spec</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
