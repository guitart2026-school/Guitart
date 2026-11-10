'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';

export const MerchSection: React.FC = () => {
  const { products, addToCart } = useStore();

  const featuredMerch = products.slice(0, 3);

  return (
    <section id="merchandise" className="py-24 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              Official Store
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Guitart Gear & <span className="text-amber-400">Merchandise</span>
            </h2>
            <p className="text-zinc-400 text-base">
              Signature pick packs, handcrafted leather guitar straps, academy hoodies, & hardcover workbooks.
            </p>
          </div>

          <Link
            href="/merchandise"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 font-bold text-sm transition self-start md:self-auto"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredMerch.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-amber-500/40 transition flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="aspect-square relative overflow-hidden bg-zinc-950">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 border border-zinc-800">
                    {product.category}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-xl font-extrabold text-amber-400 font-mono pt-2">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <Link
                  href={`/merchandise/${product.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-center font-bold text-xs transition"
                >
                  Details
                </Link>

                <button
                  onClick={() => addToCart(product, 1)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-950/40 shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
