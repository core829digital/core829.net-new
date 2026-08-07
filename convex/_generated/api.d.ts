/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as chat from "../chat.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as partners from "../partners.js";
import type * as pricing from "../pricing.js";
import type * as quotes from "../quotes.js";
import type * as roles from "../roles.js";
import type * as sanitize from "../sanitize.js";
import type * as serviceKeys from "../serviceKeys.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  blog: typeof blog;
  chat: typeof chat;
  emails: typeof emails;
  http: typeof http;
  notifications: typeof notifications;
  partners: typeof partners;
  pricing: typeof pricing;
  quotes: typeof quotes;
  roles: typeof roles;
  sanitize: typeof sanitize;
  serviceKeys: typeof serviceKeys;
  storage: typeof storage;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
