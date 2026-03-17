const commonI18n = {
  en: {
    confirmTitle: 'Notice',
    processing: 'Processing...',
    fallbackError: 'Operation Failed',
    guestName: 'Guest',
    guestPhone: 'Please login',
    guestRole: 'GUEST',
    memberName: 'Member',
    idPrefix: 'ID',
  },
  zh: {
    confirmTitle: '提示',
    processing: '处理中...',
    fallbackError: '操作失败',
    guestName: '访客',
    guestPhone: '请先登录',
    guestRole: '访客',
    memberName: '会员',
    idPrefix: 'ID',
  },
} as const;

export type CommonI18nText = (typeof commonI18n)['en'];

export default commonI18n;
