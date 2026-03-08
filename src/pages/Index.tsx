import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import MapView from '@/components/MapView';
import PetProfile from '@/components/PetProfile';
import VetBert from '@/components/VetBert';

const VETBERT_URL = 'https://functions.poehali.dev/12f25ae3-c3fd-4bde-99e1-7019420bee8a';

type Screen = 'home' | 'map' | 'profile' | 'market';

const DOG_IMG = 'https://cdn.poehali.dev/projects/4c79b83f-1c17-4270-8aec-fa2997e5d38a/files/7e18e7de-54fc-410e-9df6-6f3c6d1e4895.jpg';
const CAT_IMG = 'https://cdn.poehali.dev/projects/4c79b83f-1c17-4270-8aec-fa2997e5d38a/files/192fe34f-442f-4594-a8cf-e68d44848a68.jpg';

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return (
    <div>
      <div className="font-russo text-6xl leading-none text-white tracking-tight">{h}:{m}</div>
      <div className="font-golos text-sm text-white/60 mt-1 capitalize">
        {days[time.getDay()]}, {time.getDate()} {months[time.getMonth()]}
      </div>
    </div>
  );
}

function StatusBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center justify-between px-4 py-1.5" style={{ background: '#0f1114' }}>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-metro-teal animate-pulse" />
        <span className="text-[10px] font-golos text-metro-teal uppercase tracking-widest">PetTrack</span>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="Wifi" size={12} className="text-white/50" />
        <Icon name="Signal" size={12} className="text-white/50" />
        <div className="flex items-center gap-0.5">
          <div className="w-5 h-2.5 border border-white/30 flex items-center px-0.5">
            <div className="h-1.5 bg-metro-teal" style={{ width: '70%' }} />
          </div>
        </div>
        <span className="text-[10px] font-golos text-white/50">
          {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const tiles: {id: Screen; size: string; color: string; content: React.ReactNode}[] = [
    {
      id: 'map', size: 'wide', color: '#0078d4',
      content: (
        <div className="h-full flex flex-col justify-between p-3">
          <div>
            <p className="font-russo text-white text-base uppercase tracking-wide">GPS Карта</p>
            <p className="text-xs text-white/70 font-golos mt-0.5">3 питомца онлайн</p>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80 font-golos">Барсик · 200м</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-white/80 font-golos">Рекс · 1.2км</span>
              </div>
            </div>
            <Icon name="MapPin" size={32} className="text-white/20" />
          </div>
        </div>
      )
    },
    {
      id: 'profile', size: 'square', color: '#00d4d8',
      content: (
        <div className="h-full flex flex-col justify-between p-3">
          <img src={CAT_IMG} alt="Барсик" className="w-12 h-12 object-cover" />
          <div>
            <p className="font-russo text-black text-sm uppercase">Барсик</p>
            <p className="text-xs text-black/60 font-golos">Шотландский</p>
          </div>
        </div>
      )
    },
    {
      id: 'profile', size: 'square', color: '#ff8c00',
      content: (
        <div className="h-full flex flex-col justify-between p-3">
          <img src={DOG_IMG} alt="Рекс" className="w-12 h-12 object-cover" />
          <div>
            <p className="font-russo text-white text-sm uppercase">Рекс</p>
            <p className="text-xs text-white/70 font-golos">Лабрадор</p>
          </div>
        </div>
      )
    },
    {
      id: 'profile', size: 'wide', color: '#1a1d21',
      content: (
        <div className="h-full flex items-center gap-4 px-4">
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: '#744da9' }}>
            <Icon name="Activity" size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-russo text-white text-sm uppercase">Активность сегодня</p>
            <div className="flex gap-3 mt-1">
              <div>
                <p className="text-xs text-white/40 font-golos">Шагов</p>
                <p className="text-sm text-metro-teal font-russo">4 821</p>
              </div>
              <div>
                <p className="text-xs text-white/40 font-golos">Км</p>
                <p className="text-sm text-metro-teal font-russo">3.2</p>
              </div>
              <div>
                <p className="text-xs text-white/40 font-golos">Мин</p>
                <p className="text-sm text-metro-teal font-russo">67</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'market', size: 'square', color: '#107c10',
      content: (
        <div className="h-full flex flex-col justify-between p-3">
          <Icon name="ShoppingBag" size={24} className="text-white" />
          <div>
            <p className="font-russo text-white text-sm uppercase">Магазин</p>
            <p className="text-xs text-white/60 font-golos">3 новинки</p>
          </div>
        </div>
      )
    },
    {
      id: 'home', size: 'square', color: '#1a1d21',
      content: (
        <div className="h-full flex flex-col justify-between p-3">
          <Icon name="Bell" size={22} className="text-metro-teal" />
          <div>
            <p className="font-russo text-white text-sm uppercase">Уведомления</p>
            <div className="w-5 h-5 flex items-center justify-center mt-1" style={{ background: '#e81123' }}>
              <span className="text-[10px] text-white font-russo">2</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'home', size: 'wide', color: '#1a1d21',
      content: (
        <div className="h-full flex items-center gap-4 px-4">
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: '#e81123' }}>
            <Icon name="Syringe" size={18} className="text-white" />
          </div>
          <div>
            <p className="font-russo text-white text-sm uppercase">Вакцинация</p>
            <p className="text-xs text-white/60 font-golos">Барсик · через 12 дней</p>
          </div>
          <div className="ml-auto">
            <div className="px-2 py-1" style={{ background: '#e81123' }}>
              <span className="text-[10px] text-white font-russo">СКОРО</span>
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-5" style={{ background: 'linear-gradient(135deg, #0f1114 60%, #0078d420)' }}>
        <Clock />
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-metro-teal animate-pulse" />
          <span className="text-xs text-white/50 font-golos">Все питомцы в безопасности</span>
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs font-golos text-white/30 uppercase tracking-widest">главный экран</p>
      </div>

      <div className="px-4 pb-24">
        <div className="grid grid-cols-2 gap-2" style={{ gridAutoRows: '100px' }}>
          {tiles.map((tile, i) => (
            <button
              key={i}
              onClick={() => onNavigate(tile.id)}
              className={`metro-tile metro-slide-in border border-metro-border overflow-hidden text-left ${tile.size === 'wide' ? 'col-span-2' : 'col-span-1'}`}
              style={{
                background: tile.color,
                animationDelay: `${i * 0.06}s`,
                animationFillMode: 'forwards',
                opacity: 0,
              }}
            >
              {tile.content}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketScreen() {
  const products = [
    { name: 'GPS-трекер PetTrack Pro', price: '2 490 ₽', tag: 'ХИТ', color: '#00d4d8', icon: 'Wifi' },
    { name: 'Ошейник с LED-подсветкой', price: '890 ₽', tag: 'НОВОЕ', color: '#ff8c00', icon: 'Zap' },
    { name: 'Умная кормушка Wi-Fi', price: '4 990 ₽', tag: '', color: '#744da9', icon: 'Utensils' },
    { name: 'Антипаразитарный комплект', price: '560 ₽', tag: '-30%', color: '#107c10', icon: 'Shield' },
    { name: 'Витамины для суставов', price: '1 200 ₽', tag: '', color: '#0078d4', icon: 'Heart' },
    { name: 'Подстилка с подогревом', price: '3 100 ₽', tag: 'НОВОЕ', color: '#e81123', icon: 'Flame' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 pt-4 pb-2">
        <p className="font-russo text-xl text-white uppercase tracking-widest">магазин</p>
        <p className="text-xs text-metro-teal mt-0.5">Товары для питомцев</p>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 border border-metro-border px-3 py-2 mb-4"
          style={{ background: '#1a1d21' }}>
          <Icon name="Search" size={14} className="text-white/30" />
          <span className="text-sm text-white/30 font-golos">Поиск товаров...</span>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
          {['Все', 'Трекеры', 'Аксессуары', 'Питание', 'Уход'].map((cat, i) => (
            <div key={cat} className="flex-shrink-0 px-3 py-1.5 text-xs font-golos font-semibold uppercase"
              style={{
                background: i === 0 ? '#00d4d8' : '#1a1d21',
                color: i === 0 ? '#000' : '#ffffff80',
                border: `1px solid ${i === 0 ? '#00d4d8' : '#2a2d33'}`,
              }}>
              {cat}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {products.map((p, i) => (
            <button key={i} className="metro-tile border border-metro-border text-left overflow-hidden metro-fade-up"
              style={{ background: '#1a1d21', animationDelay: `${i * 0.07}s`, animationFillMode: 'forwards', opacity: 0 }}>
              <div className="h-24 flex items-center justify-center relative"
                style={{ background: p.color + '22' }}>
                <Icon name={p.icon} size={40} style={{ color: p.color }} />
                {p.tag && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5"
                    style={{ background: p.color }}>
                    <span className="text-[9px] font-russo text-white">{p.tag}</span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-golos font-semibold text-white leading-tight">{p.name}</p>
                <p className="font-russo text-sm mt-1" style={{ color: p.color }}>{p.price}</p>
                <div className="mt-2 py-1.5 text-center text-[10px] font-golos font-bold uppercase tracking-wider"
                  style={{ background: p.color, color: '#000' }}>
                  В корзину
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [screen, setScreen] = useState<Screen>('home');

  const navItems: { id: Screen; icon: string; label: string }[] = [
    { id: 'home', icon: 'LayoutGrid', label: 'Главная' },
    { id: 'map', icon: 'MapPin', label: 'Карта' },
    { id: 'profile', icon: 'PawPrint', label: 'Питомцы' },
    { id: 'market', icon: 'ShoppingBag', label: 'Магазин' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0f1114', maxWidth: 480, margin: '0 auto' }}>
      <StatusBar />

      <div className="flex-1 overflow-hidden flex flex-col">
        {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
        {screen === 'map' && (
          <div className="flex-1 overflow-y-auto pb-24">
            <MapView />
          </div>
        )}
        {screen === 'profile' && (
          <div className="flex-1 overflow-hidden flex flex-col pb-20">
            <PetProfile />
          </div>
        )}
        {screen === 'market' && <MarketScreen />}
      </div>

      <VetBert apiUrl={VETBERT_URL} />

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex border-t"
        style={{ maxWidth: 480, background: '#0a0c0e', borderColor: '#2a2d33' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors metro-tile"
            style={{
              borderTop: screen === item.id ? '2px solid #00d4d8' : '2px solid transparent',
            }}
          >
            <Icon
              name={item.icon}
              size={20}
              style={{ color: screen === item.id ? '#00d4d8' : '#ffffff40' }}
            />
            <span className="text-[10px] font-golos uppercase tracking-wide"
              style={{ color: screen === item.id ? '#00d4d8' : '#ffffff30' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}