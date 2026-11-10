'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, CreditCard, Calendar, Truck, ArrowRight } from 'lucide-react';

export default function StudentOrdersPage() {
  const { orders, currentUser } = useStore();

  const studentId = currentUser?.id || '';

  // Filter orders for student
  const studentOrders = studentId ? orders.filter((o) => o.studentId === studentId) : [];

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="My Order History"
        subtitle="Track your gear merchandise orders, bKash verification status, & delivery shipments."
      />

      <div className="px-6 space-y-8">
        {studentOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title="No Orders Found"
            description="You have not placed any merchandise orders yet."
            actionText="Visit Merchandise Store"
            onAction={() => window.location.href = '/student/merchandise'}
          />
        ) : (
          <div className="space-y-6">
            {studentOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl hover:border-amber-500/30 transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-white font-mono">{order.id}</span>
                      <span className="text-xs text-zinc-400 font-mono">Placed on {formatDate(order.createdAt)}</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Deliver to: <span className="text-zinc-200">{order.deliveryAddress}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                    <StatusBadge status={order.orderStatus} type="order" />
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-zinc-800/60">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-800"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{item.product.name}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {formatCurrency(item.product.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold font-mono text-white">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Payment Info */}
                <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 text-zinc-400">
                    <p>
                      Payment Method:{' '}
                      <span className="text-white font-bold">{order.paymentMethod}</span>
                      {order.bKashTransactionId && (
                        <span> (TxID: <span className="font-mono text-amber-400">{order.bKashTransactionId}</span>)</span>
                      )}
                    </p>
                    {order.paymentStatus === 'Pending' && order.paymentMethod === 'bKash' && (
                      <p className="text-[11px] text-amber-400 italic">
                        * Payment verification pending manual review by Admin.
                      </p>
                    )}
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <span className="text-zinc-400 block text-[11px]">Total Paid (Inc. Delivery):</span>
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
