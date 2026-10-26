import React, { useEffect, useRef, useState } from 'react';
import type { WasteContainer, Incident } from '@/src/types/database';
import { MapPin, AlertTriangle, CheckCircle2, Trash2, Navigation } from 'lucide-react';

interface CityMapProps {
  containers: WasteContainer[];
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  onSelectContainer?: (container: WasteContainer) => void;
  selectableLocation?: boolean;
  onLocationChosen?: (lat: number, lng: number, address: string) => void;
  centerLat?: number;
  centerLng?: number;
}

export const CityMap: React.FC<CityMapProps> = ({
  containers,
  incidents,
  onSelectIncident,
  onSelectContainer,
  selectableLocation = false,
  onLocationChosen,
  centerLat = 40.2831,
  centerLng = 69.6272,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'containers' | 'incidents' | 'overflowing'>('all');
  const [chosenCoord, setChosenCoord] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        const L = await import('leaflet');

        if (!isMounted || !mapContainerRef.current) return;

        // Custom Leaflet icons without external CDN dependencies
        const createSvgIcon = (color: string, label: string) =>
          L.divIcon({
            className: 'custom-map-marker',
            html: `
              <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); color: white; font-weight: bold; font-size: 11px;">
                ${label}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
          });

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | Низоми Шаҳри Покиза',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Add Containers
        if (filterType === 'all' || filterType === 'containers' || filterType === 'overflowing') {
          containers.forEach((c) => {
            if (filterType === 'overflowing' && c.current_status !== 'overflowing') return;

            const isOverflow = c.current_status === 'overflowing';
            const color = isOverflow ? '#ef4444' : '#10b981';
            const marker = L.marker([c.latitude, c.longitude], {
              icon: createSvgIcon(color, isOverflow ? '!' : 'Қ'),
            }).addTo(map);

            marker.bindPopup(`
              <div style="padding: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${c.name_or_number}</div>
                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">${c.street}, ${c.city}</div>
                <div style="display: flex; gap: 8px; font-size: 11px; margin-bottom: 4px;">
                  <span>Пуршавӣ: <b>${c.fill_percentage}%</b></span>
                  <span>Ҳолат: <b style="color: ${isOverflow ? '#f87171' : '#34d399'}">${isOverflow ? 'Пур шуд' : 'Муътадил'}</b></span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1;">${c.address_description}</div>
              </div>
            `);

            marker.on('click', () => {
              if (onSelectContainer) onSelectContainer(c);
            });
          });
        }

        // Add Incidents
        if (filterType === 'all' || filterType === 'incidents' || filterType === 'overflowing') {
          incidents.forEach((inc) => {
            const isResolved = inc.status === 'resolved';
            const color = isResolved ? '#059669' : inc.priority === 'urgent' || inc.priority === 'high' ? '#dc2626' : '#f59e0b';
            const marker = L.marker([inc.latitude, inc.longitude], {
              icon: createSvgIcon(color, 'Ҳ'),
            }).addTo(map);

            marker.bindPopup(`
              <div style="padding: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">Ҳодиса: ${inc.id}</div>
                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">${inc.address}</div>
                <div style="font-size: 12px; margin-bottom: 4px;">${inc.description}</div>
                <div style="display: flex; gap: 8px; font-size: 11px;">
                  <span>Вазъ: <b>${inc.status}</b></span>
                  <span>Дараҷа: <b>${inc.priority}</b></span>
                </div>
              </div>
            `);

            marker.on('click', () => {
              if (onSelectIncident) onSelectIncident(inc);
            });
          });
        }

        // Location selection mode for citizen reporting
        if (selectableLocation) {
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            setChosenCoord({ lat, lng });
            const mockAddress = `Хуҷанд, наздикии нуқтаи координатавӣ (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            if (onLocationChosen) {
              onLocationChosen(lat, lng, mockAddress);
            }
          });
        }
      } catch (err) {
        console.error('Failed to load map library:', err);
        setMapError(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [containers, incidents, filterType, selectableLocation]);

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Map Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11221c] p-3 rounded-xl border border-[#1f3d32]">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-[#182f26]'
            }`}
          >
            Ҳама нуқтаҳо ({containers.length + incidents.length})
          </button>
          <button
            onClick={() => setFilterType('containers')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterType === 'containers'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-[#182f26]'
            }`}
          >
            Қуттиҳо ({containers.length})
          </button>
          <button
            onClick={() => setFilterType('incidents')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterType === 'incidents'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-[#182f26]'
            }`}
          >
            Ҳодисаҳо ({incidents.length})
          </button>
          <button
            onClick={() => setFilterType('overflowing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterType === 'overflowing'
                ? 'bg-red-600 text-white'
                : 'text-red-300 hover:bg-[#182f26]'
            }`}
          >
            Оҷилона / Пуршуда
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Шаҳр: <b>Хуҷанд (Маълумоти намоишӣ)</b></span>
        </div>
      </div>

      {/* Main Map or Fallback Table */}
      {mapError ? (
        /* Address-based list fallback when tiles/webgl cannot be rendered */
        <div className="bg-[#11221c] p-6 rounded-xl border border-[#1f3d32] flex flex-col gap-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>Рӯйхати фаврии суроғаҳо ва маконҳои партовгоҳ</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {containers.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-[#0d1a15] border border-[#1f3d32] text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-slate-100">{c.name_or_number}</div>
                  <div className="text-slate-400">{c.street}, {c.city}</div>
                </div>
                <span className={`px-2 py-1 rounded font-medium ${c.current_status === 'overflowing' ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'}`}>
                  {c.fill_percentage}% пур
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-[#1f3d32]">
          <div ref={mapContainerRef} className="w-full h-full" />
          {selectableLocation && (
            <div className="absolute top-3 left-3 z-[1000] bg-[#11221c]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1f3d32] text-xs text-slate-200 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Барои интихоби макони ҳодиса дар харита пахш кунед</span>
            </div>
          )}
          {chosenCoord && (
            <div className="absolute bottom-3 right-3 z-[1000] bg-[#11221c]/90 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs text-emerald-300">
              Макон сабт шуд: {chosenCoord.lat.toFixed(4)}, {chosenCoord.lng.toFixed(4)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
