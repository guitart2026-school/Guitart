'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/types';
import { Package, Plus, Search, Edit3, Trash2, CheckCircle2, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary, deleteImageFromCloudinary, isCloudinaryUrl } from '@/lib/uploadClient';

export default function AdminMerchandisePage() {
  const { products, createProduct, updateProduct, deleteProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1000);
  const [stock, setStock] = useState<number>(20);
  const [category, setCategory] = useState<'Accessories' | 'Apparel' | 'Learning Material' | 'Guitars'>('Accessories');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80');
  const [isActive, setIsActive] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice(1000);
    setStock(20);
    setCategory('Accessories');
    setImageUrl('https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80');
    setIsActive(true);
    setUploadError('');
    setEditingProduct(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const res = await uploadImageToCloudinary(file, 'guitart_academy/merchandise');
      if (res.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    setIsDeletingImage(true);
    setUploadError('');

    try {
      if (isCloudinaryUrl(imageUrl)) {
        await deleteImageFromCloudinary(imageUrl);
      }
      setImageUrl('');
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to delete image from Cloudinary.');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setStock(p.stock);
    setCategory(p.category);
    setImageUrl(p.images[0] || '');
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        images: [imageUrl],
        isActive,
      });
    } else {
      createProduct({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        images: [imageUrl],
        isActive,
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Merchandise Catalog Management"
        subtitle="Manage signature pick packs, leather straps, hoodies, stock quantities, & pricing."
      />

      <div className="px-6 space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Categories</option>
              <option value="Accessories">Accessories</option>
              <option value="Apparel">Apparel</option>
              <option value="Learning Material">Learning Material</option>
            </select>

            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-950/40 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Package className="w-4 h-4 text-amber-400" />
            <span>Official Store Products ({filteredProducts.length})</span>
          </h3>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8" />}
              title="No Products Found"
              description="No merchandise products match your search query."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 px-4">Product Name</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Category</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Price</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Stock</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Status</th>
                    <th className="pb-3 px-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-4 px-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white leading-snug">{p.name}</p>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-zinc-300 whitespace-nowrap">{p.category}</td>
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">{formatCurrency(p.price)}</td>
                      <td className="py-4 px-4 font-mono text-zinc-300 whitespace-nowrap">{p.stock} units</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={p.isActive ? 'Active' : 'Inactive'} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Guitart Premium Leather Strap"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Price (BDT) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  >
                    <option value="Accessories">Accessories</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Learning Material">Learning Material</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-xs">
                    Product Image (Cloudinary)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload to Cloudinary</span>
                        </>
                      )}
                    </button>

                    {imageUrl && (
                      <button
                        type="button"
                        disabled={isDeletingImage || isUploadingImage}
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Remove image and delete from Cloudinary"
                      >
                        {isDeletingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                            <span>Removing...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Remove</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-700 shrink-0 bg-zinc-900"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400 font-medium">{uploadError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isActiveToggle" className="text-zinc-300 font-semibold cursor-pointer">
                  Active in Public Merchandise Catalog
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingProductId}
        title="Delete Product"
        description="Are you sure you want to remove this product from the merchandise catalog?"
        confirmText="Delete Product"
        isDestructive
        onConfirm={() => {
          if (deletingProductId) deleteProduct(deletingProductId);
        }}
        onClose={() => setDeletingProductId(null)}
      />
    </div>
  );
}
