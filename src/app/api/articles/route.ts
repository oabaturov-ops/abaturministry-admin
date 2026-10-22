import { NextResponse } from "next/server";
import { getArticles, createArticle } from "../../../lib/articles-store";

// ============================================================
// /api/articles
//   GET  — отдаёт список статей КАК ЕСТЬ, простым массивом
//          (панель ожидает именно массив — items.map)
//   POST — создаёт статью и возвращает её же без обёртки
// ============================================================

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error("[api/articles] GET failed:", error);
    const message =
      error instanceof Error ? error.message : "Не удалось загрузить статьи";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const article = await createArticle(body ?? {});
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("[api/articles] POST failed:", error);
    const message =
      error instanceof Error ? error.message : "Ошибка сохранения";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}