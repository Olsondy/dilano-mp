export const TOKEN_KEY = 'access_token';

let authBootstrapPromise: Promise<unknown> | null = null;

export function getToken(): string {
  return wx.getStorageSync(TOKEN_KEY);
}

export function setToken(token: string) {
  wx.setStorageSync(TOKEN_KEY, token);
}

export function removeToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

export function getAuthBootstrapPromise(): Promise<unknown> | null {
  return authBootstrapPromise;
}

export function setAuthBootstrapPromise(promise: Promise<unknown>) {
  authBootstrapPromise = promise;
}
