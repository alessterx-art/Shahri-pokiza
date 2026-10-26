import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Camera,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Settings,
  Sparkles,
  Users,
  Video,
  Award,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/src/features/auth/AuthContext';
import { dbRepository } from '@/src/lib/supabase/client';
import type {
  WasteContainer,
  Incident,
  CleanupTask,
  UserRole,
  NotificationItem,
} from '@/src/types/database';

import { CityMap } from '@/src/features/map/CityMap';
import { ReportIncidentModal } from '@/src/features/incidents/ReportIncidentModal';
import { CCTVMonitoringPanel } from '@/src/features/cameras/CCTVMonitoringPanel';
import { WorkerDashboard } from '@/src/features/workers/WorkerDashboard';
import { AdminDashboard } from '@/src/features/admin/AdminDashboard';
import { EcoPointsPanel } from '@/src/features/eco-points/EcoPointsPanel';
import { SettingsModal } from '@/src/components/SettingsModal';

type MainTab = 'map' | 'admin' | 'workers' | 'cctv' | 'eco';

function MainApp() {
  const { currentUser, switchRole, allProfiles } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>('map');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Data states from Supabase repository
  const [containers, setContainers] = useState<WasteContainer[]>(dbRepository.getContainers());
  const [incidents, setIncidents] = useState<Incident[]>(dbRepository.getIncidents());
  const [tasks, setTasks] = useState<CleanupTask[]>(dbRepository.getTasks());
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    dbRepository.getNotifications(currentUser.id)
  );

  useEffect(() => {
    const unsub = dbRepository.subscribe(() => {
      setContainers(dbRepository.getContainers());
      setIncidents(dbRepository.getIncidents());
      setTasks(dbRepository.getTasks());
      setNotifications(dbRepository.getNotifications(currentUser.id));
    });
    return unsub;
  }, [currentUser]);

  // Real KPI numbers
  const totalContainers = containers.length;
  const overflowingCount = containers.filter((c) => c.current_status === 'overflowing').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;
  const unreadNotifs = notifications.filter((n) => !n.read_status).length;

  // Strict Role Guard
  const canAccessAdmin = currentUser.role === 'admin';
  const canAccessWorkers = currentUser.role === 'admin' || currentUser.role === 'sanitation_worker';

  return (
    <div className="min-h-screen bg-[#0c1512] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* =========================================================================
          1. TOP BAR CONTRACT: [Brand title] — [4–5 nav links] — [1 primary action]
          ========================================================================= */}
      <header className="border-b border-[#1f3d32] bg-[#0c1813]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('map');
            }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Шаҳри Покиза</span>
          </a>

          {/* Zone 2: 4-5 single-line navigation text links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setActiveTab('map')}
              className={`hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'map' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
              }`}
            >
              Харитаи шаҳр
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'admin' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
              }`}
            >
              Мудирият (Админ)
            </button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'workers' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
              }`}
            >
              Коргарони тозагӣ
            </button>
            <button
              onClick={() => setActiveTab('cctv')}
              className={`hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'cctv' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
              }`}
            >
              Камераҳои CCTV
            </button>
            <button
              onClick={() => setActiveTab('eco')}
              className={`hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'eco' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
              }`}
            >
              Эко-холҳо
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-[#182f26] transition-colors relative"
                title="Огоҳиҳо"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#11221c] border border-[#1f3d32] rounded-xl shadow-2xl p-4 z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-200 border-b border-[#1f3d32] pb-2">
                    <span>Огоҳиномаҳо ({notifications.length})</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">Огоҳиномаи нав нест</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded bg-[#0d1a15] border border-[#1f3d32] space-y-1"
                        >
                          <div className="font-semibold text-emerald-300">{n.title}</div>
                          <div className="text-slate-300 text-[11px]">{n.message}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-[#182f26] transition-colors"
              title="Танзимоти Supabase"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Хабар додан</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around border-t border-[#1f3d32] px-2 py-2 text-[11px] overflow-x-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'map' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Харита
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Мудирият
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'workers' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Коргарон
          </button>
          <button
            onClick={() => setActiveTab('cctv')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'cctv' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            CCTV
          </button>
          <button
            onClick={() => setActiveTab('eco')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'eco' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Эко-холҳо
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. COMPETITION DEMONSTRATION & ROLE SWITCHER BAR (Zero-Friction for Judges)
          ========================================================================= */}
      <div className="bg-[#09120e] border-b border-[#1f3d32] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Ҳолати намоиши озмунӣ:
            </span>
            <span className="text-slate-400">
              Технология барои шаҳри тоза ва ояндаи сабз
            </span>
          </div>

          {/* Interactive Role Switcher for Competition Judges */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Нақши корбар барои санҷиш:</span>
            <div className="flex items-center gap-1 bg-[#11221c] p-0.5 rounded-lg border border-[#1f3d32]">
              <button
                onClick={() => switchRole('admin')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Мудир (Admin)
              </button>
              <button
                onClick={() => switchRole('sanitation_worker')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentUser.role === 'sanitation_worker'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Коргари тозагӣ
              </button>
              <button
                onClick={() => switchRole('public_user')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentUser.role === 'public_user'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Шаҳрванд
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN CONTENT VIEWPORT
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: SMART CITY MAP & CITIZEN PORTAL */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Hero Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Clean Urban Vision (7 cols) */}
              <div className="lg:col-span-7 bg-[#11221c] border border-[#1f3d32] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Шаҳри Хуҷанд · Низоми ягонаи электронии партовҳо</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
                    Шаҳри Покиза — Назорати ҳушманд барои ояндаи сабз
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    Аввалин низоми пурраи муттаҳидшуда дар Тоҷикистон бо истифода аз зеҳни сунъӣ (Gemini Vision AI), камераҳои назоратӣ (CCTV) ва харитаи маҳаллии қуттиҳои партов.
                  </p>
                </div>

                <div className="pt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Хабар додани ифлосшавӣ бо акс</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-5 py-2.5 bg-[#182f26] hover:bg-[#1f3d32] text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all border border-[#1f3d32]"
                  >
                    <span>Панели мудирият</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Hero High-Fidelity City Photography (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#1f3d32] bg-black relative min-h-[260px]">
                <img
                  src="/src/assets/images/hero_smart_city_khujand_1792953898192.jpg"
                  alt="Хуҷанд — Шаҳри тоза"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <div className="text-xs font-bold text-white">Соҳили дарёи Сир, Хуҷанд</div>
                  <div className="text-[11px] text-emerald-300">
                    Қуттиҳои ҳушманд ва гулгаштҳои экологии намунавӣ
                  </div>
                </div>
              </div>
            </div>

            {/* 4 KPI Strip Placed in Full-Width Row Below Hero Split */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
                <div className="text-[11px] text-slate-400">Қуттиҳои ҳушманд</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-100 mt-1">
                  {totalContainers}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Нуқтаҳои назоратшуда</div>
              </div>

              <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
                <div className="text-[11px] text-slate-400">Қуттиҳои пуршуда</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-red-400 mt-1">
                  {overflowingCount}
                </div>
                <div className="text-[10px] text-red-300 mt-0.5">Ба тозакунӣ ниёз доранд</div>
              </div>

              <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
                <div className="text-[11px] text-slate-400">Ҳодисаҳои фаъол</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                  {activeIncidents}
                </div>
                <div className="text-[10px] text-amber-300 mt-0.5">Дар раванди ҳаллу фасл</div>
              </div>

              <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
                <div className="text-[11px] text-slate-400">Тозакуниҳои тасдиқшуда</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                  {resolvedCount}
                </div>
                <div className="text-[10px] text-emerald-300 mt-0.5">Бо акси "Баъд аз тозакунӣ"</div>
              </div>
            </div>

            {/* Interactive Leaflet City Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span>Харитаи интерактивии тозагии шаҳри Хуҷанд</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ҳолати зиндаи қуттиҳо, партовгоҳҳои оҷил ва супоришҳои фаъол
                  </p>
                </div>
              </div>

              <CityMap
                containers={containers}
                incidents={incidents}
                onSelectIncident={(inc) => {
                  if (canAccessAdmin) {
                    setActiveTab('admin');
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: ADMINISTRATIVE DASHBOARD */}
        {activeTab === 'admin' && (
          <div>
            {!canAccessAdmin ? (
              <div className="bg-[#11221c] border border-red-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
                <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-100">Дастрасӣ маҳдуд аст</h3>
                <p className="text-xs text-slate-300">
                  Саҳифаи мудирият танҳо барои кормандони дорои ваколати "Мудир" (Admin) дастрас мебошад. Мувофиқи қоидаҳои амниятии Supabase Row Level Security (RLS), корбарони оддӣ наметавонанд ба ин сабтҳо дастрасӣ пайдо кунанд.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => switchRole('admin')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                  >
                    Гузариш ба нақши "Мудир (Admin)" барои озмун
                  </button>
                </div>
              </div>
            ) : (
              <AdminDashboard />
            )}
          </div>
        )}

        {/* TAB 3: WORKER DASHBOARD */}
        {activeTab === 'workers' && (
          <div>
            {!canAccessWorkers ? (
              <div className="bg-[#11221c] border border-amber-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
                <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-100">
                  Дастрасӣ танҳо барои кормандони тозагӣ
                </h3>
                <p className="text-xs text-slate-300">
                  Барои дидани супоришҳои амалиётӣ ва боргузории аксҳои "Пеш ва баъд аз тозакунӣ", шумо бояд нақши "Коргари тозагӣ" ё "Мудир"-ро дошта бошед.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => switchRole('sanitation_worker')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs"
                  >
                    Гузариш ба нақши "Коргари тозагӣ" барои озмун
                  </button>
                </div>
              </div>
            ) : (
              <WorkerDashboard />
            )}
          </div>
        )}

        {/* TAB 4: CCTV SURVEILLANCE & EVIDENCE */}
        {activeTab === 'cctv' && (
          <div>
            <CCTVMonitoringPanel />
          </div>
        )}

        {/* TAB 5: ECO POINTS & LEADERBOARD */}
        {activeTab === 'eco' && (
          <div>
            <EcoPointsPanel />
          </div>
        )}
      </main>

      {/* =========================================================================
          4. CITIZEN INCIDENT REPORT MODAL
          ========================================================================= */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onIncidentCreated={(id) => {
          alert(`Ҳисоботи шумо бомуваффақият қабул шуд (ID: ${id}) ва ба мудирият ирсол гардид!`);
        }}
      />

      {/* =========================================================================
          5. SETTINGS & SUPABASE CONFIGURATION MODAL
          ========================================================================= */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* =========================================================================
          6. QUIET FOOTER
          ========================================================================= */}
      <footer className="border-t border-[#1f3d32] bg-[#0c1813] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Шаҳри Покиза</span>
            <span>·</span>
            <span>Низоми идоракунии партовҳои ҳушманд дар Тоҷикистон</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Пойгоҳи додаҳо: <b>Supabase PostgreSQL</b></span>
            <span>·</span>
            <span>Таҳлили тасвир: <b>Gemini Vision AI</b></span>
            <span>·</span>
            <span>Лоиҳаи озмунӣ 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
