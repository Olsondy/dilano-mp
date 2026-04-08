import { request } from '../utils/request';
import { USER_CANCELLATION_URL, USER_INFO_URL } from './routes';

export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  [key: string]: any;
}

export const getUserInfo = async (): Promise<UserInfo> => {
  const res: any = await request({
    url: USER_INFO_URL,
    method: 'POST',
  });
  return res.data || res;
};

export const cancelAccount = () =>
  request({
    url: USER_CANCELLATION_URL,
    method: 'POST',
  });
