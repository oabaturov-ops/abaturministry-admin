import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    // Получаем правильный пароль из файла .env
    const correctPassword = process.env.ADMIN_PASSWORD

    // Если пароль в .env забыли указать, временно пускаем по дефолтному (безопасность для тестов)
    const fallbackPassword = 'admin' 

    const validPassword = correctPassword || fallbackPassword

    if (password === validPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
