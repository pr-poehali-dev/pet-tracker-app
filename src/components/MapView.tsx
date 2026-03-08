import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Pet {
  id: number;
  name: string;
  type: string;
  color: string;
  lat: number;
  lng: number;
  status: 'online' | 'sleep' | 'walk';
  lastSeen: string;
  battery: number;
}

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  hours: string;
  open: boolean;
  x: number;
  y: number;
  speciality: string;
}

const PETS: Pet[] = [
  { id: 1, name: 'Барсик', type: '🐱', color: '#00d4d8', lat: 55.751, lng: 37.618, status: 'walk', lastSeen: '1 мин назад', battery: 87 },
  { id: 2, name: 'Рекс', type: '🐶', color: '#ff8c00', lat: 55.759, lng: 37.631, status: 'online', lastSeen: '30 сек назад', battery: 42 },
  { id: 3, name: 'Пончик', type: '🐇', color: '#744da9', lat: 55.745, lng: 37.608, status: 'sleep', lastSeen: '5 мин назад', battery: 95 },
];

const CLINICS: Clinic[] = [
  { id: 1, name: 'Доктор Айболит', address: 'ул. Садовая, 12', phone: '+7 495 123-45-67', rating: 4.9, distance: '0.3 км', hours: '09:00–21:00', open: true, x: 62, y: 55, speciality: 'Терапия, хирургия' },
  { id: 2, name: 'Пушистик Клиник', address: 'пр. Мира, 44', phone: '+7 495 987-65-43', rating: 4.7, distance: '0.8 км', hours: '08:00–22:00', open: true, x: 78, y: 72, speciality: 'Стоматология, УЗИ' },
  { id: 3, name: 'Vet24', address: 'ул. Ленина, 5', phone: '+7 495 555-00-11', rating: 4.5, distance: '1.2 км', hours: 'Круглосуточно', open: true, x: 30, y: 68, speciality: 'Скорая помощь' },
  { id: 4, name: 'ZooMed', address: 'бул. Цветной, 8', phone: '+7 495 222-33-44', rating: 4.3, distance: '1.7 км', hours: '10:00–20:00', open: false, x: 48, y: 35, speciality: 'Дерматология, груминг' },
  { id: 5, name: 'АниВет', address: 'ул. Горького, 31', phone: '+7 495 311-22-55', rating: 4.6, distance: '0.6 км', hours: '08:00–23:00', open: true, x: 55, y: 80, speciality: 'Хирургия, онкология' },
  { id: 6, name: 'ЗооДент', address: 'пер. Тихий, 7', phone: '+7 495 400-10-20', rating: 4.4, distance: '1.5 км', hours: '10:00–19:00', open: false, x: 22, y: 42, speciality: 'Стоматология' },
];

type FilterTag = 'все' | 'открыто' | 'круглосуточно' | 'хирургия' | 'стоматология' | 'скорая' | 'дерматология' | 'терапия';

const FILTERS: { id: FilterTag; label: string; emoji: string }[] = [
  { id: 'все', label: 'Все', emoji: '🔍' },
  { id: 'открыто', label: 'Открыто', emoji: '🟢' },
  { id: 'круглосуточно', label: '24 часа', emoji: '🌙' },
  { id: 'хирургия', label: 'Хирургия', emoji: '🔪' },
  { id: 'стоматология', label: 'Стоматология', emoji: '🦷' },
  { id: 'скорая', label: 'Скорая', emoji: '🚑' },
  { id: 'терапия', label: 'Терапия', emoji: '💊' },
  { id: 'дерматология', label: 'Дерматология', emoji: '🧴' },
];

function matchFilter(clinic: Clinic, filter: FilterTag): boolean {
  if (filter === 'все') return true;
  if (filter === 'открыто') return clinic.open;
  if (filter === 'круглосуточно') return clinic.hours.toLowerCase().includes('круглосуточно');
  return clinic.speciality.toLowerCase().includes(filter);
}

const STATUS_MAP = {
  online: { label: 'Онлайн', color: '#107c10' },
  sleep: { label: 'Спит', color: '#0078d4' },
  walk: { label: 'На прогулке', color: '#00d4d8' },
};

type MapMode = 'pets' | 'clinics';

export default function MapView() {
  const [selectedPet, setSelectedPet] = useState<Pet>(PETS[0]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [positions, setPositions] = useState(PETS.map(p => ({ id: p.id, x: 0, y: 0 })));
  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<MapMode>('pets');
  const [activeFilter, setActiveFilter] = useState<FilterTag>('все');

  const filteredClinics = CLINICS.filter(c => matchFilter(c, activeFilter))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setPositions(PETS.map((p, i) => ({
      id: p.id,
      x: 20 + i * 28 + Math.sin(tick * 0.4 + i) * 5,
      y: 25 + i * 15 + Math.cos(tick * 0.3 + i) * 4,
    })));
  }, [tick]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <p className="font-russo text-xl text-white uppercase tracking-widest">карта</p>
        <p className="text-xs text-metro-teal mt-0.5">GPS · обновление каждые 30с</p>
      </div>

      {/* Mode switcher */}
      <div className="flex mx-4 mb-2">
        <button
          onClick={() => { setMode('pets'); setSelectedClinic(null); }}
          className="flex-1 py-2 text-xs font-golos font-bold uppercase tracking-wider transition-colors"
          style={{
            background: mode === 'pets' ? '#00d4d8' : '#1a1d21',
            color: mode === 'pets' ? '#000' : '#ffffff60',
            border: '1px solid #2a2d33',
          }}
        >
          🐾 Питомцы
        </button>
        <button
          onClick={() => setMode('clinics')}
          className="flex-1 py-2 text-xs font-golos font-bold uppercase tracking-wider transition-colors"
          style={{
            background: mode === 'clinics' ? '#e81123' : '#1a1d21',
            color: mode === 'clinics' ? '#fff' : '#ffffff60',
            border: '1px solid #2a2d33',
          }}
        >
          🏥 Ветклиники
        </button>
      </div>

      {/* Map Area */}
      <div className="mx-4 relative overflow-hidden bg-metro-tile border border-metro-border map-grid" style={{ height: 250 }}>
        {/* Street lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="125" x2="100%" y2="125" stroke="#00d4d8" strokeWidth="3"/>
          <line x1="0" y1="75" x2="100%" y2="75" stroke="#00d4d8" strokeWidth="1.5"/>
          <line x1="0" y1="195" x2="100%" y2="195" stroke="#00d4d8" strokeWidth="1.5"/>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#00d4d8" strokeWidth="3"/>
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#00d4d8" strokeWidth="1"/>
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#00d4d8" strokeWidth="1"/>
          <rect x="60" y="40" width="80" height="55" fill="rgba(0,212,216,0.05)" stroke="#00d4d8" strokeWidth="0.5"/>
          <rect x="200" y="140" width="100" height="45" fill="rgba(0,212,216,0.05)" stroke="#00d4d8" strokeWidth="0.5"/>
          <rect x="280" y="50" width="60" height="75" fill="rgba(0,212,216,0.05)" stroke="#00d4d8" strokeWidth="0.5"/>
        </svg>

        {/* Distance rings when clinics mode */}
        {mode === 'clinics' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="60" fill="none" stroke="#e81123" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3"/>
            <circle cx="50%" cy="50%" r="110" fill="none" stroke="#e81123" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2"/>
            <circle cx="50%" cy="50%" r="160" fill="none" stroke="#e81123" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.1"/>
            {/* User location dot */}
            <circle cx="50%" cy="50%" r="6" fill="#e81123" opacity="0.9"/>
            <circle cx="50%" cy="50%" r="10" fill="#e81123" opacity="0.3"/>
          </svg>
        )}

        {/* Pet markers */}
        {mode === 'pets' && PETS.map((pet, i) => {
          const pos = positions.find(p => p.id === pet.id);
          const isSelected = selectedPet.id === pet.id;
          return (
            <button
              key={pet.id}
              onClick={() => setSelectedPet(pet)}
              className="absolute flex flex-col items-center transition-all duration-700"
              style={{
                left: `${pos?.x ?? 20 + i * 28}%`,
                top: `${pos?.y ?? 25 + i * 15}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {isSelected && (
                <div className="absolute inset-0 rounded-full border-2 animate-ping"
                  style={{ borderColor: pet.color, width: 36, height: 36, margin: -6 }} />
              )}
              <div
                className="w-8 h-8 flex items-center justify-center text-sm font-bold border-2 relative z-10 transition-transform"
                style={{
                  background: pet.color,
                  borderColor: isSelected ? '#fff' : pet.color,
                  transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                }}
              >
                {pet.type}
              </div>
              {isSelected && (
                <div className="mt-1 px-2 py-0.5 text-xs font-golos font-bold whitespace-nowrap"
                  style={{ background: pet.color, color: '#000' }}>
                  {pet.name}
                </div>
              )}
            </button>
          );
        })}

        {/* Clinic markers */}
        {mode === 'clinics' && filteredClinics.map(clinic => {
          const isSelected = selectedClinic?.id === clinic.id;
          return (
            <button
              key={clinic.id}
              onClick={() => setSelectedClinic(isSelected ? null : clinic)}
              className="absolute flex flex-col items-center transition-all duration-200"
              style={{
                left: `${clinic.x}%`,
                top: `${clinic.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 20 : 10,
              }}
            >
              {isSelected && (
                <div className="absolute rounded-full border animate-ping"
                  style={{ borderColor: '#e81123', width: 40, height: 40, margin: -8, borderWidth: 2 }} />
              )}
              <div
                className="flex items-center justify-center font-bold border-2 relative z-10 transition-all"
                style={{
                  background: clinic.open ? '#e81123' : '#555',
                  borderColor: isSelected ? '#fff' : 'transparent',
                  width: isSelected ? 36 : 28,
                  height: isSelected ? 36 : 28,
                  fontSize: isSelected ? 16 : 13,
                }}
              >
                🏥
              </div>
              {isSelected && (
                <div className="mt-1 px-2 py-0.5 text-[10px] font-golos font-bold whitespace-nowrap"
                  style={{ background: '#e81123', color: '#fff', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {clinic.name}
                </div>
              )}
            </button>
          );
        })}

        {/* Compass */}
        <div className="absolute top-3 right-3 w-8 h-8 border border-metro-border flex items-center justify-center"
          style={{ background: '#0f1114' }}>
          <span className="text-xs font-russo text-metro-teal">N</span>
        </div>

        {/* Scale */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <div className="w-12 h-0.5 bg-metro-teal"/>
          <span className="text-xs text-metro-teal font-golos">500м</span>
        </div>

        {/* Clinics count badge */}
        {mode === 'clinics' && (
          <div className="absolute top-3 left-3 px-2 py-1 flex items-center gap-1"
            style={{ background: '#e81123' }}>
            <Icon name="MapPin" size={10} className="text-white" />
            <span className="text-[10px] font-russo text-white">{CLINICS.filter(c => c.open).length} открыто</span>
          </div>
        )}
      </div>

      {/* --- PETS MODE --- */}
      {mode === 'pets' && (
        <>
          <div className="flex gap-0 mt-2 mx-4 overflow-x-auto">
            {PETS.map(pet => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className="flex-1 py-2.5 px-3 text-left transition-colors border-b-2 metro-tile"
                style={{
                  background: selectedPet.id === pet.id ? pet.color + '22' : 'transparent',
                  borderBottomColor: selectedPet.id === pet.id ? pet.color : 'transparent',
                }}
              >
                <div className="text-base">{pet.type}</div>
                <div className="text-xs font-golos font-semibold text-white">{pet.name}</div>
              </button>
            ))}
          </div>

          <div className="mx-4 mt-2 p-4 border border-metro-border" style={{ background: '#1a1d21' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_MAP[selectedPet.status].color }} />
                  <span className="text-xs font-golos text-white/60">{STATUS_MAP[selectedPet.status].label}</span>
                </div>
                <p className="font-russo text-lg text-white">{selectedPet.name}</p>
                <p className="text-xs text-white/50 font-golos mt-0.5">Обновление: {selectedPet.lastSeen}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <Icon name="Battery" size={14} className="text-metro-teal" />
                  <span className="text-sm font-golos font-bold" style={{ color: selectedPet.battery < 30 ? '#e81123' : '#00d4d8' }}>
                    {selectedPet.battery}%
                  </span>
                </div>
                <p className="text-xs text-white/50 font-golos">55.751° N</p>
                <p className="text-xs text-white/50 font-golos">37.618° E</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-2 text-xs font-golos font-bold uppercase tracking-wider border border-metro-teal text-metro-teal metro-tile">
                История маршрута
              </button>
              <button className="py-2 px-3 text-xs font-golos font-bold uppercase tracking-wider border border-metro-border text-white/60 metro-tile">
                <Icon name="Bell" size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- CLINICS MODE --- */}
      {mode === 'clinics' && (
        <div className="mx-4 mt-2 flex-1 overflow-y-auto pb-4">

          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 -mx-0">
            {FILTERS.map(f => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => { setActiveFilter(f.id); setSelectedClinic(null); }}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-golos font-bold uppercase tracking-wide metro-tile transition-all"
                  style={{
                    background: isActive ? '#e81123' : '#1a1d21',
                    color: isActive ? '#fff' : '#ffffff55',
                    border: `1px solid ${isActive ? '#e81123' : '#2a2d33'}`,
                  }}
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Count line */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1" style={{ background: '#2a2d33' }} />
            <span className="text-[10px] font-golos text-white/30 uppercase tracking-widest">
              {filteredClinics.length} клиник
            </span>
            <div className="h-px flex-1" style={{ background: '#2a2d33' }} />
          </div>

          {/* Selected clinic detail */}
          {selectedClinic && (
            <div className="mb-3 border-2 p-4 metro-fade-up"
              style={{ borderColor: '#e81123', background: '#1a0305', animationFillMode: 'forwards' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-1.5 py-0.5 text-[10px] font-russo"
                      style={{ background: selectedClinic.open ? '#107c10' : '#555', color: '#fff' }}>
                      {selectedClinic.open ? 'ОТКРЫТО' : 'ЗАКРЫТО'}
                    </div>
                    <span className="text-xs text-white/40 font-golos">{selectedClinic.hours}</span>
                  </div>
                  <p className="font-russo text-lg text-white">{selectedClinic.name}</p>
                  <p className="text-xs text-white/60 font-golos">{selectedClinic.address}</p>
                  <p className="text-xs text-white/40 font-golos mt-0.5">{selectedClinic.speciality}</p>
                </div>
                <div className="text-right ml-3">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="font-russo text-white text-sm">{selectedClinic.rating}</span>
                  </div>
                  <p className="text-xs text-metro-teal font-golos mt-1">{selectedClinic.distance}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <a href={`tel:${selectedClinic.phone}`}
                  className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-golos font-bold uppercase tracking-wider"
                  style={{ background: '#e81123', color: '#fff' }}>
                  <Icon name="Phone" size={13} />
                  Позвонить
                </a>
                <button className="flex-1 py-2.5 text-xs font-golos font-bold uppercase tracking-wider border border-metro-teal text-metro-teal metro-tile">
                  Маршрут
                </button>
              </div>
            </div>
          )}

          {/* Clinics list */}
          <div className="space-y-1.5">
            {filteredClinics.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-golos text-white/40">Клиники не найдены</p>
                <button onClick={() => setActiveFilter('все')}
                  className="mt-3 px-4 py-2 text-xs font-golos font-bold uppercase text-metro-teal border border-metro-teal metro-tile">
                  Сбросить фильтр
                </button>
              </div>
            )}
            {filteredClinics.map((clinic, i) => (
              <button
                key={clinic.id}
                onClick={() => setSelectedClinic(selectedClinic?.id === clinic.id ? null : clinic)}
                className="w-full flex items-center gap-3 p-3 border metro-tile metro-fade-up text-left transition-all"
                style={{
                  background: selectedClinic?.id === clinic.id ? '#e8112315' : '#1a1d21',
                  borderColor: selectedClinic?.id === clinic.id ? '#e81123' : '#2a2d33',
                  animationDelay: `${i * 0.06}s`,
                  animationFillMode: 'forwards',
                  opacity: 0,
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: clinic.open ? '#e8112322' : '#2a2d33' }}>
                  🏥
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-golos font-semibold text-white truncate">{clinic.name}</p>
                    {!clinic.open && <span className="text-[9px] text-white/30 font-golos">ЗАКР.</span>}
                  </div>
                  <p className="text-xs text-white/50 font-golos truncate">{clinic.address}</p>
                  <p className="text-[10px] text-white/30 font-golos mt-0.5">{clinic.speciality}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 justify-end">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-russo text-white">{clinic.rating}</span>
                  </div>
                  <p className="text-xs font-golos mt-0.5" style={{ color: '#00d4d8' }}>{clinic.distance}</p>
                  <p className="text-[10px] text-white/30 font-golos">{clinic.hours}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}