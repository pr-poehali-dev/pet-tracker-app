import { useState } from 'react';
import Icon from '@/components/ui/icon';

const DOG_IMG = 'https://cdn.poehali.dev/projects/4c79b83f-1c17-4270-8aec-fa2997e5d38a/files/7e18e7de-54fc-410e-9df6-6f3c6d1e4895.jpg';
const CAT_IMG = 'https://cdn.poehali.dev/projects/4c79b83f-1c17-4270-8aec-fa2997e5d38a/files/192fe34f-442f-4594-a8cf-e68d44848a68.jpg';

const PETS = [
  {
    id: 1, name: 'Барсик', type: 'Кот', breed: 'Шотландская вислоухая', age: '3 года', weight: '4.2 кг',
    image: CAT_IMG, color: '#00d4d8', chip: '643.098.100.123456', vaccinated: true,
    vet: 'Клиника «Доктор Айболит»', nextVisit: '15 апреля 2026',
    history: [
      { date: '01.03.2026', icon: 'Syringe', label: 'Вакцинация', detail: 'Бешенство, комплексная', color: '#107c10' },
      { date: '14.02.2026', icon: 'Stethoscope', label: 'Осмотр', detail: 'Профилактический осмотр', color: '#0078d4' },
      { date: '20.01.2026', icon: 'Pill', label: 'Лечение', detail: 'Антипаразитарная обработка', color: '#ff8c00' },
      { date: '05.01.2026', icon: 'MapPin', label: 'Маршрут', detail: 'Прогулка 2.3 км, 47 мин', color: '#744da9' },
      { date: '28.12.2025', icon: 'Heart', label: 'Взвешивание', detail: '4.2 кг — норма', color: '#e81123' },
    ]
  },
  {
    id: 2, name: 'Рекс', type: 'Собака', breed: 'Лабрадор-ретривер', age: '5 лет', weight: '28 кг',
    image: DOG_IMG, color: '#ff8c00', chip: '643.098.100.789012', vaccinated: true,
    vet: 'Ветцентр «Пушистик»', nextVisit: '20 мая 2026',
    history: [
      { date: '05.03.2026', icon: 'MapPin', label: 'Прогулка', detail: 'Парк «Сокольники», 5.1 км', color: '#744da9' },
      { date: '20.02.2026', icon: 'Syringe', label: 'Вакцинация', detail: 'Чума, парвовирус', color: '#107c10' },
      { date: '10.02.2026', icon: 'Scissors', label: 'Груминг', detail: 'Стрижка и купание', color: '#0078d4' },
      { date: '01.02.2026', icon: 'Pill', label: 'Лечение', detail: 'Глистогонные таблетки', color: '#ff8c00' },
    ]
  },
];

export default function PetProfile() {
  const [activeId, setActiveId] = useState(1);
  const [tab, setTab] = useState<'info' | 'history'>('info');
  const pet = PETS.find(p => p.id === activeId)!;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <p className="font-russo text-xl text-white uppercase tracking-widest">питомцы</p>
        <p className="text-xs text-metro-teal mt-0.5">Личный кабинет</p>
      </div>

      {/* Pet switcher */}
      <div className="flex mx-4 gap-0 mb-3">
        {PETS.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className="flex-1 py-2 px-3 flex items-center gap-2 metro-tile border-b-2 transition-all"
            style={{
              background: activeId === p.id ? p.color + '18' : 'transparent',
              borderBottomColor: activeId === p.id ? p.color : '#2a2d33',
            }}
          >
            <div className="w-6 h-6 overflow-hidden flex-shrink-0">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-golos font-semibold text-white">{p.name}</span>
          </button>
        ))}
        <button className="py-2 px-3 border-b-2 border-metro-border text-white/30 metro-tile">
          <Icon name="Plus" size={16} />
        </button>
      </div>

      {/* Pet card */}
      <div className="mx-4 border border-metro-border" style={{ background: '#1a1d21' }}>
        <div className="flex">
          <div className="w-28 h-28 flex-shrink-0 overflow-hidden">
            <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-russo text-xl text-white">{pet.name}</p>
                <p className="text-xs font-golos text-white/60">{pet.breed}</p>
              </div>
              <div className="w-2 h-2 mt-1 rounded-full bg-green-500" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <p className="text-[10px] text-white/40 font-golos uppercase">Возраст</p>
                <p className="text-sm text-white font-golos font-semibold">{pet.age}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-golos uppercase">Вес</p>
                <p className="text-sm text-white font-golos font-semibold">{pet.weight}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-golos uppercase">Чип</p>
                <p className="text-xs text-metro-teal font-golos truncate">{pet.chip}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-golos uppercase">Вакцины</p>
                <p className="text-xs font-golos" style={{ color: pet.vaccinated ? '#107c10' : '#e81123' }}>
                  {pet.vaccinated ? '✓ Актуальны' : '✗ Просрочены'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vet info bar */}
        <div className="px-3 py-2 border-t border-metro-border flex items-center justify-between"
          style={{ background: pet.color + '12' }}>
          <div className="flex items-center gap-2">
            <Icon name="Stethoscope" size={14} className="text-white/50" />
            <span className="text-xs font-golos text-white/70">{pet.vet}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Calendar" size={12} className="text-metro-teal" />
            <span className="text-xs font-golos text-metro-teal">{pet.nextVisit}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mt-3">
        {(['info', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-golos font-bold uppercase tracking-widest transition-colors"
            style={{
              background: tab === t ? pet.color : 'transparent',
              color: tab === t ? '#000' : '#ffffff66',
              borderBottom: tab !== t ? '1px solid #2a2d33' : 'none',
            }}
          >
            {t === 'info' ? 'Данные' : 'История'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 mx-4 overflow-y-auto">
        {tab === 'info' ? (
          <div className="py-3 space-y-2">
            {[
              { icon: 'Dog', label: 'Порода', value: pet.breed },
              { icon: 'Cake', label: 'Возраст', value: pet.age },
              { icon: 'Weight', label: 'Вес', value: pet.weight },
              { icon: 'Cpu', label: 'Чип-номер', value: pet.chip },
              { icon: 'MapPin', label: 'Ветеринар', value: pet.vet },
              { icon: 'Calendar', label: 'Следующий визит', value: pet.nextVisit },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-2 px-3 border border-metro-border"
                style={{ background: '#1a1d21' }}>
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                  style={{ background: pet.color + '22' }}>
                  <Icon name={item.icon} size={14} style={{ color: pet.color }} />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-golos uppercase">{item.label}</p>
                  <p className="text-sm text-white font-golos">{item.value}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-3 text-sm font-golos font-bold uppercase tracking-wider border border-dashed border-metro-border text-white/40 metro-tile mt-2">
              + Редактировать данные
            </button>
          </div>
        ) : (
          <div className="py-3 space-y-0 relative timeline-line">
            {pet.history.map((event, i) => (
              <div key={i} className="flex gap-3 pb-4 relative metro-fade-up"
                style={{ animationDelay: `${i * 0.07}s`, animationFillMode: 'forwards', opacity: 0 }}>
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center z-10"
                  style={{ background: event.color }}>
                  <Icon name={event.icon} size={12} className="text-white" />
                </div>
                <div className="flex-1 pb-3 border-b border-metro-border">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-white font-golos font-semibold">{event.label}</p>
                    <p className="text-xs text-white/40 font-golos">{event.date}</p>
                  </div>
                  <p className="text-xs text-white/60 font-golos mt-0.5">{event.detail}</p>
                </div>
              </div>
            ))}
            <button className="ml-9 mb-3 text-xs font-golos text-metro-teal uppercase tracking-wider">
              + Добавить запись
            </button>
          </div>
        )}
      </div>
    </div>
  );
}