# Village Management Frontend

Frontend aplikasi manajemen desa berbasis **Next.js 16**, TypeScript, dan Tailwind CSS.

## Features

- ✅ **Authentication** — Login & register dengan JWT (role: Admin / Warga)
- ✅ **Route Protection** — Protected layout per-role, server-side redirect di halaman `/`
- ✅ **Public Pages** — Lihat kegiatan & tanya AI hukum
- ✅ **Warga Dashboard** — Riwayat donasi, Smart Farm AI, profil
- ✅ **Admin Dashboard** — Kelola kegiatan, verifikasi donasi, manajemen user
- ✅ **Responsive Design** — Mobile-first, works on all devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context (Auth)
- **API Client**: Axios (dengan interceptor JWT & 401 handling)
- **Validation**: Zod (client-side forms)

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:5858`

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local sesuai URL backend

# Run development server
npm run dev
```

Aplikasi tersedia di `http://localhost:3000`

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login & Register (guest-only)
│   ├── (public)/         # Public pages (kegiatan, tanya-hukum, smartfarm)
│   ├── admin/            # Admin dashboard (role: ADMIN)
│   └── warga/            # Warga dashboard (role: WARGA)
├── components/
│   ├── ui/               # Base UI components (Button, Card, LoadingScreen, dll.)
│   ├── auth/             # AuthProvider & ProtectedRoute
│   └── Navbar.tsx
├── services/             # API service layer (per domain)
├── hooks/                # useAuth
├── types/                # Shared TypeScript types
└── lib/                  # Axios instance & helpers
```

## API Services

Semua API call dihandle melalui service files di `src/services/`:

| File                   | Domain                            |
| ---------------------- | --------------------------------- |
| `auth.service.ts`      | Login, register, logout           |
| `kegiatan.service.ts`  | Kegiatan desa                     |
| `donasi.service.ts`    | Submit & kelola donasi            |
| `ai.service.ts`        | Tanya AI hukum                    |
| `smartfarm.service.ts` | Smart Farm AI                     |
| `admin.service.ts`     | Admin dashboard & user management |

## Routing

### Public Routes

| Path             | Deskripsi                     |
| ---------------- | ----------------------------- |
| `/kegiatan`      | Daftar kegiatan desa          |
| `/kegiatan/[id]` | Detail kegiatan + form donasi |
| `/tanya-hukum`   | AI Legal Q&A                  |
| `/smartfarm`     | Smart Farm (public info)      |
| `/login`         | Halaman login                 |
| `/register`      | Halaman registrasi            |

### Protected Routes

**Warga** (`role: WARGA`):

| Path               | Deskripsi       |
| ------------------ | --------------- |
| `/warga/dashboard` | Dashboard warga |
| `/warga/donasi`    | Riwayat donasi  |
| `/warga/smartfarm` | Kelola tanaman  |

**Admin** (`role: ADMIN`):

| Path               | Deskripsi             |
| ------------------ | --------------------- |
| `/admin/dashboard` | Dashboard statistik   |
| `/admin/kegiatan`  | Kelola kegiatan       |
| `/admin/donasi`    | Approve/reject donasi |
| `/admin/users`     | Manajemen user        |

## Development

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # Lint
```

## License

MIT
