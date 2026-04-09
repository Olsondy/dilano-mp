export const TOKEN_KEY = 'access_token';
export const MANUAL_LOGOUT_KEY = 'manual_logout';

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

export function hasManualLogoutFlag(): boolean {
  return Boolean(wx.getStorageSync(MANUAL_LOGOUT_KEY));
}

export function setManualLogoutFlag() {
  wx.setStorageSync(MANUAL_LOGOUT_KEY, true);
}

export function clearManualLogoutFlag() {
  wx.removeStorageSync(MANUAL_LOGOUT_KEY);
}

export function getAuthBootstrapPromise(): Promise<unknown> | null {
  return authBootstrapPromise;
}

export function setAuthBootstrapPromise(promise: Promise<unknown>) {
  authBootstrapPromise = promise;
}
