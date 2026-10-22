import { createClient } from "@supabase/supabase-js";

// ============================================================
// articles-store.ts — серверный слой работы со статьями.
// Хранилище: таблица `articles` в Supabase.
//
// ВАЖНО: здесь используется СЕКРЕТНЫЙ service_role ключ из .env.local
// (он обходит RLS-политики). Этот файл можно импортировать ТОЛЬКО
// из серверных файлов (src/app/api/**) — никогда из компонентов.
// ============================================================

export interface Article {
  id: string;
  slug: string;
  title_ru: string;
  title_en: string | null;
  excerpt_ru: string | null;
  excerpt_en: string | null;
  content_ru: string;
  content_en: string | null;
  category_ru: string | null;
  category_en: string | null;
  read_time: string | null;
  cover_image: string | null;
  author: string | null;
  published: boolean;
  sort_order: number | null;
  created_at: string;
}

// ---------- Аккуратно читаем .env.local (обрезаем пробелы и кавычки) ----------

function readEnv(): { url: string; key: string } | null {
  const rawUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = rawUrl.trim().replace(/^["']+|["']+$/g, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "")
    .trim()
    .replace(/^["']+|["']+$/g, "");
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return { url, key };
  } catch {
    return null;
  }
}

type AdminClient = ReturnType<typeof makeClient>;

let cachedClient: AdminClient | null | undefined;

// createClient в свежих версиях supabase-js очень строго типизирует запросы
// (без сгенерированных типов БД insert/update принимают «never»), поэтому
// клиент приводим к any ровно в ОДНОМ месте — весь остальной код store
// остаётся со строгими типами на границе (Promise<Article[]> и т.д.).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeClient(url: string, key: string): any {
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function adminClient(): AdminClient {
  const env = readEnv();
  if (!env) {
    throw new Error(
      "Нет подключения к Supabase. Проверь файл .env.local — там должны быть две строки: " +
        "SUPABASE_URL=https://yzreudrlcapyolwsqgaq.supabase.co и SUPABASE_SERVICE_ROLE_KEY=eyJ... " +
        "После правки файла перезапусти npm run dev.",
    );
  }
  if (cachedClient === undefined) {
    cachedClient = makeClient(env.url, env.key);
  }
  return cachedClient;
}

// ---------- Превращаем русский заголовок в адрес (slug) ----------

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(text: string): string {
  const lowered = (text ?? "").toLowerCase().trim();
  let out = "";
  for (const ch of lowered) {
    if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (out.length > 0 && !out.endsWith("-")) out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// ---------- Приводим данные формы к колонкам таблицы ----------
// Понимаем и «змеиные» имена (title_ru), и «верблюжьи» (titleRu) —
// панель может присылать в любом формате.

const COLUMNS: Record<string, string> = {
  slug: "slug",
  title: "title_ru",
  title_ru: "title_ru", titleRu: "title_ru",
  title_en: "title_en", titleEn: "title_en",
  excerpt: "excerpt_ru",
  excerpt_ru: "excerpt_ru", excerptRu: "excerpt_ru",
  excerpt_en: "excerpt_en", excerptEn: "excerpt_en",
  content: "content_ru",
  content_ru: "content_ru", contentRu: "content_ru",
  content_en: "content_en", contentEn: "content_en",
  category: "category_ru",
  category_ru: "category_ru", categoryRu: "category_ru",
  category_en: "category_en", categoryEn: "category_en",
  read_time: "read_time", readTime: "read_time",
  cover_image: "cover_image", coverImage: "cover_image",
  author: "author",
  published: "published",
  sort_order: "sort_order", sortOrder: "sort_order",
};

function pickColumns(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const column = COLUMNS[key];
    if (!column || value === undefined) continue;

    if (column === "sort_order") {
      const n = Number(value);
      out[column] = Number.isFinite(n) ? Math.round(n) : null;
    } else if (column === "read_time") {
      // В таблице read_time — текст («5 мин»)
      out[column] = value === null || value === "" ? null : String(value);
    } else if (column === "published") {
      out[column] = Boolean(value);
    } else if (value === null) {
      out[column] = null;
    } else {
      out[column] = String(value);
    }
  }
  return out;
}

// ---------- Отдаём строки с дублями полей в двух форматах ----------
// row.sort_order и row.sortOrder — оба есть, панель найдёт своё.

function withCamel(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    titleRu: row.title_ru,
    titleEn: row.title_en,
    excerptRu: row.excerpt_ru,
    excerptEn: row.excerpt_en,
    contentRu: row.content_ru,
    contentEn: row.content_en,
    categoryRu: row.category_ru,
    categoryEn: row.category_en,
    readTime: row.read_time,
    coverImage: row.cover_image,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

// ============================================================
// ЧТЕНИЕ
// ============================================================

export async function getArticles(): Promise<Article[]> {
  const { data, error } = await adminClient()
    .from("articles")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error("Supabase: " + error.message);
  return ((data ?? []) as Record<string, unknown>[]).map(withCamel) as unknown as Article[];
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await adminClient()
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Supabase: " + error.message);
  return data
    ? (withCamel(data as Record<string, unknown>) as unknown as Article)
    : null;
}

// ============================================================
// СОЗДАНИЕ
// ============================================================

async function nextSortOrder(): Promise<number> {
  const { data } = await adminClient()
    .from("articles")
    .select("sort_order")
    .order("sort_order", { ascending: false, nullsFirst: false })
    .limit(1);
  const max =
    data && data.length > 0
      ? Number((data[0] as { sort_order?: number | null }).sort_order ?? 0)
      : 0;
  return max + 1;
}

export async function createArticle(input: Record<string, unknown>): Promise<Article> {
  const values = pickColumns(input);

  const title = String(values.title_ru ?? "").trim();
  if (!title) throw new Error("Заполните хотя бы «Название (RU)» — оно обязательно");

  // slug: если панель не прислала — делаем из заголовка
  const rawSlug = String(values.slug ?? "").trim();
  values.slug = slugify(rawSlug) || slugify(title) || `statya-${Date.now()}`;

  if (!("read_time" in values) || values.read_time === null) {
    values.read_time = "5 мин";
  }
  if (!("published" in values)) values.published = true;
  if (values.sort_order === null || values.sort_order === undefined) {
    values.sort_order = await nextSortOrder();
  }

  const { data, error } = await adminClient()
    .from("articles")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Статья с таким адресом (slug) уже есть — придумайте другой");
    }
    throw new Error("Supabase: " + error.message);
  }
  return withCamel(data as Record<string, unknown>) as unknown as Article;
}

// ============================================================
// ОБНОВЛЕНИЕ
// ============================================================

export async function updateArticle(
  id: string,
  input: Record<string, unknown>,
): Promise<Article> {
  const values = pickColumns(input);
  if (Object.keys(values).length === 0) {
    throw new Error("Нет данных для обновления");
  }

  const { data, error } = await adminClient()
    .from("articles")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Статья с таким адресом (slug) уже есть — придумайте другой");
    }
    throw new Error("Supabase: " + error.message);
  }
  if (!data) throw new Error("Статья не найдена");
  return withCamel(data as Record<string, unknown>) as unknown as Article;
}

// ============================================================
// УДАЛЕНИЕ
// ============================================================

export async function deleteArticle(id: string): Promise<void> {
  const { data, error } = await adminClient()
    .from("articles")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error("Supabase: " + error.message);
  if (!data || data.length === 0) {
    throw new Error("Статья не найдена — возможно, уже удалена");
  }
}