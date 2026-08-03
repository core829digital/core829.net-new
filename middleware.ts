import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip internals e file statici
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
