import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '৳0';
  return `৳${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const year = parts[0];
    if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
      return `${months[monthIndex]} ${day}, ${year}`;
    }
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Converts any YouTube URL format (standard watch URL, short URL, youtu.be, or video ID)
 * into a valid, embeddable YouTube iframe URL (https://www.youtube.com/embed/VIDEO_ID).
 */
export function formatYouTubeEmbedUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  // Match 11-character YouTube ID from various URL patterns
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  );

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Handle raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  return trimmed;
}

/**
 * Extracts a Google Drive file ID from standard share/view URLs.
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{20,})/i
  );
  return match ? match[1] : null;
}

/**
 * Converts a Google Drive share link or external audio link into a reliable, CORS-enabled streaming URL.
 */
export function formatGoogleDriveAudioUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Local assets can be served directly
  if (trimmed.startsWith('/') && !trimmed.startsWith('/api/audio-proxy')) {
    return trimmed;
  }

  // Route external/Google Drive links through the server-side audio proxy
  return `/api/audio-proxy?url=${encodeURIComponent(trimmed)}`;
}

/**
 * Converts a Google Drive share link to a direct download or preview link for PDF tab files.
 */
export function formatGoogleDriveDownloadUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return trimmed;
}

/**
 * Cleans a mobile number by stripping out spaces, dashes, and international prefix (+880).
 */
export function cleanMobileNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('880') && cleaned.length === 13) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

/**
 * Pure Vanilla JavaScript validation for 11-digit mobile contact number.
 * Ensures the phone number is strictly 11 digits (e.g. 01712345678, 018..., 019...).
 */
export function isValidMobile(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = cleanMobileNumber(phone);
  return /^01[3-9]\d{8}$/.test(cleaned) || /^\d{11}$/.test(cleaned);
}

/**
 * Helper to determine if a lesson is unlocked for a student.
 * Checks all possible student identifiers (id, firebaseUid, email, roster match) against lessonAccess records.
 */
export function isLessonUnlockedForStudent(
  lesson: { id: string; lessonNumber: number; isPublic?: boolean },
  user: { id?: string; firebaseUid?: string; email?: string } | null,
  usersRoster: { id: string; firebaseUid?: string; email: string }[],
  lessonAccess: { studentId: string; lessonId: string; isUnlocked: boolean }[]
): boolean {
  if (lesson.lessonNumber === 1 || lesson.isPublic) return true;
  if (!user) return false;

  const rosterStudent = usersRoster.find(
    (u) =>
      (user.id && u.id === user.id) ||
      (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
  );

  const studentIdentifiers = Array.from(
    new Set(
      [
        user.id,
        user.firebaseUid,
        user.email?.toLowerCase(),
        rosterStudent?.id,
        rosterStudent?.firebaseUid,
        rosterStudent?.email?.toLowerCase(),
      ].filter(Boolean)
    )
  ) as string[];

  const acc = lessonAccess.find(
    (la) => studentIdentifiers.includes(la.studentId) && la.lessonId === lesson.id
  );

  return acc ? acc.isUnlocked : lesson.lessonNumber === 1;
}
