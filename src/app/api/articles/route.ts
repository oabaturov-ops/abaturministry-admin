import { NextResponse } from 'next/server'
import { readArticles, writeArticles, Article } from '../../../lib/articles-store'


// GET: Получить все статьи
export async function GET() {
  const articles = readArticles()
  // Сортируем по порядку sortOrder, затем по дате создания
  const sorted = articles.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  return NextResponse.json(sorted)
}

// POST: Создать новую статью
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const articles = readArticles()

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      slug: body.slug || `article-${Date.now()}`,
      author: body.author || '',
      coverImage: body.coverImage || '',
      published: Object.prototype.hasOwnProperty.call(body, 'published') ? body.published : false,
      sortOrder: Number(body.sortOrder) || 0,
      createdAt: new Date().toISOString(),
      title_ru: body.title_ru || '',
      content_ru: body.content_ru || '',
      excerpt_ru: body.excerpt_ru || '',
      title_en: body.title_en || '',
      content_en: body.content_en || '',
      excerpt_en: body.excerpt_en || '',
    }

    articles.push(newArticle)
    writeArticles(articles)

    return NextResponse.json({ success: true, article: newArticle })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
