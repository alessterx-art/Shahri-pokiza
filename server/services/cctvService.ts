export interface CameraDevice {
  id: string;
  name: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  streamUrl?: string;
  adapterType: 'browser_demo' | 'upload_stream' | 'ip_camera_rtsp';
  lastConnection: string;
}

export interface CameraEvent {
  id: string;
  cameraId: string;
  eventCategory: string;
  timestamp: string;
  incidentId?: string;
  evidenceImagePath: string;
  reviewStatus: 'pending_review' | 'confirmed' | 'rejected';
  notes?: string;
}

// In-memory registry of municipal camera nodes
export const municipalCameras: CameraDevice[] = [
  {
    id: 'CAM-01-PANJ',
    name: 'Камераи №1 — Бозори Панҷшанбе',
    location: 'кӯчаи Шарқ, чорроҳаи марказӣ, сутуни №14',
    city: 'Хуҷанд',
    latitude: 40.2832,
    longitude: 69.6274,
    status: 'online',
    streamUrl: 'rtsp://cam1.khujand.tj/stream/live',
    adapterType: 'browser_demo',
    lastConnection: new Date().toISOString(),
  },
  {
    id: 'CAM-02-SOMON',
    name: 'Камераи №2 — Хиёбони Исмоили Сомонӣ',
    location: 'Хиёбони Исмоили Сомонӣ, назди Театри Камол',
    city: 'Хуҷанд',
    latitude: 40.2855,
    longitude: 69.6220,
    status: 'online',
    streamUrl: 'rtsp://cam2.khujand.tj/stream/live',
    adapterType: 'browser_demo',
    lastConnection: new Date().toISOString(),
  },
  {
    id: 'CAM-03-M19',
    name: 'Камераи №3 — Маҳаллаи 19',
    location: 'Маҳаллаи 19, нуқтаи ҷамъоварии партовҳои хонагӣ',
    city: 'Хуҷанд',
    latitude: 40.2723,
    longitude: 69.6455,
    status: 'online',
    streamUrl: 'rtsp://cam3.khujand.tj/stream/live',
    adapterType: 'upload_stream',
    lastConnection: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];
