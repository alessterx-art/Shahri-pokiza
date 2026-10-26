export type UserRole = 'admin' | 'sanitation_worker' | 'public_user';

export type AccountStatus = 'active' | 'pending' | 'suspended';

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  account_status: AccountStatus;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export type ContainerStatus = 'normal' | 'overflowing' | 'damaged' | 'maintenance';
export type WasteType = 'mixed' | 'recyclable' | 'organic';

export interface WasteContainer {
  id: string;
  name_or_number: string;
  city: string;
  street: string;
  address_description: string;
  latitude: number;
  longitude: number;
  current_status: ContainerStatus;
  fill_percentage: number;
  waste_type: WasteType;
  last_inspection: string;
  created_at?: string;
}

export type IncidentCategory =
  | 'overflowing_bin'
  | 'garbage_outside'
  | 'litter_scattered'
  | 'dirty_public_area'
  | 'unclear';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'urgent';

export type IncidentStatus =
  | 'new'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export interface Incident {
  id: string;
  category: IncidentCategory;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  photograph_path: string;
  ai_analysis_result?: {
    category: string;
    categoryTajik: string;
    description: string;
    confidence: number;
    visibleEvidence: string[];
    recommendedAction: string;
    needsHumanReview: boolean;
    priority: IncidentPriority;
  };
  confidence_score: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporter_id?: string;
  assigned_worker_id?: string;
  reported_at: string;
  resolved_at?: string | null;
}

export interface CameraDevice {
  id: string;
  name: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  stream_url?: string;
  adapter_type: 'browser_demo' | 'upload_stream' | 'ip_camera_rtsp';
  last_connection: string;
}

export interface CameraEvent {
  id: string;
  camera_id: string;
  event_category: string;
  timestamp: string;
  incident_id?: string | null;
  evidence_image_path: string;
  review_status: 'pending_review' | 'confirmed' | 'rejected';
  notes?: string;
}

export interface CleanupTask {
  id: string;
  incident_id: string;
  assigned_worker_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  before_photo_path?: string | null;
  after_photo_path?: string | null;
  worker_notes?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  related_incident_id?: string | null;
  read_status: boolean;
  created_at: string;
}

export interface EcoPoint {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  related_incident_id?: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_name?: string;
  action: string;
  affected_record: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
