import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se as variáveis de ambiente não estão configuradas, deixa passar para
  // que a página mostre seu próprio estado de erro em vez de tela branca.
  if (!supabaseUrl || !supabaseKey ||
      supabaseUrl.includes("your-project") ||
      supabaseKey.includes("your-anon-key")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            options as Parameters<typeof supabaseResponse.cookies.set>[2]
          )
        );
      },
    },
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/setup");

    if (!user && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && (pathname === "/" || pathname.startsWith("/login"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // Se o Supabase falhar (credenciais inválidas, sem rede), redireciona
    // para login em vez de travar tudo com tela branca.
    const { pathname } = request.nextUrl;
    const isPublicOnError =
      pathname === "/" ||
      pathname.startsWith("/login");
    if (!isPublicOnError) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
