/**
 * 接口定义
 */
import { BackendProject, getCustomerProjects } from '../../api/parties';
import { getCurrentLang, getI18nText, LangType } from '../../utils/i18n';
import indexI18n from './i18n';

interface TimelineItem {
  t: string;
  d: string;
  title: string;
  status: string;
  info: string;
  ts: number;
}

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
  isTimeout: boolean;
}

const defaultLang: LangType = 'en';
const getText = (lang: LangType) => getI18nText(indexI18n, lang);
type IndexText = ReturnType<typeof getText>;

Page({
  data: {
    currentLang: defaultLang as LangType,
    text: getText(defaultLang) as IndexText,
    loading: true,
    activeId: '',
    currentSwiperIndex: 0,
    activeThemeColor: '#4DB6AC',
    isDescending: true,
    switchAnimation: false,
    displayTimeline: [] as TimelineItem[],
    projectsData: [] as UIProject[],
    skeletonCount: 5,
  },

  onLoad() {
    this.calcSkeletonCount();
  },

  onShow() {
    const currentLang = getCurrentLang();
    this.applyLanguage(currentLang);

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
      this.getTabBar().updateTabList(currentLang);
    }

    this.initData();
  },

  applyLanguage(lang: LangType) {
    this.setData({
      currentLang: lang,
      text: getText(lang),
    });
  },

  // 动态计算骨架屏数量
  calcSkeletonCount() {
    try {
      const { windowHeight, screenWidth } = wx.getSystemInfoSync();
      const pixelRatio = screenWidth / 750;
      const usedRpx = 556;
      const itemRpx = 144;
      const remainHeight = windowHeight - usedRpx * pixelRatio;

      if (remainHeight > 0) {
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
      const res = await getCustomerProjects();
      console.log('>>> [API DEBUG] Raw Response:', res);

      if (res?.data?.projectList) {
        const uiProjects = res.data.projectList.map((item, index) =>
          this.mapBackendToUI(item, index),
        );

        this.setData(
          {
            projectsData: uiProjects,
            activeId: uiProjects[0]?.id || '',
            activeThemeColor: uiProjects[0]?.tagColor || '#000',
            loading: false,
          },
          () => {
            this.updateTimeline();
          },
        );
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
    const text = this.data.text;
    const phaseMap: Record<string, string> = {
      created: text.phaseCreated,
      quoted: text.phaseQuoted,
      signed: text.phaseSigned,
      finished: text.phaseFinished,
    };
    const statusDesc = phaseMap[item.projectPhase] || item.projectPhase;

    let color = '#71717A';
    const progressValue = item.progress || 0;
    if (progressValue >= 100) {
      color = '#10B981';
    } else if (progressValue >= 60) {
      color = '#0070F3';
    } else if (progressValue >= 30) {
      color = '#5E6AD2';
    }

    const isTimeout = item.phaseTimeout === '0';
    let commissionVal = '0.00';
    try {
      const price = parseFloat(item.quotedPrice || '0');
      const rate = parseFloat(item.rebateCommissionRate || '0');
      if (!Number.isNaN(price) && !Number.isNaN(rate)) {
        commissionVal = (price * rate).toFixed(2);
      }
    } catch (e) {
      console.error('Commission calc error', e);
    }

    const material =
      item.stoneTypeList && item.stoneTypeList.length > 0
        ? item.stoneTypeList.join(' / ')
        : text.emptyMaterial;

    const isSelf = item.projectSource === 'self';
    const sourceText = isSelf ? text.sourceSelf : text.sourceReferred;
    const sourceClass = isSelf ? 'source-self' : 'source-referred';

    const timeline: TimelineItem[] = (item.timelineList || []).map((tl) => {
      const safeTime = tl.eventTime ? tl.eventTime.replace(/-/g, '/') : '';
      const date = safeTime ? new Date(safeTime) : new Date();
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');
      const hh = date.getHours().toString().padStart(2, '0');
      const min = date.getMinutes().toString().padStart(2, '0');

      return {
        t: `${hh}:${min}`,
        d: `${mm}-${dd}`,
        title: tl.newValue || text.statusChanged,
        status: 'Done',
        info: tl.description || tl.newValue || '',
        ts: date.getTime(),
      };
    });

    return {
      id: item.id || `p${index}`,
      name: item.projectName || text.unnamedProject,
      statusDesc,
      tagColor: color,
      themeColor: color,
      material,
      createDate: item.createTime ? item.createTime.substring(0, 16) : '',
      commission: commissionVal,
      progress: item.progress || 0,
      timeline,
      sourceText,
      sourceClass,
      isTimeout,
    };
  },

  // 更新详情列表逻辑
  updateTimeline() {
    const activeId = this.data.activeId;
    const isDescending = this.data.isDescending;
    const projectsData = this.data.projectsData;

    if (!projectsData || projectsData.length === 0) return;

    const project = projectsData.find((item) => item.id === activeId);

    if (project?.timeline) {
      const sorted = project.timeline.slice();
      sorted.sort((a, b) => (isDescending ? b.ts - a.ts : a.ts - b.ts));
      this.setData({ displayTimeline: sorted });
    } else {
      this.setData({ displayTimeline: [] });
    }
  },

  toggleSort() {
    this.setData({
      isDescending: !this.data.isDescending,
      switchAnimation: true,
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
        switchAnimation: true,
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
        switchAnimation: true,
      });
      this.updateTimeline();
      setTimeout(() => this.setData({ switchAnimation: false }), 500);
    }
  },

  async onPullDownRefresh() {
    this.initData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: this.data.text.refreshSuccess, icon: 'none' });
    }, 800);
  },
});
