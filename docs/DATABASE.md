# Database Schema Documentation — Шаҳри Покиза

The database runs on Supabase PostgreSQL with strict Row Level Security (RLS) enabled on all tables.

## 1. Schema Tables

### `profiles`
Represents application users and their authoritative roles.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, FK auth.users | Primary user identifier |
| `display_name` | TEXT | NOT NULL | User's full name in Tajik Cyrillic |
| `role` | TEXT | 'admin', 'sanitation_worker', 'public_user' | Authoritative system role |
| `account_status` | TEXT | 'active', 'pending', 'suspended' | Account verification state |
| `phone` | TEXT | NULLABLE | Contact telephone |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

### `containers`
Smart waste container locations and IoT telemetry.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PK | e.g. 'CNT-KHJ-01' |
| `name_or_number` | TEXT | NOT NULL | Display name |
| `city` | TEXT | NOT NULL | e.g. 'Хуҷанд', 'Душанбе' |
| `street` | TEXT | NOT NULL | Street name |
| `address_description` | TEXT | NOT NULL | Landmark description |
| `latitude` | FLOAT | NOT NULL | WGS-84 coordinate |
| `longitude` | FLOAT | NOT NULL | WGS-84 coordinate |
| `current_status` | TEXT | 'normal', 'overflowing', 'damaged', 'maintenance' | Container condition |
| `fill_percentage` | INT | 0 to 100 | Sensor fill percentage |
| `waste_type` | TEXT | 'mixed', 'recyclable', 'organic' | Sorting compartment |
| `last_inspection` | TIMESTAMPTZ | DEFAULT now() | Last physical check |

### `incidents`
Sanitation alerts submitted by citizens or detected by CCTV.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PK | e.g. 'INC-2026-001' |
| `category` | TEXT | NOT NULL | 'overflowing_bin', 'garbage_outside', etc. |
| `city` | TEXT | NOT NULL | Location city |
| `address` | TEXT | NOT NULL | Street address |
| `latitude` | FLOAT | NOT NULL | GPS latitude |
| `longitude` | FLOAT | NOT NULL | GPS longitude |
| `description` | TEXT | NOT NULL | Report description |
| `photograph_path` | TEXT | NOT NULL | Supabase Storage URL / relative path |
| `ai_analysis_result` | JSONB | NULLABLE | Structured AI diagnostics |
| `confidence_score` | NUMERIC | 0.00 to 1.00 | AI confidence |
| `priority` | TEXT | 'low', 'medium', 'high', 'urgent' | Dispatch priority |
| `status` | TEXT | 'new', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected' | Workflow status |
| `reporter_id` | UUID | FK profiles(id) | Reporting user |
| `assigned_worker_id` | UUID | FK profiles(id) | Assigned sanitation worker |
| `reported_at` | TIMESTAMPTZ | DEFAULT now() | Submission time |
| `resolved_at` | TIMESTAMPTZ | NULLABLE | Resolution time |

### `camera_devices` & `camera_events`
Municipal CCTV infrastructure and AI event captures.
- `camera_devices`: Tracks online/offline status, RTSP streams, and physical poles.
- `camera_events`: Timestamps, capture stills, and human review status for video-detected incidents.

### `cleanup_tasks`
Work orders assigned to sanitation staff.
- Links `incident_id` to `assigned_worker_id`.
- Stores `before_photo_path` and `after_photo_path` to verify real physical cleanup.

### `notifications`
In-app alerts for workers when work orders are dispatched, and for citizens when reports are resolved.

### `eco_points`
Incentive points awarded for verified environmental reporting. Unique constraint on `(user_id, related_incident_id)` prevents double-rewarding.

### `audit_logs`
Immutable record of all administrative assignments, camera reviews, and status changes.

## 2. Storage Buckets
1. `incident-photos` (Public read): Citizen and incident evidence photos.
2. `cleanup-evidence` (Public read): Before and after cleanup photographs.
3. `cctv-records` (Private): High-resolution security stills, accessible only through server-signed URLs for authenticated staff.
