import { AuthTokenPayload, AuthRole } from '../types';

const DEFAULT_SECRET = 'metron-production-jwt-hmac-sha256-secret-key-32chars!';
const JWT_SECRET = process.env.AUTH_SECRET || DEFAULT_SECRET;
export const AUTH_COOKIE_NAME = 'metron_auth_token';
export const DEFAULT_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytesOrStr: Uint8Array | ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof bytesOrStr === 'string') {
    bytes = encoder.encode(bytesOrStr);
  } else if (bytesOrStr instanceof Uint8Array) {
    bytes = bytesOrStr;
  } else {
    bytes = new Uint8Array(bytesOrStr);
  }

  // Fast path for environments with Buffer
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }

  // Universal Web API fallback
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBytes(str: string): Uint8Array {
  // Fast path for environments with Buffer
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(str, 'base64url'));
  }

  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string = JWT_SECRET): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sign a JWT token using HMAC-SHA256 via Web Crypto API (supported in Node & Edge)
 */
export async function signToken(
  payload: Omit<AuthTokenPayload, 'iat' | 'exp'>,
  expiresInSeconds: number = DEFAULT_TOKEN_EXPIRY
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AuthTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataToSign)
  );
  const encodedSignature = base64UrlEncode(signatureBuffer);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verify a JWT token signature and expiration
 */
export async function verifyToken(token?: string | null): Promise<AuthTokenPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  try {
    const key = await getCryptoKey();
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const signatureBytes = base64UrlToBytes(encodedSignature);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(dataToVerify)
    );

    if (!isValid) {
      return null;
    }

    const payloadJson = decoder.decode(base64UrlToBytes(encodedPayload));
    const payload: AuthTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Extract token from cookie string, Request object, or Authorization header
 */
export function extractTokenFromRequest(
  cookieHeaderOrRequest: string | Request | { headers?: Headers | { get: (k: string) => string | null } }
): string | null {
  if (!cookieHeaderOrRequest) return null;

  // 1. If it's a string (e.g. cookie header)
  if (typeof cookieHeaderOrRequest === 'string') {
    return parseCookieValue(cookieHeaderOrRequest, AUTH_COOKIE_NAME);
  }

  // 2. Check Authorization Header if available
  const headers = 'headers' in cookieHeaderOrRequest ? cookieHeaderOrRequest.headers : undefined;
  if (headers && typeof headers.get === 'function') {
    const authHeader = headers.get('authorization') || headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    const cookieHeader = headers.get('cookie') || headers.get('Cookie');
    if (cookieHeader) {
      return parseCookieValue(cookieHeader, AUTH_COOKIE_NAME);
    }
  }

  return null;
}

function parseCookieValue(cookieString: string, name: string): string | null {
  const match = cookieString.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getRoleDashboardPath(role: AuthRole): string {
  switch (role) {
    case 'freelancer':
      return '/freelancer/dashboard';
    case 'client':
      return '/client/dashboard';
    default:
      return '/login';
  }
}
