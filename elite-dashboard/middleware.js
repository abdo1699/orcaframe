// Middleware temporarily disabled to avoid conflicts with client-side auth.
// If you want server-enforced protection, set a signed cookie on login
// and re-enable the logic accordingly.
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

// Narrow matcher to nothing for now (no-op)
export const config = {
  matcher: [],
};
