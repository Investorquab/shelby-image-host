# ⬡ Shelby Vault — Decentralized Image Host

> Upload images to **[Shelby Protocol](https://shelby.xyz)** decentralized hot-storage on the **Aptos** blockchain. Get a permanent shareable link. No servers. No middlemen.

🔗 **[Live Demo](https://shelby-image-host.vercel.app)**

---

## What This Does

- Upload any image (JPG, PNG, GIF, WebP — up to 10MB)
- Stores it on Shelby's distributed storage nodes across the world
- Records the transaction on the **Aptos blockchain**
- Returns a direct URL + Blob ID you can share with anyone
- Gallery view of all your uploaded images

## How Uploads Work
```
Browser → POST /api/upload
              ↓
         Next.js API Route (server-side — private key protected)
              ↓
    1. POST /sessions/createSession  → get session token
    2. PUT  /storage/blobs           → upload image
    3. Returns blobId + direct URL to browser
```

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Storage | Shelby Protocol (shelbynet devnet) |
| Blockchain | Aptos |
| Deploy | Vercel (free) |

---

## Setup

### 1 — Install Shelby CLI & create wallet
```bash
npm install -g @shelby-protocol/cli
shelby init                               # choose shelbynet
shelby faucet --network shelbynet         # get free APT + ShelbyUSD
shelby account balance                    # verify tokens arrived
```

### 2 — Clone & configure
```bash
git clone https://github.com/Investorquab/shelby-image-host
cd shelby-image-host
cp .env.example .env.local
```

Fill in `.env.local`:
```
SHELBY_PRIVATE_KEY=ed25519-priv-0x...      ← from: shelby account list
SHELBY_ACCOUNT_ADDRESS=0x...               ← from: shelby account list
SHELBY_NETWORK=shelbynet
SHELBY_RPC_ENDPOINT=https://api.shelbynet.shelby.xyz/shelby
APTOS_FULLNODE=https://api.shelbynet.shelby.xyz/v1
SHELBY_STORAGE_DURATION=86400
```

### 3 — Run locally
```bash
npm install --legacy-peer-deps
npm run dev
```

### 4 — Deploy free on Vercel
1. Push to GitHub
2. Import on [vercel.com/new](https://vercel.com/new)
3. Add env variables in Vercel settings
4. Deploy!

---

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts   ← receives image → uploads to Shelby
│   │   └── images/route.ts   ← returns gallery list
│   ├── page.tsx              ← full UI (upload + gallery)
│   └── layout.tsx
└── lib/
    ├── shelby.ts             ← Shelby session + upload logic
    └── store.ts              ← local JSON metadata store
```

## Resources

- [Shelby Docs](https://docs.shelby.xyz)
- [Shelby Explorer](https://explorer.shelby.xyz/shelbynet)
- [Faucet](https://faucet.shelbynet.shelby.xyz)
- [Aptos Docs](https://aptos.dev)

> ⚠️ shelbynet resets weekly — for learning only, not production.