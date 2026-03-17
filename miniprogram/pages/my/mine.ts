import Toast from 'tdesign-miniprogram/toast/index';
import { AuthService } from '../../utils/auth';
import {
  buildDisplayId,
  getCurrentLang,
  getI18nText,
  LangType,
  setCurrentLang,
} from '../../utils/i18n';
import mineI18n, { mineRoleI18n } from './i18n';

const defaultLang: LangType = 'en';
const getText = (lang: LangType) => getI18nText(mineI18n, lang);
type MineText = ReturnType<typeof getText>;

interface MineUserInfo {
  nickname: string;
  phone: string;
  avatar: string;
  role: string;
  partyType: string;
}

const getGuestUserInfo = (lang: LangType): MineUserInfo => ({
  nickname: getText(lang).guestName,
  phone: getText(lang).guestPhone,
  avatar: '/assets/default_avatar.png',
  role: getText(lang).guestRole,
  partyType: '',
});

Page({
  data: {
    currentLang: defaultLang as LangType,
    text: getText(defaultLang) as MineText,
    userInfo: getGuestUserInfo(defaultLang) as MineUserInfo,
    commission: '0.00',
    referrer: '-',
    showLogin: false,
    showReferrals: false,
    referralList: [] as any[],
    privacyAgreed: false,
    showAgreementError: false,
    showPrivacyDialog: false,
    storageSize: '0 KB',
  },

  onLoad() {
    this.applyLanguage(getCurrentLang());
  },

  onShow() {
    const currentLang = getCurrentLang();
    this.applyLanguage(currentLang);

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
      this.getTabBar().updateTabList(currentLang);
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
    const map = mineRoleI18n[type];
    if (map) return map[lang];
    return getText(lang).memberName;
  },

  getLocalizedUserPhone(lang: LangType): string {
    const displayId = this.data.userInfo.phone || '';
    if (!displayId || displayId === this.data.text.guestPhone) {
      return '';
    }

    const rawId = displayId.replace(/^ID:\s*/, '').trim();
    return rawId ? buildDisplayId(rawId, lang) : displayId;
  },

  getLoggedOutState(lang: LangType) {
    return {
      userInfo: getGuestUserInfo(lang),
      commission: '0.00',
      referrer: '-',
      referralList: [] as any[],
      showLogin: true,
    };
  },

  applyLanguage(lang: LangType) {
    const text = getText(lang);
    const currentType = this.data.userInfo.partyType;
    const userInfo = currentType
      ? {
          ...this.data.userInfo,
          role: this.getRoleName(currentType, lang),
          phone: this.getLocalizedUserPhone(lang),
        }
      : getGuestUserInfo(lang);

    this.setData({
      currentLang: lang,
      text,
      userInfo,
    });
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
          commission = total.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          if (referralInfo.referredBy?.partyName) {
            referrer = referralInfo.referredBy.partyName;
          }
          if (
            referralInfo.referredUsers &&
            Array.isArray(referralInfo.referredUsers)
          ) {
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
          nickname: userInfo.nickname || this.data.text.memberName,
          phone: userInfo.id
            ? buildDisplayId(userInfo.id, this.data.currentLang)
            : '',
          avatar: userInfo.avatar || '/assets/default_avatar.png',
          role: roleName,
          partyType,
        },
        commission,
        referrer,
        referralList,
        showLogin: false,
      });
    } catch (_error) {
      this.setData(this.getLoggedOutState(this.data.currentLang));
    }
  },

  openReferrals() {
    if (!this.data.referralList || this.data.referralList.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: this.data.text.noReferralRecords,
      });
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
        Toast({
          context: this,
          selector: '#t-toast',
          message: this.data.text.authorizeCancelled,
        });
      } else {
        Toast({
          context: this,
          selector: '#t-toast',
          message: this.data.text.getPhoneFailed,
        });
      }
      return;
    }

    wx.showLoading({ title: this.data.text.loading, mask: true });
    try {
      await AuthService.login(code);
      wx.hideLoading();
      Toast({
        context: this,
        selector: '#t-toast',
        message: this.data.text.loginSuccess,
      });
      this.setData({ showLogin: false });
      this.checkLogin();
    } catch (err: any) {
      wx.hideLoading();
      Toast({
        context: this,
        selector: '#t-toast',
        message: err.message || this.data.text.loginFailed,
      });
    }
  },

  handleLogout() {
    wx.showModal({
      title: this.data.text.confirmTitle,
      content: this.data.text.logoutConfirm,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: this.data.text.logoutLoading, mask: true });
          try {
            await AuthService.logout();
            wx.hideLoading();
            Toast({
              context: this,
              selector: '#t-toast',
              message: this.data.text.logoutSuccess,
            });
            this.setData(this.getLoggedOutState(this.data.currentLang));
          } catch (_error) {
            wx.hideLoading();
          }
        }
      },
    });
  },

  handlePrivacy() {
    wx.openPrivacyContract({
      success: () => {},
      fail: () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: this.data.text.openPrivacyFailed,
        });
      },
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
          wx.showLoading({ title: this.data.text.processing, mask: true });
          try {
            const result: any = await AuthService.deleteAccount();
            wx.hideLoading();
            Toast({
              context: this,
              selector: '#t-toast',
              message: result.msg || this.data.text.accountDeleted,
            });
            this.setData(this.getLoggedOutState(this.data.currentLang));
          } catch (e: any) {
            wx.hideLoading();
            Toast({
              context: this,
              selector: '#t-toast',
              message: e.message || this.data.text.fallbackError,
            });
          }
        }
      },
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
    if (!displayId || displayId === this.data.text.guestPhone) {
      return;
    }

    const rawId = displayId.replace(/^ID:\s*/, '').trim();
    if (rawId) {
      wx.setClipboardData({
        data: rawId,
        success: () => {
          wx.hideToast();
          Toast({
            context: this,
            selector: '#t-toast',
            message: this.data.text.copyIdSuccess,
          });
        },
      });
    }
  },

  toggleLanguage() {
    const newLang = this.data.currentLang === 'en' ? 'zh' : 'en';
    setCurrentLang(newLang);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateTabList(newLang);
    }
    this.applyLanguage(newLang);
    Toast({
      context: this,
      selector: '#t-toast',
      message: getText(newLang).languageSwitched,
    });
  },

  onVisibleChange(e: any) {
    this.setData({
      showLogin: e.detail.visible,
    });
  },
});
