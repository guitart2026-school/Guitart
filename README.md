# 🎸 Guitart Academy

A full-stack guitar learning platform built with **Next.js (App Router)**. It combines a public marketing site, a student portal (lessons, progress, attendance, merchandise, orders) and an admin dashboard (approvals, students, billing, CMS, reviews, orders and more).

## ✨ Features

### Public site
- Landing page with hero, about, instructor, process, featured lessons, merch, testimonials and CTA sections (CMS-driven)
- Lesson catalogue and lesson detail pages
- Merchandise store, cart and checkout (bKash payment FAQ included)
- Privacy Policy and Terms of Service pages

### Authentication
- Email/password sign-up and login (Firebase Auth + MongoDB sync)
- **Continue with Google** sign-in / sign-up
- "Remember me" sessions, forgot / reset password via Gmail SMTP
- Admin approval flow: new students are `Pending` until an admin approves them (`Active` / `Rejected`)

### Student portal (`/student/*`)
- Dashboard, profile, enrolled lessons and progress tracking
- Attendance, cart, checkout and order history
- Merchandise browsing and lesson reviews

### Admin portal (`/admin/*`)
- Dashboard with analytics (Recharts)
- Student management and approvals
- Lesson, merchandise and order management
- Attendance and billing management
- CMS for landing page sections and site settings
- Review moderation

## 🧰 Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | Firebase Authentication (Email/Password, Google) |
| Database | MongoDB via Mongoose |
| Media uploads | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Forms / validation | React Hook Form, Zod |
| Charts / icons | Recharts, Lucide React |

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (20+ recommended) and npm
- A [MongoDB](https://www.mongodb.com/) database (local or [Atlas](https://www.mongodb.com/atlas))
- A [Firebase](https://console.firebase.google.com/) project with a Web app
- A [Cloudinary](https://cloudinary.com/) account (for image / file uploads)
- *(Optional)* A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for password-reset emails

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone <your-repository-url>
cd Guitart
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows (CMD)
copy .env.example .env.local
```

See [Environment Variables](#-environment-variables) below for details.

### 3. Set up Firebase

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Go to **Authentication → Sign-in method** and enable **Email/Password** and **Google**.
   (Otherwise you will get `auth/operation-not-allowed`.)
3. Go to **Authentication → Settings → Authorized domains** and make sure `localhost` (and your production domain) is listed.
4. Go to **Project Settings → General → Your apps (Web)** and copy the config values into `.env.local`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the server whenever you change `.env.local`.

## 🔐 Environment Variables

All variables live in `.env.local` (git-ignored). Use [`.env.example`](./.env.example) as a template.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. Falls back to `mongodb://localhost:27017/guitart_academy` |
| `MONGODB_DB` | No | Database name. Defaults to `guitart` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | No | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | Google Analytics measurement ID |
| `CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary cloud name (*needed for uploads) |
| `CLOUDINARY_API_KEY` | Yes* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes* | Cloudinary API secret (server-only) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | Admin email shown / used on the client |
| `ADMIN_EMAIL` | Yes | Admin email used by server routes |
| `ADMIN_DEFAULT_EMAIL` | Yes | Email of the seeded default admin account |
| `ADMIN_DEFAULT_PASSWORD` | Yes | Password of the default admin account (**change it!**) |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | No | Client-side admin password fallback (visible in the browser bundle — prefer `ADMIN_DEFAULT_PASSWORD`) |
| `GMAIL_USER` | No | Gmail address used to send password-reset emails |
| `GMAIL_APP_PASSWORD` | No | Gmail App Password. If empty, emails are only logged to the console |
| `NEXT_PUBLIC_APP_URL` | No | Base URL for reset links. Falls back to `VERCEL_URL`, then `http://localhost:3000` |

> ⚠️ `NEXT_PUBLIC_*` variables are embedded in the browser bundle. Never put real secrets in them.

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase with ESLint |

## 📁 Project Structure

```
Guitart/
├── public/                 # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/         # login, signup, forgot-password, reset-password
│   │   ├── admin/          # Admin portal (dashboard, students, lessons, billing, CMS, ...)
│   │   ├── student/        # Student portal (dashboard, lessons, orders, profile, ...)
│   │   ├── lessons/        # Public lesson pages
│   │   ├── merchandise/    # Public store pages
│   │   ├── cart/ checkout/ # Public cart and checkout
│   │   ├── waiting-approval/
│   │   └── api/            # Route handlers (auth, users, lessons, orders, upload, ...)
│   ├── components/
│   │   ├── landing/        # Landing page sections
│   │   └── shared/         # Navbars, sidebars, modals, toasts, ...
│   ├── context/            # StoreContext (global app / auth state)
│   ├── lib/                # firebase, mongodb, cloudinary, mailer, utils, types
│   └── models/             # Mongoose models (User, Lesson, Order, Product, ...)
├── .env.example            # Environment variable template
├── next.config.ts
└── package.json
```

## 🔑 Roles & Approval Flow

1. A student signs up (email/password or Google) → account status is **Pending**.
2. The admin reviews it under **Admin → Approvals** and sets it to **Active** or **Rejected**.
3. Pending / rejected users are redirected to `/waiting-approval`.
4. Active students get access to `/student/*`; the admin account (configured via the `ADMIN_*` variables) accesses `/admin/*`.

## ☁️ Deployment

The easiest way to deploy is [Vercel](https://vercel.com/new):

1. Push the repository to GitHub and import it into Vercel.
2. Add all environment variables from `.env.example` in **Project Settings → Environment Variables**.
3. In Firebase, add your Vercel domain to **Authentication → Settings → Authorized domains**.
4. In MongoDB Atlas, allow Vercel's IPs (or `0.0.0.0/0`) under **Network Access**.
5. Deploy.

## 🛡️ Security Notes

- Never commit `.env.local` or any real credentials.
- Change the default admin password before going to production.
- Rotate any key that has been accidentally shared or committed.
- Restrict your Firebase API key and MongoDB network access for production.

## 🐛 Troubleshooting

| Problem | Fix |
| --- | --- |
| `Firebase: Error (auth/operation-not-allowed)` | Enable Email/Password and Google in Firebase → Authentication → Sign-in method |
| `Firebase credentials are missing` warning | Fill the `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` and restart the dev server |
| `auth/unauthorized-domain` | Add your domain to Firebase → Authentication → Authorized domains |
| MongoDB connection errors | Check `MONGODB_URI` and your Atlas IP allow-list |
| Password-reset email not arriving | Set `GMAIL_USER` + `GMAIL_APP_PASSWORD` (otherwise the email is only printed in the console) |
| Env changes not applied | Restart `npm run dev` |

## 📄 License

Private project — all rights reserved by Guitart Academy.
