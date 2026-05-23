import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "studyflow_super_secret_fallback_key_32_chars_long_minimum!"
);

const COOKIE_NAME = "auth_token";

export interface UserSessionPayload {
  userId: string;
  email: string;
  username: string;
  fullName: string;
}

/**
 * Signs and generates a secure, lightweight JWT session token.
 */
export async function signJWT(payload: UserSessionPayload, rememberMe: boolean): Promise<string> {
  const expiresIn = rememberMe ? "30d" : "1d";
  
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Decodes and verifies a JWT token. Returns null if invalid or expired.
 */
export async function verifyJWT(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Stores the session JWT in an HTTP-only, secure, sameSite="lax" cookie.
 */
export async function setAuthCookie(token: string, rememberMe: boolean) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge,
  });
}

/**
 * Deletes the session token cookie from the browser on logout.
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Sets the session JWT cookie directly on a NextResponse object.
 * Use this in Route Handlers that have `export const dynamic = "force-static"`,
 * since next/headers cookies().set() is blocked in force-static mode.
 */
export function setResponseAuthCookie(
  response: NextResponse,
  token: string,
  rememberMe: boolean
) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/**
 * Clears the session JWT cookie directly on a NextResponse object.
 * Use this in Route Handlers that have `export const dynamic = "force-static"`.
 */
export function clearResponseAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Retrieves the currently logged-in user payload from cookies.
 */
export async function getAuthUser(req?: NextRequest): Promise<UserSessionPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifyJWT(token);
}
