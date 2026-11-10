'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PublicCartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQuantity, clearCart, currentUser } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-[80vh] py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Guitart Merchandise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review your selected official Guitart accessories, picks, cables, & apparel.
          </p>
        </div>

        <Link
          href="/merchandise"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Your Cart is Empty</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              You have not added any merchandise or guitar accessories to your shopping cart.
            </p>
          </div>
          <Link
            href="/merchandise"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/40 cursor-pointer"
          >
            <span>Explore Merchandise Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List Left */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white">Cart Items ({cart.length})</h3>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {cart.map((item) => (
                <div key={item.product.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.product.name}</h4>
                      <p className="text-xs font-mono text-amber-400 mt-0.5">
                        {formatCurrency(item.product.price)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto w-full sm:w-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-950 p-1">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white font-mono">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="text-sm font-bold text-white font-mono min-w-[70px] text-right">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary & Checkout Button Right */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl sticky top-28">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-white font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Delivery Charge</span>
                <span className="text-zinc-500 italic text-xs">Calculated at checkout</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between text-base font-bold text-white">
                <span>Total (Excl. delivery)</span>
                <span className="font-mono text-amber-400 text-lg">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-sm transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[11px] text-zinc-500 text-center">
              Delivery zone charges & promo coupons applied on the next step.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
