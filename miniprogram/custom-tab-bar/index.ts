Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/static/icons/home.png",
        selectedIconPath: "/static/icons/home-active.png"
      },
      {
        pagePath: "/pages/my/mine",
        text: "我的",
        iconPath: "/static/icons/user.png",
        selectedIconPath: "/static/icons/user-active.png"
      }
    ]
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      if (!page) return;

      const route = page.route; // e.g., "pages/index/index"
      
      // 使用更宽松的匹配逻辑：比较去掉开头的斜杠
      const index = this.data.list.findIndex(item => {
        const itemPath = item.pagePath.startsWith('/') ? item.pagePath.substring(1) : item.pagePath;
        return itemPath === route;
      });
      
      if (index !== -1) {
        this.setData({ selected: index });
      }
    }
  },
  methods: {
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
