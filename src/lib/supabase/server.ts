import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies' // 型をインポート

export async function createClient() {
  const cookieStore: ReadonlyRequestCookies = await cookies() // 型を明示的に指定

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (_error) {
            // The `cookies().set()` method can only be called from a Server Component or Server Action.
            // This error can be ignored if you're processing a form submission with `action={}`
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (_error) {
            // The `cookies().set()` method can only be called from a Server Component or Server Action.
            // This error can be ignored if you're processing a form submission with `action={}`
          }
        },
      },
    }
  )
}