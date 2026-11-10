'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, isValidMobile } from '@/lib/utils';
import { PaymentMethod, Coupon } from '@/lib/types';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Smartphone,
  Info,
  DollarSign,
  Tag,
  X,
  Sparkles,
  Check,
  ShoppingBag,
  ShieldCheck,
  Copy,
  Clock
} from 'lucide-react';

export default function ProfessionalCheckoutPage() {
  const router = useRouter();
  const { cart, currentUser, placeOrder, deliveryFees, validateCoupon, platformSettings } = useStore();

  // Dynamic delivery fees synced from admin billing settings
  const insideFee = deliveryFees?.insideDhaka ?? 80;
  const outsideFee = deliveryFees?.outsideDhaka ?? 150;

  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerMobile, setCustomerMobile] = useState(currentUser?.mobile || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [bKashTxId, setBKashTxId] = useState('');
  const [bKashSender, setBKashSender] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const deliveryCharge = deliveryZone === 'inside' ? insideFee : outsideFee;
  const deliveryMethod = deliveryZone === 'inside' ? `Inside Dhaka (${formatCurrency(insideFee)})` : `Outside Dhaka (${formatCurrency(outsideFee)})`;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  const handleCopyBkash = () => {
    const num = platformSettings?.bKashNumber || '01711-000000';
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(num.replace(/\s+/g, ''));
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  if (cart.length === 0 && !placedOrder) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-5 max-w-md mx-auto animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Cart is Empty</h2>
          <p className="text-sm text-zinc-400">
            Please add items to your cart before proceeding to checkout.
          </p>
        </div>
        <Link
          href="/merchandise"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-950/40 cursor-pointer"
        >
          <span>Explore Merchandise Store</span>
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccessMsg('');

    if (!couponCodeInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const res = validateCoupon(couponCodeInput.trim(), subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      setCouponSuccessMsg(
        `Coupon "${res.coupon.code}" applied! You saved ${formatCurrency(res.discount)}.`
      );
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError(res.error || 'Invalid or expired coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput('');
    setCouponError('');
    setCouponSuccessMsg('');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName || !customerMobile || !customerEmail || !deliveryAddress) {
      setErrorMsg('Please fill in all customer and delivery details.');
      return;
    }

    if (!isValidMobile(customerMobile)) {
      setErrorMsg('Please provide a valid 11-digit mobile contact number for delivery (e.g. 01712345678).');
      return;
    }

    if (paymentMethod === 'bKash' && !bKashTxId) {
      setErrorMsg('Please enter your bKash Transaction ID after completing payment.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newOrder = placeOrder({
        studentId: currentUser?.id || 'guest',
        customerName,
        customerMobile,
        customerEmail,
        deliveryAddress,
        deliveryMethod,
        deliveryCharge,
        items: cart,
        subtotal,
        couponCode: appliedCoupon?.code,
        couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
        totalAmount,
        paymentMethod,
        bKashTransactionId: paymentMethod === 'bKash' ? bKashTxId : undefined,
        bKashSenderMobile: paymentMethod === 'bKash' ? bKashSender : undefined,
      });
      setPlacedOrder(newOrder);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fade-in text-zinc-100 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Checkout & Order
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Complete your delivery information and select your payment method.
          </p>
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition self-start sm:self-auto px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
      </div>

      {placedOrder ? (
        /* Order Confirmation Screen */
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-6 max-w-2xl mx-auto shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
            <CheckCircle2 className="w-8 h-8 text-amber-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Order Placed Successfully!
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Thank you for ordering with Guitart. Your order reference has been confirmed and is being processed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5 text-sm text-left">
            <div className="flex justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-zinc-400">Order Reference</span>
              <span className="font-mono text-amber-400 font-bold">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-zinc-400">Recipient Name</span>
              <span className="text-white font-medium">{placedOrder.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-zinc-400">Contact Number</span>
              <span className="text-white font-mono">{placedOrder.customerMobile}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-zinc-400">Delivery Address</span>
              <span className="text-white text-right max-w-[280px] font-medium leading-tight">
                {placedOrder.deliveryAddress}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-zinc-400">Delivery Method</span>
              <span className="text-zinc-300">{placedOrder.deliveryMethod}</span>
            </div>
            {placedOrder.couponCode && (
              <div className="flex justify-between border-b border-zinc-800 pb-2.5 text-emerald-400">
                <span>Coupon Applied ({placedOrder.couponCode})</span>
                <span className="font-mono font-bold">-{formatCurrency(placedOrder.couponDiscount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-zinc-400">Payment Option</span>
              <span className="text-white font-semibold">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold text-white">
              <span>Total Payable</span>
              <span className="font-mono text-amber-400 text-lg">{formatCurrency(placedOrder.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/merchandise"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-amber-950/40"
            >
              Continue Shopping
            </Link>
            {currentUser && currentUser.role === 'student' && (
              <Link
                href="/student/orders"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm transition"
              >
                View in Student Orders
              </Link>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Customer & Delivery Address */}
            <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Customer & Delivery Address
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enter recipient contact details and physical street delivery address.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Hasan"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Mobile Number <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Full Street Delivery Address <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House / Apartment, Road No, Area / Thana, City"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition resize-none"
                    required
                  />
                </div>

                {/* Delivery Zone Cards */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
                    Delivery Zone & Rates
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div
                      onClick={() => setDeliveryZone('inside')}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        deliveryZone === 'inside'
                          ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-950/30'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            deliveryZone === 'inside'
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-zinc-600'
                          }`}
                        >
                          {deliveryZone === 'inside' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Inside Dhaka</p>
                          <p className="text-xs text-zinc-400 mt-0.5">24 – 48 Hours Delivery</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {formatCurrency(insideFee)}
                      </span>
                    </div>

                    <div
                      onClick={() => setDeliveryZone('outside')}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        deliveryZone === 'outside'
                          ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-950/30'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            deliveryZone === 'outside'
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-zinc-600'
                          }`}
                        >
                          {deliveryZone === 'outside' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Outside Dhaka</p>
                          <p className="text-xs text-zinc-400 mt-0.5">2 – 4 Days Nationwide</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {formatCurrency(outsideFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Payment Method */}
            <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Choose between Cash on Delivery or instant bKash payment.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-950/30'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-zinc-600'
                    }`}
                  >
                    {paymentMethod === 'Cash on Delivery' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Cash on Delivery</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Pay in cash when package arrives</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 ${
                    paymentMethod === 'bKash'
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-950/30'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'bKash'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-zinc-600'
                    }`}
                  >
                    {paymentMethod === 'bKash' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">bKash Payment</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Send money to academy merchant</p>
                  </div>
                </div>
              </div>

              {/* bKash Payment Instructions Container */}
              {paymentMethod === 'bKash' && (
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-700/80 space-y-4 text-xs animate-fade-in shadow-inner">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">
                        bKash Payment Steps
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        1. Open your bKash App and select <strong>Send Money</strong>.
                        <br />
                        2. Send exact amount of <strong className="text-amber-400 font-mono font-bold">{formatCurrency(totalAmount)}</strong> to the merchant number below.
                      </p>
                    </div>
                  </div>

                  {/* Merchant Number Copy Box */}
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">bKash Personal / Merchant Number:</span>
                      <span className="text-base font-mono font-extrabold text-white tracking-wide">
                        {platformSettings?.bKashNumber || '01711-000000'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBkash}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Transaction ID & Sender Mobile Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        bKash Transaction ID (TrxID) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={bKashTxId}
                        onChange={(e) => setBKashTxId(e.target.value.toUpperCase())}
                        placeholder="e.g. 9J28DA10K"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm uppercase placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Sender Mobile Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={bKashSender}
                        onChange={(e) => setBKashSender(e.target.value)}
                        placeholder="e.g. 01712345678"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Review Sidebar (Right 5 Cols) */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-6 sticky top-28">
            <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">
              Order Summary ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
            </h3>

            {/* Product items breakdown */}
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1 divide-y divide-zinc-800/60">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-white truncate text-xs">{item.product.name}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Qty: <span className="text-white font-mono font-bold">{item.quantity}</span> × {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-white font-bold text-xs shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Promotional Coupon</span>
                </span>
                <span className="text-[10px] text-zinc-500">Optional</span>
              </div>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-[11px] text-emerald-300/90 font-medium">
                        -{formatCurrency(couponDiscount)} discount applied
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. GUITART)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs uppercase placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 font-bold text-xs transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
              {couponSuccessMsg && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponSuccessMsg}</span>
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-sm border-t border-zinc-800 pt-4">
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Subtotal</span>
                <span className="font-mono text-white font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>Coupon Savings ({appliedCoupon?.code})</span>
                  <span className="font-mono font-bold">-{formatCurrency(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Delivery Charge ({deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-mono text-white font-semibold">{formatCurrency(deliveryCharge)}</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline text-base font-extrabold text-white">
                <span>Total Payable</span>
                <span className="font-mono text-amber-400 text-2xl font-black">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-sm transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing Order...' : `Place Order (${formatCurrency(totalAmount)}) →`}</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Secure Checkout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Fast Delivery
              </span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
