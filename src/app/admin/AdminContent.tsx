'use client'
import { useState, useEffect, useCallback } from 'react'

interface Article {
  id: string; slug: string; author: string; coverImage: string; published: boolean; sortOrder: number; createdAt: string;
  title_ru: string; content_ru: string; excerpt_ru: string;
  title_en: string; content_en: string; excerpt_en: string;
  category_ru: string; category_en: string; read_time: string;
}

export default function AdminContent() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState<Article | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [tab, setTab] = useState<'gen' | 'ru' | 'en'>('gen')
  const [form, setForm] = useState({ slug: '', author: '', coverImage: '', published: false, sortOrder: '0', title_ru: '', content_ru: '', excerpt_ru: '', title_en: '', content_en: '', excerpt_en: '', category_ru: '', category_en: '', read_time: '' })

  const loadData = useCallback(async () => {
    try { const r = await fetch('/api/articles'); if (r.ok) setItems(await r.json()) } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (auth) loadData() }, [auth, loadData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) })
    if (r.ok) { setAuth(true); setErr('') } else { setErr('Неверный пароль') }
  }

  const openM = (item?: Article) => {
    setTab('gen')
    setForm(item ? { slug: item.slug, author: item.author, coverImage: item.coverImage, published: item.published, sortOrder: String(item.sortOrder), title_ru: item.title_ru||'', content_ru: item.content_ru||'', excerpt_ru: item.excerpt_ru||'', title_en: item.title_en||'', content_en: item.content_en||'', excerpt_en: item.excerpt_en||'', category_ru: item.category_ru||'', category_en: item.category_en||'', read_time: item.read_time||'' } : { slug: '', author: '', coverImage: '', published: false, sortOrder: '0', title_ru: '', content_ru: '', excerpt_ru: '', title_en: '', content_en: '', excerpt_en: '', category_ru: '', category_en: '', read_time: '' })
    setEditItem(item || null)
    setModal(true)
  }

  const save = async () => {
    const url = editItem ? `/api/articles/${editItem.id}` : '/api/articles'
    const r = await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }) })
    if (r.ok) { setModal(false); loadData() } else { alert('Ошибка сохранения') }
  }

  const remove = async () => {
    if (!delId) return
    const r = await fetch(`/api/articles/${delId}`, { method: 'DELETE' })
    if (r.ok) { setDelId(null); loadData() } else { alert('Ошибка удаления') }
  }

  // Маленькие под-компоненты полей, чтобы разгрузить основной рендер
  const renderGen = () => (
    <div className="space-y-3">
      <div><label className="text-xs text-gray-400">Slug (URL латиницей)</label><input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1 text-white focus:outline-none" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-400">Сортировка</label><input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
        <div><label className="text-xs text-gray-400">Время чтения</label><input type="text" placeholder="5 мин" value={form.read_time} onChange={e => setForm({...form, read_time: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-400">Категория (RU)</label><input type="text" value={form.category_ru} onChange={e => setForm({...form, category_ru: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
        <div><label className="text-xs text-gray-400">Category (EN)</label><input type="text" value={form.category_en} onChange={e => setForm({...form, category_en: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
      </div>
      <div><label className="text-xs text-gray-400">Ссылка на обложку</label><input type="text" value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
      <div className="flex items-center gap-2 pt-1"><input type="checkbox" id="pub" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /><label htmlFor="pub" className="text-xs text-gray-300">Опубликовать сразу</label></div>
    </div>
  )


  const renderRu = () => (
    <div className="space-y-3">
      <div><label className="text-xs text-gray-400">Заголовок (RU)</label><input type="text" value={form.title_ru} onChange={e => setForm({...form, title_ru: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
      <div><label className="text-xs text-gray-400">Описание превью (RU)</label><textarea rows={2} value={form.excerpt_ru} onChange={e => setForm({...form, excerpt_ru: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1 resize-none" /></div>
      <div><label className="text-xs text-gray-400">Полный текст (RU)</label><textarea rows={5} value={form.content_ru} onChange={e => setForm({...form, content_ru: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
    </div>
  )

  const renderEn = () => (
    <div className="space-y-3">
      <div><label className="text-xs text-gray-400">Title (EN)</label><input type="text" value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
      <div><label className="text-xs text-gray-400">Excerpt (EN)</label><textarea rows={2} value={form.excerpt_en} onChange={e => setForm({...form, excerpt_en: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1 resize-none" /></div>
      <div><label className="text-xs text-gray-400">Content Text (EN)</label><textarea rows={5} value={form.content_en} onChange={e => setForm({...form, content_en: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 mt-1" /></div>
    </div>
  )

  if (!auth) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-2xl w-full max-w-sm border border-gray-800 text-center">
        <h1 className="text-2xl font-bold mb-2 text-blue-400">ABATUR MINISTRY</h1>
        <p className="text-gray-400 mb-6 text-sm">Панель администратора</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Пароль" className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none" />
          {err && <p className="text-red-400 text-sm text-left">{err}</p>}
          <button type="submit" className="w-full py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700">Войти</button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 text-left">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-blue-400">ABATUR Админка</h1>
          <button onClick={() => openM()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">+ Добавить материал</button>
        </div>
        {loading ? <p className="text-gray-400 text-center py-6">Загрузка...</p> : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-200">🇷🇺 {item.title_ru || 'Без названия'}</div>
                  <div className="text-sm text-gray-400">🇺🇸 {item.title_en || 'No title'}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.category_ru && <span>📁 {item.category_ru}</span>}
                    <span className="ml-2">{item.published ? '🟢 Опубликовано' : '⚪️ Черновик'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openM(item)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-xs">Редактировать</button>
                  <button onClick={() => setDelId(item.id)} className="px-3 py-1 bg-red-950/40 text-red-400 hover:bg-red-900 rounded-md text-xs">Удалить</button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-gray-500 text-center py-6">Материалов пока нет</p>}
          </div>
        )}
      </div>
           {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold">{editItem ? 'Редактирование' : 'Новый материал'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex border-b border-gray-800 bg-[#161616] text-xs">
              <button onClick={() => setTab('gen')} className={`px-4 py-2.5 border-b-2 ${tab === 'gen' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}>⚙️ Общие</button>
              <button onClick={() => setTab('ru')} className={`px-4 py-2.5 border-b-2 ${tab === 'ru' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}>🇷🇺 RU</button>
              <button onClick={() => setTab('en')} className={`px-4 py-2.5 border-b-2 ${tab === 'en' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}>🇺🇸 EN</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm">
              {tab === 'gen' && renderGen()}
              {tab === 'ru' && renderRu()}
              {tab === 'en' && renderEn()}
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-2 bg-[#141414]">
              <button onClick={() => setModal(false)} className="px-4 py-1.5 text-xs text-gray-400">Отмена</button>
              <button onClick={save} className="px-4 py-1.5 text-xs text-white bg-blue-600 rounded-md">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] border border-gray-800 p-5 rounded-xl max-w-xs w-full text-center text-sm">
            <h3 className="font-bold mb-1">Удалить материал?</h3>
            <p className="text-gray-400 text-xs mb-4">Это действие полностью удалит запись на обоих языках.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setDelId(null)} className="px-3 py-1 bg-gray-800 rounded text-xs">Отмена</button>
              <button onClick={remove} className="px-3 py-1 bg-red-600 rounded text-xs text-white">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}