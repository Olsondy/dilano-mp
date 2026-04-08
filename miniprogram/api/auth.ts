import { request } from '../utils/request';
import {
  AUTH_LOGOUT_URL,
  AUTH_ONE_CLICK_LOGIN_URL,
  AUTH_SILENT_LOGIN_URL,
} from './routes';

export type SilentLoginStatus =
  | 'SUCCESS'
  | 'NEED_ONE_CLICK_LOGIN'
  | 'CONTACT_SERVICE';

export interface SilentLoginResult {
  status: SilentLoginStatus;
  businessBound?: boolean;
  access_token?: string;
  expire_in?: number;
}

export interface SilentLoginParams {
  loginCode: string;
  clientId: string;
  grantType: string;
}

export interface OneClickLoginParams extends SilentLoginParams {
  phoneCode: string;
}

export const silentLogin = (data: SilentLoginParams) =>
  request<{
    code: number;
    msg: string;
    data: SilentLoginResult;
  }>({
    url: AUTH_SILENT_LOGIN_URL,
    method: 'POST',
    data,
  });

export const oneClickLogin = (data: OneClickLoginParams) =>
  request({
    url: AUTH_ONE_CLICK_LOGIN_URL,
    method: 'POST',
    data,
  });

export const logout = () =>
  request({
    url: AUTH_LOGOUT_URL,
    method: 'POST',
  });
