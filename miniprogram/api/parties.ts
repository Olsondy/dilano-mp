import { request } from '../utils/request';
import {
  PARTIES_CUSTOMER_PROJECTS_URL,
  PARTIES_REFERRAL_INFO_URL,
} from './routes';

export interface BackendTimelineItem {
  description: string;
  eventTime: string;
  newValue: string;
}

export interface BackendProject {
  id: string;
  projectName: string;
  stoneTypeList: string[] | null;
  quotedPrice: string;
  rebateCommissionRate: string;
  projectPhase: string;
  lastPhaseChangeTime: string;
  phaseTimeout: string;
  createTime: string;
  projectSource?: string;
  timelineList?: BackendTimelineItem[];
  progress?: number;
}

export interface CustomerProjectsResponse {
  code: number;
  msg: string;
  data: {
    partyInfo: any;
    projectList: BackendProject[];
  };
}

export const getCustomerProjects = () =>
  request<CustomerProjectsResponse>({
    url: PARTIES_CUSTOMER_PROJECTS_URL,
    method: 'GET',
  });

export const getReferralInfo = async (): Promise<any> => {
  const res: any = await request({
    url: PARTIES_REFERRAL_INFO_URL,
    method: 'GET',
  });
  return res.data || res;
};
