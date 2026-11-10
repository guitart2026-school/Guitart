'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Search, Store, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function PublicMerchandiseCatalogPage() {
  const { products, addToCart } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  const activeProducts = products.filter((p) => p.isActive);

  const filteredProducts = activeProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <Store className="w-3.5 h-3.5" />
            <span>Official Academy Store</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
            Guitart Gear & <span className="text-amber-400">Merchandise</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Official signature guitar accessories, handcrafted leather straps, stage apparel, & exclusive learning materials.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition self-start md:self-auto px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gear & products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          <span className="text-zinc-400 font-mono text-[11px] shrink-0 mr-1">Category:</span>
          {['All', 'Accessories', 'Apparel', 'Learning Material'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl border font-semibold transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md shadow-amber-950/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Products Found</h3>
          <p className="text-xs text-zinc-400">
            No items matched your current search or category filter. Try clearing filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-bold transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-amber-500/40 transition flex flex-col justify-between group shadow-2xl"
            >
              <div>
                <div className="aspect-square relative overflow-hidden bg-zinc-950">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-zinc-950/85 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-mono font-bold text-amber-400 border border-zinc-800 shadow-md">
                    {product.category}
                  </div>
                </div>

                <div className="p-6 space-y-2.5">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
                    {product.description}
                  </p>
                  <p className="text-2xl font-black text-amber-400 font-mono pt-2">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <Link
                  href={`/merchandise/${product.id}`}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-center font-bold text-xs transition"
                >
                  View Details
                </Link>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className={`px-4 py-3 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer ${
                    addedIds[product.id]
                      ? 'bg-emerald-500 text-zinc-950 shadow-emerald-950/40'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/40'
                  }`}
                >
                  {addedIds[product.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
