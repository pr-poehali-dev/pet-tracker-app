import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const VETBERT_URL = 'https://functions.poehali.dev/12f25ae3-c3fd-4bde-99e1-7019420bee8a';

export interface PetContext {
  name: string;
  type: string;
  breed: string;
  age: string;
  weight: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  pet: PetContext;
  storageKey?: string;
  quickQuestions?: string[];
}

const DEFAULT_QUICK: string[] = [
  'Что делать, если питомец не ест?',
  'Как часто нужна вакцинация?',
  'Симптомы отравления',
  'Сколько раз кормить в день?',
];

export default function VetBertChat({ pet, storageKey, quickQuestions }: Props) {
  const key = storageKey || `vetbert_${pet.name}`;
  const questions = quickQuestions || DEFAULT_QUICK;

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.warn('VetBertChat: failed to save history', e);
    }
  }, [messages, key]);

  async function send(text: string) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setInput('');
    const updated: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await fetch(VETBERT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, pet }),
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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-3">
            <div className="text-3xl mb-2">🩺</div>
            <p className="text-sm font-golos text-white/60 text-center leading-relaxed">
              Задай вопрос про <span className="text-white">{pet.name}</span>
            </p>
            <p className="text-[10px] text-white/30 font-golos mt-1 text-center">
              {pet.breed} · {pet.age} · {pet.weight}
            </p>
            <div className="mt-4 w-full space-y-1.5">
              {questions.map((q, i) => (
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

      {/* Clear button */}
      {messages.length > 0 && (
        <div className="px-3 pb-1 flex justify-end">
          <button onClick={() => setMessages([])}
            className="flex items-center gap-1 text-[10px] text-white/25 font-golos hover:text-white/50 transition-colors">
            <Icon name="Trash2" size={11} /> Очистить
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center border-t border-metro-border" style={{ background: '#1a1d21' }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder={`Спроси про ${pet.name}...`}
          className="flex-1 px-4 py-3 text-sm font-golos bg-transparent text-white outline-none placeholder-white/30"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-3 metro-tile transition-colors disabled:opacity-30"
          style={{ background: input.trim() ? '#00d4d8' : 'transparent' }}
        >
          <Icon name="Send" size={16} style={{ color: input.trim() ? '#000' : '#ffffff40' }} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
