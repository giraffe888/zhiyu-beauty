/* 知予 · 统一数据源（优先读取后台保存的数据，回退到内嵌数据）
 * 后台在 localStorage 中保存的数据会优先于打包时的内嵌数据，
 * 因此管理员在后台修改后，前台刷新即可看到最新内容。 */
(function () {
  "use strict";

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {
      console.warn("本地数据读取失败，已回退到内嵌数据", e);
    }
    return fallback;
  }

  window.zhiyuData = {
    projects: function () { return load("zhiyu_admin_projects", window.__ZHIYU_DATA__ || window.__MEDBEAUTY_DATA__); },
    products: function () { return load("zhiyu_admin_products", window.__ZHIYU_PRODUCTS__); },
    policies: function () { return load("zhiyu_admin_policies", window.__ZHIYU_POLICIES__); },
    insights: function () { return load("zhiyu_admin_insights", window.__ZHIYU_INSIGHTS__); },
  };
})();
