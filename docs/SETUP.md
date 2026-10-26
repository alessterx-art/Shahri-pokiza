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

## 3. GitHub Pages Deployment (Fixing Blank White Page)
When deploying a Vite React app to GitHub Pages (`https://<username>.github.io/<repo-name>/`), the default root path `/` causes a blank white page because scripts look at `https://<username>.github.io/assets/...` instead of the repo folder.

This project is configured with:
- `base: './'` in `vite.config.ts` (relative asset paths for all scripts and styles).
- Bundled image imports in `src/assets/images.ts` and static copies in `public/assets/images/`.
- `public/404.html` SPA redirect handler.

### Step-by-Step GitHub Pages Deployment:
1. Push your code to your GitHub repository.
2. In your repository on GitHub, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, choose:
   - **GitHub Actions** (Recommended): Create `.github/workflows/deploy.yml` with:
     ```yaml
     name: Deploy to GitHub Pages
     on:
       push:
         branches: [main]
     permissions:
       contents: read
       pages: write
       id-token: write
     jobs:
       deploy:
         environment:
           name: github-pages
           url: ${{ steps.deployment.outputs.page_url }}
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with:
               node-version: 20
           - run: npm ci
           - run: npm run build
           - uses: actions/upload-pages-artifact@v3
             with:
               path: ./dist
           - id: deployment
             uses: actions/deploy-pages@v4
     ```
   - **OR Deploy branch**: Select `gh-pages` branch and folder `/ (root)`.
