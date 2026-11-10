'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StudentLevel } from '@/lib/types';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Save,
  CheckCircle2,
  Check,
  Camera,
  Upload,
  Link as LinkIcon,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
  KeyRound,
  Loader2,
  Trash2,
  Clock,
  Copy,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { uploadImageToCloudinary, deleteImageFromCloudinary, isCloudinaryUrl } from '@/lib/uploadClient';
import { isValidMobile, cleanMobileNumber } from '@/lib/utils';

const LEVEL_OPTIONS: {
  id: StudentLevel;
  title: string;
  badge: string;
  description: string;
}[] = [
  {
    id: 'Beginner',
    title: 'Beginner',
    badge: 'Level 1',
    description: 'Open Chords, Strumming & Basics',
  },
  {
    id: 'Intermediate',
    title: 'Intermediate',
    badge: 'Level 2',
    description: 'CAGED, Pentatonic & Scales',
  },
  {
    id: 'Advanced',
    title: 'Advanced',
    badge: 'Level 3',
    description: 'Lead Solos, Sweep & Speed',
  },
];

export default function StudentProfilePage() {
  const { currentUser, users, adminName, updateProfile, updateUserPassword, requestPasswordResetLink, refreshCurrentUser } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Status & Feedback States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Reset Email States
  const [isGeneratingResetLink, setIsGeneratingResetLink] = useState(false);
  const [linkResetSuccess, setLinkResetSuccess] = useState('');
  const [linkResetError, setLinkResetError] = useState('');

  // Compute live active skill level by matching currentUser against users store
  const currentStudentInRoster = currentUser
    ? users.find(
        (u) =>
          u.id === currentUser.id ||
          (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : null;
  const currentSkillLevel = currentStudentInRoster?.level || currentUser?.level || 'Beginner';

  const isInitializedRef = useRef(false);

  // Sync fresh profile from DB on mount
  useEffect(() => {
    setMounted(true);
    refreshCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && !isInitializedRef.current) {
      setFullName(currentUser.fullName || '');
      setMobile(currentUser.mobile || '');
      setDateOfBirth(currentUser.dateOfBirth || '');
      if (currentUser.avatarUrl) setAvatarUrl(currentUser.avatarUrl);
      isInitializedRef.current = true;
    }
  }, [currentUser]);

  // Handle direct Cloudinary image upload (No local fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    try {
      const res = await uploadImageToCloudinary(file, 'guitart_academy/students');
      if (res.url) {
        setAvatarUrl(res.url);
        setProfileSuccessMsg('Image uploaded to Cloudinary successfully! ✨ Click "Save Profile Changes" to save your profile.');
      } else {
        setProfileErrorMsg('Upload succeeded but no Cloudinary URL was returned.');
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle photo removal / deletion from Cloudinary
  const handleRemovePhoto = async () => {
    if (!avatarUrl) return;

    setIsDeletingImage(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    try {
      if (isCloudinaryUrl(avatarUrl)) {
        await deleteImageFromCloudinary(avatarUrl);
      }
      setAvatarUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80');
      setProfileSuccessMsg('Photo removed from Cloudinary! ✨ Click "Save Profile Changes" to save.');
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Failed to delete photo from Cloudinary.');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setShowUrlInput(false);
      setCustomUrlInput('');
    }
  };

  // Save Profile Handler (Student can edit identity, mobile, DOB, avatar - Skill Level is strictly Admin-only)
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    const cleaned = cleanMobileNumber(mobile);
    if (!cleaned) {
      setProfileErrorMsg('Mobile contact number is required to access your student account & lessons.');
      return;
    }

    if (!isValidMobile(cleaned)) {
      setProfileErrorMsg('Please enter a valid 11-digit mobile number (e.g. 01712345678).');
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        mobile: cleaned,
        dateOfBirth,
        avatarUrl,
      });

      if (res.success) {
        setMobile(cleaned);
        setProfileSuccessMsg('Profile details and avatar updated successfully! ✨');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      } else {
        setProfileErrorMsg(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Error updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Send Password Reset Email
  const handleGenerateStudentResetLink = async () => {
    if (!currentUser?.email) return;
    setIsGeneratingResetLink(true);
    setLinkResetSuccess('');
    setLinkResetError('');

    try {
      const res = await requestPasswordResetLink(currentUser.email);
      if (res.success) {
        setLinkResetSuccess(`Password reset instructions sent to ${currentUser.email}! Please check your inbox. 📧`);
      } else {
        setLinkResetError(res.error || 'Failed to send reset email.');
      }
    } catch (err: any) {
      setLinkResetError(err?.message || 'Error sending reset email.');
    } finally {
      setIsGeneratingResetLink(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Student Account Profile"
        subtitle="Manage your profile image, personal details, contact information, guitar level, & account security."
      />

      <div className="px-6 space-y-8 max-w-4xl mx-auto">
        {/* Profile Card Form */}
        <form
          onSubmit={handleProfileSave}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Title */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Personal Information & Avatar</h2>
                <p className="text-xs text-zinc-400">Update your student identity and skill level</p>
              </div>
            </div>
          </div>

          {/* Avatar Selector Section */}
          <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
              Profile Avatar
            </label>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <img
                  src={
                    avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={fullName || 'Student Avatar'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80';
                  }}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl shadow-amber-950/30 group-hover:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                  title="Upload image from computer"
                >
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span>Change</span>
                </button>
              </div>

              {/* Avatar Actions & Presets */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Image</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Image URL</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDeletingImage || isUploadingImage}
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Remove uploaded photo and delete from Cloudinary"
                  >
                    {isDeletingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Remove Photo</span>
                      </>
                    )}
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-2 animate-fade-in pt-1">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="Paste image link (https://...)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white font-medium text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                  Email Address
                </label>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Student Account
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={currentUser?.email || 'student@guitart.com'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-zinc-400 text-sm font-mono cursor-not-allowed"
                />
              </div>
            </div>

            {/* Mobile & DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider text-xs">
                    Mobile Contact Number <span className="text-amber-400">*</span>
                  </label>
                  {mobile && (
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        isValidMobile(mobile) ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {cleanMobileNumber(mobile).length}/11 digits {isValidMobile(mobile) ? '(Valid)' : ''}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="01712345678 (11 digits)"
                    maxLength={15}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border text-white font-medium text-sm focus:outline-none transition shadow-inner font-mono ${
                      mobile && !isValidMobile(mobile)
                        ? 'border-amber-500/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25'
                        : mobile && isValidMobile(mobile)
                        ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25'
                        : 'border-zinc-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25'
                    }`}
                    required
                  />
                </div>
                {mobile && !isValidMobile(mobile) && (
                  <p className="text-[11px] text-amber-400 font-mono">
                    Must be exactly 11 digits (e.g. 01712345678).
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                  Date of Birth
                </label>
                <div className="relative group">
                  <Calendar className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white font-medium text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Guitar Skill Level (Strictly Admin-Controlled) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guitar Skill Level Classification</span>
                </label>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono font-medium">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Admin Controlled</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LEVEL_OPTIONS.map((opt) => {
                  const isCurrent = currentSkillLevel.toLowerCase() === opt.id.toLowerCase();
                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between select-none ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/60'
                          : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isCurrent
                              ? 'bg-amber-500 text-zinc-950 font-black'
                              : 'bg-zinc-900 text-zinc-500'
                          }`}
                        >
                          {opt.badge}
                        </span>
                        {isCurrent ? (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <Lock className="w-3 h-3 text-zinc-600" />
                        )}
                      </div>

                      <div>
                        <div
                          className={`text-sm font-bold tracking-tight ${
                            isCurrent ? 'text-amber-400 flex items-center gap-1.5' : 'text-zinc-400'
                          }`}
                        >
                          <span>{opt.title}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug font-sans">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informative Admin-Managed Notice */}
              <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-400 font-sans">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Your skill level classification is verified and managed by <strong className="text-zinc-200">Academy Director ({adminName})</strong>. For batch reassessment or level upgrade requests, please contact academy administration.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-black text-xs transition shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSavingProfile ? 'Saving Details...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Account Security & Password */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Account Security & Password</h2>
                <p className="text-xs text-zinc-400">Reset your portal login password via secure email verification</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Single-Use Link</span>
            </div>
          </div>

          {linkResetSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{linkResetSuccess}</span>
            </div>
          )}

          {linkResetError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{linkResetError}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Registered Student Email:</span>
                <span className="font-mono font-bold text-white bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                  {currentUser?.email || 'student@guitart.com'}
                </span>
              </div>

              <p className="text-zinc-400 leading-relaxed text-[11px]">
                To maintain the highest security standard for your Guitart student account, passwords are reset through single-use encrypted verification links dispatched via secure Gmail SMTP to your registered email inbox.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted 24-byte cryptographic tokenization</span>
            </div>

            <button
              type="button"
              onClick={handleGenerateStudentResetLink}
              disabled={isGeneratingResetLink}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingResetLink ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Mail...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Password Reset Mail</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
