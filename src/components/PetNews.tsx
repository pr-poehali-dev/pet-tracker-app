import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const NEWS_URL = 'https://functions.poehali.dev/4e4288cf-2429-40f1-962a-ed46382cc3de';

type Tab = 'feed' | 'stories' | 'submit';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  author: string;
  published_at: string;
  views: number;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  created_at: string;
}

interface UserStory {
  id: number;
  author: string;
  pet_name: string;
  title: string;
  story: string;
  created_at: string;
}

const CATEGORIES = ['Все', 'Здоровье', 'Поведение', 'Питание', 'Воспитание', 'Породы'];
const CATEGORY_COLORS: Record<string, string> = {
  'Здоровье': '#107c10',
  'Поведение': '#0078d4',
  'Питание': '#ff8c00',
  'Воспитание': '#744da9',
  'Породы': '#00d4d8',
  'Общее': '#2a2d33',
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

function api(body: object) {
  return fetch(NEWS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

export default function PetNews() {
  const [tab, setTab] = useState<Tab>('feed');
  const [articles, setArticles] = useState<Article[]>([]);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [category, setCategory] = useState('Все');
  const [loading, setLoading] = useState(false);

  // Submit story form
  const [petName, setPetName] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const phone = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || '{}').phone || ''; } catch { return ''; }
  })();

  useEffect(() => {
    if (tab === 'feed') loadArticles();
    if (tab === 'stories') loadStories();
  }, [tab, category]);

  async function loadArticles() {
    setLoading(true);
    const data = await api({ action: 'get_articles', category });
    setArticles(data.articles || []);
    setLoading(false);
  }

  async function loadStories() {
    setLoading(true);
    const data = await api({ action: 'get_stories' });
    setStories(data.stories || []);
    setLoading(false);
  }

  async function openArticle(article: Article) {
    setSelectedArticle(article);
    setComments([]);
    api({ action: 'increment_views', article_id: article.id });
    const data = await api({ action: 'get_article', article_id: article.id });
    setComments(data.comments || []);
  }

  async function sendComment() {
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    const data = await api({
      action: 'add_comment',
      article_id: selectedArticle!.id,
      text: commentText.trim(),
      phone,
    });
    if (data.id) {
      setComments(prev => [...prev, data]);
      setCommentText('');
    }
    setCommentLoading(false);
  }

  async function handleSubmitStory() {
    setSubmitError('');
    setSubmitLoading(true);
    const data = await api({ action: 'submit_story', pet_name: petName, title: storyTitle, story: storyText, phone });
    setSubmitLoading(false);
    if (data.success) {
      setSubmitDone(true);
      setPetName(''); setStoryTitle(''); setStoryText('');
    } else {
      setSubmitError(data.error || 'Ошибка');
    }
  }

  // Article detail view
  if (selectedArticle) {
    const catColor = CATEGORY_COLORS[selectedArticle.category] || '#2a2d33';
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-3 pb-2 flex-shrink-0 border-b border-metro-border flex items-center gap-2"
          style={{ background: '#1a1d21' }}>
          <button onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1.5 text-xs text-white/50 font-golos hover:text-white/80 transition-colors">
            <Icon name="ChevronLeft" size={16} /> Назад
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-[10px] text-white/30 font-golos">
            <Icon name="Eye" size={11} />
            <span>{selectedArticle.views + 1}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{selectedArticle.emoji}</span>
              <span className="text-[10px] font-golos px-2 py-0.5 font-semibold uppercase"
                style={{ background: catColor + '22', color: catColor }}>
                {selectedArticle.category}
              </span>
            </div>
            <h1 className="font-russo text-lg text-white leading-snug mb-2">{selectedArticle.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] text-white/40 font-golos">{selectedArticle.author}</span>
              <span className="text-white/20">·</span>
              <span className="text-[11px] text-white/30 font-golos">{timeAgo(selectedArticle.published_at)}</span>
            </div>
            <div className="text-sm font-golos text-white/80 leading-relaxed whitespace-pre-line border-l-2 pl-4 mb-6"
              style={{ borderColor: catColor }}>
              {selectedArticle.content}
            </div>
          </div>

          {/* Comments */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="MessageCircle" size={14} className="text-metro-teal" />
              <p className="text-xs font-russo text-white uppercase tracking-wider">
                Комментарии {comments.length > 0 && `(${comments.length})`}
              </p>
            </div>

            {comments.length === 0 && (
              <p className="text-xs text-white/30 font-golos mb-3">Будьте первым, кто прокомментирует</p>
            )}

            <div className="space-y-2 mb-3">
              {comments.map(c => (
                <div key={c.id} className="px-3 py-2 border border-metro-border" style={{ background: '#1a1d21' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-golos text-metro-teal">
                      {c.author.length > 7 ? c.author.slice(0, 4) + '***' + c.author.slice(-2) : c.author}
                    </span>
                    <span className="text-[10px] text-white/25 font-golos">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm font-golos text-white/80">{c.text}</p>
                </div>
              ))}
            </div>

            <div className="flex border border-metro-border" style={{ background: '#1a1d21' }}>
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
                placeholder="Оставить комментарий..."
                maxLength={500}
                className="flex-1 px-3 py-2.5 text-sm font-golos bg-transparent text-white outline-none placeholder-white/25"
              />
              <button onClick={sendComment} disabled={commentLoading || !commentText.trim()}
                className="px-3 transition-opacity disabled:opacity-30"
                style={{ background: commentText.trim() ? '#00d4d8' : 'transparent' }}>
                <Icon name="Send" size={14} style={{ color: commentText.trim() ? '#000' : '#ffffff40' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-2xl">📰</span>
          <p className="font-russo text-xl text-white uppercase tracking-widest">Новости</p>
        </div>
        <p className="text-xs text-metro-teal font-golos">Мир питомцев — интересное и важное</p>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mb-3 flex-shrink-0">
        {([
          { id: 'feed' as Tab, label: '📰 Статьи' },
          { id: 'stories' as Tab, label: '⭐ Истории' },
          { id: 'submit' as Tab, label: '✏️ Прислать' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-xs font-golos font-bold tracking-wide transition-colors"
            style={{
              background: tab === t.id ? '#00d4d8' : 'transparent',
              color: tab === t.id ? '#000' : '#ffffff66',
              borderBottom: tab !== t.id ? '1px solid #2a2d33' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* FEED TAB */}
      {tab === 'feed' && (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="flex-shrink-0 px-2.5 py-1 text-[10px] font-golos font-semibold uppercase transition-colors"
                style={{
                  background: category === cat ? (CATEGORY_COLORS[cat] || '#00d4d8') : '#1a1d21',
                  color: category === cat ? '#fff' : '#ffffff60',
                  border: `1px solid ${category === cat ? (CATEGORY_COLORS[cat] || '#00d4d8') : '#2a2d33'}`,
                }}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 border border-metro-border animate-pulse" style={{ background: '#1a1d21' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {articles.map((article, i) => {
                const catColor = CATEGORY_COLORS[article.category] || '#2a2d33';
                return (
                  <button key={article.id} onClick={() => openArticle(article)}
                    className="w-full text-left border metro-tile transition-all metro-fade-up"
                    style={{ background: '#1a1d21', borderColor: '#2a2d33', animationDelay: `${i * 0.05}s`, animationFillMode: 'forwards', opacity: 0 }}>
                    <div className="flex gap-3 p-3">
                      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-2xl"
                        style={{ background: catColor + '18' }}>
                        {article.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-golos px-1.5 py-0.5 font-semibold uppercase"
                            style={{ background: catColor + '22', color: catColor }}>
                            {article.category}
                          </span>
                          <span className="text-[10px] text-white/25 font-golos ml-auto flex items-center gap-1">
                            <Icon name="Eye" size={10} />{article.views}
                          </span>
                        </div>
                        <p className="font-golos font-semibold text-sm text-white leading-snug line-clamp-2">{article.title}</p>
                        <p className="text-[10px] text-white/40 font-golos mt-1">{article.author} · {timeAgo(article.published_at)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STORIES TAB */}
      {tab === 'stories' && (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-24 border border-metro-border animate-pulse" style={{ background: '#1a1d21' }} />)}
            </div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-12 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <p className="font-russo text-base text-white mb-2">Историй пока нет</p>
              <p className="text-sm text-white/40 font-golos mb-4">Будьте первым! Пришлите историю о своём питомце — после одобрения она появится здесь.</p>
              <button onClick={() => setTab('submit')}
                className="px-4 py-2 text-xs font-russo uppercase tracking-wider text-black"
                style={{ background: '#00d4d8' }}>
                Прислать историю
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((s, i) => (
                <div key={s.id} className="border border-metro-border p-4 metro-fade-up"
                  style={{ background: '#1a1d21', animationDelay: `${i * 0.06}s`, animationFillMode: 'forwards', opacity: 0 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🐾</span>
                    <div>
                      <p className="text-xs font-russo text-white">{s.pet_name}</p>
                      <p className="text-[10px] text-white/30 font-golos">
                        {s.author.length > 7 ? s.author.slice(0, 4) + '***' + s.author.slice(-2) : s.author} · {timeAgo(s.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="font-golos font-semibold text-sm text-white mb-1">{s.title}</p>
                  <p className="text-sm font-golos text-white/70 leading-relaxed">{s.story}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBMIT TAB */}
      {tab === 'submit' && (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {submitDone ? (
            <div className="flex flex-col items-center justify-center pt-12 text-center metro-fade-up"
              style={{ animationFillMode: 'forwards' }}>
              <div className="text-5xl mb-4">🎉</div>
              <p className="font-russo text-lg text-white mb-2">История отправлена!</p>
              <p className="text-sm text-white/50 font-golos mb-6 leading-relaxed">
                Мы рассмотрим её и опубликуем<br/>в разделе «Истории» после проверки.
              </p>
              <button onClick={() => setSubmitDone(false)}
                className="px-5 py-2.5 font-russo text-xs uppercase tracking-wider text-black"
                style={{ background: '#00d4d8' }}>
                Прислать ещё
              </button>
            </div>
          ) : (
            <>
              <div className="border border-metro-border p-4 mb-4" style={{ background: '#1a1d21', borderTop: '2px solid #00d4d8' }}>
                <p className="text-xs text-white/50 font-golos leading-relaxed">
                  Расскажите смешной, трогательный или удивительный случай с вашим питомцем.
                  После проверки администратором история появится в разделе «Истории».
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Имя питомца *</label>
                  <input type="text" value={petName} onChange={e => setPetName(e.target.value)}
                    placeholder="Барсик, Рекс, Пушок..."
                    className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none placeholder-white/25"
                    style={{ background: '#0f1114', borderColor: '#2a2d33' }} />
                </div>

                <div>
                  <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">Заголовок истории *</label>
                  <input type="text" value={storyTitle} onChange={e => setStoryTitle(e.target.value)}
                    placeholder="Как мой кот спас семью..."
                    className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none placeholder-white/25"
                    style={{ background: '#0f1114', borderColor: '#2a2d33' }} />
                </div>

                <div>
                  <label className="text-[10px] text-white/40 font-golos uppercase tracking-widest mb-1.5 block">
                    История * <span className="text-white/25 normal-case">(мин. 50 символов)</span>
                  </label>
                  <textarea value={storyText} onChange={e => setStoryText(e.target.value)}
                    placeholder="Однажды мой питомец..."
                    rows={6}
                    className="w-full px-3 py-2.5 text-sm font-golos text-white border outline-none placeholder-white/25 resize-none"
                    style={{ background: '#0f1114', borderColor: '#2a2d33' }} />
                  <p className="text-[10px] text-white/25 font-golos mt-1 text-right">{storyText.length} символов</p>
                </div>

                {submitError && <p className="text-xs text-red-400 font-golos">{submitError}</p>}

                <button onClick={handleSubmitStory}
                  disabled={submitLoading || !petName.trim() || !storyTitle.trim() || storyText.length < 50}
                  className="w-full py-3.5 font-russo text-sm uppercase tracking-widest transition-opacity disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #00d4d8, #0078d4)', color: '#000' }}>
                  {submitLoading ? 'ОТПРАВЛЯЕМ...' : '✏️ ОТПРАВИТЬ НА ПРОВЕРКУ'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
