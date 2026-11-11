import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Search,
  FileText,
} from 'lucide-react';
import { Order } from '../../types';
import { storageService } from '../../services/storageService';

export const OrdersManagementView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => storageService.getOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleStatusChange = (orderId: string, newStatus: Order['orderStatus']) => {
    storageService.updateOrderStatus(orderId, newStatus);
    setOrders(storageService.getOrders());
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.orderStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7A582F]"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Fulfillment &amp; Courier Logistics
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            Orders &amp; Shipments
          </h1>
          <p className="text-xs text-[#50443D] max-w-2xl mt-1">
            Track bespoke orders, update tailoring status, assign Leopards Express/TCS couriers, and generate printable receipts.
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#42240D]"
        >
          <option value="all">All Orders ({orders.length})</option>
          <option value="Processing / Tailoring">Processing / Tailoring</option>
          <option value="Dispatched / In Transit">Dispatched / In Transit</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#D4C3B9]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#7A582F] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E2DD]">
              <tr>
                <th className="py-3.5 px-4">Order ID &amp; Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items / Silhouette</th>
                <th className="py-3.5 px-4">Valuation</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Courier Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE9]">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-serif font-bold text-sm text-[#42240D] block">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-[#82746C]">{ord.date}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#42240D] block">{ord.customerName}</span>
                    <span className="text-[11px] text-[#82746C]">{ord.customerPhone}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#42240D] line-clamp-1">
                      {ord.items[0]?.title || 'Pret Ensemble'}
                    </span>
                    <span className="text-[10px] text-[#7A582F]">
                      Size: {ord.items[0]?.size} ({ord.items[0]?.deliverable}) · {ord.items.length} item(s)
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-serif font-bold text-sm text-[#42240D]">
                      PKR {ord.total.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-xs text-[#50443D] block">{ord.paymentMethod}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D4C3B9] rounded-lg text-xs font-bold text-[#42240D]"
                    >
                      <option value="Processing / Tailoring">Processing / Tailoring</option>
                      <option value="Dispatched / In Transit">Dispatched / In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <span className="text-[10px] font-mono text-[#82746C] block mt-0.5">
                      {ord.courier} ({ord.trackingNumber})
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] text-xs font-bold text-[#42240D]"
                    >
                      View Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#C49A6C]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DD]">
              <h3 className="font-serif text-lg font-bold text-[#42240D]">
                Order Details: {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#82746C] hover:text-[#42240D]"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl text-xs space-y-2 border border-[#D4C3B9]">
              <div className="flex justify-between">
                <span className="text-[#82746C]">Customer:</span>
                <span className="font-bold text-[#42240D]">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Contact:</span>
                <span>{selectedOrder.customerPhone} ({selectedOrder.customerEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Shipping Destination:</span>
                <span className="text-right">{selectedOrder.shippingAddress.addressLine}, {selectedOrder.shippingAddress.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Payment:</span>
                <span className="font-semibold">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Courier:</span>
                <span>{selectedOrder.courier} ({selectedOrder.trackingNumber})</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase text-[#7A582F] block">Ordered Silhouettes:</span>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between p-2 rounded-lg bg-[#FAF7F2] border border-[#F0EDE9]">
                  <div>
                    <span className="font-bold text-[#42240D]">{it.title}</span>
                    <div className="text-[10px] text-[#82746C]">Size: {it.size} · {it.deliverable}</div>
                  </div>
                  <span className="font-bold text-[#7A582F]">PKR {(it.price * it.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
