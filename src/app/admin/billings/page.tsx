'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { formatCurrency } from '@/lib/utils';
import { Coupon, NoticeBoard, DeliveryFees } from '@/lib/types';
import {
  Truck,
  Tag,
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Layers,
  Save,
  Radio,
  ExternalLink,
  Info,
  X,
  Copy,
  Sliders,
  Bell,
  Eye,
  Pencil,
  Smartphone,
} from 'lucide-react';

export default function AdminBillingsPage() {
  const {
    deliveryFees,
    coupons,
    noticeBoard,
    platformSettings,
    updatePlatformSettings,
    updateDeliveryFees,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    updateNoticeBoard,
  } = useStore();

  // --- Section 1: bKash Number & Delivery Fees State ---
  const [bKashNumber, setBKashNumber] = useState<string>(platformSettings?.bKashNumber || '01711-000000');
  const [insideDhaka, setInsideDhaka] = useState<number>(deliveryFees?.insideDhaka ?? 80);
  const [outsideDhaka, setOutsideDhaka] = useState<number>(deliveryFees?.outsideDhaka ?? 150);
  const [isSavingFees, setIsSavingFees] = useState(false);
  const [feesSavedSuccess, setFeesSavedSuccess] = useState(false);

  useEffect(() => {
    if (deliveryFees) {
      setInsideDhaka(deliveryFees.insideDhaka);
      setOutsideDhaka(deliveryFees.outsideDhaka);
    }
  }, [deliveryFees]);

  useEffect(() => {
    if (platformSettings?.bKashNumber) {
      setBKashNumber(platformSettings.bKashNumber);
    }
  }, [platformSettings?.bKashNumber]);

  const handleSaveDeliveryFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFees(true);
    setFeesSavedSuccess(false);
    
    // Save bKash receiver number site-wide
    updatePlatformSettings({ bKashNumber: bKashNumber.trim() });
    
    await updateDeliveryFees({
      insideDhaka: Number(insideDhaka) || 0,
      outsideDhaka: Number(outsideDhaka) || 0,
    });
    
    setIsSavingFees(false);
    setFeesSavedSuccess(true);
    setTimeout(() => setFeesSavedSuccess(false), 3500);
  };

  // --- Section 2: Coupons State ---
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(10);
  const [newMinOrderAmount, setNewMinOrderAmount] = useState<string>('500');
  const [newMaxDiscount, setNewMaxDiscount] = useState<string>('500');
  const [newExpiryDate, setNewExpiryDate] = useState<string>('');
  const [newUsageLimit, setNewUsageLimit] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [couponError, setCouponError] = useState('');
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    if (!newCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    if (newDiscountValue <= 0) {
      setCouponError('Discount value must be greater than 0.');
      return;
    }

    setIsCreatingCoupon(true);
    const res = await createCoupon({
      code: newCode.trim().toUpperCase(),
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue),
      minOrderAmount: newMinOrderAmount ? Number(newMinOrderAmount) : undefined,
      maxDiscount: newDiscountType === 'percentage' && newMaxDiscount ? Number(newMaxDiscount) : undefined,
      isActive: true,
      expiryDate: newExpiryDate || undefined,
      usageLimit: newUsageLimit ? Number(newUsageLimit) : undefined,
      description: newDescription.trim() || undefined,
    });
    setIsCreatingCoupon(false);

    if (res.success) {
      setShowCreateCouponModal(false);
      setNewCode('');
      setNewDiscountType('percentage');
      setNewDiscountValue(10);
      setNewMinOrderAmount('500');
      setNewMaxDiscount('500');
      setNewExpiryDate('');
      setNewUsageLimit('');
      setNewDescription('');
    } else {
      setCouponError(res.error || 'Failed to create coupon.');
    }
  };

  // Edit Coupon State
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDiscountType, setEditDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [editDiscountValue, setEditDiscountValue] = useState<number>(10);
  const [editMinOrderAmount, setEditMinOrderAmount] = useState<string>('');
  const [editMaxDiscount, setEditMaxDiscount] = useState<string>('');
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [editUsageLimit, setEditUsageLimit] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditCode(coupon.code);
    setEditDiscountType(coupon.discountType);
    setEditDiscountValue(coupon.discountValue);
    setEditMinOrderAmount(coupon.minOrderAmount ? String(coupon.minOrderAmount) : '');
    setEditMaxDiscount(coupon.maxDiscount ? String(coupon.maxDiscount) : '');
    setEditExpiryDate(coupon.expiryDate || '');
    setEditUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setEditDescription(coupon.description || '');
    setEditIsActive(coupon.isActive);
    setEditError('');
  };

  const handleSaveEditedCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    setEditError('');

    if (!editCode.trim()) {
      setEditError('Please enter a coupon code.');
      return;
    }
    if (editDiscountValue <= 0) {
      setEditError('Discount value must be greater than 0.');
      return;
    }

    setIsSavingEdit(true);
    const res = await updateCoupon(editingCoupon.id, {
      code: editCode.trim().toUpperCase(),
      discountType: editDiscountType,
      discountValue: Number(editDiscountValue),
      minOrderAmount: editMinOrderAmount ? Number(editMinOrderAmount) : undefined,
      maxDiscount: editDiscountType === 'percentage' && editMaxDiscount ? Number(editMaxDiscount) : undefined,
      expiryDate: editExpiryDate || undefined,
      usageLimit: editUsageLimit ? Number(editUsageLimit) : undefined,
      description: editDescription.trim() || undefined,
      isActive: editIsActive,
    });
    setIsSavingEdit(false);

    if (res.success) {
      setEditingCoupon(null);
    } else {
      setEditError(res.error || 'Failed to update coupon.');
    }
  };

  const copyCouponCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedCouponId(coupon.id);
    setTimeout(() => setCopiedCouponId(null), 2000);
  };

  // --- Section 3: Notice Board State ---
  const [noticeActive, setNoticeActive] = useState<boolean>(noticeBoard?.isActive ?? false);
  const [noticeTitle, setNoticeTitle] = useState<string>(noticeBoard?.title || '');
  const [noticeMessage, setNoticeMessage] = useState<string>(noticeBoard?.message || '');
  const [noticeType, setNoticeType] = useState<'info' | 'warning' | 'announcement' | 'event'>(
    noticeBoard?.type || 'announcement'
  );
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeSavedSuccess, setNoticeSavedSuccess] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  useEffect(() => {
    if (noticeBoard) {
      setNoticeActive(noticeBoard.isActive);
      setNoticeTitle(noticeBoard.title);
      setNoticeMessage(noticeBoard.message);
      setNoticeType(noticeBoard.type);
    }
  }, [noticeBoard]);

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotice(true);
    setNoticeSavedSuccess(false);

    await updateNoticeBoard({
      isActive: noticeActive,
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
      type: noticeType,
      linkLabel: undefined,
      linkUrl: undefined,
    });

    setIsSavingNotice(false);
    setNoticeSavedSuccess(true);
    setTimeout(() => setNoticeSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Billings & Notice Management"
        subtitle="Manage delivery zone fees, promotional coupons, & global academy website popup announcements."
      />

      <div className="px-6 space-y-10 max-w-7xl mx-auto">
        {/* Navigation jump pills */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#section-delivery-fees"
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-xs font-bold text-zinc-300 hover:text-amber-400 transition flex items-center gap-2"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>1. bKash & Delivery Fees</span>
          </a>
          <a
            href="#section-coupons"
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-xs font-bold text-zinc-300 hover:text-amber-400 transition flex items-center gap-2"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Promotional Coupons</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
              {coupons.length}
            </span>
          </a>
          <a
            href="#section-notice-board"
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-xs font-bold text-zinc-300 hover:text-amber-400 transition flex items-center gap-2"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Website Popup Notice</span>
            {noticeActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </a>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: BKASH RECEIVER & DELIVERY FEE MANAGEMENT                        */}
        {/* ========================================================================= */}
        <section
          id="section-delivery-fees"
          className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Section 1: Live Payment & Delivery Sync</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                bKash Receiver & Delivery Rates
              </h2>
              <p className="text-xs text-zinc-400">
                Set academy bKash merchant number and delivery fees. These sync live to student checkout and FAQ.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Synced to Checkout</span>
            </div>
          </div>

          <form onSubmit={handleSaveDeliveryFees} className="space-y-6">
            {/* Academy bKash Receiver Phone Number */}
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Academy bKash Merchant / Personal Receiver Number</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-medium">Checkout Synced</span>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                  bKash Account Number *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={bKashNumber}
                    onChange={(e) => setBKashNumber(e.target.value)}
                    placeholder="e.g. 01711-000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500 transition shadow-inner"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-zinc-400">
                Students and customers will complete their bKash Send Money / Merchant payments to this exact number during checkout.
              </p>
            </div>

            {/* Delivery Rates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inside Dhaka */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Inside Dhaka Zone
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Metro Delivery</span>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                    Delivery Charge (৳ BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-zinc-500 font-mono text-sm">৳</span>
                    <input
                      type="number"
                      min={0}
                      value={insideDhaka}
                      onChange={(e) => setInsideDhaka(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Applied when students select <span className="text-white font-semibold">Inside Dhaka</span> at checkout.
                </p>
              </div>

              {/* Outside Dhaka */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Outside Dhaka Zone
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Nationwide Courier</span>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                    Delivery Charge (৳ BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-zinc-500 font-mono text-sm">৳</span>
                    <input
                      type="number"
                      min={0}
                      value={outsideDhaka}
                      onChange={(e) => setOutsideDhaka(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Applied when students select <span className="text-white font-semibold">Outside Dhaka</span> at checkout.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Any changes saved here will be reflected instantly for all students during checkout.</span>
              </div>

              <div className="flex items-center gap-3">
                {feesSavedSuccess && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Rates & bKash Synced Live!
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSavingFees}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingFees ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save bKash & Delivery Rates</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: PROMOTIONAL COUPON CODES                                        */}
        {/* ========================================================================= */}
        <section
          id="section-coupons"
          className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
                <Tag className="w-3.5 h-3.5" />
                <span>Section 2: Discounts & Coupons</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Promotional Coupon Codes
              </h2>
              <p className="text-xs text-zinc-400">
                Offer percentage (%) or fixed amount (৳) discounts on official gear & merchandise.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateCouponModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Coupon</span>
            </button>
          </div>

          {/* Coupon List */}
          {coupons.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Coupons Created Yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Click &quot;Create New Coupon&quot; to offer discounts for masterclass students and fans.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => {
                const isPercentage = coupon.discountType === 'percentage';
                const isCopied = copiedCouponId === coupon.id;

                return (
                  <div
                    key={coupon.id}
                    className={`p-5 rounded-2xl border transition space-y-4 flex flex-col justify-between ${
                      coupon.isActive
                        ? 'bg-zinc-950/90 border-zinc-800 hover:border-amber-500/40 shadow-xl'
                        : 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Code Badge & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono font-extrabold text-sm tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCouponCode(coupon)}
                            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                            title="Copy code"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            coupon.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      {/* Discount Value */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white font-mono">
                          {isPercentage ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold uppercase font-mono">
                          {isPercentage ? 'Discount' : 'Flat Off'}
                        </span>
                      </div>

                      {/* Description */}
                      {coupon.description && (
                        <p className="text-xs text-zinc-300 leading-relaxed">{coupon.description}</p>
                      )}

                      {/* Conditions */}
                      <div className="space-y-1 text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-800/80">
                        {coupon.minOrderAmount ? (
                          <div className="flex justify-between">
                            <span>Min Order:</span>
                            <span className="text-zinc-200">৳{coupon.minOrderAmount}</span>
                          </div>
                        ) : null}

                        {isPercentage && coupon.maxDiscount ? (
                          <div className="flex justify-between">
                            <span>Max Cap:</span>
                            <span className="text-zinc-200">৳{coupon.maxDiscount}</span>
                          </div>
                        ) : null}

                        {coupon.expiryDate ? (
                          <div className="flex justify-between">
                            <span>Expires:</span>
                            <span className="text-amber-400/90">{coupon.expiryDate}</span>
                          </div>
                        ) : null}

                        <div className="flex justify-between items-center">
                          <span>Usages / Limit:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">
                              {coupon.usageCount || 0}
                              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                            </span>
                            {coupon.usageLimit ? (
                              (coupon.usageCount || 0) >= coupon.usageLimit ? (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                                  Limit Reached
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  ({coupon.usageLimit - (coupon.usageCount || 0)} left)
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                (Unlimited)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCouponStatus(coupon.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            coupon.isActive
                              ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                        >
                          {coupon.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCoupon(coupon)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Edit coupon details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete coupon code "${coupon.code}"?`)) {
                            deleteCoupon(coupon.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: ACADEMY NOTICE BOARD & POPUP BROADCASTER                       */}
        {/* ========================================================================= */}
        <section
          id="section-notice-board"
          className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Section 3: Global Website Popup</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Academy Notice Board & Popup Manager
              </h2>
              <p className="text-xs text-zinc-400">
                Broadcast announcements, masterclass alerts, or notifications that appear as a dismissable popup modal for visitors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLivePreviewModal(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Preview Popup</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <input
                  type="checkbox"
                  checked={noticeActive}
                  onChange={(e) => setNoticeActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/20 accent-amber-500 cursor-pointer"
                />
                <span
                  className={`text-xs font-mono font-bold ${
                    noticeActive ? 'text-emerald-400' : 'text-zinc-400'
                  }`}
                >
                  {noticeActive ? 'Live Broadcasting Active' : 'Broadcast Disabled'}
                </span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSaveNotice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Form Inputs */}
              <div className="md:col-span-7 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. 🎸 Live Masterclass with Ershad Zaman!"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                    Notice Message / Description *
                  </label>
                  <textarea
                    rows={4}
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="Enter detailed notice content, schedule, or instructions for students..."
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                    Notice Badge & Theme Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'announcement', label: 'Announcement', color: 'text-amber-400 border-amber-500/30' },
                      { id: 'event', label: 'Event / Masterclass', color: 'text-purple-400 border-purple-500/30' },
                      { id: 'warning', label: 'Important Alert', color: 'text-rose-400 border-rose-500/30' },
                      { id: 'info', label: 'Information', color: 'text-blue-400 border-blue-500/30' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNoticeType(t.id as any)}
                        className={`px-3 py-2 rounded-xl border text-center font-semibold transition cursor-pointer ${
                          noticeType === t.id
                            ? `bg-zinc-800 ${t.color} font-bold shadow-md`
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Live Preview Box */}
              <div className="md:col-span-5 space-y-2">
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Modal Visual Preview</span>
                  <span className="text-[10px] text-amber-400">Visitor Perspective</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-4 shadow-2xl relative">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                        GUITART ACADEMY NOTICE
                      </span>
                    </div>
                    <div className="p-1 rounded-lg bg-zinc-900 text-zinc-400 text-xs">✕</div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {noticeTitle || 'Notice Title Will Appear Here'}
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                      {noticeMessage || 'Detailed notice message text will be displayed here for website visitors.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Notice Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  When enabled, visitors will see this announcement modal once per session with a close cross (✕) button.
                </span>
              </div>

              <div className="flex items-center gap-3">
                {noticeSavedSuccess && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Notice Broadcast Saved!
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSavingNotice}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingNotice ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save & Broadcast Notice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* --- CREAT      {/* --- CREATE COUPON MODAL --- */}
      {showCreateCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-900 shrink-0">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>New Promotion</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">Create Coupon Code</h3>
                <p className="text-xs text-zinc-400">
                  Define discount values, minimum order thresholds, and expiration dates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateCouponModal(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {couponError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                {/* Code */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20 or ERSHAD500"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold uppercase focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewDiscountType('percentage')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        newDiscountType === 'percentage'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Percentage (%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewDiscountType('fixed')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        newDiscountType === 'fixed'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="font-mono text-sm">৳</span>
                      <span>Fixed Amount (৳)</span>
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    {newDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Fixed Discount Amount (৳ BDT) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono">
                      {newDiscountType === 'percentage' ? '%' : '৳'}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={newDiscountType === 'percentage' ? 100 : undefined}
                      value={newDiscountValue}
                      onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                {/* Min Order & Max Cap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Minimum Order Amount (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newMinOrderAmount}
                      onChange={(e) => setNewMinOrderAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {newDiscountType === 'percentage' && (
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Max Discount Cap (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newMaxDiscount}
                        onChange={(e) => setNewMaxDiscount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Expiration Date & Usages Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Usages Number (Optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newUsageLimit}
                      onChange={(e) => setNewUsageLimit(e.target.value)}
                      placeholder="e.g. 50 (Unlimited)"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">
                      No value means Unlimited uses
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. 10% off for new guitar students"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateCouponModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCoupon}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isCreatingCoupon ? 'Creating...' : 'Create & Activate Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT COUPON MODAL --- */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-3xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-900 shrink-0">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Promotion</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Edit Coupon: <span className="text-amber-400 font-mono">{editingCoupon.code}</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Modify discount rate, minimum order conditions, or status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {editError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditedCoupon} className="space-y-4 text-xs">
                {/* Code */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold uppercase focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditDiscountType('percentage')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        editDiscountType === 'percentage'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Percentage (%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditDiscountType('fixed')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        editDiscountType === 'fixed'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="font-mono text-sm">৳</span>
                      <span>Fixed Amount (৳)</span>
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    {editDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Fixed Discount Amount (৳ BDT) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono">
                      {editDiscountType === 'percentage' ? '%' : '৳'}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={editDiscountType === 'percentage' ? 100 : undefined}
                      value={editDiscountValue}
                      onChange={(e) => setEditDiscountValue(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                {/* Min Order & Max Cap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Minimum Order Amount (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editMinOrderAmount}
                      onChange={(e) => setEditMinOrderAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {editDiscountType === 'percentage' && (
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Max Discount Cap (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editMaxDiscount}
                        onChange={(e) => setEditMaxDiscount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Expiration Date & Usages Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Usages Number (Optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editUsageLimit}
                      onChange={(e) => setEditUsageLimit(e.target.value)}
                      placeholder="e.g. 50 (Unlimited)"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">
                      No value means Unlimited uses
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="e.g. 10% off for new guitar students"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Status Toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/20 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-zinc-300">
                      Coupon is currently active & redeemable
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingCoupon(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Coupon Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- LIVE PREVIEW POPUP MODAL --- */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative gold-border-glow my-auto max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowLivePreviewModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/50">
                <Megaphone className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                <span>{noticeType}</span>
              </div>
              <h3 className="text-xl font-black text-white leading-tight">
                {noticeTitle || 'Academy Announcement'}
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                {noticeMessage || 'Notice message body will appear here for visitors.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
