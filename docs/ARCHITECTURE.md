# Architecture & System Design — Шаҳри Покиза

"Шаҳри Покиза" (Clean City) is a smart municipal waste monitoring and sanitation response system designed for the urban environment of Tajikistan (Khujand, Dushanbe, etc.).

## 1. High-Level Architecture Diagram

```
+--------------------------------------------------------------------------+
|                        CLIENT TIER (React + TypeScript)                  |
|  - Public Citizen Reporting Portal (Tajik Cyrillic)                      |
|  - Sanitation Worker Field Operations PWA                                |
|  - Municipal Administration Dashboard (Audit, CCTV, Work Orders)         |
|  - Interactive City Waste Map (Leaflet / OSM GIS)                        |
+---------------------+-------------------------------+--------------------+
                      |                               |
                      | HTTPS (REST / JSON)           | Supabase Realtime / Auth
                      v                               v
+-------------------------------------+  +---------------------------------+
|       SERVER TIER (Express.js)       |  |   SUPABASE BACKEND PLATFORM     |
|  - Gemini 3.8 Flash Vision API      |  |  - PostgreSQL Database          |
|  - CCTV Stream Ingestion & Adapter  |  |  - Supabase Auth (JWT RBAC)     |
|  - Evidence Signed URL Broker       |  |  - Storage Buckets (Evidence)   |
|  - System Health & Audit Logger     |  |  - Row Level Security (RLS)     |
+------------------+------------------+  +----------------+----------------+
                   |                                      |
                   +------------------+-------------------+
                                      |
                       +--------------v--------------+
                       |  EXTERNAL / EDGE HARDWARE   |
                       |  - Municipal CCTV RTSP feeds|
                       |  - IoT Fill-Level Sensors   |
                       |  - Citizen Smartphone Cams  |
                       +-----------------------------+
```

## 2. Core Modules

### A. Data Layer (`/src/lib/supabase`)
- **Direct Supabase Integration**: Built on `@supabase/supabase-js`.
- **Dual-Operational Mode**: Connects directly to production Supabase cloud when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided. If credentials are not yet configured during local evaluation or sandbox demonstrations, an in-memory client mirrors the exact Supabase query interface (`.from().select().eq().order()`, Auth session, and storage signed URLs) without data loss or crashes.
- **Strict Row-Level Security**: All database interactions honor the 3 roles (`admin`, `sanitation_worker`, `public_user`).

### B. AI Waste Analysis Engine (`/server/services/geminiService.ts`)
- Utilizes Google Gemini (`gemini-3.8-flash` via `@google/genai`) exclusively on the server side.
- Accepts citizen photographs or CCTV video snapshots.
- Analyzes container status, litter spread, and severity with structured JSON output in Tajik.
- Provides actionable recommendations for municipal dispatch.

### C. CCTV and Video Monitoring Adapter (`/server/services/cctvService.ts`)
- **Browser Camera Adapter**: For live video capture and local webcam testing during competition demonstrations.
- **Media Upload Adapter**: Allows inspection officers to upload captured CCTV footage or snapshots.
- **RTSP IP-Camera Interface**: Outlines connection specs for Dahua, Hikvision, and Uniview ONVIF-compliant municipal cameras.
- **Privacy & Civil Liberty Compliance**: Explicitly prohibits automated facial identification; isolates evidence snapshots strictly for municipal sanitation review.

### D. Task Management & Work Orders (`/src/features/workers`)
- Assigns incidents to municipal cleanup brigades.
- Tracks stages: `pending` -> `in_progress` -> `completed` -> `verified`.
- Captures before-and-after photographic evidence with timestamps.

### E. Eco-Participation & Community Points (`/src/features/eco-points`)
- Citizens earn points for verified waste reports.
- Public leaderboard displays community champions without exposing private addresses or worker rosters.
