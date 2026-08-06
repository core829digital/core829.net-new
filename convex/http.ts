import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Rotte per la verifica dei JWT (.well-known/openid-configuration,
// .well-known/jwks.json) e per gli eventuali flussi OAuth.
auth.addHttpRoutes(http);

export default http;
