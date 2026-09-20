import fs from 'fs'
import path from 'path'

export interface Article {
  id: string; slug: string; author: string; coverImage: string; published: boolean; sortOrder: number; createdAt: string;
  title_ru: string; content_ru: string; excerpt_ru: string;
  title_en: string; content_en: string; excerpt_en: string;
}

const filePath = path.join(process.cwd(), 'src', 'data', 'articles.json')

export function readArticles(): Article[] {
  try { return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) || [] : [] } catch { return [] }
}

// Пишем ТОЛЬКО внутреннее хранилище админки (articles.json).
// Файлы сайта (posts.ts / books.ts) больше не трогаем — раньше это портило сайт.
export function writeArticles(articles: Article[]): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf8')
    return true
  } catch { return false }
}