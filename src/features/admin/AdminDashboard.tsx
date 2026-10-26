import React, { useState, useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  UserCheck,
  Shield,
  FileText,
  MapPin,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import type {
  WasteContainer,
  Incident,
  CleanupTask,
  Profile,
  AuditLog,
  UserRole,
} from '@/src/types/database';
import { dbRepository } from '@/src/lib/supabase/client';

interface AdminDashboardProps {
  onSelectIncidentForMap?: (incident: Incident) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectIncidentForMap }) => {
  const [containers, setContainers] = useState<WasteContainer[]>(dbRepository.getContainers());
  const [incidents, setIncidents] = useState<Incident[]>(dbRepository.getIncidents());
  const [tasks, setTasks] = useState<CleanupTask[]>(dbRepository.getTasks());
  const [profiles, setProfiles] = useState<Profile[]>(dbRepository.getProfiles());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(dbRepository.getAuditLogs());

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Active view tab in Admin
  const [currentTab, setCurrentTab] = useState<'overview' | 'incidents' | 'workers' | 'audit'>('overview');

  // Selected incident for assignment modal
  const [assigningIncident, setAssigningIncident] = useState<Incident | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  useEffect(() => {
    const unsub = dbRepository.subscribe(() => {
      setContainers(dbRepository.getContainers());
      setIncidents(dbRepository.getIncidents());
      setTasks(dbRepository.getTasks());
      setProfiles(dbRepository.getProfiles());
      setAuditLogs(dbRepository.getAuditLogs());
    });
    return unsub;
  }, []);

  // Real Metric Calculations
  const totalContainers = containers.length;
  const overflowingContainers = containers.filter((c) => c.current_status === 'overflowing').length;
  const newIncidents = incidents.filter((i) => i.status === 'new').length;
  const underReviewIncidents = incidents.filter((i) => i.status === 'under_review').length;
  const activeAssignedTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'pending').length;
  const completedCleanups = tasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;

  const sanitationWorkers = profiles.filter((p) => p.role === 'sanitation_worker');

  // Filtered Incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || inc.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || inc.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleAssignWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningIncident || !selectedWorkerId) return;

    dbRepository.updateIncident(assigningIncident.id, {
      assigned_worker_id: selectedWorkerId,
      status: 'assigned',
    });

    setAssigningIncident(null);
    setSelectedWorkerId('');
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    dbRepository.updateProfileRole(userId, newRole);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f3d32] pb-4">
        <div className="flex items-center gap-1.5 bg-[#09120e] p-1 rounded-xl border border-[#1f3d32] text-xs">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Нишондодҳои умумӣ
          </button>
          <button
            onClick={() => setCurrentTab('incidents')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab === 'incidents' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ҳодисаҳо ва супоришҳо ({incidents.length})
          </button>
          <button
            onClick={() => setCurrentTab('workers')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab === 'workers' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Кормандон ва нақшҳо ({profiles.length})
          </button>
          <button
            onClick={() => setCurrentTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab === 'audit' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Журнали аудит ({auditLogs.length})
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Минтақаи назорат: <b>Шаҳри Хуҷанд (Вилояти Суғд)</b>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* 6 Key Performance Metrics (Tabular Numerals) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
              <div className="text-[11px] text-slate-400">Ҳамаи қуттиҳо</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-100 mt-1">
                {totalContainers}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                <span>Нуқтаҳои фаъол</span>
              </div>
            </div>

            <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
              <div className="text-[11px] text-slate-400">Пуршуда / Оҷилӣ</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-red-400 mt-1">
                {overflowingContainers}
              </div>
              <div className="text-[10px] text-red-300 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Эҳтиёҷ ба холӣ кардан</span>
              </div>
            </div>

            <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
              <div className="text-[11px] text-slate-400">Ҳодисаҳои нав</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                {newIncidents}
              </div>
              <div className="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Бе вобастагӣ</span>
              </div>
            </div>

            <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
              <div className="text-[11px] text-slate-400">Интизори тасдиқ</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-400 mt-1">
                {underReviewIncidents}
              </div>
              <div className="text-[10px] text-blue-300 mt-1">Аз камераҳои CCTV</div>
            </div>

            <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
              <div className="text-[11px] text-slate-400">Дар иҷрои коргарон</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-400 mt-1">
                {activeAssignedTasks}
              </div>
              <div className="text-[10px] text-indigo-300 mt-1">Бригадаҳои зудамал</div>
            </div>

            <div className="bg-[#11221c] p-4 rounded-xl border border-[#1f3d32]">
              <div className="text-[11px] text-slate-400">Тозакуниҳои анҷомёфта</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                {completedCleanups}
              </div>
              <div className="text-[10px] text-emerald-300 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Тасдиқ бо акс</span>
              </div>
            </div>
          </div>

          {/* Container Telemetry Grid */}
          <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center justify-between">
              <span>Ҳолати сенсорҳои сатҳи пуршавии қуттиҳо (IoT Telemetry)</span>
              <span className="text-xs font-normal text-slate-400">Навсозии автоматӣ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {containers.map((container) => {
                const isOver = container.current_status === 'overflowing';
                return (
                  <div
                    key={container.id}
                    className="p-4 bg-[#0d1a15] border border-[#1f3d32] rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">{container.name_or_number}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isOver ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {isOver ? 'Пур шуд' : 'Муътадил'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      <div>{container.street}, {container.city}</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{container.address_description}</div>
                    </div>

                    {/* Fill Level Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Сатҳи партов:</span>
                        <span className="font-mono font-bold tabular-nums text-slate-200">
                          {container.fill_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#182f26] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isOver ? 'bg-red-500' : container.fill_percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${container.fill_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-[#1f3d32]/60">
                      <span>Намуд: <b>{container.waste_type}</b></span>
                      <span>
                        Санҷиш:{' '}
                        {new Date(container.last_inspection).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INCIDENTS TAB */}
      {currentTab === 'incidents' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ҷустуҷӯ аз рӯи суроға ё тавсиф..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#09120e] border border-[#1f3d32] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#09120e] border border-[#1f3d32] rounded-lg px-3 py-2 text-slate-300 focus:outline-none"
            >
              <option value="all">Ҳамаи вазъҳо</option>
              <option value="new">Нав</option>
              <option value="under_review">Интизори тасдиқ</option>
              <option value="assigned">Вобасташуда</option>
              <option value="in_progress">Дар иҷро</option>
              <option value="resolved">Ҳалшуда</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#09120e] border border-[#1f3d32] rounded-lg px-3 py-2 text-slate-300 focus:outline-none"
            >
              <option value="all">Ҳама категорияҳо</option>
              <option value="overflowing_bin">Қуттии пуршуда</option>
              <option value="garbage_outside">Партов дар берун</option>
              <option value="litter_scattered">Партовҳои пароканда</option>
              <option value="dirty_public_area">Минтақаи ифлосшуда</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#09120e] border border-[#1f3d32] rounded-lg px-3 py-2 text-slate-300 focus:outline-none"
            >
              <option value="all">Ҳама дараҷаҳо</option>
              <option value="urgent">Оҷилӣ (Urgent)</option>
              <option value="high">Баланд (High)</option>
              <option value="medium">Миёна (Medium)</option>
              <option value="low">Паст (Low)</option>
            </select>
          </div>

          {/* Incidents Table */}
          <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0c1813] border-b border-[#1f3d32] text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3">ID / Сана</th>
                    <th className="p-3">Суроға ва Тавсиф</th>
                    <th className="p-3">Акс / Далел</th>
                    <th className="p-3">Дараҷа</th>
                    <th className="p-3">Ҳолат</th>
                    <th className="p-3">Корманди вобаста</th>
                    <th className="p-3 text-right">Амалиёт</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f3d32]/60">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Ҳодисае бо ин меъёрҳо ёфт нашуд.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => {
                      const assignedWorker = profiles.find((p) => p.id === inc.assigned_worker_id);

                      return (
                        <tr key={inc.id} className="hover:bg-[#142820] transition-colors">
                          <td className="p-3">
                            <div className="font-mono font-bold text-slate-200">{inc.id}</div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="font-semibold text-slate-100">{inc.address}</div>
                            <div className="text-slate-400 text-[11px] line-clamp-1">{inc.description}</div>
                          </td>
                          <td className="p-3">
                            {inc.photograph_path ? (
                              <div className="w-12 h-10 rounded overflow-hidden border border-[#1f3d32] bg-black">
                                <img
                                  src={inc.photograph_path}
                                  alt="Далел"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                inc.priority === 'urgent'
                                  ? 'bg-red-950 text-red-300'
                                  : inc.priority === 'high'
                                  ? 'bg-amber-950 text-amber-300'
                                  : 'bg-emerald-950 text-emerald-300'
                              }`}
                            >
                              {inc.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                inc.status === 'resolved'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : inc.status === 'in_progress'
                                  ? 'bg-blue-950 text-blue-300'
                                  : inc.status === 'assigned'
                                  ? 'bg-indigo-950 text-indigo-300'
                                  : 'bg-amber-950 text-amber-300'
                              }`}
                            >
                              {inc.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {assignedWorker ? (
                              <div className="font-medium text-slate-200">{assignedWorker.display_name}</div>
                            ) : (
                              <span className="text-amber-400 text-[11px]">Таъин нашудааст</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {inc.status !== 'resolved' && (
                              <button
                                onClick={() => {
                                  setAssigningIncident(inc);
                                  setSelectedWorkerId(inc.assigned_worker_id || sanitationWorkers[0]?.id || '');
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] transition-colors"
                              >
                                {inc.assigned_worker_id ? 'Тағйири коргар' : 'Вобастакунӣ'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WORKERS & ROLES TAB */}
      {currentTab === 'workers' && (
        <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f3d32] pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Идоракунии ҳайати кормандон ва нақшҳои корбарӣ</span>
              </h3>
              <p className="text-xs text-slate-400">
                Танҳо мудири бахш (Админ) метавонад нақши кормандиро тасдиқ ё тағйир диҳад.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#1f3d32]/60">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#182f26] border border-[#1f3d32] flex items-center justify-center font-bold text-emerald-400">
                    {profile.display_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">{profile.display_name}</div>
                    <div className="text-slate-400 text-[11px]">{profile.phone || 'Телефон сабт нашудааст'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      profile.role === 'admin'
                        ? 'bg-purple-950 text-purple-300'
                        : profile.role === 'sanitation_worker'
                        ? 'bg-blue-950 text-blue-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {profile.role === 'admin'
                      ? 'Мудир (Admin)'
                      : profile.role === 'sanitation_worker'
                      ? 'Коргари тозагӣ'
                      : 'Шаҳрванд (Public)'}
                  </span>

                  {/* Change Role Selector */}
                  <select
                    value={profile.role}
                    onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                    className="bg-[#09120e] border border-[#1f3d32] rounded px-2.5 py-1 text-slate-300 focus:outline-none text-[11px]"
                  >
                    <option value="admin">Мудир (Admin)</option>
                    <option value="sanitation_worker">Коргари тозагӣ</option>
                    <option value="public_user">Шаҳрванд (Public)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {currentTab === 'audit' && (
        <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f3d32] pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Журнали расмии аудит ва назорати амалиёт (Audit Trail)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ҳамаи вобастакуниҳо, тасдиқи камераҳо ва тағйироти вазъи қуттиҳо сабт мегарданд.
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#0d1a15] border border-[#1f3d32] rounded-lg text-xs flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-200">{log.action}</div>
                  <div className="text-slate-400 text-[11px]">
                    Сабти дахлдор: <b>{log.affected_record}</b> · Иҷрокунанда: {log.actor_name || 'Система'}
                  </div>
                  {log.details && (
                    <div className="text-[10px] text-emerald-400/80 font-mono mt-1">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assigningIncident && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#11221c] border border-[#1f3d32] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              Вобаста кардани супориш: {assigningIncident.id}
            </h3>
            <p className="text-xs text-slate-300">
              Суроға: <b>{assigningIncident.address}</b>
            </p>

            <form onSubmit={handleAssignWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Интихоби корманд ё бригадаи зудамал
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#09120e] border border-[#1f3d32] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Кормандро интихоб намоед --</option>
                  {sanitationWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.display_name} ({w.phone || 'Тамос'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1f3d32]">
                <button
                  type="button"
                  onClick={() => setAssigningIncident(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Бекор кардан
                </button>
                <button
                  type="submit"
                  disabled={!selectedWorkerId}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-lg"
                >
                  Таъин ва ирсоли супориш
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
