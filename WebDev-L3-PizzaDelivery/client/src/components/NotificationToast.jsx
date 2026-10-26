import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export default function NotificationToast() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-orange-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-stone-900/95 text-emerald-200',
    warning: 'border-amber-500/40 bg-stone-900/95 text-amber-200',
    error: 'border-rose-500/40 bg-stone-900/95 text-rose-200',
    info: 'border-orange-500/40 bg-stone-900/95 text-orange-200'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle max-w-sm w-full pointer-events-none px-4">
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md pointer-events-auto ${borders[toast.type] || borders.info}`}
      >
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium text-stone-100 flex-1 leading-snug">{toast.message}</p>
      </div>
    </div>
  );
}
