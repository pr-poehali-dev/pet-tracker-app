import { useState } from 'react';
import Icon from '@/components/ui/icon';

type Tab = 'map' | 'animals' | 'donate';

const SHELTERS = [
  {
    id: 1,
    name: 'Приют «Хвостатый друг»',
    address: 'ул. Лесная, 14, Москва',
    animals: 87,
    raised: 124500,
    goal: 200000,
    phone: '+7 (495) 123-45-67',
    coords: { top: '38%', left: '44%' },
    color: '#0078d4',
  },
  {
    id: 2,
    name: 'Приют «Добрые лапки»',
    address: 'пр. Мира, 33, Москва',
    animals: 52,
    raised: 89300,
    goal: 150000,
    phone: '+7 (495) 987-65-43',
    coords: { top: '52%', left: '60%' },
    color: '#107c10',
  },
  {
    id: 3,
    name: 'Приют «Второй шанс»',
    address: 'ул. Садовая, 7, Москва',
    animals: 130,
    raised: 56000,
    goal: 300000,
    phone: '+7 (495) 555-44-33',
    coords: { top: '28%', left: '62%' },
    color: '#e81123',
  },
  {
    id: 4,
    name: 'Кошачий приют «Мурка»',
    address: 'ул. Речная, 2, Москва',
    animals: 44,
    raised: 201000,
    goal: 250000,
    phone: '+7 (495) 777-88-99',
    coords: { top: '60%', left: '36%' },
    color: '#744da9',
  },
];

const ANIMALS = [
  { id: 1, name: 'Барон', type: 'Собака', breed: 'Метис', age: '2 года', shelter: 'Хвостатый друг', emoji: '🐕', color: '#0078d4', desc: 'Ласковый и игривый пёс, обожает детей. Ищет семью с дворцом.' },
  { id: 2, name: 'Снежок', type: 'Кот', breed: 'Беспородный', age: '1 год', shelter: 'Добрые лапки', emoji: '🐱', color: '#00d4d8', desc: 'Белоснежный котик, очень нежный. Любит сидеть на руках.' },
  { id: 3, name: 'Рыжик', type: 'Кот', breed: 'Метис', age: '3 года', shelter: 'Мурка', emoji: '🐈', color: '#ff8c00', desc: 'Рыжий красавец с зелёными глазами. Независимый, но ласковый.' },
  { id: 4, name: 'Луна', type: 'Собака', breed: 'Хаски-метис', age: '4 года', shelter: 'Второй шанс', emoji: '🐺', color: '#744da9', desc: 'Красивая и умная собака. Знает команды, обожает прогулки.' },
  { id: 5, name: 'Персик', type: 'Кот', breed: 'Британский', age: '5 лет', shelter: 'Хвостатый друг', emoji: '😸', color: '#107c10', desc: 'Степенный кот-аристократ. Ищет тихую семью без детей.' },
  { id: 6, name: 'Буря', type: 'Собака', breed: 'Лайка-метис', age: '1.5 года', shelter: 'Добрые лапки', emoji: '🐶', color: '#e81123', desc: 'Энергичная и преданная собака. Нужно много прогулок и любви.' },
];

const AMOUNTS = [100, 300, 500, 1000, 2000, 5000];

function ShelterMapPin({ shelter, selected, onClick }: { shelter: typeof SHELTERS[0]; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute flex flex-col items-center transition-all"
      style={{ top: shelter.coords.top, left: shelter.coords.left, transform: 'translate(-50%, -100%)', zIndex: selected ? 10 : 5 }}
    >
      <div
        className="w-8 h-8 flex items-center justify-center text-white font-russo text-xs"
        style={{
          background: selected ? shelter.color : shelter.color + 'cc',
          boxShadow: selected ? `0 0 0 3px ${shelter.color}44` : 'none',
          transform: selected ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 0.2s',
        }}
      >
        🐾
      </div>
      <div className="w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `6px solid ${shelter.color}cc` }} />
    </button>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1.5 w-full" style={{ background: '#2a2d33' }}>
      <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function Dobrohvostik() {
  const [tab, setTab] = useState<Tab>('map');
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<typeof ANIMALS[0] | null>(null);
  const [donateShelterId, setDonateShelterId] = useState<number>(1);
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [donated, setDonated] = useState(false);
  const [filterType, setFilterType] = useState<'Все' | 'Кот' | 'Собака'>('Все');

  const selectedShelter = SHELTERS.find(s => s.id === selectedShelterId) || null;

  function handleDonate() {
    const sum = amount || Number(customAmount);
    if (!sum || sum < 10) return;
    setDonated(true);
    setTimeout(() => setDonated(false), 4000);
    setAmount('');
    setCustomAmount('');
  }

  const filteredAnimals = filterType === 'Все' ? ANIMALS : ANIMALS.filter(a => a.type === filterType);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-2xl">🐾</span>
          <p className="font-russo text-xl text-white uppercase tracking-widest">Доброхвостик</p>
        </div>
        <p className="text-xs font-golos mt-0.5" style={{ color: '#ff8c00' }}>Помоги бездомным животным найти дом</p>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mb-3 flex-shrink-0">
        {([
          { id: 'map' as Tab, label: '🗺 Приюты', },
          { id: 'animals' as Tab, label: '🐶 Животные' },
          { id: 'donate' as Tab, label: '❤️ Помочь' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-xs font-golos font-bold tracking-wide transition-colors"
            style={{
              background: tab === t.id ? '#ff8c00' : 'transparent',
              color: tab === t.id ? '#000' : '#ffffff66',
              borderBottom: tab !== t.id ? '1px solid #2a2d33' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: MAP */}
      {tab === 'map' && (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* Map */}
          <div className="relative w-full mb-3 overflow-hidden border border-metro-border"
            style={{ height: 220, background: '#0a0c0e' }}>
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00d4d8" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {/* Roads */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="110" x2="100%" y2="110" stroke="#1a2a3a" strokeWidth="8"/>
              <line x1="180" y1="0" x2="180" y2="100%" stroke="#1a2a3a" strokeWidth="6"/>
              <line x1="0" y1="65" x2="100%" y2="65" stroke="#1a2a3a" strokeWidth="4"/>
              <line x1="280" y1="0" x2="280" y2="100%" stroke="#1a2a3a" strokeWidth="4"/>
              <line x1="80" y1="0" x2="80" y2="100%" stroke="#1a2a3a" strokeWidth="3"/>
            </svg>
            {/* Shelter pins */}
            {SHELTERS.map(s => (
              <ShelterMapPin key={s.id} shelter={s} selected={selectedShelterId === s.id}
                onClick={() => setSelectedShelterId(selectedShelterId === s.id ? null : s.id)} />
            ))}
            <div className="absolute bottom-2 right-2 px-2 py-1 text-[9px] font-golos text-white/30"
              style={{ background: '#0f1114cc' }}>
              {SHELTERS.length} приюта на карте
            </div>
          </div>

          {/* Shelter cards */}
          <div className="space-y-2">
            {SHELTERS.map(shelter => (
              <button
                key={shelter.id}
                onClick={() => setSelectedShelterId(selectedShelterId === shelter.id ? null : shelter.id)}
                className="w-full text-left border transition-all"
                style={{
                  background: selectedShelterId === shelter.id ? shelter.color + '14' : '#1a1d21',
                  borderColor: selectedShelterId === shelter.id ? shelter.color : '#2a2d33',
                }}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: shelter.color + '22' }}>
                    🏠
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-golos font-semibold text-sm text-white truncate">{shelter.name}</p>
                    <p className="text-[11px] text-white/40 font-golos truncate">{shelter.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-russo" style={{ color: shelter.color }}>{shelter.animals}</p>
                    <p className="text-[9px] text-white/30 font-golos">животных</p>
                  </div>
                </div>
                {selectedShelterId === shelter.id && (
                  <div className="px-3 pb-3 space-y-2 border-t border-metro-border" style={{ borderColor: shelter.color + '33' }}>
                    <div className="pt-2 flex items-center gap-2">
                      <Icon name="Phone" size={12} className="text-white/40" />
                      <span className="text-xs font-golos text-white/60">{shelter.phone}</span>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-white/40 font-golos">Сбор средств</span>
                        <span className="text-[10px] font-russo" style={{ color: shelter.color }}>
                          {shelter.raised.toLocaleString('ru')} / {shelter.goal.toLocaleString('ru')} ₽
                        </span>
                      </div>
                      <ProgressBar value={shelter.raised} max={shelter.goal} color={shelter.color} />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setDonateShelterId(shelter.id); setTab('donate'); }}
                      className="w-full py-1.5 text-xs font-russo uppercase tracking-wider"
                      style={{ background: shelter.color, color: '#fff' }}
                    >
                      Помочь приюту
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ANIMALS */}
      {tab === 'animals' && (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {selectedAnimal ? (
            <div className="metro-fade-up" style={{ animationFillMode: 'forwards' }}>
              <button onClick={() => setSelectedAnimal(null)}
                className="flex items-center gap-1.5 text-xs text-white/50 font-golos mb-3 hover:text-white/80 transition-colors">
                <Icon name="ChevronLeft" size={14} /> Назад
              </button>
              <div className="border" style={{ background: '#1a1d21', borderColor: selectedAnimal.color, borderTop: `3px solid ${selectedAnimal.color}` }}>
                <div className="flex items-center justify-center py-8" style={{ background: selectedAnimal.color + '18', fontSize: 72 }}>
                  {selectedAnimal.emoji}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-russo text-2xl text-white">{selectedAnimal.name}</p>
                    <p className="text-sm text-white/50 font-golos">{selectedAnimal.breed} · {selectedAnimal.age}</p>
                  </div>
                  <p className="text-sm font-golos text-white/70 leading-relaxed">{selectedAnimal.desc}</p>
                  <div className="flex items-center gap-2 py-2 px-3 border border-metro-border" style={{ background: '#0f1114' }}>
                    <Icon name="MapPin" size={14} className="text-white/40" />
                    <span className="text-xs font-golos text-white/60">Приют «{selectedAnimal.shelter}»</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setDonateShelterId(SHELTERS.find(s => s.name.includes(selectedAnimal.shelter))?.id || 1); setTab('donate'); }}
                      className="py-2.5 text-xs font-russo uppercase tracking-wider border"
                      style={{ borderColor: selectedAnimal.color, color: selectedAnimal.color }}
                    >
                      Помочь приюту
                    </button>
                    <button
                      className="py-2.5 text-xs font-russo uppercase tracking-wider text-black"
                      style={{ background: selectedAnimal.color }}
                    >
                      Взять домой
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-3">
                {(['Все', 'Кот', 'Собака'] as const).map(f => (
                  <button key={f} onClick={() => setFilterType(f)}
                    className="px-3 py-1.5 text-xs font-golos font-semibold uppercase transition-colors"
                    style={{
                      background: filterType === f ? '#ff8c00' : '#1a1d21',
                      color: filterType === f ? '#000' : '#ffffff66',
                      border: `1px solid ${filterType === f ? '#ff8c00' : '#2a2d33'}`,
                    }}>
                    {f}
                  </button>
                ))}
                <span className="ml-auto text-[11px] text-white/30 font-golos self-center">{filteredAnimals.length} животных</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredAnimals.map(animal => (
                  <button
                    key={animal.id}
                    onClick={() => setSelectedAnimal(animal)}
                    className="text-left border metro-tile transition-all"
                    style={{ background: '#1a1d21', borderColor: '#2a2d33' }}
                  >
                    <div className="flex items-center justify-center py-5" style={{ fontSize: 44, background: animal.color + '14' }}>
                      {animal.emoji}
                    </div>
                    <div className="p-2.5">
                      <p className="font-russo text-sm text-white">{animal.name}</p>
                      <p className="text-[10px] text-white/40 font-golos">{animal.breed}</p>
                      <p className="text-[10px] font-golos mt-1" style={{ color: animal.color }}>{animal.age}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: DONATE */}
      {tab === 'donate' && (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {donated ? (
            <div className="flex flex-col items-center justify-center py-16 metro-fade-up" style={{ animationFillMode: 'forwards' }}>
              <div className="text-6xl mb-4">🐾❤️</div>
              <p className="font-russo text-xl text-white tracking-wider mb-2">СПАСИБО!</p>
              <p className="text-sm font-golos text-white/60 text-center leading-relaxed">
                Твоя помощь делает мир<br/>лучше для бездомных животных
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-white/40 font-golos uppercase tracking-widest mb-3">Выбери приют</p>
              <div className="space-y-2 mb-5">
                {SHELTERS.map(shelter => (
                  <button
                    key={shelter.id}
                    onClick={() => setDonateShelterId(shelter.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 border transition-all text-left"
                    style={{
                      background: donateShelterId === shelter.id ? shelter.color + '18' : '#1a1d21',
                      borderColor: donateShelterId === shelter.id ? shelter.color : '#2a2d33',
                    }}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                      style={{ borderColor: donateShelterId === shelter.id ? shelter.color : '#2a2d33' }}>
                      {donateShelterId === shelter.id && (
                        <div className="w-2.5 h-2.5" style={{ background: shelter.color }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-golos text-white truncate">{shelter.name}</p>
                      <ProgressBar value={shelter.raised} max={shelter.goal} color={shelter.color} />
                      <p className="text-[10px] text-white/30 font-golos mt-0.5">
                        {Math.round(shelter.raised / shelter.goal * 100)}% от цели
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-white/40 font-golos uppercase tracking-widest mb-2">Сумма пожертвования</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {AMOUNTS.map(a => (
                  <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }}
                    className="py-2.5 text-sm font-russo transition-all"
                    style={{
                      background: amount === a ? '#ff8c00' : '#1a1d21',
                      color: amount === a ? '#000' : '#ffffff80',
                      border: `1px solid ${amount === a ? '#ff8c00' : '#2a2d33'}`,
                    }}>
                    {a.toLocaleString('ru')} ₽
                  </button>
                ))}
              </div>
              <div className="flex items-center border border-metro-border mb-5" style={{ background: '#1a1d21' }}>
                <span className="px-3 text-sm text-white/30 font-golos">₽</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setAmount(''); }}
                  placeholder="Своя сумма"
                  className="flex-1 py-3 text-sm font-golos text-white bg-transparent outline-none placeholder-white/25 pr-3"
                />
              </div>

              <button
                onClick={handleDonate}
                disabled={!amount && !customAmount}
                className="w-full py-4 font-russo text-sm tracking-widest uppercase transition-opacity disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #ff8c00, #e81123)', color: '#fff' }}
              >
                ❤️ ПОЖЕРТВОВАТЬ {(amount || Number(customAmount) || '').toLocaleString('ru')} {(amount || customAmount) ? '₽' : ''}
              </button>

              <p className="text-[10px] text-white/20 font-golos text-center mt-3 leading-relaxed">
                Средства поступают напрямую в выбранный приют.<br/>
                Это демо-версия — реальные платежи не обрабатываются.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
