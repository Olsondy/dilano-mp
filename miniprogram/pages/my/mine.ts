import { AuthService } from '../../utils/auth';
import Toast from 'tdesign-miniprogram/toast/index';

const i18n = {
  en: {
    pageTitle: "Account",
    commissionLabel: "Total Rewards",
    referrerLabel: "Inviter",
    generalSection: "GENERAL",
    referrals: "My Invitations",
    privacy: "Privacy Policy",
    about: "About",
    language: "Language",
    supportSection: "SUPPORT",
    logout: "Log Out",
    contact: "Contact Us",
    feedback: "Feedback",
    clearCache: "Clear Cache",
    userAgreement: "User Agreement",
    deleteAccount: "Delete Account",
    cacheCleared: "Cache cleared successfully",
    deleteConfirm: "注销后，您将无法通过此手机号再次登录小程序。如需保留查看权限，请仅选择退出登录。确定要注销吗？",
    legalSection: "LEGAL",
    footer: "DILANO v1.0.0",
    loginTitle: "Welcome to DILANO",
    loginDesc: "Login to unlock exclusive service experience",
    loginBtn: "One-click Login",
    agreeText: "I have read and agree to",
    agreeErr: "Please read and agree to ",
    andText: " and ",
    privacyLink: "Privacy Policy",
    loading: "Verifying...",
    logoutConfirm: "Are you sure to log out?",
    logoutLoading: "Logging out..."
  },
  zh: {
    pageTitle: "个人中心",
    commissionLabel: "累计奖励",
    referrerLabel: "邀请人",
    generalSection: "常规设置",
    referrals: "我的邀请",
    privacy: "隐私条款",
    about: "关于",
    language: "语言设置",
    supportSection: "支持与服务",
    logout: "退出登录",
    contact: "联系客服",
    feedback: "意见反馈",
    clearCache: "清除缓存",
    userAgreement: "用户协议",
    deleteAccount: "注销账号",
    cacheCleared: "缓存已清理",
    deleteConfirm: "注销后，您将无法通过此手机号再次登录小程序。如需保留查看权限，请仅选择退出登录。确定要注销吗？",
    legalSection: "法律与合规",
    footer: "DILANO v1.0.0",
    loginTitle: "欢迎来到迪兰诺",
    loginDesc: "立即登录，开启您的专属服务体验",
    loginBtn: "一键登录",
    agreeText: "我已阅读并同意",
    agreeErr: "请先阅读并同意",
    andText: "和",
    privacyLink: "《隐私协议》",
    loading: "验证中",
    logoutConfirm: "确定要退出登录吗？",
    logoutLoading: "退出中"
  }
};

type LangType = 'en' | 'zh';

const ROLE_MAP: Record<string, { en: string; zh: string }> = {
  customer: { en: 'CUSTOMER', zh: '客户' },
  referral: { en: 'INVITER', zh: '邀请人' }
};

Page({
  data: {
    currentLang: 'en' as LangType,
    text: i18n.en,
    userInfo: {
      nickname: 'Guest',
      phone: 'Please login',
      avatar: '/assets/default_avatar.png',
      role: 'GUEST',
      partyType: ''
    },
    commission: '0.00',
    referrer: '-',
    showLogin: false,
    showReferrals: false,
    referralList: [] as any[],
    privacyAgreed: false,
    showAgreementError: false,
    showPrivacyDialog: false,
    storageSize: '0 KB'
  },

  onLoad() {
    const storedLang = wx.getStorageSync('user_lang');
    if (storedLang) {
      this.updateContent(storedLang as LangType);
      return;
    }
    try {
      const sysInfo = wx.getSystemInfoSync();
      const sysLang = sysInfo.language;
      const targetLang = (sysLang && sysLang.indexOf('zh') >= 0) ? 'zh' : 'en';
      wx.setStorageSync('user_lang', targetLang);
      this.updateContent(targetLang);
    } catch (e) {
      wx.setStorageSync('user_lang', 'en');
      this.updateContent('en');
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
      const storedLang = wx.getStorageSync('user_lang');
      if (storedLang) {
        this.getTabBar().updateTabList(storedLang);
      }
    }

    const isRedirect = wx.getStorageSync('auth_redirect');
    if (isRedirect) {
      wx.removeStorageSync('auth_redirect');
      this.setData({ showLogin: true });
    } else {
      this.checkLogin();
    }
    // this.calculateStorageSize();
  },

  /*
  calculateStorageSize() {
    try {
      const res = wx.getStorageInfoSync();
      const sizeInKb = res.currentSize;
      let storageSize = '';
      if (sizeInKb < 1024) {
        storageSize = `${sizeInKb} KB`;
      } else {
        storageSize = `${(sizeInKb / 1024).toFixed(2)} MB`;
      }
      this.setData({ storageSize });
    } catch (e) {
      console.error('Failed to get storage info', e);
    }
  },
  */

  getRoleName(type: string, lang: LangType): string {
    const map = ROLE_MAP[type];
    if (map) return map[lang];
    return lang === 'en' ? 'MEMBER' : '客户';
  },

  async checkLogin() {
    try {
      const userInfo = await AuthService.getUserInfo();
      let commission = '0.00';
      let referrer = '-';
      let referralList: any[] = [];

      try {
        const referralInfo = await AuthService.getReferralInfo();
        if (referralInfo) {
          const total = Number(referralInfo.totalCommission || 0);
          commission = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (referralInfo.referredBy && referralInfo.referredBy.partyName) {
            referrer = referralInfo.referredBy.partyName;
          }
          if (referralInfo.referredUsers && Array.isArray(referralInfo.referredUsers)) {
            referralList = referralInfo.referredUsers;
          }
        }
      } catch (err) {
        console.error('Failed to fetch referral info:', err);
      }

      const partyType = userInfo.partyType || 'customer';
      const roleName = this.getRoleName(partyType, this.data.currentLang);

      this.setData({
        userInfo: {
          ...this.data.userInfo,
          nickname: userInfo.nickname || 'Member',
          phone: userInfo.id ? `ID: ${userInfo.id}` : '',
          avatar: userInfo.avatar || '/assets/default_avatar.png',
          role: roleName,
          partyType: partyType
        },
        commission,
        referrer,
        referralList,
        showLogin: false
      });
    } catch (e) {
      this.setData({ showLogin: true });
    }
  },

  openReferrals() {
    if (!this.data.referralList || this.data.referralList.length === 0) {
      Toast({ context: this, selector: '#t-toast', message: '暂无邀请记录' });
      return;
    }
    this.setData({ showReferrals: true });
  },

  onReferralsVisibleChange(e: any) {
    this.setData({ showReferrals: e.detail.visible });
  },

  closeReferrals() {
    this.setData({ showReferrals: false });
  },

  async handleLogin(e: any) {
    const { code, errMsg } = e.detail;
    if (!code) {
      if (errMsg.indexOf('deny') >= 0) {
        Toast({ context: this, selector: '#t-toast', message: '已取消授权' });
      } else {
        Toast({ context: this, selector: '#t-toast', message: '获取手机号失败' });
      }
      return;
    }

    wx.showLoading({ title: '验证中', mask: true });
    try {
      await AuthService.login(code);
      wx.hideLoading();
      Toast({ context: this, selector: '#t-toast', message: '登录成功' });
      this.setData({ showLogin: false });
      this.checkLogin();
    } catch (err: any) {
      wx.hideLoading();
      Toast({ context: this, selector: '#t-toast', message: err.message || '登录失败' });
    }
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '退出中', mask: true });
          try {
            await AuthService.logout();
            wx.hideLoading();
            Toast({ context: this, selector: '#t-toast', message: '已退出登录' });
            this.setData({ 
              userInfo: {
                nickname: 'Guest',
                phone: 'Please login',
                avatar: '/assets/default_avatar.png',
                role: 'GUEST',
                partyType: ''
              },
              commission: '0.00',
              referrer: '-',
              referralList: [],
              showLogin: true 
            });
          } catch (e) {
            wx.hideLoading();
          }
        }
      }
    })
  },

  handlePrivacy() {
    wx.openPrivacyContract({
      success: () => {},
      fail: () => {
        Toast({ context: this, selector: '#t-toast', message: '无法打开隐私协议' });
      }
    });
  },

  handleAgreement() {
    const url = encodeURIComponent('https://dilano.cloud/userTerm.html');
    wx.navigateTo({
      url: `/pages/webview/index?url=${url}`
    });
  },

  /*
  handleClearCache() {
    wx.showModal({
      title: this.data.currentLang === 'en' ? 'Clear Cache' : '清除缓存',
      content: this.data.currentLang === 'en' ? 'Are you sure?' : '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          const currentLang = this.data.currentLang;
          const token = AuthService.getToken();
          wx.clearStorage();
          // Re-save language and token
          wx.setStorageSync('user_lang', currentLang);
          if (token) AuthService.setToken(token);
          this.calculateStorageSize();
          Toast({ context: this, selector: '#t-toast', message: this.data.text.cacheCleared });
        }
      }
    });
  },
  */

  handleDeleteAccount() {
    wx.showModal({
      title: this.data.text.deleteAccount,
      content: this.data.text.deleteConfirm,
      confirmColor: '#E5484D',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: 'Processing...', mask: true });
          try {
            const result: any = await AuthService.deleteAccount();
            wx.hideLoading();
            Toast({ 
              context: this, 
              selector: '#t-toast', 
              message: result.msg || (this.data.currentLang === 'en' ? 'Account Deleted' : '账号已注销') 
            });
            this.setData({ 
              userInfo: {
                nickname: 'Guest',
                phone: 'Please login',
                avatar: '/assets/default_avatar.png',
                role: 'GUEST',
                partyType: ''
              },
              commission: '0.00',
              referrer: '-',
              referralList: [],
              showLogin: true 
            });
          } catch (e: any) {
            wx.hideLoading();
            Toast({ context: this, selector: '#t-toast', message: e.message || 'Operation Failed' });
          }
        }
      }
    });
  },

  togglePrivacy() {
    this.setData({ privacyAgreed: !this.data.privacyAgreed });
  },

  handleLoginCheck() {
    if (!this.data.privacyAgreed) {
      this.setData({ showAgreementError: true });
      setTimeout(() => {
        this.setData({ showAgreementError: false });
      }, 3000);
    }
  },

  handleCopyId() {
    const displayId = this.data.userInfo.phone || '';
    const rawId = displayId.replace('ID: ', '').trim();
    if (rawId && rawId !== 'Please login') {
      wx.setClipboardData({
        data: rawId,
        success: () => {
          wx.hideToast(); 
          Toast({ context: this, selector: '#t-toast', message: 'ID已复制' });
        }
      });
    }
  },

  toggleLanguage() {
    const newLang = this.data.currentLang === 'en' ? 'zh' : 'en';
    wx.setStorageSync('user_lang', newLang);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateTabList(newLang);
    }
    this.updateContent(newLang);
    Toast({ 
      context: this, 
      selector: '#t-toast', 
      message: newLang === 'en' ? 'Switched to English' : '已切换至中文',
    });
  },

  updateContent(lang: LangType) {
    const currentType = this.data.userInfo.partyType;
    let newRole = this.data.userInfo.role;
    if (currentType) {
      newRole = this.getRoleName(currentType, lang);
    } else {
      newRole = lang === 'en' ? 'GUEST' : '访客';
    }
    this.setData({
      currentLang: lang,
      text: i18n[lang],
      'userInfo.role': newRole
    });
  },

  onVisibleChange(e: any) {
    this.setData({
      showLogin: e.detail.visible
    });
  }
});