'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { HomepageSection, LegalPolicies, PolicyPageContent } from '@/lib/types';
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Sparkles,
  Upload,
  Loader2,
  Image as ImageIcon,
  Trash2,
  FileText,
  ShieldCheck,
  Scale,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Star,
  Quote,
  MessageSquare,
} from 'lucide-react';
import { uploadImageToCloudinary, deleteImageFromCloudinary, isCloudinaryUrl } from '@/lib/uploadClient';

export default function AdminCmsPage() {
  const {
    cmsSections,
    updateCmsSection,
    toggleCmsSection,
    moveCmsSection,
    legalPolicies,
    updateLegalPolicy,
    reviews,
    deleteReview,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'homepage' | 'reviews' | 'policies'>('homepage');
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<keyof LegalPolicies>('privacyPolicy');

  // Homepage CMS states
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Policy CMS Form states
  const currentPolicy = legalPolicies?.[selectedPolicyKey] || {
    title: '',
    subtitle: '',
    lastUpdated: 'March 2026',
    content: '',
  };

  const [policyTitle, setPolicyTitle] = useState(currentPolicy.title);
  const [policySubtitle, setPolicySubtitle] = useState(currentPolicy.subtitle);
  const [policyLastUpdated, setPolicyLastUpdated] = useState(currentPolicy.lastUpdated);
  const [policyContent, setPolicyContent] = useState(currentPolicy.content);

  // Update policy form states when selectedPolicyKey or legalPolicies change
  React.useEffect(() => {
    if (legalPolicies?.[selectedPolicyKey]) {
      const p = legalPolicies[selectedPolicyKey];
      setPolicyTitle(p.title);
      setPolicySubtitle(p.subtitle);
      setPolicyLastUpdated(p.lastUpdated);
      setPolicyContent(p.content);
    }
  }, [selectedPolicyKey, legalPolicies]);

  const sortedSections = [...cmsSections].sort((a, b) => a.order - b.order);

  const handleOpenEdit = (sec: HomepageSection) => {
    setEditingSection(sec);
    setTitle(sec.title);
    setSubtitle(sec.subtitle || '');
    setContent(sec.content);
    setImageUrl(sec.imageUrl || '');
    setButtonText(sec.buttonText || '');
    setButtonLink(sec.buttonLink || '');
    setUploadError('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const res = await uploadImageToCloudinary(file, 'guitart_academy/cms');
      if (res.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload section image to Cloudinary.');
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
      setUploadError(err?.message || 'Failed to delete section image from Cloudinary.');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    updateCmsSection(editingSection.id, {
      title,
      subtitle,
      content,
      imageUrl,
      buttonText,
      buttonLink,
    });

    setEditingSection(null);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    updateLegalPolicy(selectedPolicyKey, {
      title: policyTitle,
      subtitle: policySubtitle,
      lastUpdated: policyLastUpdated,
      content: policyContent,
    });
  };

  const policyPublicUrls: { [key in keyof LegalPolicies]: string } = {
    privacyPolicy: '/privacy-policy',
    termsOfService: '/terms-of-service',
    bkashFaq: '/bkash-faq',
  };

  return (
    <div className="space-y-8 font-sans">
      <DashboardHeader
        title="Content Management System (CMS)"
        subtitle="Manage public landing page sections and edit legal policy & FAQ content."
      />

      <div className="px-6 space-y-6 max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('homepage')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'homepage'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Homepage Modules CMS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Student Reviews ({reviews?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'policies'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Legal Policies & FAQ CMS</span>
          </button>
        </div>

        {/* TAB 1: Homepage CMS */}
        {activeTab === 'homepage' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-bold">Live CMS Customization:</span> Rearranging section order or editing copy will instantly update the public Guitart landing page.
              </p>
            </div>

            {/* Sections List */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Homepage Section Ordering & Content ({sortedSections.length})</span>
              </h3>

              <div className="space-y-3">
                {sortedSections.map((sec, index) => (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                      sec.enabled
                        ? 'bg-zinc-950/80 border-zinc-800 hover:border-amber-500/40'
                        : 'bg-zinc-950/30 border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Order controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveCmsSection(sec.id, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveCmsSection(sec.id, 'down')}
                          disabled={index === sortedSections.length - 1}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-bold text-amber-400 w-6">
                        #{sec.order}
                      </span>

                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {sec.title}
                        </h4>
                        {sec.subtitle && (
                          <p className="text-xs text-zinc-400 line-clamp-1">{sec.subtitle}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCmsSection(sec.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          sec.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        }`}
                      >
                        {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{sec.enabled ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(sec)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition cursor-pointer"
                        title="Edit Section Content"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Student Reviews Management */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="leading-relaxed">
                  <span className="font-bold">Student Reviews Showcase:</span> All student feedback and star ratings submitted from the student portal appear live in the animated marquee on the landing page.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs shrink-0">
                {reviews?.length || 0} Total Reviews
              </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 shadow-xl relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                        <span className="text-xs font-mono font-bold text-zinc-400 ml-1.5">
                          {rev.rating}.0 / 5.0
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the review by "${rev.name}"?`)) {
                            deleteReview(rev.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-300 italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1 truncate">
                        {rev.name} <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      </h4>
                      <p className="text-[11px] text-amber-400 font-mono truncate">{rev.level}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{rev.studentEmail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Legal Policies & FAQ CMS */}
        {activeTab === 'policies' && (
          <div className="space-y-6 animate-fade-in">
            {/* Policy Selector Sub-tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPolicyKey('privacyPolicy')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                    selectedPolicyKey === 'privacyPolicy'
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPolicyKey('termsOfService')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                    selectedPolicyKey === 'termsOfService'
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Terms of Service</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPolicyKey('bkashFaq')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                    selectedPolicyKey === 'bkashFaq'
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>bKash Payment FAQ</span>
                </button>
              </div>

              <Link
                href={policyPublicUrls[selectedPolicyKey]}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-bold"
              >
                <span>View Live Page ({policyPublicUrls[selectedPolicyKey]})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Policy Editor Form */}
            <form onSubmit={handleSavePolicy} className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Editing: {currentPolicy.title}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Modifying this copy updates the live public page at {policyPublicUrls[selectedPolicyKey]}.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Policy Changes</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-bold uppercase tracking-wider mb-1.5">
                      Page Main Title *
                    </label>
                    <input
                      type="text"
                      value={policyTitle}
                      onChange={(e) => setPolicyTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold uppercase tracking-wider mb-1.5">
                      Last Updated Display (e.g. March 2026)
                    </label>
                    <input
                      type="text"
                      value={policyLastUpdated}
                      onChange={(e) => setPolicyLastUpdated(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold uppercase tracking-wider mb-1.5">
                    Page Subtitle / Overview
                  </label>
                  <input
                    type="text"
                    value={policySubtitle}
                    onChange={(e) => setPolicySubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-zinc-300 font-bold uppercase tracking-wider">
                      Policy Body Content (Use ### For Section Titles) *
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Markdown ### Headings supported
                    </span>
                  </div>
                  <textarea
                    rows={14}
                    value={policyContent}
                    onChange={(e) => setPolicyContent(e.target.value)}
                    className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Publish Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Edit CMS Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit CMS Section: {editingSection.id}</h3>
              <button onClick={() => setEditingSection(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Content Body *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Button Copy</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Button Link</label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-xs">
                    Section Image (Cloudinary)
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
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </button>

                    {imageUrl && (
                      <button
                        type="button"
                        disabled={isDeletingImage || isUploadingImage}
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Remove section image and delete from Cloudinary"
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
                      alt="Section Preview"
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

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg cursor-pointer"
                >
                  Save Section Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
