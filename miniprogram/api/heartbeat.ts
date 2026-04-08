import { request } from '../utils/request';
import { HEARTBEAT_URL } from './routes';

export const sendHeartbeat = (timestamp: number) =>
  request({
    url: HEARTBEAT_URL,
    method: 'GET',
    data: {
      timestamp,
    },
  });
