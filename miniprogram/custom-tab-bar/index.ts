const i18n = {
  en: ["Overview", "Account"],
  zh: ["概览", "我的"]
};

Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "Overview",
        iconType: "home"
      },
      {
        pagePath: "/pages/my/mine",
        text: "Account",
        iconType: "user"
      }
    ]
  },
  lifetimes: {
    attached() {
      this.initTabState();
    }
  },
  methods: {
    initTabState() {
      // 1. Update selection
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      if (page) {
        const route = page.route;
        const index = this.data.list.findIndex(item => {
          const itemPath = item.pagePath.startsWith('/') ? item.pagePath.substring(1) : item.pagePath;
          return itemPath === route;
        });
        if (index !== -1) {
          this.setData({ selected: index });
        }
      }

      // 2. Update language
      const lang = wx.getStorageSync('user_lang') || 'en'; // Default to en if not set (or match system)
      // Note: System detection logic is mainly in Mine page, here we rely on storage or default.
      // If consistency is key, we can duplicate the detection logic, but storage is safer.
      this.updateTabList(lang);
    },

    updateTabList(lang: 'en' | 'zh') {
      const texts = i18n[lang] || i18n.en;
      const newList = this.data.list.map((item, index) => ({
        ...item,
        text: texts[index]
      }));
      this.setData({ list: newList });
    },

    switchTab(e: WechatMiniprogram.BaseEvent) {
      const data = e.currentTarget.dataset;
      const index = Number(data.index);
      const path = data.path;

      if (this.data.selected !== index) {
        this.setData({ selected: index });
      }

      wx.switchTab({
        url: path
      });
    }
  }
})