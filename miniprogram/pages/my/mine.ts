interface MenuItem {
  title: string;
  icon: string;
  path: string;
}

Page({
  data: {
    userInfo: {
      nickname: 'Akshay Rajput',
      phone: '@rajputakshay8940',
      avatar: '/static/avatar.png'
    },
    commission: '12,850.00',
    referrer: 'TechAdmin',
    menuItems: [
      { title: '推荐人列表', icon: '/static/icons/leads.png', path: '' },
      { title: '修改手机号', icon: '/static/icons/tasks.png', path: '' },
      { title: '隐私条款', icon: '/static/icons/reports.png', path: '' },
      { title: '关于DILANO', icon: '/static/icons/fav.png', path: '' }
    ] as MenuItem[]
  },

  onShow() {
    // 确保底部导航选中态正确
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  }
});