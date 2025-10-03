import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'survey_session_id';
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const getSessionId = (): string | undefined => {
  return cookies().get(SESSION_COOKIE_NAME)?.value;
};

export const getOrCreateSessionId = (): string => {
  const cookieStore = cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const newId = crypto.randomUUID();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: newId,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: THIRTY_DAYS
  });

  return newId;
};
