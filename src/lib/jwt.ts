import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = () => {
  const s = import.meta.env.VITE_AUTH_SECRET;
  if (!s) throw new Error("VITE_AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
};

export type AuthPayload = JWTPayload & {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
  full_name: string;
};

export async function signAuthToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as AuthPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export function decodeAuthTokenUnsafe(token: string): AuthPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(payloadJson) as AuthPayload;
  } catch {
    return null;
  }
}
