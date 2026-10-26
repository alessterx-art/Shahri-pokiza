# Security & Access Control Guide — Шаҳри Покиза

## 1. Principles of Security
1. **Never Trust the Client**: Role validation is enforced on the server and via Supabase Row-Level Security (RLS). Hiding buttons on the client is purely for UX, never security.
2. **Authoritative Roles**: Roles (`admin`, `sanitation_worker`, `public_user`) reside in the protected `profiles` table. Users cannot elevate their own role upon signup.
3. **API Key Isolation**:
   - `GEMINI_API_KEY`: Kept on server (`process.env.GEMINI_API_KEY`). Never exposed to browser.
   - `SUPABASE_SERVICE_ROLE_KEY`: Reserved for backend admin operations.
   - `VITE_SUPABASE_ANON_KEY`: Subject to strict RLS policies.
4. **Privacy-Preserving Video Surveillance**: Automated facial recognition is strictly prohibited. Camera stills focus exclusively on public container stations and physical waste conditions.
5. **Signed URLs**: Sensitive CCTV evidence is placed in private buckets, with short-lived signed URLs provided only to authorized staff.
