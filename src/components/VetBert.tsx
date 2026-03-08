import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = [
  'Что делать, если питомец не ест?',
  'Как часто нужна вакцинация?',
  'Симптомы отравления у кошки',
  'Сколько раз кормить щенка?',
  'Почему кот чихает?',
];

const PET_CONTEXT = {
  name: 'Барсик',
  type: 'Кот',
  breed: 'Шотландский вислоухий',
  age: '3 года',
  weight: '4.2 кг',
};

export default function VetBert({ apiUrl }: { apiUrl: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, open]);

  async function send(text: string) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setInput('');

    const updated: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, pet: PET_CONTEXT }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Не удалось получить ответ.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Ошибка соединения. Попробуйте позже.' }]);
    } finally {
      setLoading(false);
    }
  }

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
        {/* Badge */}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center pt-4">
                <div className="text-3xl mb-3">🩺</div>
                <p className="text-sm font-golos text-white/60 text-center leading-relaxed">
                  Привет! Я VetBERT — задай любой вопрос<br/>о здоровье питомца
                </p>
                <p className="text-[10px] text-white/30 font-golos mt-1 text-center">
                  Контекст: {PET_CONTEXT.name} · {PET_CONTEXT.breed} · {PET_CONTEXT.age}
                </p>
                {/* Quick questions */}
                <div className="mt-4 w-full space-y-1.5">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="w-full text-left px-3 py-2 text-xs font-golos border metro-tile transition-colors"
                      style={{ background: '#1a1d21', borderColor: '#2a2d33', color: '#ffffff80' }}
                    >
                      <span className="text-metro-teal mr-1.5">›</span>{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 flex items-center justify-center text-sm mr-2 mt-0.5 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00d4d8, #0078d4)' }}>
                    🐾
                  </div>
                )}
                <div
                  className="max-w-[78%] px-3 py-2 text-sm font-golos leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? '#0078d4' : '#1a1d21',
                    color: msg.role === 'user' ? '#fff' : '#ffffffcc',
                    borderLeft: msg.role === 'assistant' ? '2px solid #00d4d8' : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00d4d8, #0078d4)' }}>
                  🐾
                </div>
                <div className="px-3 py-2 border-l-2" style={{ background: '#1a1d21', borderColor: '#00d4d8' }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(j => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full bg-metro-teal"
                        style={{ animation: `bounce 1s ease-in-out ${j * 0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-0 border-t border-metro-border"
            style={{ background: '#1a1d21' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Спроси VetBERT..."
              className="flex-1 px-4 py-3 text-sm font-golos bg-transparent text-white outline-none placeholder-white/30"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="px-4 py-3 metro-tile transition-colors disabled:opacity-30"
              style={{ background: input.trim() ? '#00d4d8' : 'transparent' }}
            >
              <Icon name="Send" size={16}
                style={{ color: input.trim() ? '#000' : '#ffffff40' }} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
