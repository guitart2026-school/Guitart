'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatus, PaymentStatus } from '@/lib/types';
import {
  ShoppingBag,
  CheckCircle2,
  Search,
  Filter,
  Smartphone,
  AlertCircle,
  Eye,
  X,
  ChevronDown,
  Banknote,
  Check,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, verifyBkashPayment, updateOrderStatus, updatePaymentStatus } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('All');
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerMobile.includes(searchQuery) ||
      (order.bKashTransactionId && order.bKashTransactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.paymentMethod && order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPayment = selectedPaymentStatus === 'All' || order.paymentStatus === selectedPaymentStatus;
    const matchesOrder = selectedOrderStatus === 'All' || order.orderStatus === selectedOrderStatus;

    return matchesSearch && matchesPayment && matchesOrder;
  });

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Merchandise Orders & Payment Management"
        subtitle="Manage customer orders, update Cash on Delivery & bKash payment statuses, and control shipping workflow."
      />

      <div className="px-6 space-y-6">
        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer, TxID, Payment..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            {/* Payment Filter */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 font-mono text-[11px]">Payment:</span>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Payment Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified (Paid)</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Order Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 font-mono text-[11px]">Order:</span>
              <select
                value={selectedOrderStatus}
                onChange={(e) => setSelectedOrderStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Order Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Orders Management Dashboard ({filteredOrders.length})</span>
          </h3>

          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8" />}
              title="No Orders Found"
              description="No orders match your filter criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 px-4 whitespace-nowrap">Order ID & Date</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Customer Info</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Payment Method / TxID</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Total Amount</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Payment Status</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Order Workflow</th>
                    <th className="pb-3 px-4 text-right whitespace-nowrap min-w-[130px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-zinc-800/40 transition ${
                        order.paymentStatus === 'Pending' && order.paymentMethod === 'bKash'
                          ? 'bg-amber-950/20'
                          : ''
                      }`}
                    >
                      <td className="py-4 px-4 font-mono whitespace-nowrap">
                        <span className="font-bold text-white block">{order.id}</span>
                        <span className="text-[10px] text-zinc-400">{formatDate(order.createdAt)}</span>
                      </td>

                      <td className="py-4 px-4 min-w-[160px]">
                        <p className="font-bold text-white leading-snug">{order.customerName}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{order.customerMobile}</p>
                      </td>

                      {/* Payment Method & bKash Transaction ID */}
                      <td className="py-4 px-4 font-mono whitespace-nowrap">
                        {order.bKashTransactionId ? (
                          <div className="p-2 rounded-lg bg-zinc-950 border border-amber-500/30 text-amber-300 font-bold inline-block">
                            <span className="text-[10px] text-zinc-500 block">bKash TxID:</span>
                            {order.bKashTransactionId}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Banknote className="w-3.5 h-3.5 text-amber-400" />
                            <span>{order.paymentMethod || 'Cash on Delivery'}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      {/* Interactive Payment Status Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="relative inline-flex items-center group">
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => updatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                            className={`appearance-none cursor-pointer pl-6 pr-7 py-1 rounded-full text-xs font-semibold border transition outline-none shadow-sm ${
                              order.paymentStatus === 'Verified'
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/60'
                                : order.paymentStatus === 'Failed'
                                ? 'bg-rose-950/70 text-rose-300 border-rose-500/40 hover:border-rose-400 hover:bg-rose-900/60'
                                : 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:border-amber-400 hover:bg-amber-900/60'
                            }`}
                            title="Click to update payment status"
                          >
                            <option value="Pending" className="bg-zinc-950 text-amber-400 font-semibold py-1">
                              Pending
                            </option>
                            <option value="Verified" className="bg-zinc-950 text-emerald-400 font-semibold py-1">
                              Verified (Paid)
                            </option>
                            <option value="Failed" className="bg-zinc-950 text-rose-400 font-semibold py-1">
                              Failed
                            </option>
                          </select>
                          <span
                            className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                              order.paymentStatus === 'Verified'
                                ? 'bg-emerald-400'
                                : order.paymentStatus === 'Failed'
                                ? 'bg-rose-400'
                                : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition" />
                        </div>
                      </td>

                      {/* Interactive Order Status Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="relative inline-flex items-center group">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-zinc-950 border border-zinc-700/80 text-zinc-200 rounded-lg px-3 py-1 pr-6 text-xs focus:outline-none focus:border-amber-500 cursor-pointer appearance-none hover:border-zinc-500 transition shadow-inner font-medium"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Action for Cash on Delivery */}
                          {order.paymentStatus === 'Pending' && order.paymentMethod === 'Cash on Delivery' && (
                            <button
                              type="button"
                              onClick={() => updatePaymentStatus(order.id, 'Verified')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition shadow-md cursor-pointer whitespace-nowrap flex items-center gap-1"
                              title="Mark Cash on Delivery as Paid & Received"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Mark Paid</span>
                            </button>
                          )}

                          {/* Quick Action for bKash */}
                          {order.paymentStatus === 'Pending' && order.paymentMethod === 'bKash' && (
                            <button
                              type="button"
                              onClick={() => verifyBkashPayment(order.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-md cursor-pointer whitespace-nowrap"
                            >
                              Verify bKash ✓
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Order #{viewingOrder.id}</h3>
                <p className="text-xs text-zinc-400 font-mono">Placed on {formatDate(viewingOrder.createdAt)}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Quick Status Controls inside Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-bold">
                    Payment Status
                  </label>
                  <select
                    value={viewingOrder.paymentStatus}
                    onChange={(e) => {
                      const newStat = e.target.value as PaymentStatus;
                      updatePaymentStatus(viewingOrder.id, newStat);
                      setViewingOrder({ ...viewingOrder, paymentStatus: newStat });
                    }}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold border transition focus:outline-none ${
                      viewingOrder.paymentStatus === 'Verified'
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                        : viewingOrder.paymentStatus === 'Failed'
                        ? 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                        : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    <option value="Pending" className="bg-zinc-950 text-amber-400">
                      Pending
                    </option>
                    <option value="Verified" className="bg-zinc-950 text-emerald-400">
                      Verified (Paid)
                    </option>
                    <option value="Failed" className="bg-zinc-950 text-rose-400">
                      Failed
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-bold">
                    Order Workflow
                  </label>
                  <select
                    value={viewingOrder.orderStatus}
                    onChange={(e) => {
                      const newStat = e.target.value as OrderStatus;
                      updateOrderStatus(viewingOrder.id, newStat);
                      setViewingOrder({ ...viewingOrder, orderStatus: newStat });
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <p className="font-bold text-white">Customer Shipping Details:</p>
                <p className="text-zinc-300">
                  {viewingOrder.customerName} ({viewingOrder.customerMobile})
                </p>
                <p className="text-zinc-400">{viewingOrder.customerEmail}</p>
                <p className="text-zinc-300 pt-1 font-semibold">{viewingOrder.deliveryAddress}</p>
                <p className="text-[11px] text-amber-400 font-mono pt-1">
                  Payment Method: {viewingOrder.paymentMethod || 'Cash on Delivery'}
                </p>
              </div>

              {viewingOrder.bKashTransactionId && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <p className="font-bold">bKash Payment Info:</p>
                  <p className="font-mono">
                    Transaction ID: <span className="font-bold text-amber-400">{viewingOrder.bKashTransactionId}</span>
                  </p>
                  <p className="font-mono text-zinc-300">
                    Sender Mobile: {viewingOrder.bKashSenderMobile || 'N/A'}
                  </p>
                </div>
              )}

              <div className="divide-y divide-zinc-800/80">
                <p className="font-bold text-white pb-2">Ordered Products:</p>
                {viewingOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span className="text-zinc-300">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-mono text-white">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm text-white">
                <span>Total Order Amount:</span>
                <span className="font-mono text-amber-400">{formatCurrency(viewingOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition cursor-pointer"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

