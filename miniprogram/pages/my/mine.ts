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
    footer: "DILANO Customer v1.0.2"
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
    footer: "DILANO 客户端 v1.0.2"
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
      avatar: '/assets/ScreenShot.png',
      role: 'GUEST', // Default role
      partyType: ''  // Store raw type
    },
    commission: '0.00',
    referrer: '-',
    showLogin: false,
    showReferrals: false,
    referralList: [] as any[],
    privacyAgreed: false,
    showPrivacyDialog: false
  },

  onLoad() {
    // 1. Check user preference
    const storedLang = wx.getStorageSync('user_lang');
    if (storedLang) {
        this.updateContent(storedLang as LangType);
        return;
    }

    // 2. Auto-detect system language
    try {
        const sysInfo = wx.getSystemInfoSync();
        const sysLang = sysInfo.language; // e.g., "zh_CN", "en"
        const targetLang = (sysLang && sysLang.indexOf('zh') >= 0) ? 'zh' : 'en';
        
        // Save detected language so other components can access it
        wx.setStorageSync('user_lang', targetLang);
        
        this.updateContent(targetLang);
    } catch (e) {
        // Fallback to English
        wx.setStorageSync('user_lang', 'en');
        this.updateContent('en');
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
      // Sync TabBar language
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
  },

  getRoleName(type: string, lang: LangType): string {
      const map = ROLE_MAP[type];
      if (map) return map[lang];
      return lang === 'en' ? 'MEMBER' : '会员';
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

          const partyType = userInfo.partyType || 'customer'; // Default to customer if missing
          const roleName = this.getRoleName(partyType, this.data.currentLang);

          this.setData({
              userInfo: {
                  ...this.data.userInfo,
                  nickname: userInfo.nickname || 'Member',
                  phone: userInfo.id ? `ID: ${userInfo.id}` : '',
                  avatar: userInfo.avatar || this.data.userInfo.avatar,
                  role: roleName,
                  partyType: partyType
              },
              commission,
              referrer,
              referralList,
              showLogin: false
          });
      } catch (e) {
          console.log('Session invalid, showing login popup');
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
                              avatar: '/assets/ScreenShot.png',
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
                      // Even if API failed, local token is removed by AuthService.logout() finally block
                      // So we proceed to reset UI
                  }
              }
          }
      })
  },

  handlePrivacy() {
      wx.openPrivacyContract({
          success: () => {},
          fail: (res) => {
              Toast({ context: this, selector: '#t-toast', message: '无法打开隐私协议' });
          }
      });
  },

  togglePrivacy() {
      this.setData({ privacyAgreed: !this.data.privacyAgreed });
  },

  handleLoginCheck() {
      if (!this.data.privacyAgreed) {
          // Shake animation or just a toast
          Toast({ context: this, selector: '#t-toast', message: '请先阅读并同意隐私协议' });
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
    
    // Persist user preference
    wx.setStorageSync('user_lang', newLang);
    
    // Update TabBar immediately
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
    // Recalculate role based on new language if partyType exists
    const currentType = this.data.userInfo.partyType;
    let newRole = this.data.userInfo.role;
    
    if (currentType) {
        newRole = this.getRoleName(currentType, lang);
    } else {
        // Fallback for guest
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