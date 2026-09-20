import { NextResponse } from 'next/server'
import { readArticles, writeArticles } from '../../../../lib/articles-store'

// PUT: Обновить материал
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params // Добавлен await для Next.js 16
    const body = await request.json()
    const articles = readArticles()
    
    const index = articles.findIndex((a) => a.id === id)
    if (index === -1) return NextResponse.json({ error: 'Не найден' }, { status: 404 })

    articles[index] = {
      ...articles[index],
      slug: body.slug || articles[index].slug,
      author: body.author || articles[index].author,
      coverImage: body.coverImage || articles[index].coverImage,
      published: Object.prototype.hasOwnProperty.call(body, 'published') ? body.published : articles[index].published,
      sortOrder: Number(body.sortOrder) ?? articles[index].sortOrder,
      title_ru: body.title_ru || '',
      content_ru: body.content_ru || '',
      excerpt_ru: body.excerpt_ru || '',
      title_en: body.title_en || '',
      content_en: body.content_en || '',
      excerpt_en: body.excerpt_en || '',
    }

    writeArticles(articles)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Ошибка' }, { status: 500 }) }
}

// DELETE: Удалить материал
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params // Добавлен await для Next.js 16
    const articles = readArticles()
    const filtered = articles.filter((a) => a.id !== id)
    
    if (articles.length === filtered.length) {
      return NextResponse.json({ error: 'Не найден' }, { status: 404 })
    }

    writeArticles(filtered)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Ошибка' }, { status: 500 }) }
}
