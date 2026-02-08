/**
 * 接口定义
 */
interface TimelineItem {
  t: string; d: string; title: string; status: string; info: string; ts: number;
}

// 后台原始数据结构
interface BackendProject {
    projectName: string;
    stoneTypeList: string[];
    rebateCommission: string;
    projectPhase: string; // '已创建' | '已报价' | '已签合同' | '已完成'
    phaseTimeout: string; // '正常' | '超时'
    createTime: string;
    // 模拟的 timeline 数据，实际可能需要单独获取
    mockTimeline?: TimelineItem[]; 
}

// 前端 UI 展示结构
interface UIProject {
  id: string; 
  statusDesc: string; 
  tagColor: string; 
  name: string;
  material: string; 
  createDate: string; // 替代原本的 time
  commission: string; // 替代 daysLeft
  progress: number;
  timeline: TimelineItem[];
  themeColor: string;
}

const i18n = {
  en: {
    dashboard: "Dashboard",
    overview: "Overview",
    created: "CREATED",
    progress: "Progress",
    noProjects: "NO ACTIVE PROJECTS",
    statusIdle: "Status: Idle",
    activity: "Activity",
    sort: "Sort",
    noActivity: "No recent activity"
  },
  zh: {
    dashboard: "仪表盘",
    overview: "概览",
    created: "创建于",
    progress: "进度",
    noProjects: "暂无进行中项目",
    statusIdle: "状态: 空闲",
    activity: "动态",
    sort: "排序",
    noActivity: "暂无最新动态"
  }
};

Page({
  data: {
    text: i18n.en, // Default to English
    loading: true,
    activeId: '',
    currentSwiperIndex: 0,
    activeThemeColor: '#4DB6AC',
    isDescending: true,
    switchAnimation: false,
    displayTimeline: [] as TimelineItem[],
    projectsData: [] as UIProject[],
    skeletonCount: 5 
  },

  onLoad() {
    this.calcSkeletonCount();
    this.initData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
      // Sync TabBar language
      const storedLang = wx.getStorageSync('user_lang');
      if (storedLang) {
          this.getTabBar().updateTabList(storedLang);
      }
    }

    // Update Page Language
    let storedLang = wx.getStorageSync('user_lang');
    if (!storedLang) {
        // Auto-detect if not set (First launch scenario)
        try {
            const sysInfo = wx.getSystemInfoSync();
            storedLang = (sysInfo.language && sysInfo.language.indexOf('zh') >= 0) ? 'zh' : 'en';
            wx.setStorageSync('user_lang', storedLang);
        } catch (e) {
            storedLang = 'en';
        }
    }
    
    this.setData({ text: i18n[storedLang] || i18n.en });
    
    // Also update TabBar with the determined language
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateTabList(storedLang);
    }
  },

  // 动态计算骨架屏数量
  calcSkeletonCount() {
    try {
        const { windowHeight, screenWidth } = wx.getSystemInfoSync();
        const pixelRatio = screenWidth / 750; // rpx 转 px 的比例
        
        // 估算头部已占用的高度 (rpx)
        // Navigation (176) + Header(100) + Cards(280) = ~556rpx
        const usedRpx = 556; 
        
        // 单个条目的高度 (rpx)
        // sk-line(120) + margin(24) = 144rpx
        const itemRpx = 144;
        
        // 剩余可用高度 (px)
        const remainHeight = windowHeight - (usedRpx * pixelRatio);
        
        if (remainHeight > 0) {
            // 计算需要的数量，向上取整并多加 2 个作为缓冲
            const count = Math.ceil(remainHeight / (itemRpx * pixelRatio)) + 2;
            this.setData({ skeletonCount: count });
        }
    } catch (e) {
        console.error('Calculated skeleton count failed', e);
    }
  },

  initData() {
    this.setData({ loading: true });
    
    // 模拟后台返回的数据
    const backendResponse: BackendProject[] = [
        // {
        //     projectName: "翡翠湖 0801",
        //     stoneTypeList: ["大理石", "花岗岩"],
        //     rebateCommission: "12,500",
        //     projectPhase: "已签合同",
        //     phaseTimeout: "正常",
        //     createTime: "2025-10-05 12:14:04",
        //     mockTimeline: [
        //          { t: '11:35', d: '12-20', title: '合同签署', status: '完成', info: '双方已确认报价单并签字。', ts: 1734665700 }
        //     ]
        // },
        // {
        //     projectName: "玫瑰园 A6",
        //     stoneTypeList: ["人造石"],
        //     rebateCommission: "8,200",
        //     projectPhase: "已报价",
        //     phaseTimeout: "超时", // 测试超时变红
        //     createTime: "2025-11-01 09:30:00",
        //      mockTimeline: [
        //          { t: '09:00', d: '11-01', title: '项目创建', status: '完成', info: '客户需求已录入系统。', ts: 1730420000 }
        //     ]
        // }
    ];

    const uiData = backendResponse.map((item, index) => this.mapBackendToUI(item, index));

    setTimeout(() => {
      this.setData({ 
          projectsData: uiData,
          activeId: uiData[0]?.id || '',
          activeThemeColor: uiData[0]?.tagColor || '#000',
          loading: false 
      });
      this.updateTimeline();
    }, 1000);
  },

  /**
   * 数据适配器：将后台数据转换为 UI 格式
   */
  mapBackendToUI(item: BackendProject, index: number): UIProject {
      // 1. 进度映射
      const progressMap: Record<string, number> = {
          '已创建': 10,
          '已报价': 35,
          '已签合同': 70,
          '已完成': 100
      };
      
      // 2. 颜色映射
      const colorMap: Record<string, string> = {
          '已创建': '#71717A', // Zinc-500
          '已报价': '#5E6AD2', // Linear Purple
          '已签合同': '#0070F3', // Vercel Blue
          '已完成': '#10B981'  // Emerald-500
      };

      let color = colorMap[item.projectPhase] || '#000';
      
      // 3. 超时处理
      if (item.phaseTimeout === '超时') {
          color = '#E5484D'; // Red
      }

      return {
          id: `p${index}`, // 生成唯一ID
          name: item.projectName,
          statusDesc: item.projectPhase,
          tagColor: color,
          themeColor: color,
          material: item.stoneTypeList.join(' / ') || '暂无材料信息',
          createDate: item.createTime.split(' ')[0], // 提取 YYYY-MM-DD
          commission: item.rebateCommission,
          progress: progressMap[item.projectPhase] || 0,
          timeline: item.mockTimeline || [] // 实际开发中可能需要单独 fetch
      };
  },

  // 更新详情列表逻辑
  updateTimeline() {
    const activeId = this.data.activeId;
    const isDescending = this.data.isDescending;
    const projectsData = this.data.projectsData;
    
    // Safety check
    if (!projectsData || projectsData.length === 0) return;
    
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

  onProjectSelect(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index;
    const project = this.data.projectsData[index];
    
    if (project && project.id !== this.data.activeId) {
        this.setData({
            currentSwiperIndex: index,
            activeId: project.id,
            activeThemeColor: project.themeColor,
            switchAnimation: true
        });
        this.updateTimeline();
        setTimeout(() => this.setData({ switchAnimation: false }), 500);
    }
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
    this.initData(); // 重新加载数据
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '已同步最新进度', icon: 'none' });
    }, 800);
  }
});
