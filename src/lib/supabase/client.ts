import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Profile,
  WasteContainer,
  Incident,
  CameraDevice,
  CameraEvent,
  CleanupTask,
  NotificationItem,
  EcoPoint,
  AuditLog,
  UserRole,
} from '@/src/types/database';

// Initial Khujand Seed Data
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    display_name: 'Фаррух Назаров',
    role: 'admin',
    account_status: 'active',
    phone: '+992 92 777 0001',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    display_name: 'Рустам Қосимов (Бригадаи №4)',
    role: 'sanitation_worker',
    account_status: 'active',
    phone: '+992 92 777 0002',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    display_name: 'Шерзод Шарифов (Муҳандис)',
    role: 'sanitation_worker',
    account_status: 'active',
    phone: '+992 92 777 0003',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    display_name: 'Малика Саидова (Эко-фаъол)',
    role: 'public_user',
    account_status: 'active',
    phone: '+992 92 777 0004',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    display_name: 'Ҷамшед Аҳмадов (Сокини шаҳр)',
    role: 'public_user',
    account_status: 'active',
    phone: '+992 92 777 0005',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const INITIAL_CONTAINERS: WasteContainer[] = [
  {
    id: 'CNT-KHJ-01',
    name_or_number: 'Қуттии ҳушманд №101',
    city: 'Хуҷанд',
    street: 'хиёбони Исмоили Сомонӣ',
    address_description: 'Назди Боғи фарҳангии Камоли Хуҷандӣ',
    latitude: 40.2858,
    longitude: 69.6225,
    current_status: 'normal',
    fill_percentage: 35,
    waste_type: 'recyclable',
    last_inspection: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'CNT-KHJ-02',
    name_or_number: 'Қуттии ҳушманд №102',
    city: 'Хуҷанд',
    street: 'кӯчаи Шарқ',
    address_description: 'Бозори Панҷшанбе, даромадгоҳи марказӣ',
    latitude: 40.2831,
    longitude: 69.6272,
    current_status: 'overflowing',
    fill_percentage: 94,
    waste_type: 'mixed',
    last_inspection: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'CNT-KHJ-03',
    name_or_number: 'Қуттии ҳушманд №103',
    city: 'Хуҷанд',
    street: 'маҳаллаи 19',
    address_description: 'Рӯ ба рӯи бинои истиқоматии 14',
    latitude: 40.2725,
    longitude: 69.6450,
    current_status: 'normal',
    fill_percentage: 58,
    waste_type: 'organic',
    last_inspection: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'CNT-KHJ-04',
    name_or_number: 'Қуттии ҳушманд №104',
    city: 'Хуҷанд',
    street: 'кӯчаи Раҳим Ҷалил',
    address_description: 'Майдони Ситораҳо, нуқтаи ҷудокунии партов',
    latitude: 40.2912,
    longitude: 69.6189,
    current_status: 'maintenance',
    fill_percentage: 15,
    waste_type: 'recyclable',
    last_inspection: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'CNT-KHJ-05',
    name_or_number: 'Қуттии ҳушманд №105',
    city: 'Хуҷанд',
    street: 'хиёбони Раҳмон Набиев',
    address_description: 'Соҳили рости дарёи Сир, гулгашти пиёдагард',
    latitude: 40.2880,
    longitude: 69.6295,
    current_status: 'normal',
    fill_percentage: 45,
    waste_type: 'mixed',
    last_inspection: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'CNT-DSH-06',
    name_or_number: 'Қуттии ҳушманд №201',
    city: 'Душанбе',
    street: 'хиёбони Рӯдакӣ',
    address_description: 'Майдони Истиқлол, канори шимолӣ',
    latitude: 38.5737,
    longitude: 68.7844,
    current_status: 'normal',
    fill_percentage: 40,
    waste_type: 'recyclable',
    last_inspection: new Date(Date.now() - 3600000).toISOString(),
  },
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-001',
    category: 'overflowing_bin',
    city: 'Хуҷанд',
    address: 'кӯчаи Шарқ, бозори Панҷшанбе',
    latitude: 40.2831,
    longitude: 69.6272,
    description: 'Қуттии партов пур шудааст ва партовҳо ба замин рехтаанд',
    photograph_path: '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg',
    ai_analysis_result: {
      category: 'overflowing_bin',
      categoryTajik: 'Қуттии аз ҳад пуршуда',
      description: 'Қуттии партов ба андозаи 90% пур буда, халтаҳои партов берун аз қуттӣ қарор доранд',
      confidence: 0.94,
      visibleEvidence: ['Қуттии партов пур аст', 'Партовҳои рехташуда дар атроф'],
      recommendedAction: 'Ирсоли фаврии мошини партовкаш ва тозакунӣ',
      needsHumanReview: false,
      priority: 'high',
    },
    confidence_score: 0.94,
    priority: 'high',
    status: 'assigned',
    reporter_id: 'c0000000-0000-0000-0000-000000000004',
    assigned_worker_id: 'b0000000-0000-0000-0000-000000000002',
    reported_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'INC-2026-002',
    category: 'garbage_outside',
    city: 'Хуҷанд',
    address: 'хиёбони Раҳмон Набиев 45',
    latitude: 40.2882,
    longitude: 69.6298,
    description: 'Партовҳои сохтмонӣ ва картон берун аз қуттӣ гузошта шудаанд',
    photograph_path: '/src/assets/images/cctv_waste_monitoring_camera_1792953898985.jpg',
    ai_analysis_result: {
      category: 'garbage_outside',
      categoryTajik: 'Партов дар беруни қуттӣ',
      description: 'Берун аз қуттии партов қуттиҳои картонӣ ва партовҳои бесоҳиб гузошта шудаанд',
      confidence: 0.88,
      visibleEvidence: ['Қуттиҳои картонӣ дар пиёдароҳ', 'Партовҳои бесоҳиб'],
      recommendedAction: 'Бригадаи махсус барои кашонидани картон ва партовҳои калонҳаҷм',
      needsHumanReview: true,
      priority: 'medium',
    },
    confidence_score: 0.88,
    priority: 'medium',
    status: 'under_review',
    reporter_id: 'c0000000-0000-0000-0000-000000000005',
    reported_at: new Date(Date.now() - 3600000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'INC-2026-003',
    category: 'litter_scattered',
    city: 'Хуҷанд',
    address: 'Боғи Камоли Хуҷандӣ, гулгашти шимолӣ',
    latitude: 40.2862,
    longitude: 69.6228,
    description: 'Тозакунии саривақтӣ анҷом дода шуд',
    photograph_path: '/src/assets/images/hero_smart_city_khujand_1792953898192.jpg',
    ai_analysis_result: {
      category: 'litter_scattered',
      categoryTajik: 'Партовҳои пароканда',
      description: 'Партовҳои хурди пластикӣ дар гулгашт',
      confidence: 0.91,
      visibleEvidence: ['Шишаҳои пластикӣ дар замин'],
      recommendedAction: 'Тозакунии дастӣ аз ҷониби корманди минтақа',
      needsHumanReview: false,
      priority: 'low',
    },
    confidence_score: 0.91,
    priority: 'low',
    status: 'resolved',
    reporter_id: 'c0000000-0000-0000-0000-000000000004',
    assigned_worker_id: 'b0000000-0000-0000-0000-000000000002',
    reported_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    resolved_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
];

const INITIAL_CAMERAS: CameraDevice[] = [
  {
    id: 'CAM-01-PANJ',
    name: 'Камераи №1 — Бозори Панҷшанбе',
    location: 'кӯчаи Шарқ, чорроҳаи марказӣ, сутуни №14',
    city: 'Хуҷанд',
    latitude: 40.2832,
    longitude: 69.6274,
    status: 'online',
    stream_url: 'rtsp://cam1.khujand.tj/stream/live',
    adapter_type: 'browser_demo',
    last_connection: new Date().toISOString(),
  },
  {
    id: 'CAM-02-SOMON',
    name: 'Камераи №2 — Хиёбони Исмоили Сомонӣ',
    location: 'Хиёбони Исмоили Сомонӣ, назди Театри Камол',
    city: 'Хуҷанд',
    latitude: 40.2855,
    longitude: 69.6220,
    status: 'online',
    stream_url: 'rtsp://cam2.khujand.tj/stream/live',
    adapter_type: 'browser_demo',
    last_connection: new Date().toISOString(),
  },
  {
    id: 'CAM-03-M19',
    name: 'Камераи №3 — Маҳаллаи 19',
    location: 'Маҳаллаи 19, назди мактаби миёна',
    city: 'Хуҷанд',
    latitude: 40.2723,
    longitude: 69.6455,
    status: 'online',
    stream_url: 'rtsp://cam3.khujand.tj/stream/live',
    adapter_type: 'upload_stream',
    last_connection: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

const INITIAL_CAMERA_EVENTS: CameraEvent[] = [
  {
    id: 'EVT-01',
    camera_id: 'CAM-01-PANJ',
    event_category: 'overflowing_bin',
    timestamp: new Date(Date.now() - 2 * 3600000 - 15 * 60000).toISOString(),
    incident_id: 'INC-2026-001',
    evidence_image_path: '/src/assets/images/cctv_waste_monitoring_camera_1792953898985.jpg',
    review_status: 'confirmed',
    notes: 'Камераи №1 ҳолати пуршавии беш аз 90%-ро сабт намуд',
  },
  {
    id: 'EVT-02',
    camera_id: 'CAM-02-SOMON',
    event_category: 'garbage_outside',
    timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    incident_id: 'INC-2026-002',
    evidence_image_path: '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg',
    review_status: 'pending_review',
    notes: 'Сабти ҳаракат дар назди қуттии партов ва партофтани қуттиҳои калон',
  },
];

const INITIAL_TASKS: CleanupTask[] = [
  {
    id: 'TSK-101',
    incident_id: 'INC-2026-001',
    assigned_worker_id: 'b0000000-0000-0000-0000-000000000002',
    status: 'in_progress',
    before_photo_path: '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg',
    after_photo_path: null,
    worker_notes: 'Бригада ба ҷойи ҳодиса ҳозир шуд, холӣ кардани қуттӣ оғоз гардид',
    completed_at: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'TSK-100',
    incident_id: 'INC-2026-003',
    assigned_worker_id: 'b0000000-0000-0000-0000-000000000002',
    status: 'completed',
    before_photo_path: '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg',
    after_photo_path: '/src/assets/images/hero_smart_city_khujand_1792953898192.jpg',
    worker_notes: 'Атрофи гулгашт пурра рӯбучин ва тоза карда шуд',
    completed_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    recipient_id: 'b0000000-0000-0000-0000-000000000002',
    title: 'Супориши нав ба қайд гирифта шуд',
    message: 'Ҳодисаи INC-2026-001 дар Бозори Панҷшанбе ба шумо вобаста карда шуд.',
    related_incident_id: 'INC-2026-001',
    read_status: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'NOTIF-02',
    recipient_id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Ҳисоботи шумо қабул гардид',
    message: 'Барои хабар додани ҳолати ифлосшавӣ ба шумо 25 эко-хол дода шуд!',
    related_incident_id: 'INC-2026-001',
    read_status: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const INITIAL_ECO_POINTS: EcoPoint[] = [
  {
    id: 'ECO-01',
    user_id: 'c0000000-0000-0000-0000-000000000004',
    points: 25,
    reason: 'Ҳисоботи тасдиқшудаи қуттии пуршуда дар Панҷшанбе',
    related_incident_id: 'INC-2026-001',
    verification_status: 'approved',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ECO-02',
    user_id: 'c0000000-0000-0000-0000-000000000005',
    points: 15,
    reason: 'Ҳисоботи партови бесоҳиб дар соҳили дарёи Сир',
    related_incident_id: 'INC-2026-002',
    verification_status: 'pending',
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-01',
    actor_id: 'a0000000-0000-0000-0000-000000000001',
    actor_name: 'Фаррух Назаров (Админ)',
    action: 'INCIDENT_ASSIGNED',
    affected_record: 'INC-2026-001',
    details: { assigned_to: 'Рустам Қосимов', priority: 'high' },
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'LOG-02',
    actor_id: 'b0000000-0000-0000-0000-000000000002',
    actor_name: 'Рустам Қосимов (Коргари тозагӣ)',
    action: 'TASK_STATUS_UPDATED',
    affected_record: 'TSK-101',
    details: { status: 'in_progress' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Check environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));

// Direct Supabase Client instance (when real project credentials are configured)
export const realSupabase: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Persistent In-Memory / Local Repository for demo stability
class DatabaseRepository {
  private profiles: Profile[] = [...INITIAL_PROFILES];
  private containers: WasteContainer[] = [...INITIAL_CONTAINERS];
  private incidents: Incident[] = [...INITIAL_INCIDENTS];
  private cameras: CameraDevice[] = [...INITIAL_CAMERAS];
  private cameraEvents: CameraEvent[] = [...INITIAL_CAMERA_EVENTS];
  private tasks: CleanupTask[] = [...INITIAL_TASKS];
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  private ecoPoints: EcoPoint[] = [...INITIAL_ECO_POINTS];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('shahri_pokiza_demo_db');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.incidents) this.incidents = data.incidents;
        if (data.containers) this.containers = data.containers;
        if (data.tasks) this.tasks = data.tasks;
        if (data.cameraEvents) this.cameraEvents = data.cameraEvents;
        if (data.notifications) this.notifications = data.notifications;
        if (data.ecoPoints) this.ecoPoints = data.ecoPoints;
        if (data.auditLogs) this.auditLogs = data.auditLogs;
        if (data.profiles) this.profiles = data.profiles;
      }
    } catch {
      // Ignore parse errors, use defaults
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(
        'shahri_pokiza_demo_db',
        JSON.stringify({
          incidents: this.incidents,
          containers: this.containers,
          tasks: this.tasks,
          cameraEvents: this.cameraEvents,
          notifications: this.notifications,
          ecoPoints: this.ecoPoints,
          auditLogs: this.auditLogs,
          profiles: this.profiles,
        })
      );
    } catch {
      // Ignore quota errors
    }
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Profiles ---
  getProfiles(): Profile[] {
    return [...this.profiles];
  }

  updateProfileRole(id: string, newRole: UserRole): boolean {
    const profile = this.profiles.find((p) => p.id === id);
    if (!profile) return false;
    profile.role = newRole;
    this.addAuditLog('ROLE_UPDATED', `Profile:${id}`, { newRole });
    this.saveToStorage();
    return true;
  }

  // --- Containers ---
  getContainers(): WasteContainer[] {
    return [...this.containers];
  }

  updateContainerStatus(id: string, status: WasteContainer['current_status'], fill?: number): boolean {
    const container = this.containers.find((c) => c.id === id);
    if (!container) return false;
    container.current_status = status;
    if (typeof fill === 'number') container.fill_percentage = fill;
    container.last_inspection = new Date().toISOString();
    this.addAuditLog('CONTAINER_STATUS_CHANGED', `Container:${id}`, { status, fill });
    this.saveToStorage();
    return true;
  }

  // --- Incidents ---
  getIncidents(): Incident[] {
    return [...this.incidents].sort(
      (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
    );
  }

  addIncident(incidentData: Omit<Incident, 'id' | 'reported_at'>): Incident {
    const id = `INC-${new Date().getFullYear()}-${String(this.incidents.length + 1).padStart(3, '0')}`;
    const newIncident: Incident = {
      ...incidentData,
      id,
      reported_at: new Date().toISOString(),
    };
    this.incidents.unshift(newIncident);

    // If assigned to a worker, automatically create a cleanup task
    if (newIncident.assigned_worker_id) {
      this.addTask({
        incident_id: newIncident.id,
        assigned_worker_id: newIncident.assigned_worker_id,
        status: 'pending',
        before_photo_path: newIncident.photograph_path,
        created_at: new Date().toISOString(),
      });
    }

    // Award pending eco points if reported by citizen
    if (newIncident.reporter_id) {
      this.addEcoPoint({
        user_id: newIncident.reporter_id,
        points: 20,
        reason: `Ҳисоботи нав дар ${newIncident.address}`,
        related_incident_id: newIncident.id,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    this.addAuditLog('INCIDENT_CREATED', `Incident:${id}`, {
      category: newIncident.category,
      address: newIncident.address,
      priority: newIncident.priority,
    });
    this.saveToStorage();
    return newIncident;
  }

  updateIncident(id: string, updates: Partial<Incident>): boolean {
    const index = this.incidents.findIndex((i) => i.id === id);
    if (index === -1) return false;

    const oldIncident = this.incidents[index];
    const updated = { ...oldIncident, ...updates };

    // If newly assigned
    if (updates.assigned_worker_id && updates.assigned_worker_id !== oldIncident.assigned_worker_id) {
      updated.status = 'assigned';
      this.addTask({
        incident_id: id,
        assigned_worker_id: updates.assigned_worker_id,
        status: 'pending',
        before_photo_path: updated.photograph_path,
        created_at: new Date().toISOString(),
      });
      // Notify worker
      this.addNotification({
        recipient_id: updates.assigned_worker_id,
        title: 'Супориши нави тозакунӣ',
        message: `Ба шумо ҳодисаи ${id} дар ${updated.address} вобаста карда шуд.`,
        related_incident_id: id,
        read_status: false,
        created_at: new Date().toISOString(),
      });
    }

    // If resolved
    if (updates.status === 'resolved' && !updated.resolved_at) {
      updated.resolved_at = new Date().toISOString();
      // Approve eco-points
      const eco = this.ecoPoints.find((e) => e.related_incident_id === id);
      if (eco) eco.verification_status = 'approved';
    }

    this.incidents[index] = updated;
    this.addAuditLog('INCIDENT_UPDATED', `Incident:${id}`, updates);
    this.saveToStorage();
    return true;
  }

  // --- Tasks ---
  getTasks(): CleanupTask[] {
    return [...this.tasks].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  addTask(taskData: Omit<CleanupTask, 'id'>): CleanupTask {
    const id = `TSK-${this.tasks.length + 101}`;
    const newTask: CleanupTask = {
      ...taskData,
      id,
    };
    this.tasks.unshift(newTask);
    this.addAuditLog('TASK_DISPATCHED', `Task:${id}`, {
      incident_id: taskData.incident_id,
      worker_id: taskData.assigned_worker_id,
    });
    this.saveToStorage();
    return newTask;
  }

  updateTaskStatus(
    id: string,
    status: CleanupTask['status'],
    afterPhoto?: string,
    notes?: string
  ): boolean {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return false;

    task.status = status;
    if (afterPhoto) task.after_photo_path = afterPhoto;
    if (notes) task.worker_notes = notes;

    if (status === 'completed') {
      task.completed_at = new Date().toISOString();
      // Also update linked incident to resolved
      this.updateIncident(task.incident_id, { status: 'resolved' });
    } else if (status === 'in_progress') {
      this.updateIncident(task.incident_id, { status: 'in_progress' });
    }

    this.addAuditLog('TASK_STATUS_UPDATED', `Task:${id}`, { status, notes });
    this.saveToStorage();
    return true;
  }

  // --- Cameras & Events ---
  getCameras(): CameraDevice[] {
    return [...this.cameras];
  }

  getCameraEvents(): CameraEvent[] {
    return [...this.cameraEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addCameraEvent(eventData: Omit<CameraEvent, 'id' | 'timestamp'>): CameraEvent {
    const id = `EVT-${String(this.cameraEvents.length + 1).padStart(2, '0')}`;
    const newEvent: CameraEvent = {
      ...eventData,
      id,
      timestamp: new Date().toISOString(),
    };
    this.cameraEvents.unshift(newEvent);
    this.addAuditLog('CAMERA_EVENT_DETECTED', `CameraEvent:${id}`, {
      camera: eventData.camera_id,
      category: eventData.event_category,
    });
    this.saveToStorage();
    return newEvent;
  }

  reviewCameraEvent(id: string, status: 'confirmed' | 'rejected', notes?: string): boolean {
    const event = this.cameraEvents.find((e) => e.id === id);
    if (!event) return false;

    event.review_status = status;
    if (notes) event.notes = notes;

    if (status === 'confirmed' && !event.incident_id) {
      // Auto-generate incident from confirmed CCTV evidence
      const camera = this.cameras.find((c) => c.id === event.camera_id);
      const inc = this.addIncident({
        category: (event.event_category as Incident['category']) || 'garbage_outside',
        city: camera?.city || 'Хуҷанд',
        address: camera?.location || 'Нуқтаи назорати CCTV',
        latitude: camera?.latitude || 40.2831,
        longitude: camera?.longitude || 69.6272,
        description: `Ҳодиса аз ҷониби ${camera?.name || 'камераи назоратӣ'} сабт ва тасдиқ гардид`,
        photograph_path: event.evidence_image_path,
        confidence_score: 0.95,
        priority: 'high',
        status: 'under_review',
      });
      event.incident_id = inc.id;
    }

    this.addAuditLog('CAMERA_EVENT_REVIEWED', `CameraEvent:${id}`, { status, notes });
    this.saveToStorage();
    return true;
  }

  // --- Notifications ---
  getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.recipient_id === userId);
  }

  addNotification(notifData: Omit<NotificationItem, 'id'>): NotificationItem {
    const id = `NOTIF-${Date.now()}`;
    const newNotif = { ...notifData, id };
    this.notifications.unshift(newNotif);
    this.saveToStorage();
    return newNotif;
  }

  markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read_status = true;
      this.saveToStorage();
    }
  }

  // --- Eco Points ---
  getEcoPoints(): EcoPoint[] {
    return [...this.ecoPoints];
  }

  addEcoPoint(pointData: Omit<EcoPoint, 'id'>): EcoPoint {
    const id = `ECO-${Date.now()}`;
    const newPoint = { ...pointData, id };
    this.ecoPoints.unshift(newPoint);
    this.saveToStorage();
    return newPoint;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private addAuditLog(action: string, affectedRecord: string, details?: Record<string, unknown>) {
    const log: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      affected_record: affectedRecord,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
  }

  // --- Demo Reset ---
  resetDemoData() {
    this.profiles = [...INITIAL_PROFILES];
    this.containers = [...INITIAL_CONTAINERS];
    this.incidents = [...INITIAL_INCIDENTS];
    this.cameras = [...INITIAL_CAMERAS];
    this.cameraEvents = [...INITIAL_CAMERA_EVENTS];
    this.tasks = [...INITIAL_TASKS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.ecoPoints = [...INITIAL_ECO_POINTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    localStorage.removeItem('shahri_pokiza_demo_db');
    this.notify();
  }
}

export const dbRepository = new DatabaseRepository();
