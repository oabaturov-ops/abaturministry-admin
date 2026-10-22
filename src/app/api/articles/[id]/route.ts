import { NextResponse } from "next/server";
import {
  getArticleById,
  updateArticle,
  deleteArticle,
} from "../../../../lib/articles-store";

// ============================================================
// /api/articles/[id]
// GET    — одна статья (по uuid)
// PUT    — обновление статьи (панель, кнопка «Сохранить»)
// DELETE — удаление статьи
//
// ⚠️ Файл лежит ВНУТРИ папки [id] — на уровень глубже, чем
// /api/articles/route.ts, поэтому здесь ЧЕТЫРЕ ../ :
//   [id] → articles → api → app → src
// ============================================================

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/articles/[id] — получить одну статью
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    console.error("GET /api/articles/[id]:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// PUT /api/articles/[id] — обновить статью
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateArticle(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/articles/[id]:", error);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}

// DELETE /api/articles/[id] — удалить статью
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteArticle(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/articles/[id]:", error);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}