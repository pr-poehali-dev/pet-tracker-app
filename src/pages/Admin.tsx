import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const NEWS_URL = 'https://functions.poehali.dev/4e4288cf-2429-40f1-962a-ed46382cc3de';
const TOKEN_KEY = 'admin_token';

type AdminTab = 'stats' | 'stories' | 'articles' | 'add_article';

interface Stats {
  users: number;
  articles: number;
  comments: number;
  pending_stories: number;
  approved_stories: number;
}

interface Story {
  id: number;
  author: string;
  pet_name: string;
  title: string;
  story: string;
  status: string;
  created_at: string;
}

interface Article {
  id: number;
  title: string;
  category: string;
  emoji: string;
  author: string;
  published_at: string;
  views: number;
  is_published: boolean;
}

const CATEGORIES = ['Здоровье', 'Поведение', 'Питание', 'Воспитание', 'Породы', 'Общее'];

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<AdminTab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesFilter, setStoriesFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // Add article form
  const [newTitle, setNewTitle] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Общее');
  const [newEmoji, setNewEmoji] = useState('🐾');
  const [newAuthor, setNewAuthor] = useState('Редакция');
  const [addError, setAddError] = useState('');
  const [addDone, setAddDone] = useState(false);

  function api(body: object) {
    return fetch(NEWS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, admin_token: token }),
    }).then(r => r.json());
  }

  const loadStats = useCallback(async () => {
    const data = await api({ action: 'admin_stats' });
    if (data.error) return false;
    setStats(data);
    return true;
  }, [token]);

  async function login() {
    setAuthError('');
    setLoading(true);
    const data = await fetch(NEWS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'admin_stats', admin_token: tokenInput }),
    }).then(r => r.json());
    setLoading(false);
    if (data.error) {
      setAuthError('Неверный токен');
      return;
    }
    localStorage.setItem(TOKEN_KEY, tokenInput);
    setToken(tokenInput);
    setStats(data);
    setAuthed(true);
  }

  useEffect(() => {
    if (token) {
      loadStats().then(ok => setAuthed(ok));
    }
  }, [token]);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'stats') loadStats();
    if (tab === 'stories') loadStories();
    if (tab === 'articles') loadArticles();
  }, [tab, authed, storiesFilter]);

  async function loadStories() {
    setLoading(true);
    const data = await api({ action: 'admin_get_stories', status: storiesFilter });
    setStories(data.stories || []);
    setLoading(false);
  }

  async function loadArticles() {
    setLoading(true);
    const data = await api({ action: 'admin_get_articles' });
    setArticles(data.articles || []);
    setLoading(false);
  }

  async function updateStory(id: number, status: string) {
    await api({ action: 'admin_update_story', story_id: id, status });
    setStories(prev => prev.filter(s => s.id !== id));
    if (tab === 'stats') loadStats();
  }

  async function toggleArticle(id: number) {
    const data = await api({ action: 'admin_toggle_article', article_id: id });
    if (data.success) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published: data.is_published } : a));
    }
  }

  async function addArticle() {
    setAddError('');
    if (!newTitle.trim() || !newExcerpt.trim() || !newContent.trim()) {
      setAddError('Заполните все обязательные поля');
      return;
    }
    setLoading(true);
    const data = await api({
      action: 'admin_add_article',
      title: newTitle, excerpt: newExcerpt, content: newContent,
      category: newCategory, emoji: newEmoji, author: newAuthor,
    });
    setLoading(false);
    if (data.success) {
      setAddDone(true);
      setNewTitle(''); setNewExcerpt(''); setNewContent('');
      setNewEmoji('🐾'); setNewAuthor('Редакция'); setNewCategory('Общее');
      setTimeout(() => setAddDone(false), 3000);
    } else {
      setAddError(data.error || 'Ошибка');
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(''); setAuthed(false); setStats(null);
  }

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: '#0f1114' }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #e81123, #744da9)' }}>
              <Icon name="Shield" size={20} className="text-white" />
            </div>
            <div>
              <p className="font-russo text-xl text-white tracking-wider">ADMIN</p>
              <p className="text-[10px] text-white/40 font-golos">PetTrack · Панель управления</p>
            </div>
          </div>

          <div className="border" style={{ background: '#1a1d21', borderColor: '#2a2d33', borderTop: '3px solid #e81123' }}>
            <div className="p-6">
              <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">
                Токен доступа
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Введите токен..."
                autoFocus
                className="w-full px-4 py-3 text-sm font-golos text-white border outline-none placeholder-white/25 mb-4"
                style={{ background: '#0f1114', borderColor: authError ? '#e81123' : '#2a2d33' }}
              />
              {authError && <p className="text-xs text-red-400 font-golos mb-3">{authError}</p>}
              <button onClick={login} disabled={loading || !tokenInput.trim()}
                className="w-full py-3 font-russo text-sm uppercase tracking-widest disabled:opacity-40"
                style={{ background: '#e81123', color: '#fff' }}>
                {loading ? 'ПРОВЕРЯЕМ...' : 'ВОЙТИ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f1114' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: '#0a0c0e', borderColor: '#2a2d33' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #e81123, #744da9)' }}>
            <Icon name="Shield" size={16} className="text-white" />
          </div>
          <div>
            <p className="font-russo text-sm text-white tracking-wider">ADMIN PANEL</p>
            <p className="text-[10px] text-white/30 font-golos">PetTrack</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-white/40 font-golos hover:text-white/70 transition-colors">
          <Icon name="LogOut" size={14} /> Выйти
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* Tabs */}
        <div className="flex gap-0 mt-4 mb-5 border border-metro-border overflow-hidden">
          {([
            { id: 'stats' as AdminTab, icon: 'BarChart2', label: 'Статистика' },
            { id: 'stories' as AdminTab, icon: 'Star', label: 'Истории' },
            { id: 'articles' as AdminTab, icon: 'BookOpen', label: 'Статьи' },
            { id: 'add_article' as AdminTab, icon: 'Plus', label: 'Добавить' },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 flex flex-col items-center gap-1 text-[10px] font-golos font-bold uppercase tracking-wide transition-colors"
              style={{
                background: tab === t.id ? '#e81123' : '#1a1d21',
                color: tab === t.id ? '#fff' : '#ffffff50',
                borderRight: '1px solid #2a2d33',
              }}>
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* STATS */}
        {tab === 'stats' && stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Пользователей', value: stats.users, icon: 'Users', color: '#0078d4' },
                { label: 'Статей', value: stats.articles, icon: 'BookOpen', color: '#107c10' },
                { label: 'Комментариев', value: stats.comments, icon: 'MessageCircle', color: '#744da9' },
                { label: 'Историй в ожидании', value: stats.pending_stories, icon: 'Clock', color: '#ff8c00' },
                { label: 'Опубликовано историй', value: stats.approved_stories, icon: 'Star', color: '#00d4d8' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 p-4 border border-metro-border"
                  style={{ background: '#1a1d21' }}>
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{ background: s.color + '20' }}>
                    <Icon name={s.icon} size={18} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="font-russo text-2xl text-white">{s.value}</p>
                    <p className="text-[10px] text-white/40 font-golos">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {stats.pending_stories > 0 && (
              <button onClick={() => setTab('stories')}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm font-russo uppercase tracking-wider"
                style={{ background: '#ff8c00', color: '#000' }}>
                <Icon name="Clock" size={16} />
                {stats.pending_stories} {stats.pending_stories === 1 ? 'история ждёт' : 'историй ждут'} проверки
              </button>
            )}
          </div>
        )}

        {/* STORIES */}
        {tab === 'stories' && (
          <div>
            <div className="flex gap-2 mb-4">
              {(['pending', 'approved', 'rejected'] as const).map(f => (
                <button key={f} onClick={() => { setStoriesFilter(f); setStories([]); }}
                  className="px-3 py-1.5 text-xs font-golos font-semibold uppercase transition-colors"
                  style={{
                    background: storiesFilter === f ? (f === 'approved' ? '#107c10' : f === 'rejected' ? '#e81123' : '#ff8c00') : '#1a1d21',
                    color: storiesFilter === f ? '#fff' : '#ffffff50',
                    border: `1px solid ${storiesFilter === f ? 'transparent' : '#2a2d33'}`,
                  }}>
                  {f === 'pending' ? '⏳ Ожидают' : f === 'approved' ? '✅ Одобрены' : '❌ Отклонены'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-28 animate-pulse border border-metro-border" style={{ background: '#1a1d21' }} />)}
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-sm text-white/40 font-golos">Историй в этом разделе нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stories.map(story => (
                  <div key={story.id} className="border border-metro-border p-4"
                    style={{ background: '#1a1d21' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-xs text-white/40 font-golos mb-1">
                          🐾 {story.pet_name} · {story.author.slice(0, 4)}*** · {timeAgo(story.created_at)}
                        </p>
                        <p className="font-golos font-semibold text-white text-sm">{story.title}</p>
                      </div>
                    </div>
                    <p className="text-sm font-golos text-white/70 leading-relaxed mb-3 border-l-2 border-metro-border pl-3">{story.story}</p>
                    {storiesFilter === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStory(story.id, 'approved')}
                          className="flex-1 py-2 text-xs font-russo uppercase tracking-wider text-white"
                          style={{ background: '#107c10' }}>
                          ✅ Одобрить
                        </button>
                        <button onClick={() => updateStory(story.id, 'rejected')}
                          className="flex-1 py-2 text-xs font-russo uppercase tracking-wider text-white"
                          style={{ background: '#e81123' }}>
                          ❌ Отклонить
                        </button>
                      </div>
                    )}
                    {storiesFilter === 'approved' && (
                      <button onClick={() => updateStory(story.id, 'rejected')}
                        className="text-xs font-golos text-white/30 hover:text-red-400 transition-colors">
                        Снять с публикации
                      </button>
                    )}
                    {storiesFilter === 'rejected' && (
                      <button onClick={() => updateStory(story.id, 'approved')}
                        className="text-xs font-golos text-white/30 hover:text-green-400 transition-colors">
                        Восстановить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ARTICLES */}
        {tab === 'articles' && (
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse border border-metro-border" style={{ background: '#1a1d21' }} />)}
              </div>
            ) : articles.map(article => (
              <div key={article.id} className="flex items-center gap-3 px-3 py-2.5 border border-metro-border"
                style={{ background: '#1a1d21', opacity: article.is_published ? 1 : 0.5 }}>
                <span className="text-xl">{article.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-golos font-semibold text-white truncate">{article.title}</p>
                  <p className="text-[10px] text-white/40 font-golos">
                    {article.category} · {article.author} · 👁 {article.views}
                  </p>
                </div>
                <button onClick={() => toggleArticle(article.id)}
                  className="flex-shrink-0 px-3 py-1.5 text-[10px] font-russo uppercase transition-colors"
                  style={{
                    background: article.is_published ? '#107c10' : '#2a2d33',
                    color: '#fff',
                  }}>
                  {article.is_published ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ADD ARTICLE */}
        {tab === 'add_article' && (
          <div className="space-y-3">
            {addDone && (
              <div className="px-4 py-3 text-sm font-golos text-white flex items-center gap-2"
                style={{ background: '#107c10' }}>
                <Icon name="Check" size={16} /> Статья успешно добавлена!
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Эмодзи</label>
                <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)}
                  className="w-full px-3 py-2.5 text-lg font-golos text-white border outline-none text-center"
                  style={{ background: '#1a1d21', borderColor: '#2a2d33' }} />
              </div>
              <div>
                <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Категория</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none"
                  style={{ background: '#1a1d21', borderColor: '#2a2d33' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Автор</label>
              <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)}
                placeholder="Редакция"
                className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none placeholder-white/25"
                style={{ background: '#1a1d21', borderColor: '#2a2d33' }} />
            </div>

            <div>
              <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Заголовок *</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Интересный факт о животных..."
                className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none placeholder-white/25"
                style={{ background: '#1a1d21', borderColor: '#2a2d33' }} />
            </div>

            <div>
              <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Краткое описание * <span className="text-white/25 normal-case">(для ленты)</span></label>
              <textarea value={newExcerpt} onChange={e => setNewExcerpt(e.target.value)}
                placeholder="Короткое описание статьи..."
                rows={2}
                className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none placeholder-white/25 resize-none"
                style={{ background: '#1a1d21', borderColor: '#2a2d33' }} />
            </div>

            <div>
              <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Полный текст * <span className="text-white/25 normal-case">(поддерживает переносы строк)</span></label>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                placeholder="Полный текст статьи..."
                rows={10}
                className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none placeholder-white/25 resize-y"
                style={{ background: '#1a1d21', borderColor: '#2a2d33' }} />
            </div>

            {addError && <p className="text-xs text-red-400 font-golos">{addError}</p>}

            <button onClick={addArticle} disabled={loading}
              className="w-full py-3.5 font-russo text-sm uppercase tracking-widest disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #e81123, #744da9)', color: '#fff' }}>
              {loading ? 'ПУБЛИКУЕМ...' : '+ ОПУБЛИКОВАТЬ СТАТЬЮ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
