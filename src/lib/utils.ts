import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl(req?: Request): string {
  // 1. Prioritize environment variable (set manually)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // 2. Try to derive from request (for production/dynamic setups)
  if (req) {
    const host = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    if (host) {
      return `${protocol}://${host}`.replace(/\/$/, "");
    }
  }

  // 3. Fallback for production (Adjust this to your real prod URL if needed)
  return "https://b360-omega.vercel.app/".replace(/\/$/, "");
}
