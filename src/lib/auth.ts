export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || 'admin@campushub.in').trim().toLowerCase();
}

export function verifyAdminCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false;
  const cleanEmail = email.trim().toLowerCase();
  const primaryAdmin = getAdminEmail();
  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isEmailMatch = cleanEmail === primaryAdmin || allowedEmails.includes(cleanEmail);
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin_password_2026';

  return isEmailMatch && password === expectedPassword;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const primaryAdmin = getAdminEmail();
  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return cleanEmail === primaryAdmin || allowedEmails.includes(cleanEmail);
}
