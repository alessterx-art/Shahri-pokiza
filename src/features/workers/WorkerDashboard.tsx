import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  Upload,
  AlertTriangle,
  MapPin,
  Check,
  ChevronRight,
  History,
  Camera,
} from 'lucide-react';
import type { CleanupTask, Incident } from '@/src/types/database';
import { dbRepository } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/features/auth/AuthContext';
import { APP_IMAGES } from '@/src/assets/images';

export const WorkerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<CleanupTask[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedTask, setSelectedTask] = useState<CleanupTask | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // After cleanup photo upload
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [workerNote, setWorkerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const refreshData = () => {
      // Sanitation workers see their assigned tasks
      const allTasks = dbRepository.getTasks();
      const myTasks = allTasks.filter(
        (t) => t.assigned_worker_id === currentUser.id || currentUser.role === 'admin'
      );
      setTasks(myTasks);
      setIncidents(dbRepository.getIncidents());

      if (myTasks.length > 0 && !selectedTask) {
        setSelectedTask(myTasks[0]);
      }
    };

    refreshData();
    const unsub = dbRepository.subscribe(refreshData);
    return unsub;
  }, [currentUser]);

  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'verified');
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'verified');

  const handleStartTask = (taskId: string) => {
    dbRepository.updateTaskStatus(taskId, 'in_progress');
  };

  const handleCompleteTask = (taskId: string) => {
    if (!afterPhoto) {
      alert('Лутфан акси баъд аз тозакуниро боргузорӣ намоед!');
      return;
    }
    setIsSubmitting(true);
    dbRepository.updateTaskStatus(
      taskId,
      'completed',
      afterPhoto,
      workerNote || 'Тозакунии пурраи минтақа бомуваффақият анҷом ёфт'
    );
    setIsSubmitting(false);
    setAfterPhoto(null);
    setWorkerNote('');
  };

  const currentIncident = selectedTask
    ? incidents.find((i) => i.id === selectedTask.incident_id)
    : null;

  return (
    <div className="space-y-6">
      {/* Worker Header & Profile Card */}
      <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
            {currentUser.display_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">{currentUser.display_name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>Вазифа: <b>Бригадаи зудамали тозагӣ</b></span>
              <span>·</span>
              <span>Супоришҳои фаъол: <b className="text-emerald-400">{activeTasks.length}</b></span>
              <span>·</span>
              <span>Анҷомшуда: <b className="text-slate-200">{completedTasks.length}</b></span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-[#09120e] p-1 rounded-lg border border-[#1f3d32] text-xs">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Супоришҳои ҷорӣ ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Таърих ва ҳисобот ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Main Two-Column Task Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Task List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {activeTab === 'active' ? 'Рӯйхати супоришҳо барои иҷро' : 'Супоришҳои анҷомёфта'}
          </h3>

          {(activeTab === 'active' ? activeTasks : completedTasks).length === 0 ? (
            <div className="p-8 text-center bg-[#11221c] border border-[#1f3d32] rounded-xl text-xs text-slate-400">
              Ҳеҷ супорише дар ин бахш вуҷуд надорад.
            </div>
          ) : (
            (activeTab === 'active' ? activeTasks : completedTasks).map((task) => {
              const inc = incidents.find((i) => i.id === task.incident_id);
              const isSelected = selectedTask?.id === task.id;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#152a23] border-emerald-500 shadow-lg'
                      : 'bg-[#11221c] border-[#1f3d32] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-200">{task.id} · {task.incident_id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        task.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300'
                          : task.status === 'in_progress'
                          ? 'bg-blue-950 text-blue-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {task.status === 'completed'
                        ? 'Анҷом ёфт'
                        : task.status === 'in_progress'
                        ? 'Дар иҷро'
                        : 'Интизор'}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-slate-100 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{inc?.address || 'Суроға номаълум'}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                    {inc?.description || 'Тавзеҳот сабт нашудааст'}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-[#1f3d32]/60">
                    <span>Дараҷа: <b className="text-amber-400 uppercase">{inc?.priority || 'medium'}</b></span>
                    <span>{new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Task Execution & Photo Evidence (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTask && currentIncident ? (
            <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1f3d32] pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Иҷрои супориш: {selectedTask.id}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentIncident.address}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Дараҷаи оҷилӣ:</span>
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    {currentIncident.priority}
                  </span>
                </div>
              </div>

              {/* Task Details */}
              <div className="text-xs text-slate-300 bg-[#0d1a15] p-3 rounded-lg border border-[#1f3d32]">
                <span className="font-semibold text-slate-200">Тавсифи ифлосшавӣ: </span>
                {currentIncident.description}
              </div>

              {/* Photos: Before & After Evidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Акси пеш аз тозакунӣ (Далел)
                  </label>
                  <div className="aspect-video rounded-lg overflow-hidden border border-[#1f3d32] bg-black">
                    <img
                      src={
                        selectedTask.before_photo_path ||
                        currentIncident.photograph_path ||
                        APP_IMAGES.container
                      }
                      alt="Пеш аз тозакунӣ"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* After Photo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Акси баъд аз тозакунӣ (Натиҷа)
                  </label>
                  {selectedTask.after_photo_path ? (
                    <div className="aspect-video rounded-lg overflow-hidden border border-[#1f3d32] bg-black">
                      <img
                        src={selectedTask.after_photo_path}
                        alt="Баъд аз тозакунӣ"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : afterPhoto ? (
                    <div className="aspect-video rounded-lg overflow-hidden border border-emerald-500 bg-black relative">
                      <img
                        src={afterPhoto}
                        alt="Акси нав"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setAfterPhoto(null)}
                        className="absolute top-2 right-2 p-1 bg-black/70 rounded text-xs text-white"
                      >
                        Иваз
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border-2 border-dashed border-[#1f3d32] flex flex-col items-center justify-center p-4 bg-[#0c1813]">
                      <Camera className="w-8 h-8 text-emerald-400 mb-2" />
                      <label className="cursor-pointer text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                        <span>Бор кардани акси тозагӣ</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setAfterPhoto(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setAfterPhoto(APP_IMAGES.hero)
                        }
                        className="mt-2 text-[10px] text-slate-400 hover:text-emerald-300 underline"
                      >
                        Истифодаи акси намунавӣ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              {selectedTask.status === 'pending' && (
                <div className="pt-4 border-t border-[#1f3d32]">
                  <button
                    onClick={() => handleStartTask(selectedTask.id)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Қабул кардани супориш ва оғози кор</span>
                  </button>
                </div>
              )}

              {selectedTask.status === 'in_progress' && (
                <div className="space-y-4 pt-4 border-t border-[#1f3d32]">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Шарҳи корманд оид ба анҷоми тозакунӣ
                    </label>
                    <input
                      type="text"
                      value={workerNote}
                      onChange={(e) => setWorkerNote(e.target.value)}
                      placeholder="Масалан: Қуттӣ холӣ шуд, пиёдароҳ рӯбучин гардид..."
                      className="w-full px-3 py-2 bg-[#09120e] border border-[#1f3d32] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={() => handleCompleteTask(selectedTask.id)}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    <span>Тасдиқи анҷоми тозакунӣ ва фиристодани ҳисобот</span>
                  </button>
                </div>
              )}

              {selectedTask.status === 'completed' && (
                <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Супориш бомуваффақият иҷро шуд!</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Вақти анҷом:{' '}
                      {selectedTask.completed_at
                        ? new Date(selectedTask.completed_at).toLocaleString()
                        : 'Сабт гардид'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-12 text-center text-xs text-slate-400">
              Барои дидани ҷузъиёт супоришеро аз сутуни чап интихоб намоед.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
