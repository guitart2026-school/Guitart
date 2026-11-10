'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowLeft, Plus, Minus, ShieldCheck, Truck, ArrowRight, Check } from 'lucide-react';

export default function PublicProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { products, addToCart } = useStore();
  const product = products.find((p) => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-mono">Product Not Found</h2>
        <p className="text-xs text-zinc-400">The product you are looking for does not exist or has been removed.</p>
        <Link href="/merchandise" className="inline-block px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition">
          Return to Merchandise Store
        </Link>
      </div>
    );
  }

  const handleAddToCart = (andCheckout: boolean = false) => {
    addToCart(product, quantity);
    setIsAdded(true);
    if (andCheckout) {
      router.push('/cart');
    } else {
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.isActive))
    .slice(0, 3);

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 animate-fade-in">
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <Link
          href="/merchandise"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Merchandise Catalog
        </Link>

        <span className="text-xs font-mono text-zinc-500">
          Category: <strong className="text-amber-400">{product.category}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery Left */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-zinc-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-amber-400 border border-zinc-800 shadow-lg">
              {product.category}
            </div>
          </div>
        </div>

        {/* Details Right */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              Official Guitart Gear
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono pt-2">
              {formatCurrency(product.price)}
            </p>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed font-light">
            {product.description}
          </p>

          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-white font-mono">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                className={`py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white hover:border-zinc-700'
                }`}
              >
                {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4 text-amber-400" />}
                <span>{isAdded ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                className="py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buy Now ({formatCurrency(product.price * quantity)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs text-zinc-400 border-t border-zinc-800/80">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Dhaka Delivery in 24-48 Hours</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>bKash & Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-zinc-800/80 space-y-6">
          <h3 className="text-xl font-bold text-white font-mono">You May Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/merchandise/${p.id}`}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition group space-y-3"
              >
                <div className="aspect-video rounded-xl overflow-hidden bg-zinc-950">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition truncate">
                    {p.name}
                  </h4>
                  <p className="text-xs font-mono text-amber-400 font-bold mt-1">
                    {formatCurrency(p.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
