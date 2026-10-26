import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, ShieldCheck, Heart, Sparkles, CheckCircle } from 'lucide-react';
import type { EcoPoint, Profile } from '@/src/types/database';
import { dbRepository } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/features/auth/AuthContext';

export const EcoPointsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [ecoPoints, setEcoPoints] = useState<EcoPoint[]>(dbRepository.getEcoPoints());
  const [profiles, setProfiles] = useState<Profile[]>(dbRepository.getProfiles());

  useEffect(() => {
    const unsub = dbRepository.subscribe(() => {
      setEcoPoints(dbRepository.getEcoPoints());
      setProfiles(dbRepository.getProfiles());
    });
    return unsub;
  }, []);

  // Compute public leaderboard
  const userScores: Record<string, { name: string; points: number; approvedReports: number }> = {};

  ecoPoints.forEach((ep) => {
    if (ep.verification_status !== 'approved') return;
    const profile = profiles.find((p) => p.id === ep.user_id);
    const displayName = profile ? profile.display_name : 'Шаҳрванди фаъол';

    if (!userScores[ep.user_id]) {
      userScores[ep.user_id] = { name: displayName, points: 0, approvedReports: 0 };
    }
    userScores[ep.user_id].points += ep.points;
    userScores[ep.user_id].approvedReports += 1;
  });

  const leaderboard = Object.values(userScores).sort((a, b) => b.points - a.points);

  const myApprovedPoints = ecoPoints
    .filter((ep) => ep.user_id === currentUser.id && ep.verification_status === 'approved')
    .reduce((sum, ep) => sum + ep.points, 0);

  const myPendingPoints = ecoPoints
    .filter((ep) => ep.user_id === currentUser.id && ep.verification_status === 'pending')
    .reduce((sum, ep) => sum + ep.points, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] to-[#122e23] border border-[#1f3d32] rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Барномаи ҳавасмандии экологии шаҳрвандон</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Барои шаҳри сабз ва тоза холҳо ба даст оред!
          </h2>
          <p className="text-xs text-slate-300">
            Ҳар як гузориши тасдиқшудаи шумо оид ба ифлосшавӣ ва қуттиҳои пуршуда холҳои экологӣ меорад. Холҳоро метавон барои имтиёзҳои коммуналӣ ва нишони ифтихории "Шаҳрванди намунавӣ" истифода бурд.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current User Balance & Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Ҳисоби эко-холҳои ман</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0d1a15] border border-[#1f3d32] rounded-lg">
                <div className="text-[11px] text-slate-400">Холҳои тасдиқшуда</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                  {myApprovedPoints}
                </div>
                <div className="text-[10px] text-emerald-300 mt-1">Фаъол барои истифода</div>
              </div>

              <div className="p-3 bg-[#0d1a15] border border-[#1f3d32] rounded-lg">
                <div className="text-[11px] text-slate-400">Дар интизори тасдиқ</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                  {myPendingPoints}
                </div>
                <div className="text-[10px] text-amber-300 mt-1">Пас аз тозакунӣ</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-200 mb-2">Таърихи холҳои охирин:</div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {ecoPoints
                  .filter((ep) => ep.user_id === currentUser.id)
                  .map((ep) => (
                    <div
                      key={ep.id}
                      className="p-2.5 bg-[#0d1a15] rounded border border-[#1f3d32] text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="text-slate-200 font-medium">{ep.reason}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ep.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          ep.verification_status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        +{ep.points}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Public City Leaderboard (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-[#11221c] border border-[#1f3d32] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f3d32] pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Ҷадвали пешсафони экологии шаҳри Хуҷанд</span>
              </h3>
              <span className="text-xs text-slate-400">Рейтинги ҷамъиятӣ</span>
            </div>

            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Ҳоло холҳои тасдиқшуда вуҷуд надоранд.
                </div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      idx === 0
                        ? 'bg-[#152e22] border-amber-500/50 text-slate-100'
                        : 'bg-[#0d1a15] border-[#1f3d32] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-[#1e3a30] text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.approvedReports} ҳисоботи тасдиқшуда
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold font-mono tabular-nums text-emerald-400">
                        {item.points}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">хол</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
