import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  Search, 
  ChevronDown, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  ClipboardCheck, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrderManagementView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // For Invoice Detail Modal
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/orders');
      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
      toast.error('Failed to load orders list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (customerId, orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/api/admin/orders/${customerId}/${orderId}/status`, { status: newStatus });
      toast.success(`Order status set to ${newStatus}`);
      
      // Update local state
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      }));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Convert numbers to Indian format (e.g. ₹2,45,680)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredOrders = orders.filter(o => 
    String(o.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(o.customerName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(o.customerPhone).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-100/50';
      case 'Packed':
        return 'bg-purple-50 text-purple-700 border-purple-100/50';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100/50';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100/50';
      case 'Refund Requested':
        return 'bg-amber-50 text-amber-600 border-amber-100/50';
      case 'Refunded':
      case 'Refund Approved':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Refund Rejected':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Order Management Queue</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">Manage processing pipeline & delivery updates</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search Order ID, phone..." 
            className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm shadow-gray-50/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Items count</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Invoice Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="w-14 h-4 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="w-24 h-3.5 bg-gray-100 rounded" />
                        <div className="w-16 h-2.5 bg-gray-100 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="w-20 h-3 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-8 h-3.5 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-14 h-3.5 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-16 h-6 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-8 h-8 bg-gray-100 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-800 text-[11.5px]">
                    #{String(order.id).replace('KSQ', '')}
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <h4 className="font-bold text-gray-800">{order.customerName}</h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{order.customerPhone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-semibold uppercase text-[10px]">
                    {order.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">
                    {order.items?.length || 0} items
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-gray-800 text-[12px]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3.5 px-4">
                    {updatingId === order.id ? (
                      <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                    ) : (
                      <select 
                        className={`border rounded-lg px-2.5 py-1 text-[11px] font-extrabold select-none outline-none focus:ring-1 focus:ring-emerald-500 ${getStatusStyle(order.status)}`}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.customerId, order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refund Requested">Refund Requested</option>
                        <option value="Refunded">Refunded (Approved)</option>
                        <option value="Refund Rejected">Refund Rejected</option>
                      </select>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition cursor-pointer"
                      title="Inspect Invoice details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-semibold select-none">
                    No orders processed matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn print:bg-white print:p-0">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] print:shadow-none print:border-none print:w-full print:max-h-full">
            {/* Modal Toolbar (hidden on print) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 print:hidden select-none">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">Invoice Details</h3>
                <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Order ID: #{selectedOrder.id}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrintInvoice}
                  className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-[11px] font-bold"
                  title="Print invoice specifications"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Specification Canvas */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin print:overflow-visible">
              {/* Branding header */}
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-black text-emerald-600 tracking-tight">Karshaq Grocery</h2>
                  <span className="text-[10px] text-gray-400 block mt-0.5">H.No 12-3, Tech Zone, Hyderabad, India</span>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-xs text-gray-800">INVOICE SPEC</h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{selectedOrder.date}</span>
                </div>
              </div>

              {/* Delivery and Customer details */}
              <div className="grid grid-cols-2 gap-6 text-[11px] leading-relaxed">
                <div>
                  <span className="font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Delivered To:</span>
                  <div className="font-bold text-gray-800 text-[12px]">{selectedOrder.customerName}</div>
                  <div className="text-gray-500 font-sans mt-1">
                    {selectedOrder.address?.street || 'No street details supplied'}<br />
                    {selectedOrder.address?.area}, {selectedOrder.address?.city}<br />
                    {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                  </div>
                </div>
                <div>
                  <span className="font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Customer Info:</span>
                  <div className="text-gray-500 flex flex-col gap-1 mt-1 font-semibold">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedOrder.customerPhone}</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedOrder.customerEmail || 'No email associated'}</span>
                  </div>
                </div>
              </div>

              {/* Items specification table */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="py-2.5 px-4">Item Name</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {(selectedOrder.items || []).map((item, index) => (
                      <tr key={index}>
                        <td className="py-2.5 px-4 font-bold">{item.name}</td>
                        <td className="py-2.5 px-4 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right font-sans">₹{item.price}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-gray-800 font-sans">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary panel */}
              <div className="flex justify-end pt-2">
                <div className="w-48 text-[11px] space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex justify-between font-semibold text-gray-400">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.total - 40)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-400">
                    <span>Delivery Fee:</span>
                    <span>₹40</span>
                  </div>
                  <div className="flex justify-between text-[12px] font-black text-gray-800 border-t border-gray-100 pt-2">
                    <span>Total Charge:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline (hidden on print) */}
              <div className="border-t border-gray-100 pt-5 print:hidden">
                <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider block mb-4">Pipeline Status Timeline</span>
                <div className="space-y-4">
                  {[
                    { step: 'Pending', label: 'Order Registered', desc: 'Awaiting merchant acceptance confirmation.', active: true },
                    { step: 'Processing', label: 'Processing & Sourcing', desc: 'Fresh groceries are being gathered from partner farms.', active: ['Processing', 'Packed', 'Shipped', 'Delivered'].includes(selectedOrder.status) },
                    { step: 'Packed', label: 'Packed & Dispatched', desc: 'Securely packaged in cardboard eco-wraps.', active: ['Packed', 'Shipped', 'Delivered'].includes(selectedOrder.status) },
                    { step: 'Shipped', label: 'Shipped via Partner', desc: 'Delivery partner has received package specifications.', active: ['Shipped', 'Delivered'].includes(selectedOrder.status) },
                    { step: 'Delivered', label: 'Delivered successfully', desc: 'Handed over directly to customer address.', active: selectedOrder.status === 'Delivered' }
                  ].map((t, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative select-none">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                        t.active ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h5 className={`font-bold text-xs ${t.active ? 'text-gray-800' : 'text-gray-400'}`}>{t.label}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-normal font-sans">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
