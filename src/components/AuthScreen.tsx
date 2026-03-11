import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const AUTH_URL = 'https://functions.poehali.dev/9e7997d4-53b1-462a-b120-1690f85671a0';

interface AuthUser {
  token: string;
  user_id: number;
  phone: string;
}

interface Props {
  onAuth: (user: AuthUser) => void;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  let d = digits;
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let result = '+7';
  if (d.length > 1) result += ' (' + d.slice(1, 4);
  if (d.length > 4) result += ') ' + d.slice(4, 7);
  if (d.length > 7) result += '-' + d.slice(7, 9);
  if (d.length > 9) result += '-' + d.slice(9, 11);
  return result;
}

export default function AuthScreen({ onAuth }: Props) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startTimer() {
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function handlePhoneInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const digits = val.replace(/\D/g, '');
    setRawPhone(digits);
    setPhone(formatPhone(digits));
    setError('');
  }

  async function sendOtp() {
    const digits = rawPhone.replace(/\D/g, '');
    const normalized = (digits.startsWith('8') ? '7' + digits.slice(1) : digits.startsWith('7') ? digits : '7' + digits);
    if (normalized.length !== 11) {
      setError('Введите корректный номер');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: '+' + normalized }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка'); return; }
      setStep('code');
      startTimer();
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }

  function handleCodeInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
    if (newCode.every(c => c !== '') && value) {
      verifyOtp(newCode.join(''));
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }

  async function verifyOtp(fullCode: string) {
    const digits = rawPhone.replace(/\D/g, '');
    const normalized = (digits.startsWith('8') ? '7' + digits.slice(1) : digits.startsWith('7') ? digits : '7' + digits);
    setLoading(true);
    setError('');
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: '+' + normalized, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Неверный код');
        setCode(['', '', '', '', '', '']);
        setTimeout(() => codeRefs.current[0]?.focus(), 50);
        return;
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({ token: data.token, user_id: data.user_id, phone: data.phone }));
      onAuth({ token: data.token, user_id: data.user_id, phone: data.phone });
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center px-6"
      style={{ background: '#0f1114' }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d4d8, #0078d4)' }}>
            <span className="text-xl">🐾</span>
          </div>
          <span className="font-russo text-2xl text-white tracking-widest uppercase">PetTrack</span>
        </div>
        <p className="text-xs text-white/40 font-golos">Трекер для ваших питомцев</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm border"
        style={{ background: '#1a1d21', borderColor: '#2a2d33', borderTop: '3px solid #00d4d8' }}>

        {step === 'phone' ? (
          <div className="p-6">
            <p className="font-russo text-lg text-white mb-1 tracking-wider">ВХОД</p>
            <p className="text-xs text-white/40 font-golos mb-6">Введите номер телефона — мы пришлём код</p>

            <div className="mb-4">
              <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneInput}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="+7 (999) 000-00-00"
                autoFocus
                className="w-full px-4 py-3 text-sm font-golos text-white outline-none border"
                style={{ background: '#0f1114', borderColor: error ? '#e81123' : '#2a2d33' }}
              />
              {error && <p className="text-[11px] text-red-400 font-golos mt-1.5">{error}</p>}
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-3 font-russo text-sm tracking-widest uppercase transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d4d8, #0078d4)', color: '#000' }}
            >
              {loading ? 'ОТПРАВЛЯЕМ...' : 'ПОЛУЧИТЬ КОД'}
            </button>

            <p className="text-[10px] text-white/20 font-golos text-center mt-4 leading-relaxed">
              Нажимая кнопку, вы соглашаетесь<br/>с условиями использования сервиса
            </p>
          </div>
        ) : (
          <div className="p-6">
            <button onClick={() => { setStep('phone'); setCode(['','','','','','']); setError(''); }}
              className="flex items-center gap-1.5 text-metro-teal text-xs font-golos mb-4 hover:opacity-70 transition-opacity">
              <Icon name="ChevronLeft" size={14} /> Изменить номер
            </button>

            <p className="font-russo text-lg text-white mb-1 tracking-wider">КОД ПОДТВЕРЖДЕНИЯ</p>
            <p className="text-xs text-white/40 font-golos mb-1">Отправлен на <span className="text-metro-teal">{phone}</span></p>
            <p className="text-[10px] text-white/25 font-golos mb-6">Код действителен 5 минут</p>

            <div className="flex gap-2 mb-4 justify-between">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { codeRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeInput(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  className="flex-1 h-12 text-center text-xl font-russo text-white outline-none border"
                  style={{
                    background: '#0f1114',
                    borderColor: error ? '#e81123' : digit ? '#00d4d8' : '#2a2d33',
                    maxWidth: 44,
                  }}
                />
              ))}
            </div>

            {error && <p className="text-[11px] text-red-400 font-golos mb-3 text-center">{error}</p>}

            <button
              onClick={() => verifyOtp(code.join(''))}
              disabled={loading || code.some(c => !c)}
              className="w-full py-3 font-russo text-sm tracking-widest uppercase transition-opacity disabled:opacity-50 mb-4"
              style={{ background: 'linear-gradient(135deg, #00d4d8, #0078d4)', color: '#000' }}
            >
              {loading ? 'ПРОВЕРЯЕМ...' : 'ВОЙТИ'}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-xs text-white/30 font-golos">Повторная отправка через {timer} сек</p>
              ) : (
                <button onClick={sendOtp} disabled={loading}
                  className="text-xs text-metro-teal font-golos hover:opacity-70 transition-opacity">
                  Отправить код повторно
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
