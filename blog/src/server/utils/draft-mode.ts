import { H3Event, deleteCookie, getCookie, setCookie } from 'h3';
import { createHash } from 'crypto';

const DRAFT_MODE_COOKIE_NAME = '__draft_mode';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour

function generateToken(): string {
  return createHash('sha256').update(Date.now().toString()).digest('hex');
}

export function setDraftMode(event: H3Event, enable = true): void {
  const token = generateToken();
  if (enable) {
    setCookie(event, DRAFT_MODE_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  } else {
    deleteCookie(event, DRAFT_MODE_COOKIE_NAME);
  }
}

export function isDraftMode(event: H3Event): boolean {
  return !!getCookie(event, DRAFT_MODE_COOKIE_NAME);
}
