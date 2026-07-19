import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Award, 
  Ban, 
  Unlock, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CustomerManagementView({ globalSearch }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearch(globalSearch);
    }
  }, [globalSearch]);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/customers');
      if (res.data && res.data.customers) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to fetch admin customers:', err);
      toast.error('Failed to load customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    if (!window.confirm(`Set customer status to ${nextStatus}?`)) return;

    try {
      setUpdatingId(id);
      await api.put(`/api/admin/customers/${id}/status`, { status: nextStatus });
      toast.success(`Customer status set to ${nextStatus}`);
      
      // Update local state
      setCustomers(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, status: nextStatus };
        }
        return c;
      }));
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to change customer status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCustomers = customers.filter(c => 
    String(c.name).toLowerCase().includes(search.toLowerCase()) ||
    String(c.email).toLowerCase().includes(search.toLowerCase()) ||
    String(c.phone).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Customer Accounts Manager</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">Audit customer spent totals, addresses, and status</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, phone..." 
            className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer profile cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-50 flex flex-col gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full" />
                <div className="space-y-2">
                  <div className="w-28 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="border-t border-gray-50 pt-3 grid grid-cols-3 gap-2">
                <div className="h-6 bg-gray-100 rounded" />
                <div className="h-6 bg-gray-100 rounded" />
                <div className="h-6 bg-gray-100 rounded" />
              </div>
            </div>
          ))
        ) : filteredCustomers.map((cust) => (
          <div 
            key={cust.id} 
            className={`bg-white border rounded-3xl p-5 shadow-sm shadow-gray-50 flex flex-col gap-4 hover:shadow-md transition relative overflow-hidden ${
              cust.status === 'Suspended' ? 'border-rose-100/70 bg-rose-50/5' : 'border-gray-100'
            }`}
          >
            {/* Tag segment */}
            <div className="flex items-start justify-between select-none">
              <div className="flex items-center gap-3.5">
                <img 
                  src={cust.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cust.name}`}
                  alt={cust.name} 
                  className="w-12 h-12 rounded-full border border-gray-100 bg-gray-50"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-gray-800">{cust.name}</h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{cust.email} • {cust.phone}</span>
                </div>
              </div>

              {/* Status Action */}
              <button 
                onClick={() => handleToggleStatus(cust.id, cust.status)}
                disabled={updatingId === cust.id}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                  cust.status === 'Suspended' 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 hover:bg-rose-100/50' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50 hover:bg-emerald-100/50'
                }`}
              >
                {cust.status === 'Suspended' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unsuspend</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats row info */}
            <div className="border-t border-gray-50 pt-4 grid grid-cols-3 gap-4 text-center select-none">
              <div className="p-2 bg-gray-50/50 border border-gray-100/50 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 block">Orders</span>
                <span className="text-xs font-black text-gray-800 block mt-0.5">{cust.ordersCount} logs</span>
              </div>
              <div className="p-2 bg-gray-50/50 border border-gray-100/50 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 block">Total Spent</span>
                <span className="text-xs font-black text-gray-800 block mt-0.5">₹{cust.totalSpent || 0}</span>
              </div>
              <div className="p-2 bg-gray-50/50 border border-gray-100/50 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 block">Rewards Points</span>
                <span className="text-xs font-black text-emerald-600 block mt-0.5">{cust.rewardPoints < 0 ? 0 : cust.rewardPoints} pts</span>
              </div>
            </div>

            {/* Address segment details */}
            <div className="text-[10.5px] leading-relaxed text-gray-500 font-sans select-none">
              <span className="font-extrabold text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Default Address:</span>
              <div className="flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>
                  {cust.addresses?.[0] 
                    ? `${cust.addresses[0].street}, ${cust.addresses[0].area}, ${cust.addresses[0].city}` 
                    : 'No address profile created'
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
        {!loading && filteredCustomers.length === 0 && (
          <div className="col-span-2 py-12 text-center text-gray-400 font-semibold select-none">
            No customers found matching search query.
          </div>
        )}
      </div>
    </div>
  );
}
