/* 知予 · 洞察列表页 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.insights();
  if (!DATA) return;
  const arts = DATA.articles || [];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* 按当前语言取字段（英文模式优先使用 en 字段） */
  const pick = (obj, field) => {
    const isEn = window.zhiyuI18n && window.zhiyuI18n.isEnglish;
    if (isEn && obj && obj.en && obj.en[field]) return obj.en[field];
    return obj ? obj[field] : "";
  };

  const state = { category: "全部", keyword: "" };

  document.getElementById("totalCount").textContent = DATA.total;

  /* 精选 */
  const featured = arts.filter((a) => a.featured);
  document.getElementById("featuredBox").innerHTML = `
    <h2 class="section-title" style="margin-top:0">⭐ 精选</h2>
    <div class="featured-grid">
      ${featured.map((a) => `
        <a class="featured-card" href="article.html?id=${encodeURIComponent(a.id)}">
          <div class="featured-cat">${esc(a.category)}</div>
          <div class="featured-title">${esc(pick(a, "title"))}</div>
          <div class="featured-sub">${esc(a.subtitle || "")}</div>
          <div class="featured-meta">${esc(a.author)} · ${esc(a.publishedAt)} · ${esc(a.readingTime)}</div>
        </a>`).join("")}
    </div>`;

  /* 列表 */
  function renderChips() {
    document.getElementById("categoryChips").innerHTML = (DATA.categories || []).map((c) =>
      `<span class="chip${state.category === c ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}</span>`).join("");
  }
  function filtered() {
    const kw = state.keyword.trim().toLowerCase();
    return arts.filter((a) => {
      if (state.category !== "全部" && a.category !== state.category) return false;
      if (kw) {
        const hay = [a.title, a.subtitle, a.summary, a.category, (a.tags || []).join(" ")].join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }
  function render() {
    const rows = filtered();
    document.getElementById("resultCount").textContent = `共 ${rows.length} 篇`;
    document.getElementById("articleGrid").innerHTML = rows.length ? rows.map((a) => `
      <a class="article-card" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="flex items-center gap-8" style="flex-wrap:wrap;margin-bottom:9px">
          <span class="tag">${esc(a.category)}</span>
          ${(a.tags || []).slice(0, 2).map((t) => `<span class="tag tag-line">${esc(t)}</span>`).join("")}
        </div>
        <div class="article-title">${esc(pick(a, "title"))}</div>
        <div class="article-summary">${esc(pick(a, "summary"))}</div>
        <div class="article-meta">${esc(a.author)} · ${esc(a.publishedAt)} · ${esc(a.readingTime)}</div>
      </a>`).join("") : '<p class="text-sub" style="padding:30px 0;text-align:center">没有找到匹配的文章</p>';
  }

  document.getElementById("categoryChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.category = c.dataset.cat; renderChips(); render();
  });
  let timer = null;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.keyword = e.target.value; render(); }, 180);
  });

  renderChips();
  render();
})();
