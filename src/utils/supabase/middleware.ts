import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Para rutas /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Si no hay usuario, redirigir a login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    } 
    
    // Si hay usuario, verificar su rol
    const { data: userProfile } = await supabase
      .from("user")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();
    
    // Si el usuario es client o no tiene perfil, redirigir a página no autorizada
    if (!userProfile || userProfile.role === 'client') {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized"; // O a cualquier otra página de acceso denegado
      return NextResponse.redirect(url);
    }
    
    // Si es admin, superadmin o marketing y está en la raíz de admin, redirigir al dashboard
    if (request.nextUrl.pathname === "/admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Para rutas /shop: puedes decidir si requieren autenticación o no
  // Este ejemplo permite acceso público a /shop
  // Si quieres que requiera autenticación, descomenta:
  /*
  if (!user && request.nextUrl.pathname.startsWith("/shop")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  */

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
