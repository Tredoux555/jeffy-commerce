import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';
const AGENT_API_KEY = process.env.AGENT_API_KEY || 'change-this-api-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const ADMIN_COOKIE_NAME = 'jeffy_admin_session';

/**
 * Generate a secure session token
 */
function generateSessionToken(password: string): string {
  const timestamp = Date.now().toString();
  const data = `${password}:${timestamp}:${SESSION_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex') + ':' + timestamp;
}

/**
 * Verify a session token (valid for 24 hours)
 */
function verifySessionToken(token: string): boolean {
  if (!token) return false;
  
  const [hash, timestamp] = token.split(':');
  if (!hash || !timestamp) return false;
  
  // Check if token is expired (24 hours)
  const tokenTime = parseInt(timestamp);
  if (Date.now() - tokenTime > 24 * 60 * 60 * 1000) return false;
  
  // Verify hash
  const data = `${ADMIN_PASSWORD}:${timestamp}:${SESSION_SECRET}`;
  const expectedHash = crypto.createHash('sha256').update(data).digest('hex');
  
  return hash === expectedHash;
}

/**
 * Check if admin is logged in
 */
export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session ? verifySessionToken(session.value) : false;
}

/**
 * Log in admin with password
 */
export async function adminLogin(password: string): Promise<boolean> {
  if (password !== ADMIN_PASSWORD) return false;
  
  const token = generateSessionToken(password);
  const cookieStore = await cookies();
  
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
  
  return true;
}

/**
 * Log out admin
 */
export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Verify agent API key
 */
export function verifyAgentApiKey(apiKey: string): boolean {
  return apiKey === AGENT_API_KEY;
}

/**
 * Generate a partner session token
 */
export function generatePartnerToken(partnerId: string): string {
  const timestamp = Date.now().toString();
  const data = `${partnerId}:${timestamp}:${SESSION_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex') + ':' + partnerId + ':' + timestamp;
}

/**
 * Verify partner token
 */
export function verifyPartnerToken(token: string): { valid: boolean; partnerId?: string } {
  if (!token) return { valid: false };
  
  const parts = token.split(':');
  if (parts.length !== 3) return { valid: false };
  
  const [hash, partnerId, timestamp] = parts;
  
  // Check expiry (7 days)
  const tokenTime = parseInt(timestamp);
  if (Date.now() - tokenTime > 7 * 24 * 60 * 60 * 1000) return { valid: false };
  
  // Verify hash
  const data = `${partnerId}:${timestamp}:${SESSION_SECRET}`;
  const expectedHash = crypto.createHash('sha256').update(data).digest('hex');
  
  if (hash !== expectedHash) return { valid: false };
  
  return { valid: true, partnerId };
}
