import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import VetBertChat from '@/components/VetBertChat';

const PET_CONTEXT = {
  name: 'Барсик',
  type: 'Кот',
  breed: 'Шотландский вислоухий',
  age: '3 года',
  weight: '4.2 кг',
};

export default function VetBert({ apiUrl: _apiUrl }: { apiUrl: string }) {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed z-50 metro-tile transition-all"
        style={{
          right: 16,
          bottom: 88,
          width: 52,
          height: 52,
          background: open ? '#0f1114' : 'linear-gradient(135deg, #00d4d8, #0078d4)',
          border: `2px solid ${open ? '#00d4d8' : 'transparent'}`,
          boxShadow: pulse ? '0 0 0 8px rgba(0,212,216,0.2)' : '0 4px 20px rgba(0,212,216,0.3)',
          animation: pulse ? 'tile-pulse 1.5s ease-in-out 3' : 'none',
        }}
        title="VetBERT — AI ветеринар"
      >
        {open
          ? <Icon name="X" size={22} className="text-metro-teal" />
          : <span style={{ fontSize: 22 }}>🐾</span>
        }
        {!open && (
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center"
            style={{ background: '#e81123' }}>
            <span className="text-[9px] font-russo text-white">AI</span>
          </div>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-40 flex flex-col metro-fade-up"
          style={{
            right: 8,
            bottom: 152,
            width: 'calc(100vw - 16px)',
            maxWidth: 420,
            height: 480,
            background: '#0f1114',
            border: '1px solid #2a2d33',
            borderTop: '3px solid #00d4d8',
            animationFillMode: 'forwards',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-metro-border"
            style={{ background: '#1a1d21' }}>
            <div className="w-8 h-8 flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00d4d8, #0078d4)' }}>
              🐾
            </div>
            <div className="flex-1">
              <p className="font-russo text-sm text-white tracking-wider">VetBERT</p>
              <p className="text-[10px] text-metro-teal font-golos">AI-ветеринарный помощник</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-white/40 font-golos">онлайн</span>
            </div>
          </div>

          <VetBertChat pet={PET_CONTEXT} storageKey="vetbert_history" />
        </div>
      )}
    </>
  );
}