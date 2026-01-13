import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Створюємо відповідь за замовчуванням
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Ініціалізуємо Supabase клієнт
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Оновлюємо куки в запиті
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          
          // Оновлюємо відповідь (щоб куки записалися в браузер)
          supabaseResponse = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. ОНОВЛЮЄМО СЕСІЮ (Це критично для Safari!)
  // Цей виклик перевіряє токен і оновлює його, якщо він старий
  await supabase.auth.getUser()

  return supabaseResponse
}

// Налаштування: на яких сторінках працює цей файл
export const config = {
  matcher: [
    /*
     * Запускати на всіх шляхах, КРІМ:
     * - _next/static (статичні файли)
     * - _next/image (картинки)
     * - favicon.ico (іконка сайту)
     * - api/ (API маршрути обробляють auth самі)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}