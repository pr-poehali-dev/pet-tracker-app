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

const PETS: Pet[] = [
  { id: 1, name: 'Барсик', type: '🐱', color: '#00d4d8', lat: 55.751, lng: 37.618, status: 'walk', lastSeen: '1 мин назад', battery: 87 },
  { id: 2, name: 'Рекс', type: '🐶', color: '#ff8c00', lat: 55.759, lng: 37.631, status: 'online', lastSeen: '30 сек назад', battery: 42 },
  { id: 3, name: 'Пончик', type: '🐇', color: '#744da9', lat: 55.745, lng: 37.608, status: 'sleep', lastSeen: '5 мин назад', battery: 95 },
];

const STATUS_MAP = {
  online: { label: 'Онлайн', color: '#107c10' },
  sleep: { label: 'Спит', color: '#0078d4' },
  walk: { label: 'На прогулке', color: '#00d4d8' },
};

export default function MapView() {
  const [selectedPet, setSelectedPet] = useState<Pet>(PETS[0]);
  const [positions, setPositions] = useState(PETS.map(p => ({ id: p.id, x: 0, y: 0 })));
  const [tick, setTick] = useState(0);

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

      {/* Map Area */}
      <div className="mx-4 relative overflow-hidden bg-metro-tile border border-metro-border map-grid" style={{ height: 280 }}>
        {/* Street lines mock */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="140" x2="100%" y2="140" stroke="#00d4d8" strokeWidth="3"/>
          <line x1="0" y1="80" x2="100%" y2="80" stroke="#00d4d8" strokeWidth="1.5"/>
          <line x1="0" y1="210" x2="100%" y2="210" stroke="#00d4d8" strokeWidth="1.5"/>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#00d4d8" strokeWidth="3"/>
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#00d4d8" strokeWidth="1"/>
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#00d4d8" strokeWidth="1"/>
          <rect x="60" y="50" width="80" height="60" fill="rgba(0,212,216,0.05)" stroke="#00d4d8" strokeWidth="0.5"/>
          <rect x="200" y="160" width="100" height="50" fill="rgba(0,212,216,0.05)" stroke="#00d4d8" strokeWidth="0.5"/>
          <rect x="280" y="60" width="60" height="80" fill="rgba(0,212,216,0.05)" stroke="#00d4d8" strokeWidth="0.5"/>
        </svg>

        {/* Pet markers */}
        {PETS.map((pet, i) => {
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
                  color: '#000',
                }}
              >
                {pet.type}
              </div>
              {isSelected && (
                <div className="mt-1 px-2 py-0.5 text-xs font-golos font-bold text-white whitespace-nowrap"
                  style={{ background: pet.color, color: '#000' }}>
                  {pet.name}
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
      </div>

      {/* Pet selector strip */}
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

      {/* Selected pet info */}
      <div className="mx-4 mt-2 p-4 border border-metro-border" style={{ background: '#1a1d21' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_MAP[selectedPet.status].color }} />
              <span className="text-xs font-golos text-white/60">{STATUS_MAP[selectedPet.status].label}</span>
            </div>
            <p className="font-russo text-lg text-white">{selectedPet.name}</p>
            <p className="text-xs text-white/50 font-golos mt-0.5">Последнее обновление: {selectedPet.lastSeen}</p>
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
          <button className="flex-1 py-2 text-xs font-golos font-bold uppercase tracking-wider border border-metro-teal text-metro-teal metro-tile hover:bg-metro-teal hover:text-black transition-colors">
            История маршрута
          </button>
          <button className="py-2 px-3 text-xs font-golos font-bold uppercase tracking-wider border border-metro-border text-white/60 metro-tile">
            <Icon name="Bell" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
