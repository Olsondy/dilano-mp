/**
 * 接口定义：确保 TS 类型安全
 */
interface TimelineItem {
  t: string; d: string; title: string; status: string; info: string; ts: number;
}

interface Project {
  id: string; statusDesc: string; tagText: string; tagColor: string; name: string;
  material: string; time: string; themeColor: string; timeline: TimelineItem[];
}

Page({
  data: {
    loading: true,
    activeId: 'p1',
    currentSwiperIndex: 0,
    activeThemeColor: '#4DB6AC',
    isDescending: true,
    switchAnimation: false,
    displayTimeline: [] as TimelineItem[],
    projectsData: [
      {
        id: 'p1',
        statusDesc: '进行中', tagText: '我的', tagColor: '#4DB6AC',
        name: '翡翠湖 0801', material: '杜拉维特 / 汉斯格雅',
        time: '2025-11-20', themeColor: '#4DB6AC',
        timeline: [
          { t: '11:35', d: '12-20', title: '泥木施工', status: '进行中', info: '厨房墙砖铺贴完成，正在进行地面找平。', ts: 1734665700 },
          { t: '09:15', d: '12-18', title: '防水测试', status: '已通过', info: '闭水试验48小时无渗漏，业主签字。', ts: 1734484500 }
        ]
      },
      {
        id: 'p2',
        statusDesc: '已签合同', tagText: '报备', tagColor: '#ff9500',
        name: '玫瑰园 A6', material: '圣象地板 / 索菲亚',
        time: '2025-12-01', themeColor: '#ff9500',
        timeline: [
          { t: '14:20', d: '12-05', title: '交底会议', status: '完成', info: '现场核对拆改细节。', ts: 1733380000 }
        ]
      },
      {
        id: 'p3',
        statusDesc: '已签合同', tagText: '报备', tagColor: '#ff9500',
        name: '玫瑰园 A6', material: '圣象地板 / 索菲亚',
        time: '2025-12-01', themeColor: '#ff9500',
        timeline: [
          { t: '14:20', d: '12-05', title: '交底会议', status: '完成', info: '现场核对拆改细节。', ts: 1733380000 }
        ]
      }
    ] as Project[]
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  initData() {
    this.setData({ loading: true });
    setTimeout(() => {
      this.updateTimeline();
      this.setData({ loading: false });
    }, 1500);
  },

  // 更新详情列表逻辑 - 彻底移除 Spread 运算符
  updateTimeline() {
    const activeId = this.data.activeId;
    const isDescending = this.data.isDescending;
    const projectsData = this.data.projectsData;
    
    const project = projectsData.filter(p => p.id === activeId)[0];

    if (project && project.timeline) {
      // 使用 slice() 替代 [...] 避免 babel-runtime 报错
      let sorted = project.timeline.slice(); 
      sorted.sort((a, b) => {
        return isDescending ? b.ts - a.ts : a.ts - b.ts;
      });
      this.setData({ displayTimeline: sorted });
    }
  },

  toggleSort() {
    this.setData({
      isDescending: !this.data.isDescending,
      switchAnimation: true
    });
    this.updateTimeline();
    setTimeout(() => this.setData({ switchAnimation: false }), 500);
  },

  onSwiperChange(e: any) {
    const current = e.detail.current;
    const project = this.data.projectsData[current];
    
    if (project) {
        this.setData({
            currentSwiperIndex: current,
            activeId: project.id,
            activeThemeColor: project.themeColor,
            switchAnimation: true
        });
        this.updateTimeline();
        setTimeout(() => this.setData({ switchAnimation: false }), 500);
    }
  },

  async onPullDownRefresh() {
    this.updateTimeline();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '已同步最新进度', icon: 'none' });
    }, 800);
  }
});