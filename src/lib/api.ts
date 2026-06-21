import { Platform } from 'react-native';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3010';

/** Web on the dev machine hits localhost; mobile uses LAN URL from .env */
const API_URL = Platform.OS === 'web' ? 'http://localhost:3010' : configuredUrl;

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  phoneNumber: string | null;
  fplId: string | null;
  lastLoginAt: string | null;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type MeResponse = {
  user: AuthUser;
};

type ErrorResponse = {
  error?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (API_URL.includes('loca.lt')) {
    headers['Bypass-Tunnel-Reminder'] = 'true';
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    if (msg.includes('NoRouteToHost') || msg.includes('Network request failed')) {
      throw new Error(
        'Cannot reach the API server. Ensure your phone is online, reload the app after Expo restarts, and keep api:tunnel running.'
      );
    }
    throw new Error(
      'Unable to reach the server. Check that the API is running and EXPO_PUBLIC_API_URL is correct.'
    );
  }

  const data = (await response.json().catch(() => ({}))) as T & ErrorResponse;

  if (!response.ok) {
    if (response.status === 503 || response.status === 408) {
      throw new Error(
        'API tunnel unavailable. Ask your dev to restart api:tunnel and Expo, then reload the app.'
      );
    }
    throw new Error(data.error || `Request failed (${response.status}).`);
  }

  return data;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function loginRequest(email: string, password: string, rememberMe: boolean) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export async function signupRequest(email: string, password: string, confirmPassword: string) {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, confirmPassword }),
  });
}

export async function meRequest(token: string) {
  return request<MeResponse>('/api/auth/me', {
    headers: authHeaders(token),
  });
}

export async function updateProfileDetailsRequest(
  token: string,
  body: { displayName?: string; phoneNumber?: string | null; fplId?: string | null }
) {
  return request<MeResponse>('/api/profile/details', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function updateEmailRequest(
  token: string,
  body: { currentPassword: string; newEmail: string }
) {
  return request<MeResponse>('/api/profile/email', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function updatePasswordRequest(
  token: string,
  body: { currentPassword: string; newPassword: string; confirmPassword: string }
) {
  return request<{ ok: boolean }>('/api/profile/password', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export { API_URL };
