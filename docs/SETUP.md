# Setup & Deployment Guide — Шаҳри Покиза

## 1. Quick Start (Competition Demonstration Mode)
The application has built-in demo data and local persistence so judges can immediately evaluate all features (AI analysis, worker assignment, live map, CCTV inspection) without initial external configuration.

To connect your own real Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor in Supabase and paste the contents of `supabase/migrations/20261025000000_init_shahri_pokiza.sql`, then click **Run**.
3. (Optional) Run `supabase/seed.sql` to populate initial Khujand city data.
4. Set your environment variables in `.env`:
   ```bash
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   GEMINI_API_KEY="your-gemini-key"
   ```
5. Restart the server with `npm run dev`.

## 2. Connecting Real IP Cameras (RTSP)
To stream from a physical municipal Dahua or Hikvision camera:
1. Open camera configuration in the Admin Dashboard under "Камераҳо".
2. Enter RTSP endpoint: `rtsp://admin:password@camera-ip:554/Streaming/Channels/101`.
3. Set adapter to `ip_camera_rtsp`.
