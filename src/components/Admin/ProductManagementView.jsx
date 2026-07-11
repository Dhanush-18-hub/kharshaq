import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Trash,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  Filter,
  ArrowUpDown,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddProductModal from './AddProductModal';

export default function ProductManagementView({ initialTab = 'products' }) {
  const { fetchProducts: refetchGlobalProducts, fetchCategories: refetchGlobalCategories } = useAuth();
  const [currentTab, setCurrentTab] = useState(initialTab); // 'products' or 'categories'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table Controls
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal Control
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // null means adding new

  // Live Category Management States
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [submittingCategory, setSubmittingCategory] = useState(false);

  const fetchCategoriesList = async () => {
    try {
      setCategoryLoading(true);
      const res = await api.get('/api/categories');
      if (res.data) {
        setCategoriesList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'categories') {
      fetchCategoriesList();
    }
  }, [currentTab]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return toast.error('Category name is required.');
    try {
      setSubmittingCategory(true);
      await api.post('/api/admin/categories', {
        name: newCatName.trim(),
        image: newCatImage.trim() || '/category_fruits.png'
      });
      toast.success('Category created successfully!');
      setNewCatName('');
      setNewCatImage('');
      fetchCategoriesList();
      if (refetchGlobalCategories) refetchGlobalCategories();
    } catch (err) {
      console.error('Failed to create category:', err);
      toast.error(err.response?.data?.error || 'Failed to create category.');
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;
    try {
      await api.delete(`/api/admin/categories/${name}`);
      toast.success('Category deleted successfully.');
      fetchCategoriesList();
      if (refetchGlobalCategories) refetchGlobalCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      toast.error('Failed to delete category.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/products', {
        params: {
          search,
          category: categoryFilter,
          sortBy,
          page,
          perPage: 8
        }
      });
      if (res.data) {
        setProducts(res.data.products);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
        if (refetchGlobalProducts) {
          refetchGlobalProducts();
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
      toast.error('Failed to load products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    setSelectedIds([]); // clear selection on filters change
  }, [search, categoryFilter, sortBy, page, currentTab]);

  // Bulk handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    try {
      await api.post('/api/admin/products/bulk-delete', { ids: selectedIds });
      toast.success(`Successfully deleted ${selectedIds.length} products`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      toast.error('Bulk deletion failed.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete product.');
    }
  };

  const handleDuplicateProduct = async (id) => {
    try {
      await api.post(`/api/admin/products/${id}/duplicate`);
      toast.success('Product duplicated successfully');
      fetchProducts();
    } catch (err) {
      console.error('Failed to duplicate product:', err);
      toast.error('Failed to duplicate product.');
    }
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  // Mock Category stats
  const categoryStats = [
    { name: 'Fruits', count: 18, activeOffers: 2, image: '/product_mango.png' },
    { name: 'Vegetables', count: 24, activeOffers: 4, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=260' },
    { name: 'Spices', count: 12, activeOffers: 1, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=260' },
    { name: 'Dry Fruits', count: 9, activeOffers: 0, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d4b?auto=format&fit=crop&q=80&w=260' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 select-none">
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentTab('products')}
            className={`pb-3 text-sm font-bold border-b-2 transition ${currentTab === 'products' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
          >
            All Products
          </button>
          <button
            onClick={() => setCurrentTab('categories')}
            className={`pb-3 text-sm font-bold border-b-2 transition ${currentTab === 'categories' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
          >
            Categories
          </button>
        </div>
        {currentTab === 'products' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {currentTab === 'products' ? (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 select-none">
            {/* Search */}
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, SKU..."
                className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-800"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-xs font-semibold text-gray-600 outline-none focus:border-emerald-500"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              >
                <option value="All">All Categories</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Spices">Spices</option>
                <option value="Dryfruits">Dry Fruits</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <select
                className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-xs font-semibold text-gray-600 outline-none focus:border-emerald-500"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              >
                <option value="default">Default Sorting</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
                <option value="stock-desc">Stock: High to Low</option>
              </select>
            </div>
          </div>

          {/* Bulk actions status panel */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl animate-fadeIn select-none">
              <span className="text-xs font-bold text-emerald-800">
                Selected {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'}
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm shadow-gray-50/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
                    <th className="py-3.5 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        checked={products.length > 0 && selectedIds.length === products.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-3.5 px-4">Product Info</th>
                    <th className="py-3.5 px-4">SKU / Tags</th>
                    <th className="py-3.5 px-4">Inventory</th>
                    <th className="py-3.5 px-4">Pricing</th>
                    <th className="py-3.5 px-4">Discount</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {loading ? (
                    // Skeleton rows
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-4"><div className="w-4 h-4 bg-gray-100 rounded mx-auto" /></td>
                        <td className="py-4 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                          <div className="space-y-2">
                            <div className="w-24 h-3.5 bg-gray-100 rounded" />
                            <div className="w-12 h-2.5 bg-gray-100 rounded" />
                          </div>
                        </td>
                        <td className="py-4 px-4"><div className="w-16 h-3 bg-gray-100 rounded" /></td>
                        <td className="py-4 px-4"><div className="w-12 h-3.5 bg-gray-100 rounded" /></td>
                        <td className="py-4 px-4"><div className="w-14 h-3.5 bg-gray-100 rounded" /></td>
                        <td className="py-4 px-4"><div className="w-10 h-3 bg-gray-100 rounded" /></td>
                        <td className="py-4 px-4"><div className="w-20 h-7 bg-gray-100 rounded mx-auto" /></td>
                      </tr>
                    ))
                  ) : products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedIds.includes(prod.id)}
                          onChange={() => handleSelectOne(prod.id)}
                        />
                      </td>
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={prod.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260"}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-gray-800">{prod.name}</h4>
                          <span className="text-[10px] text-gray-400 block mt-0.5 capitalize">{prod.category} • {prod.weight}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500">
                        <div>{prod.sku || 'N/A'}</div>
                        {prod.organic && <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded mt-1 font-bold">ORGANIC</span>}
                        {prod.best_seller && <span className="inline-block text-[9px] bg-amber-50 text-amber-700 px-1 py-0.2 rounded mt-1 ml-1 font-bold">BEST</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${prod.stock < 20 ? 'text-rose-600' : 'text-gray-800'}`}>{prod.stock} left</span>
                        <span className={`block text-[9px] mt-0.5 font-bold ${prod.availability ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {prod.availability ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        ₹{prod.price}
                        {prod.originalPrice > prod.price && (
                          <span className="line-through text-gray-300 font-normal text-[10px] block mt-0.5">₹{prod.originalPrice}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {prod.discount ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                            {prod.discount}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(prod.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 font-semibold select-none">
                        No products match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-50 px-6 py-4 bg-gray-50/20 select-none">
                <span className="text-xs font-semibold text-gray-400">
                  Showing {(page - 1) * 8 + 1} - {Math.min(page * 8, totalCount)} of {totalCount} products
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 border border-gray-100 rounded-xl bg-white text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-200 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 border border-gray-100 rounded-xl bg-white text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-200 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Categories Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider mb-2 select-none">Active Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                ))
              ) : categoriesList.map((cat, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:border-emerald-100 transition">
                  <div className="flex items-center gap-4">
                    <img
                      src={cat.image || '/category_fruits.png'}
                      alt={cat.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-800 capitalize">{cat.name}</h4>
                      <span className="text-[11px] text-gray-400 block mt-1 font-sans font-semibold">{cat.count} products</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.name)}
                    className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create category card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-fit">
            <h3 className="font-extrabold text-base text-gray-800 mb-6 select-none">Create Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Category Name *</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                  placeholder="e.g. herbs"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Image Path/URL</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                  placeholder="e.g. /category_herbs.png"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submittingCategory}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95 cursor-pointer mt-4"
              >
                {submittingCategory ? 'Creating...' : 'Publish Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit product modal */}
      {modalOpen && (
        <AddProductModal
          product={selectedProduct}
          onClose={() => setModalOpen(false)}
          refresh={fetchProducts}
        />
      )}
    </div>
  );
}
