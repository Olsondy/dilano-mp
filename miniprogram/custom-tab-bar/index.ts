import { getCurrentLang, LangType } from '../utils/i18n';
import tabBarI18n from './i18n';

Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: tabBarI18n.en.overview,
        iconType: 'home',
      },
      {
        pagePath: '/pages/my/mine',
        text: tabBarI18n.en.account,
        iconType: 'user',
      },
    ],
  },
  lifetimes: {
    attached() {
      this.initTabState();
    },
  },
  methods: {
    initTabState() {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];

      if (page) {
        const route = page.route;
        const index = this.data.list.findIndex((item) => {
          const itemPath = item.pagePath.startsWith('/')
            ? item.pagePath.substring(1)
            : item.pagePath;
          return itemPath === route;
        });

        if (index !== -1) {
          this.setData({ selected: index });
        }
      }

      const lang = getCurrentLang();
      this.updateTabList(lang);
    },

    updateTabList(lang: LangType) {
      const texts = tabBarI18n[lang] || tabBarI18n.en;
      const newList = this.data.list.map((item, index) => ({
        ...item,
        text: index === 0 ? texts.overview : texts.account,
      }));
      this.setData({ list: newList });
    },

    switchTab(e: WechatMiniprogram.BaseEvent) {
      const data = e.currentTarget.dataset;
      const index = Number(data.index);
      const path = data.path;

      if (this.data.selected !== index && !Number.isNaN(index)) {
        this.setData({ selected: index });
      }

      wx.switchTab({
        url: path,
      });
    },
  },
});
