import React, { useState } from 'react';
import { Database, X, Check, RefreshCw, Key, Globe, Shield } from 'lucide-react';
import { dbRepository, isLiveSupabaseConfigured } from '@/src/lib/supabase/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('user_supabase_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    localStorage.getItem('user_supabase_key') || ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl && supabaseKey) {
      localStorage.setItem('user_supabase_url', supabaseUrl);
      localStorage.setItem('user_supabase_key', supabaseKey);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        window.location.reload();
      }, 1000);
    }
  };

  const handleResetData = () => {
    if (confirm('Оё мехоҳед ҳамаи маълумоти санҷиширо ба ҳолати аввала баргардонед?')) {
      dbRepository.resetDemoData();
      alert('Маълумоти санҷишӣ бомуваффақият барқарор карда шуд!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#11221c] border border-[#1f3d32] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1f3d32] pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              Танзимоти пойгоҳи додаҳои Supabase
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182f26]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-2">
          <div className="p-3 rounded-lg bg-[#0d1a15] border border-[#1f3d32] flex items-center justify-between">
            <span>Ҳолати фаъол:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                isLiveSupabaseConfigured
                  ? 'bg-emerald-950 text-emerald-300'
                  : 'bg-emerald-950/80 text-emerald-300'
              }`}
            >
              {isLiveSupabaseConfigured
                ? 'Supabase Cloud (PostgreSQL Фаъол)'
                : 'Ҳолати озмоишӣ / Демо бо меъмории Supabase'}
            </span>
          </div>

          <p className="text-slate-400">
            Барнома ба меъмории комили Supabase (PostgreSQL, RLS, Storage) мутобиқ аст. Барои пайваст кардани лоиҳаи шахсии худ, маълумотро ворид намоед:
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project URL (VITE_SUPABASE_URL)</span>
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#09120e] border border-[#1f3d32] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anon Public Key (VITE_SUPABASE_ANON_KEY)</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 bg-[#09120e] border border-[#1f3d32] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Танзимот сабт гардид! Саҳифа навсозӣ мешавад...</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[#1f3d32]">
            <button
              type="button"
              onClick={handleResetData}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
            >
              Барқароркунии маълумоти демо
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Пӯшидан
              </button>
              <button
                type="submit"
                disabled={!supabaseUrl || !supabaseKey}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Пайваст кардан
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
