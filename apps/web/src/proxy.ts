import { i18nRouter } from 'next-i18n-router'
import type { NextRequest } from 'next/server'

import { i18nRouterConfig } from './locales/i18n-router-config'

/*
 * For more info see
 * https://nextjs.org/docs/app/building-your-application/routing/internationalization
 * */

export function proxy(request: NextRequest) {
  return i18nRouter(request, i18nRouterConfig)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - manifest.json and other static files
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|api|websocketServer|config\\.json|favicon\\.ico|favicon\\.svg|manifest\\.json|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
