import React from 'react';
import { Lock, Unlock, CheckCircle2, Clock, AlertCircle, Truck, PackageCheck, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'lesson' | 'attendance' | 'order' | 'payment' | 'level' | 'default';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  let colorStyle = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  let icon = null;

  const s = status.toLowerCase();

  if (s === 'locked') {
    colorStyle = 'bg-rose-950/50 text-rose-300 border-rose-800/50';
    icon = <Lock className="w-3 h-3 mr-1 shrink-0" />;
  } else if (s === 'unlocked' || s === 'active' || s === 'approved' || s === 'present' || s === 'verified' || s === 'delivered' || s === 'confirmed') {
    colorStyle = 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50';
    icon = <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />;
  } else if (s === 'completed') {
    colorStyle = 'bg-amber-950/60 text-amber-300 border-amber-500/50 gold-glow';
    icon = <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />;
  } else if (s === 'in progress' || s === 'processing' || s === 'shipped') {
    colorStyle = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
    icon = s === 'shipped' ? <Truck className="w-3 h-3 mr-1 shrink-0" /> : <Clock className="w-3 h-3 mr-1 shrink-0 animate-spin" />;
  } else if (s === 'pending' || s === 'pending approval' || s === 'waiting' || s === 'late') {
    colorStyle = 'bg-amber-950/50 text-amber-300 border-amber-500/50';
    icon = <Clock className="w-3 h-3 mr-1 shrink-0" />;
  } else if (s === 'rejected' || s === 'denied' || s === 'absent' || s === 'cancelled' || s === 'inactive' || s === 'failed') {
    colorStyle = 'bg-rose-950/50 text-rose-300 border-rose-800/50';
    icon = <Ban className="w-3 h-3 mr-1 shrink-0" />;
  } else if (s === 'excused') {
    colorStyle = 'bg-sky-950/50 text-sky-300 border-sky-800/50';
    icon = <AlertCircle className="w-3 h-3 mr-1 shrink-0" />;
  } else if (s === 'beginner') {
    colorStyle = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
  } else if (s === 'intermediate') {
    colorStyle = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
  } else if (s === 'advanced') {
    colorStyle = 'bg-purple-950/40 text-purple-300 border-purple-800/40';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm ${sizeClasses} ${colorStyle}`}
    >
      {icon}
      {status}
    </span>
  );
};
