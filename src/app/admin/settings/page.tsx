'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { SocialIcon } from '@/components/shared/SocialIcon';
import { SocialMediaLink, SocialMediaPlatform } from '@/lib/types';
import { DEFAULT_SOCIAL_LINKS } from '@/lib/mockData';
import {
  Settings,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  User,
  Shield,
  ShieldCheck,
  Camera,
  Upload,
  Link as LinkIcon,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  AlertCircle,
  KeyRound,
  Check,
  Calendar,
  Building,
  Sliders,
  Loader2,
  Trash2,
  Globe,
  Share2,
  Plus,
  ExternalLink,
  Clock,
  Copy,
} from 'lucide-react';
import { uploadImageToCloudinary, deleteImageFromCloudinary, isCloudinaryUrl } from '@/lib/uploadClient';

const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

const AVAILABLE_PLATFORMS: { value: SocialMediaPlatform; label: string; placeholder: string }[] = [
  { value: 'youtube', label: 'YouTube Channel', placeholder: 'https://youtube.com/@yourchannel' },
  { value: 'facebook', label: 'Facebook Page', placeholder: 'https://facebook.com/yourpage' },
  { value: 'instagram', label: 'Instagram Profile', placeholder: 'https://instagram.com/yourhandle' },
  { value: 'tiktok', label: 'TikTok Account', placeholder: 'https://tiktok.com/@yourhandle' },
  { value: 'spotify', label: 'Spotify Artist', placeholder: 'https://open.spotify.com/artist/...' },
  { value: 'soundcloud', label: 'SoundCloud Tracks', placeholder: 'https://soundcloud.com/yourhandle' },
  { value: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/yourhandle' },
  { value: 'whatsapp', label: 'WhatsApp Helpline', placeholder: 'https://wa.me/8801711000000' },
  { value: 'telegram', label: 'Telegram Channel', placeholder: 'https://t.me/yourchannel' },
  { value: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/yourprofile' },
  { value: 'website', label: 'Official Website', placeholder: 'https://yourwebsite.com' },
  { value: 'custom', label: 'Custom Link', placeholder: 'https://...' },
];

export default function AdminSettingsPage() {
  const {
    currentUser,
    adminName,
    updateProfile,
    updateUserPassword,
    requestPasswordResetLink,
    platformSettings,
    updatePlatformSettings,
    addToast,
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'platform'>('profile');

  // Admin Profile Form States
  const [fullName, setFullName] = useState(currentUser?.fullName || adminName || 'Ershad Zaman');
  const [mobile, setMobile] = useState(currentUser?.mobile || '+880 1711-000000');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '1982-06-15');
  const [avatarUrl, setAvatarUrl] = useState(
    currentUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Platform Configuration States
  const [bKashNumber, setBKashNumber] = useState(platformSettings?.bKashNumber || '01711-000000');
  const [academyEmail, setAcademyEmail] = useState(platformSettings?.academyEmail || 'ershad@guitart.com');
  const [academyPhone, setAcademyPhone] = useState(platformSettings?.academyPhone || '+880 1711-000000');
  const [address, setAddress] = useState(platformSettings?.address || 'Banani, Dhaka-1213, Bangladesh');
  const [faviconUrl, setFaviconUrl] = useState(platformSettings?.faviconUrl || '/favicon.ico');

  // Social & Media Links States
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>(
    platformSettings?.socialLinks || []
  );
  const [selectedPlatformToAdd, setSelectedPlatformToAdd] = useState<SocialMediaPlatform>('youtube');

  // Favicon Upload & Delete States
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isDeletingFavicon, setIsDeletingFavicon] = useState(false);
  const [faviconError, setFaviconError] = useState('');
  const [showFaviconUrlInput, setShowFaviconUrlInput] = useState(false);
  const [customFaviconInput, setCustomFaviconInput] = useState('');

  // Feedback States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [platformSaved, setPlatformSaved] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  // Admin Password Reset Link States (10-min TTL)
  const [adminResetUrl, setAdminResetUrl] = useState('');
  const [adminResetToken, setAdminResetToken] = useState('');
  const [isGeneratingResetLink, setIsGeneratingResetLink] = useState(false);
  const [adminResetSuccess, setAdminResetSuccess] = useState('');
  const [adminResetError, setAdminResetError] = useState('');
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (currentUser && !isInitializedRef.current) {
      setFullName(currentUser.fullName || 'Ershad Zaman');
      setMobile(currentUser.mobile || '+880 1711-000000');
      setDateOfBirth(currentUser.dateOfBirth || '1982-06-15');
      if (currentUser.avatarUrl) setAvatarUrl(currentUser.avatarUrl);
      isInitializedRef.current = true;
    }
  }, [currentUser]);

  useEffect(() => {
    if (platformSettings) {
      setBKashNumber(platformSettings.bKashNumber || '01711-000000');
      setAcademyEmail(platformSettings.academyEmail || 'ershad@guitart.com');
      setAcademyPhone(platformSettings.academyPhone || '+880 1711-000000');
      setAddress(platformSettings.address || 'Banani, Dhaka-1213, Bangladesh');
      if (platformSettings.faviconUrl) {
        setFaviconUrl(platformSettings.faviconUrl);
      }
      if (Array.isArray(platformSettings.socialLinks)) {
        setSocialLinks(platformSettings.socialLinks);
      }
    }
  }, [platformSettings]);

  // Social Links management handlers
  const handleToggleSocialLink = (id: string) => {
    setSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEnabled: !item.isEnabled } : item))
    );
  };

  const handleUpdateSocialUrl = (id: string, url: string) => {
    setSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url } : item))
    );
  };

  const handleUpdateSocialLabel = (id: string, label: string) => {
    setSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  };

  const handleDeleteSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddSocialPlatform = () => {
    const platformConfig = AVAILABLE_PLATFORMS.find((p) => p.value === selectedPlatformToAdd);
    const newLink: SocialMediaLink = {
      id: `soc-${Date.now()}`,
      platform: selectedPlatformToAdd,
      label: platformConfig?.label || 'Social Link',
      url: '',
      isEnabled: true,
    };
    setSocialLinks((prev) => [...prev, newLink]);
  };

  // Handle direct Cloudinary image upload (No local fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await uploadImageToCloudinary(file, 'guitart_academy/admins');
      if (res.url) {
        setAvatarUrl(res.url);
        setProfileSuccess('Image uploaded to Cloudinary successfully! ✨ Click "Save Profile Changes" to save.');
      } else {
        setProfileError('Upload succeeded but no Cloudinary URL was returned.');
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle photo removal / deletion from Cloudinary
  const handleRemovePhoto = async () => {
    if (!avatarUrl) return;

    setIsDeletingImage(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      if (isCloudinaryUrl(avatarUrl)) {
        await deleteImageFromCloudinary(avatarUrl);
      }
      setAvatarUrl(DEFAULT_ADMIN_AVATAR);
      setProfileSuccess('Photo removed from Cloudinary! ✨ Click "Save Profile Changes" to save.');
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to delete photo from Cloudinary.');
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

  // Save Admin Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        dateOfBirth,
        avatarUrl,
      });

      updatePlatformSettings({
        directorName: fullName.trim(),
      });

      if (res.success) {
        setProfileSuccess('Admin profile and avatar updated successfully! ✨');
        setTimeout(() => setProfileSuccess(''), 4000);
      } else {
        setProfileError(res.error || 'Failed to update admin profile.');
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Error updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Send Admin Password Reset Email
  const handleGenerateAdminResetLink = async () => {
    setIsGeneratingResetLink(true);
    setAdminResetSuccess('');
    setAdminResetError('');

    const targetEmail = currentUser?.email || 'admin@guitart.com';
    try {
      const res = await requestPasswordResetLink(targetEmail);
      if (res.success) {
        setAdminResetSuccess(`Password reset email sent to ${targetEmail}! Please check your inbox. 📧`);
      } else {
        setAdminResetError(res.error || 'Failed to send reset email.');
      }
    } catch (err: any) {
      setAdminResetError(err?.message || 'Error sending reset email.');
    } finally {
      setIsGeneratingResetLink(false);
    }
  };

  const handleCopyAdminLink = () => {
    if (!adminResetUrl) return;
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${adminResetUrl}` : adminResetUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedAdminLink(true);
    setTimeout(() => setCopiedAdminLink(false), 3000);
  };

  // Handle direct Favicon upload to Cloudinary
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    setFaviconError('');

    try {
      const res = await uploadImageToCloudinary(file, 'guitart_academy/branding');
      if (res.url) {
        setFaviconUrl(res.url);
        updatePlatformSettings({ faviconUrl: res.url });
        addToast('Favicon uploaded to Cloudinary & synced site-wide! ✨', 'success');
      } else {
        setFaviconError('Upload succeeded but no Cloudinary URL was returned.');
      }
    } catch (err: any) {
      setFaviconError(err?.message || 'Failed to upload favicon to Cloudinary.');
    } finally {
      setIsUploadingFavicon(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Favicon removal & deletion from Cloudinary
  const handleRemoveFavicon = async () => {
    if (!faviconUrl || faviconUrl === '/favicon.ico') return;

    setIsDeletingFavicon(true);
    setFaviconError('');

    try {
      if (isCloudinaryUrl(faviconUrl)) {
        await deleteImageFromCloudinary(faviconUrl);
      }
      setFaviconUrl('/favicon.ico');
      updatePlatformSettings({ faviconUrl: '/favicon.ico' });
      addToast('Favicon removed from Cloudinary & reset to default! ✨', 'info');
    } catch (err: any) {
      setFaviconError(err?.message || 'Failed to remove favicon from Cloudinary.');
    } finally {
      setIsDeletingFavicon(false);
    }
  };

  const handleApplyCustomFavicon = () => {
    if (customFaviconInput.trim()) {
      setFaviconUrl(customFaviconInput.trim());
      updatePlatformSettings({ faviconUrl: customFaviconInput.trim() });
      setShowFaviconUrlInput(false);
      setCustomFaviconInput('');
      addToast('Custom Favicon URL applied & synced site-wide! ✨', 'success');
    }
  };

  // Save Platform Settings
  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings({
      bKashNumber: bKashNumber.trim(),
      academyEmail: academyEmail.trim(),
      academyPhone: academyPhone.trim(),
      address: address.trim(),
      faviconUrl,
      socialLinks,
    });
    addToast('Academy platform & media settings saved successfully! ⚙️', 'success');
    setPlatformSaved(true);
    setTimeout(() => setPlatformSaved(false), 3500);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <DashboardHeader
        title="Admin Settings & Profile"
        subtitle={`Manage ${adminName} admin profile, security credentials, academy contacts, & media links.`}
      />

      <div className="px-6 space-y-6 max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'profile'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Admin Profile & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('platform')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'platform'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Platform & bKash Config</span>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-8 animate-fade-in">
            {/* Admin Profile Form */}
            <form
              onSubmit={handleSaveProfile}
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Administrator Profile Details</h2>
                    <p className="text-xs text-zinc-400">Update your avatar, director name, and contact details</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Role: Academy Director
                </span>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Admin Profile Picture
                </label>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative group shrink-0">
                    <img
                      src={
                        avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={fullName || 'Admin Avatar'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl shadow-amber-950/30 group-hover:border-amber-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                      title="Upload custom image"
                    >
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span>Change</span>
                    </button>
                  </div>

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
                            <span>Upload Photo</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Image Link</span>
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
                          placeholder="Paste image URL (https://...)"
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

              {profileSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Form Input Grid */}
              <div className="space-y-4 text-xs">
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

                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={currentUser?.email || 'ershad@guitart.com'}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-zinc-400 text-sm font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                      Mobile Contact Number
                    </label>
                    <div className="relative group">
                      <Phone className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white font-medium text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner font-mono"
                      />
                    </div>
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

            {/* Admin Password & Security (Secure Link System) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Administrator Password Security</h2>
                    <p className="text-xs text-zinc-400">Manage credentials via secure password reset link</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Single-Use Link</span>
                </div>
              </div>

              {adminResetSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{adminResetSuccess}</span>
                </div>
              )}

              {adminResetError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{adminResetError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium">Administrator Account Email:</span>
                    <span className="font-mono font-bold text-white bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                      {currentUser?.email || 'admin@guitart.com'}
                    </span>
                  </div>

                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    To maintain the highest security standard for the Guitart academy platform, administrator passwords are reset through single-use encrypted verification links dispatched via secure Gmail SMTP to your registered email inbox.
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
                  onClick={handleGenerateAdminResetLink}
                  disabled={isGeneratingResetLink}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingResetLink ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Password Reset Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Platform & bKash Configuration Tab */
          <form
            onSubmit={handleSavePlatform}
            className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-8 shadow-xl animate-fade-in"
          >
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-4">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Academy Platform & Payment Configuration</h3>
                <p className="text-xs text-zinc-400">Configure bKash receiver phone number, contacts, & social media links</p>
              </div>
            </div>

            {platformSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Academy platform configuration saved successfully!</span>
              </div>
            )}

            <div className="space-y-6 text-xs">
              {/* Favicon Upload & Remove Section */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shrink-0 overflow-hidden p-1.5 shadow-inner">
                      <img
                        src={faviconUrl || '/favicon.ico'}
                        alt="Favicon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/favicon.ico';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">Website Favicon</h4>
                        {faviconUrl && faviconUrl !== '/favicon.ico' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-medium">
                            Cloudinary Synced
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-medium">
                            Default Favicon
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Upload custom favicon (.ico, .png, .svg, .webp) to Cloudinary. Syncs site-wide in real-time.
                      </p>
                    </div>
                  </div>

                  {/* Actions: Upload, URL, Remove */}
                  <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml,image/webp,image/jpeg,image/vnd.microsoft.icon,image/ico"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingFavicon || isDeletingFavicon}
                      onClick={() => faviconInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingFavicon ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Favicon</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isUploadingFavicon || isDeletingFavicon}
                      onClick={() => setShowFaviconUrlInput(!showFaviconUrlInput)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Favicon URL</span>
                    </button>

                    {faviconUrl && faviconUrl !== '/favicon.ico' && (
                      <button
                        type="button"
                        disabled={isDeletingFavicon || isUploadingFavicon}
                        onClick={handleRemoveFavicon}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Remove favicon and delete from Cloudinary"
                      >
                        {isDeletingFavicon ? (
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

                {faviconError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{faviconError}</span>
                  </div>
                )}

                {showFaviconUrlInput && (
                  <div className="flex items-center gap-2 animate-fade-in pt-2">
                    <input
                      type="url"
                      value={customFaviconInput}
                      onChange={(e) => setCustomFaviconInput(e.target.value)}
                      placeholder="Paste direct favicon link (https://...)"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomFavicon}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* bKash Number */}
              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                  Academy bKash Merchant / Personal Receiver Number <span className="text-amber-400">*</span>
                </label>
                <p className="text-[11px] text-zinc-500">
                  This number is shown to students during merchandise and course checkout for Send Money / Payment.
                </p>
                <div className="relative group">
                  <Smartphone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={bKashNumber}
                    onChange={(e) => setBKashNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500 transition shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                    Academy Support Email
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                    <input
                      type="email"
                      value={academyEmail}
                      onChange={(e) => setAcademyEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 transition shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                    Academy Contact Phone
                  </label>
                  <div className="relative group">
                    <Phone className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                    <input
                      type="tel"
                      value={academyPhone}
                      onChange={(e) => setAcademyPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 transition shadow-inner font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Studio Address */}
              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-mono font-bold uppercase tracking-wider">
                  Academy Studio Physical Address
                </label>
                <div className="relative group">
                  <MapPin className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 transition shadow-inner"
                  />
                </div>
              </div>

              {/* DEDICATED SOCIAL & MEDIA LINKS MANAGEMENT SECTION */}
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>Official Social & Media Links ({socialLinks.length})</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Select platforms, provide your channel URLs, and toggle visibility for the public footer.
                    </p>
                  </div>

                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 self-start sm:self-auto">
                    Live Footer Sync
                  </span>
                </div>

                {/* Live Preview Bar */}
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Active Footer Icons:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {socialLinks.filter((l) => l.isEnabled && l.url.trim()).length > 0 ? (
                      socialLinks
                        .filter((l) => l.isEnabled && l.url.trim())
                        .map((l) => (
                          <div
                            key={l.id}
                            className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-700 flex items-center justify-center text-amber-400 shadow-sm"
                            title={`${l.label} (${l.platform})`}
                          >
                            <SocialIcon platform={l.platform} className="w-3.5 h-3.5" />
                          </div>
                        ))
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic">No active links configured</span>
                    )}
                  </div>
                </div>

                {/* Social Links List */}
                <div className="space-y-3">
                  {socialLinks.map((link) => {
                    const platformMeta = AVAILABLE_PLATFORMS.find((p) => p.value === link.platform);
                    return (
                      <div
                        key={link.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${link.isEnabled
                            ? 'bg-zinc-900 border-zinc-800'
                            : 'bg-zinc-900/40 border-zinc-850 opacity-60'
                          }`}
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-750 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                            <SocialIcon platform={link.platform} className="w-4 h-4" />
                          </div>

                          <div className="min-w-[120px]">
                            <span className="font-bold text-white text-xs block">
                              {platformMeta?.label || link.platform}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono capitalize">
                              {link.platform}
                            </span>
                          </div>
                        </div>

                        {/* Input URL field */}
                        <div className="flex-1 w-full sm:w-auto min-w-[200px]">
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => handleUpdateSocialUrl(link.id, e.target.value)}
                            placeholder={platformMeta?.placeholder || 'https://...'}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition"
                          />
                        </div>

                        {/* Actions: Toggle, Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSocialLink(link.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${link.isEnabled
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}
                          >
                            {link.isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{link.isEnabled ? 'Active' : 'Hidden'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSocialLink(link.id)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 border border-transparent transition cursor-pointer"
                            title="Remove platform"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Platform Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                    <span className="text-xs text-zinc-400 font-semibold shrink-0">
                      Add Platform:
                    </span>
                    <select
                      value={selectedPlatformToAdd}
                      onChange={(e) => setSelectedPlatformToAdd(e.target.value as SocialMediaPlatform)}
                      className="w-full sm:w-56 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {AVAILABLE_PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSocialPlatform}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Social Channel</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-black text-xs transition shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Platform Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
