/* 知予 · 中英文切换（界面文案双语）
 * 实现方式：文本映射 —— 自动匹配页面中的中文文案并替换为英文，
 * 切换回中文时恢复原文，无需修改各页面 HTML。
 * 动态渲染的内容通过 MutationObserver 自动翻译。 */
(function () {
  "use strict";

  const LANG_KEY = "zhiyu_lang";

  /* ============ 词典（中文 → 英文） ============ */
  const DICT = {
    /* 品牌与导航 */
    "知予": "Zhiyu",
    "中韩医美产业信息平台": "China-Korea Aesthetics Intelligence",
    "首页": "Home",
    "行情": "Market",
    "项目库": "Projects",
    "产品库": "Products",
    "政策": "Policy",
    "洞察": "Insights",
    "资源": "Resources",
    "交流": "Community",
    "工具": "Tools",

    /* 页脚 */
    "关于我们": "About Us",
    "平台介绍": "About",
    "商务合作": "Partnership",
    "内容管理": "Admin",
    "信息频道": "Channels",
    "产业服务": "Services",
    "小红书": "Xiaohongshu",
    "复制": "Copy",
    "已复制": "Copied",
    "中韩医美产业信息平台 · ZHIYU": "China-Korea Aesthetics Intelligence · ZHIYU",

    /* 首页区块标题 */
    "平台数据概览": "Platform Overview",
    "关注度最高的项目": "Most Watched Projects",
    "项目分类分布": "Category Distribution",
    "中韩参考价格速览": "Price Overview (CN / KR)",
    "最新洞察": "Latest Insights",
    "数据说明": "Data Notes",
    "平台更新日志": "Changelog",
    "全部项目": "All Projects",
    "全部文章": "All Articles",

    /* 首页指标 */
    "收录医美项目": "Projects Indexed",
    "覆盖项目分类": "Categories",
    "韩国市场热门": "Popular in Korea",
    "中国市场热门": "Popular in China",
    "个": "",
    "类": "",
    "数据版本": "Data version",
    "韩国皮肤科与整形外科常见项目": "Common in Korean clinics",
    "国内平台高关注度项目": "High attention in China",
    "注射 / 光电 / 皮肤管理 / 手术": "Injectable / Energy / Skin / Surgery",

    /* 通用按钮与操作 */
    "登录": "Sign In",
    "注册": "Sign Up",
    "登 录": "Sign In",
    "注 册": "Sign Up",
    "退出登录": "Sign Out",
    "登录知予": "Sign in to Zhiyu",
    "注册知予": "Join Zhiyu",
    "邮箱": "Email",
    "密码（至少 6 位）": "Password (min 6 chars)",
    "还没有账号？注册一个": "No account? Sign up",
    "已有账号？去登录": "Have an account? Sign in",
    "登录后可收藏内容、订阅行业动态": "Sign in to save content and follow updates",
    "注册后即可收藏内容、参与行业交流": "Sign up to save content and join discussions",
    "🔍 检测云服务连接": "🔍 Check Connection",
    "检测中…": "Checking…",
    "浏览项目": "Browse Projects",
    "浏览产品": "Browse Products",
    "查看行情": "View Market",
    "查看详情": "View Details",
    "收藏": "Save",
    "搜索": "Search",

    /* 分类与筛选 */
    "全部": "All",
    "中国": "China",
    "韩国": "Korea",
    "注射类": "Injectable",
    "光电类": "Energy-based",
    "皮肤管理": "Skin Care",
    "手术类": "Surgery",
    "玻尿酸": "Hyaluronic Acid",
    "肉毒素": "Botulinum Toxin",
    "水光与再生": "Skin Boosters & Regenerative",
    "光电设备": "Energy Devices",
    "机构资质": "Facility License",
    "人员资质": "Practitioner License",
    "产品准入": "Product Approval",
    "广告合规": "Advertising Compliance",
    "药品管理": "Drug Regulation",
    "跨境相关": "Cross-border",
    "运营合规": "Operations",
    "市场分析": "Market Analysis",
    "技术趋势": "Technology Trends",
    "经营实务": "Business Practice",
    "合规观察": "Regulatory Watch",

    /* 页面标题 */
    "医美项目库": "Project Library",
    "产品与设备库": "Products & Devices",
    "政策合规": "Policy & Compliance",
    "趋势洞察": "Industry Insights",
    "市场行情": "Market Data",
    "会员中心": "My Account",
    "关于我们": "About Us",
    "商务合作": "Partnership",

    /* 区块标题（其他页面） */
    "项目关注度排行": "Attention Ranking",
    "分类结构": "Category Mix",
    "中韩市场覆盖": "CN-KR Coverage",
    "中韩项目价格对照表": "Price Comparison (CN / KR)",
    "行业级指标（数据接入中）": "Industry Metrics (in progress)",
    "按分类浏览": "Browse by Category",
    "产地分布": "Origin Distribution",
    "按地区与类别浏览": "Browse by Region & Topic",
    "中韩监管对比": "CN-KR Regulatory Comparison",
    "我们提供什么": "What We Offer",
    "服务对象": "Who We Serve",
    "联系我们": "Contact Us",
    "数据说明与免责声明": "Data Notes & Disclaimer",

    /* 详情与字段 */
    "技术原理": "Mechanism",
    "操作流程": "Procedure",
    "主要效果": "Effects",
    "适合人群": "Suitable For",
    "维持时间": "Duration",
    "恢复期": "Recovery",
    "风险提示": "Risks",
    "常见品牌": "Brands",
    "技术与产品来源": "Technology Origin",
    "监管提示": "Regulatory Notes",
    "参考价格": "Reference Price",
    "中国大陆": "Mainland China",
    "中国参考价": "CN Reference Price",
    "韩国参考价": "KR Reference Price",
    "主要适应症": "Indications",
    "产品特点": "Features",
    "厂商 / 品牌方": "Manufacturer",
    "主要市场": "Main Markets",
    "价格带": "Price Band",
    "注册信息与可验证来源": "Registration & Sources",
    "状态说明（原文）": "Status (Original)",
    "注册证号": "Registration No.",
    "批准日期": "Approval Date",
    "注册人 / 代理人": "Holder / Agent",
    "数据来源": "Source",
    "核实日期": "Verified On",
    "待官方核实后录入": "Pending verification",
    "未核实": "Not verified",
    "核心要点": "Key Points",
    "实务影响": "Practical Impact",
    "建议动作": "Recommended Actions",
    "中韩注册与流通状态": "CN / KR Status",

    /* 更新日志与路线图 */
    "更新日志": "Changelog",
    "更新日志与路线图": "Changelog & Roadmap",
    "进度总览": "Progress Overview",
    "品牌与架构升级": "Brand & Architecture",
    "数据与内容体系": "Data & Content",
    "资源与社区": "Resources & Community",
    "商业化与多端": "Monetization & Multi-platform",
    "已上线": "Live",
    "建设中": "In Progress",
    "规划中": "Planned",
    "已完成": "Completed",
    "待更新": "Upcoming",
    "参与共建": "Get Involved",
    "贯穿全程的合规要求": "Compliance Principles",
    "资源对接": "Resource Matching",
    "行业交流": "Industry Community",
    "数据工具": "Data Tools",
    "商业化": "Monetization",
    "多端与开放": "Multi-platform & Open",
    "高": "High",
    "中": "Mid",
    "低": "Low",
    "产品注册信息填充": "Fill in product registration data",
    "权威行业数据接入": "Connect authoritative industry data",
    "行情图表化": "Charts for market data",
    "数据看板": "Data dashboard",
    "会员内容分级": "Member content tiers",
    "内容英文翻译": "Content translation",
    "全文检索增强": "Full-text search",
    "机构黄页": "Facility directory",
    "企业认证体系": "Corporate verification",
    "供应商库": "Supplier database",
    "服务商库": "Service provider database",
    "需求发布与撮合": "Needs posting & matching",
    "人才板块": "Talent section",
    "内容审核机制": "Content moderation",
    "问答社区": "Q&A community",
    "案例分享": "Case sharing",
    "圈子功能": "Interest groups",
    "关注与私信": "Follow & messaging",
    "中韩价格对比计算器": "CN-KR price calculator",
    "市场测算器": "Market estimator",
    "项目匹配助手": "Treatment matching",
    "报告导出": "Report export",
    "会员付费体系": "Membership & payments",
    "报告订阅": "Report subscription",
    "企业展示服务": "Corporate showcase",
    "资源对接服务费": "Matching service fees",
    "定制数据服务": "Custom data services",
    "微信小程序": "WeChat Mini Program",
    "移动 App": "Mobile App",
    "数据 API": "Data API",
    "开放平台": "Open platform",

    /* 赴韩医美指南 */
    "赴韩医美指南": "Korea Medical Aesthetics Guide",
    "赴韩医美专题": "Korea Aesthetics Focus",
    "赴韩人数与消费数据": "Visitor & Spending Data",
    "税收政策动态": "Tax Policy Updates",
    "签证相关手续": "Visa Procedures",
    "官方数据来源与查询入口": "Official Sources & Portals",
    "数据采集原则：": "Data sourcing principle: ",
    "待核实后录入": "Pending verification",
    "该条目的具体规定待官方核实后录入": "This item will be documented after official verification",
    "官方来源：": "Official source: ",
    "前往官方网站 ↗": "Visit official site ↗",
    "前往查询 ↗": "Check official source ↗",
    "官方入口 ↗": "Official portal ↗",
    "重要提示": "Important Notice",

    /* 列表与统计 */
    "数据版本": "Data version",
    "收藏该项目": "Save",
    "已收藏": "Saved",
    "暂无收录条目": "Not yet available",
    "加载中…": "Loading…",
    "没有找到匹配的项目": "No matching projects",
    "没有找到匹配的产品": "No matching products",
    "没有找到匹配的政策条目": "No matching policies",
    "没有找到匹配的文章": "No matching articles",
    "换个关键词，或清空筛选条件试试": "Try another keyword or clear filters",
    "用户评论": "Comments",
    "发表": "Post",
    "分享你的经验或疑问（友善交流，最长 500 字）": "Share your experience (max 500 chars)",
    "还没有评论，来抢沙发～": "No comments yet — be the first!",
    "收藏排行": "Most Saved",
    "预约咨询": "Consultation",
  };

  let lang = localStorage.getItem(LANG_KEY) || "zh";
  let observer = null;

  const isSkippable = (node) => {
    const p = node.parentElement;
    if (!p) return true;
    const tag = p.tagName;
    return tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT";
  };

  /* 翻译单个文本节点的内容 */
  function translate(text) {
    const raw = text;
    const trimmed = text.trim();
    if (!trimmed) return raw;
    // 精确匹配
    if (DICT[trimmed] !== undefined) {
      return raw.replace(trimmed, DICT[trimmed]);
    }
    // 前缀/包含匹配（处理如 "数据版本 v2.2.0" 这类组合文本）
    for (const key of Object.keys(DICT)) {
      if (key.length > 1 && trimmed.indexOf(key) !== -1 && DICT[key]) {
        return raw.replace(key, DICT[key]);
      }
    }
    return raw;
  }

  /* 遍历并应用语言 */
  function apply(root) {
    const target = root || document.body;
    if (!target) return;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (isSkippable(node)) continue;
      // 首次处理时记录中文原文
      if (node.__zhText === undefined) node.__zhText = node.nodeValue;
      node.nodeValue = lang === "en" ? translate(node.__zhText) : node.__zhText;
    }
  }

  /* 动态内容自动翻译 */
  function startObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver((mutations) => {
      if (lang !== "en") return;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) apply(node);
          else if (node.nodeType === 3 && !isSkippable(node)) {
            if (node.__zhText === undefined) node.__zhText = node.nodeValue;
            node.nodeValue = translate(node.__zhText);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* 切换语言 */
  function toggle() {
    lang = lang === "zh" ? "en" : "zh";
    localStorage.setItem(LANG_KEY, lang);
    // 重新加载页面，确保界面文案与数据内容（名称/摘要）一并切换语言
    location.reload();
  }

  function updateButton() {
    const btn = document.getElementById("langBtn");
    if (!btn) return;
    btn.textContent = lang === "en" ? "中文" : "EN";
    btn.title = lang === "en" ? "切换到中文" : "Switch to English";
  }

  /* 初始化 */
  function init() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    if (lang === "en") apply(document.body);
    updateButton();
    startObserver();
  }

  window.zhiyuI18n = {
    get lang() { return lang; },
    get isEnglish() { return lang === "en"; },
    t(text) { return lang === "en" ? translate(text) : text; },
    apply,
    toggle,
    updateButton,
    dict: DICT,
  };

  // 延迟初始化，确保 layout.js 已完成导航注入（语言按钮存在）
  function boot() {
    init();
    // 若按钮尚未注入，200ms 后重试一次
    if (!document.getElementById("langBtn")) setTimeout(init, 200);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 60));
  } else {
    setTimeout(boot, 60);
  }
})();
