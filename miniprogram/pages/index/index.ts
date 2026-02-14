/**
 * 接口定义
 */
import { request } from '../../utils/request';

interface TimelineItem {
  t: string; d: string; title: string; status: string; info: string; ts: number;
}


interface BackendTimelineItem {
    description: string;
    eventTime: string;
    newValue: string;
}

// 后台原始数据结构 (API 对应)
interface BackendProject {
    id: string;
    projectName: string;
    stoneTypeList: string[] | null;
    quotedPrice: string;
    rebateCommissionRate: string;
    projectPhase: string; // 'created' | 'quoted' | 'signed' | 'finished'
    lastPhaseChangeTime: string;
    phaseTimeout: string; // "0" | "1"
    createTime: string;
    projectSource?: string; // "self" | "referred"
    timelineList?: BackendTimelineItem[];
}

interface ApiResponse {
    code: number;
    msg: string;
    data: {
        partyInfo: any;
        projectList: BackendProject[];
    };
}

// 前端 UI 展示结构
interface UIProject {
  id: string; 
  statusDesc: string; 
  tagColor: string; 
  name: string;
  material: string; 
  createDate: string; 
  commission: string; 
  progress: number;
  timeline: TimelineItem[];
  themeColor: string;
  sourceText: string;
  sourceClass: string;
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
    noActivity: "No recent activity",
    sourceSelf: "MINE",
    sourceReferred: "REFERRAL"
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
    noActivity: "暂无最新动态",
    sourceSelf: "个人",
    sourceReferred: "推荐"
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
    // initData moved to onShow for auto-refresh
  },

  onShow() {
    this.initData(); // Auto-refresh data every time page shows

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

  async initData() {
    this.setData({ loading: true });

    try {
      const res = await request<ApiResponse>({
        url: '/app/parties/customer-projects',
        method: 'GET'
      });
      console.log('>>> [API DEBUG] Raw Response:', res);

      if (res && res.data && res.data.projectList) {
          const uiProjects = res.data.projectList.map((item, index) => this.mapBackendToUI(item, index));
          
          this.setData({ 
              projectsData: uiProjects,
              activeId: uiProjects[0]?.id || '',
              activeThemeColor: uiProjects[0]?.tagColor || '#000',
              loading: false 
          }, () => {
              this.updateTimeline();
          });
      } else {
          this.setData({ loading: false, projectsData: [], displayTimeline: [] });
      }

    } catch (error) {
      console.error('>>> [API DEBUG] Fetch Projects Error:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 数据适配器：将后台数据转换为 UI 格式
   */
  mapBackendToUI(item: BackendProject, index: number): UIProject {
      // 1. 状态映射 (API -> UI)
      const phaseMap: Record<string, string> = {
          'created': '已创建',
          'quoted': '已报价',
          'signed': '已签合同',
          'finished': '已完成'
      };
      const statusDesc = phaseMap[item.projectPhase] || item.projectPhase;

      // 2. 进度映射
      const progressMap: Record<string, number> = {
          'created': 10,
          'quoted': 35,
          'signed': 70,
          'finished': 100
      };
      
      // 3. 颜色映射
      const colorMap: Record<string, string> = {
          'created': '#71717A', // Zinc-500
          'quoted': '#5E6AD2',  // Linear Purple
          'signed': '#0070F3',  // Vercel Blue
          'finished': '#10B981' // Emerald-500
      };

      let color = colorMap[item.projectPhase] || '#000';
      
      // 4. 超时处理 (API: "1" = 超时)
      if (item.phaseTimeout === '1') {
          color = '#E5484D'; // Red
      }

      // 5. 佣金计算 (报价 * 比例)
      let commissionVal = '0.00';
      try {
          const price = parseFloat(item.quotedPrice || '0');
          const rate = parseFloat(item.rebateCommissionRate || '0');
          if (!isNaN(price) && !isNaN(rate)) {
              commissionVal = (price * rate).toFixed(2);
          }
      } catch (e) {
          console.error('Commission calc error', e);
      }

      // 6. 材料处理
      const materialStr = (item.stoneTypeList && item.stoneTypeList.length > 0) 
          ? item.stoneTypeList.join(' / ') 
          : '暂无材料信息';

      // 7. 项目来源处理
      const isSelf = item.projectSource === 'self';
      const sourceText = isSelf ? this.data.text.sourceSelf : this.data.text.sourceReferred;
      const sourceClass = isSelf ? 'source-self' : 'source-referred';

      // 8. 项目级 Timeline 处理
      const timeline: TimelineItem[] = (item.timelineList || []).map(tl => {
          const safeTime = tl.eventTime ? tl.eventTime.replace(/-/g, '/') : '';
          const date = safeTime ? new Date(safeTime) : new Date();
          const mm = (date.getMonth() + 1).toString().padStart(2, '0');
          const dd = date.getDate().toString().padStart(2, '0');
          const hh = date.getHours().toString().padStart(2, '0');
          const min = date.getMinutes().toString().padStart(2, '0');

          return {
              t: `${hh}:${min}`,
              d: `${mm}-${dd}`,
              title: tl.newValue || '状态变更',
              status: 'Done',
              info: tl.description || tl.newValue || '',
              ts: date.getTime()
          };
      });

      return {
          id: item.id || `p${index}`, 
          name: item.projectName || '未命名项目',
          statusDesc: statusDesc,
          tagColor: color,
          themeColor: color,
          material: materialStr,
          createDate: item.createTime ? item.createTime.split(' ')[0] : '', // 提取 YYYY-MM-DD
          commission: commissionVal,
          progress: progressMap[item.projectPhase] || 0,
          timeline: timeline,
          sourceText: sourceText,
          sourceClass: sourceClass
      };
  },

  // 更新详情列表逻辑
  updateTimeline() {
    const activeId = this.data.activeId;
    const isDescending = this.data.isDescending;
    const projectsData = this.data.projectsData;
    
    if (!projectsData || projectsData.length === 0) return;
    
    // 从当前选中的项目中提取其专属 Timeline
    const project = projectsData.find(p => p.id === activeId);

    if (project && project.timeline) {
      let sorted = project.timeline.slice(); 
      sorted.sort((a, b) => isDescending ? b.ts - a.ts : a.ts - b.ts);
      this.setData({ displayTimeline: sorted });
    } else {
      this.setData({ displayTimeline: [] });
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
