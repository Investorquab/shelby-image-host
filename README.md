# ⬡ Shelby Vault — Decentralized Image Host on Aptos

> A Web3 image hosting app built on **[Shelby Protocol](https://shelby.xyz)** — the first decentralized hot-storage network on the **Aptos** blockchain. Upload images, get permanent shareable links, own your data on-chain.

🔗 **[Live Demo → shelby-image-host.vercel.app](https://shelby-image-host.vercel.app)**  
📂 **[GitHub → Investorquab/shelby-image-host](https://github.com/Investorquab/shelby-image-host)**

---

## What Is Shelby Vault?

Traditional image hosts (Imgur, Cloudinary, AWS S3) store your files on centralized servers. A company owns them. They can delete them, censor them, or shut down.

**Shelby Vault changes that.**

Every image you upload goes to Shelby Protocol — a decentralized hot-storage network where your file is:
- Split into pieces using **erasure coding**
- Distributed across **independent storage nodes worldwide**
- Recorded permanently on the **Aptos blockchain**
- Retrievable by anyone with your **Blob ID** or direct URL

No middlemen. No censorship. You own it.

---

## Features

| Feature | Details |
|---|---|
| 🖼️ **Image Upload** | JPG, PNG, GIF, WebP, SVG — up to 10MB |
| ⚡ **Hot Storage** | Sub-second retrieval — faster than most CDNs |
| ⛓️ **On-Chain Record** | Every upload signed and recorded on Aptos |
| 🔗 **Shareable Links** | Direct URL + Blob ID for every image |
| 🗂️ **Gallery View** | Browse all uploaded images in one place |
| 🔍 **Explorer Links** | Every image links to Shelby Explorer |
| 🌍 **Free Deployment** | One-click deploy on Vercel |

---

## Architecture

```
Browser (Next.js UI)
       │
       │  POST /api/upload  ←  image file
       ▼
Next.js API Route          ←  private key stays server-side only
       │
       │  Step 1: POST /sessions/createSession  →  session token
       │  Step 2: PUT  /storage/blobs           →  upload image bytes
       ▼
Shelby RPC Node
       │
       │  erasure-coding + distribution
       ▼
Storage Provider Network   ←  file spread across decentralized nodes
       │
       │  Aptos transaction recorded
       ▼
Aptos Blockchain           ←  permanent on-chain storage commitment
       │
       │  returns blobId + direct URL
       ▼
Browser                    ←  shareable link ready instantly
```

**Why server-side?**  
Your private key must never touch the browser. The Next.js API route is a secure server-side proxy — the browser sends the raw image, the server authenticates with Shelby and uploads it. Your key never leaves the server.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR + API routes in one project |
| Language | **TypeScript** | Type safety throughout |
| Styling | **Tailwind CSS** | Fast, utility-first |
| Storage | **Shelby Protocol** | Decentralized hot storage |
| Blockchain | **Aptos** | Fast, low-cost L1 |
| Deploy | **Vercel** | Free, instant, zero-config |

---

## ⚠️ Current Status — Awaiting API Access

Shelby Protocol is in **private early access**. The full upload flow is built, authenticated, and ready to go. Uploads will activate the moment an API key is granted.

> Applied at: [developers.shelby.xyz](https://developers.shelby.xyz)  
> Status: **Pending review**

Everything else — the UI, the gallery, the architecture, the deployment — is fully live at **[shelby-image-host.vercel.app](https://shelby-image-host.vercel.app)**.

---

## Run It Yourself

### Prerequisites
- Node.js v18+ → [nodejs.org](https://nodejs.org)
- Git → [git-scm.com](https://git-scm.com)
- A Shelby API key → [developers.shelby.xyz](https://developers.shelby.xyz)

### Step 1 — Install Shelby CLI & create your wallet
```bash
npm install -g @shelby-protocol/cli
shelby init                              # choose: shelbynet
shelby faucet --network shelbynet        # get free APT + ShelbyUSD
shelby account balance                   # verify tokens arrived
```

### Step 2 — Clone & configure
```bash
git clone https://github.com/Investorquab/shelby-image-host
cd shelby-image-host
cp .env.example .env.local
```

Open `.env.local` and fill in your values:
```env
SHELBY_PRIVATE_KEY=ed25519-priv-0x...      # from: shelby account list
SHELBY_ACCOUNT_ADDRESS=0x...               # from: shelby account list
SHELBY_NETWORK=shelbynet
SHELBY_RPC_ENDPOINT=https://api.shelbynet.shelby.xyz/shelby
APTOS_FULLNODE=https://api.shelbynet.shelby.xyz/v1
SHELBY_STORAGE_DURATION=86400
SHELBY_API_KEY=your_api_key_here           # from: developers.shelby.xyz
```

### Step 3 — Run locally
```bash
npm install --legacy-peer-deps
npm run dev
# Open: http://localhost:3000
```

### Step 4 — Deploy free on Vercel
1. Push repo to GitHub
2. Go to **[vercel.com/new](https://vercel.com/new)** → import your repo
3. Add all env variables in Vercel → Settings → Environment Variables
4. Click **Deploy** → get your live URL 🎉

---

## Project Structure

```
shelby-image-host/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts     ← POST: image → Shelby session → upload
│   │   │   └── images/route.ts     ← GET: gallery data
│   │   ├── page.tsx                ← Full UI (upload + gallery)
│   │   ├── layout.tsx              ← Root layout
│   │   └── globals.css             ← Design system + animations
│   └── lib/
│       ├── shelby.ts               ← Shelby API: createSession + uploadBlob
│       └── store.ts                ← Local JSON metadata store
├── data/
│   └── images.json                 ← Auto-created on first upload
├── .env.example                    ← Copy to .env.local
├── vercel.json                     ← Vercel deploy config
└── README.md
```

---

## Key Files Explained

### `src/lib/shelby.ts`
The core Shelby integration. Handles:
1. **Session creation** — authenticates with your Aptos wallet
2. **Blob upload** — streams the image to Shelby's storage nodes
3. **URL generation** — returns direct URL and Explorer link

### `src/app/api/upload/route.ts`
Server-side API route that:
- Validates file type and size
- Converts browser File → Buffer
- Calls `shelby.ts` functions (private key never leaves server)
- Saves metadata to local JSON store
- Returns blob ID + URLs to browser

### `src/lib/store.ts`
Lightweight metadata store. Saves blob IDs, filenames, timestamps to `data/images.json` so the gallery works without querying the blockchain on every page load.

---

## How Shelby Works (Simple Explanation)

Think of Shelby like a global postal system for data:

```
Your file
   ↓
Broken into chunks (erasure coding — like RAID for files)
   ↓
Chunks distributed to storage nodes worldwide
   ↓
Even if some nodes go offline, your file is still recoverable
   ↓
Aptos blockchain records WHO stored WHAT and WHEN
   ↓
Anyone with the Blob ID can retrieve it instantly
```

Unlike IPFS (slow) or Arweave (cold storage), Shelby is **hot** — data comes back in milliseconds, making it suitable for real apps like video streaming, AI datasets, and image hosting.

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Session failed [404]` | API key not approved yet | Apply at developers.shelby.xyz |
| `SHELBY_ACCOUNT_ADDRESS not set` | Missing env var | Add to Vercel environment variables |
| `Insufficient balance` | Out of ShelbyUSD | `shelby faucet --network shelbynet` |
| Image doesn't load after upload | Blob still propagating | Wait 5–10 seconds and refresh |
| Build fails on Vercel | Dependency issue | Check build logs, run with `--legacy-peer-deps` |

---

## Resources

| Resource | Link |
|---|---|
| 📖 Shelby Docs | https://docs.shelby.xyz |
| 🌐 Shelby Website | https://shelby.xyz |
| 🔍 Shelby Explorer | https://explorer.shelby.xyz/shelbynet |
| 🚰 Faucet (free tokens) | https://faucet.shelbynet.shelby.xyz |
| 👩‍💻 Developer Access | https://developers.shelby.xyz |
| ⛓️ Aptos Explorer | https://explorer.aptoslabs.com |
| 📘 Next.js Docs | https://nextjs.org/docs |

---

## About

Built by **[@quabnation](https://twitter.com/quabnation)** as part of exploring Shelby Protocol — the first decentralized hot-storage network on Aptos, developed by Aptos Labs and Jump Crypto.

This project demonstrates how decentralized hot storage can power real Web3 applications — from image hosting to video streaming to AI datasets — without depending on centralized infrastructure.

---

*Built with ❤️ using [Shelby Protocol](https://shelby.xyz) · [Aptos](https://aptos.dev) · [Next.js](https://nextjs.org) · Deployed free on [Vercel](https://vercel.com)*