import { createHash } from 'crypto';

export function generateToken(): string {
  return createHash('sha256').update(Date.now().toString()).digest('hex');
}
