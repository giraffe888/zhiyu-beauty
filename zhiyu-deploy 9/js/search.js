/* 知予 · 全站搜索（覆盖项目 / 产品 / 政策 / 文章） */
(function () {
  "use strict";

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 数据源（统一走 zhiyuData，后台改动即刻生效） ---------- */
  function loadAll() {
    const d = window.zhiyuData || {};
    const projects = (d.projects && d.projects()) || { projects: [] };
    const products = (d.products && d.products()) || { products: [] };
    const policies = (d.policies && d.policies()) || { policies: [] };
    const insights = (d.insights && d.insights()) || { articles: [] };

    const items = [];

    (projects.projects || []).forEach((p) => items.push({
      type: "项目库", typeKey: "projects", icon: "💉",
      title: p.name, subtitle: (p.aliases || []).join(" · "),
      desc: p.summary || "", url: "projects.html?id=" + encodeURIComponent(p.id),
      tags: [p.category].concat(p.hotIn || []),
      haystack: [p.name, (p.aliases || []).join(" "), p.summary, p.principle, p.procedure,
                 (p.effects || []).join(" "), (p.brands || []).join(" "), p.category,
                 (p.hotIn || []).join(" "), p.priceCn, p.priceKr, (p.risks || []).join(" ")].join(" "),
      titleText: p.name,
    }));

    (products.products || []).forEach((p) => items.push({
      type: "产品与设备", typeKey: "products", icon: "🧪",
      title: p.name, subtitle: [p.enName, p.manufacturer].filter(Boolean).join(" · "),
      desc: p.features || "", url: "products.html?q=" + encodeURIComponent(p.name),
      tags: [p.category, p.origin].filter(Boolean),
      haystack: [p.name, p.enName, p.manufacturer, p.origin, p.category,
                 (p.indications || []).join(" "), p.features, p.approvalCn, p.approvalKr,
                 p.priceBand, p.note].join(" "),
      titleText: p.name,
    }));

    (policies.policies || []).forEach((p) => items.push({
      type: "政策法规", typeKey: "policies", icon: "📜",
      title: p.title, subtitle: [p.region, p.category].filter(Boolean).join(" · "),
      desc: p.summary || "", url: "policy.html?q=" + encodeURIComponent(p.title),
      tags: [p.region, p.category].filter(Boolean),
      haystack: [p.title, p.summary, p.region, p.category, (p.keyPoints || []).join(" "),
                 p.impact, (p.practicalTips || []).join(" ")].join(" "),
      titleText: p.title,
    }));

    (insights.articles || []).forEach((a) => items.push({
      type: "趋势洞察", typeKey: "insights", icon: "📈",
      title: a.title, subtitle: a.subtitle || "",
      desc: a.summary || "", url: "article.html?id=" + encodeURIComponent(a.id),
      tags: [a.category].concat(a.tags || []),
      haystack: [a.title, a.subtitle, a.summary, a.category, (a.tags || []).join(" "),
                 (a.content || []).map((b) => b.text || (b.items || []).join(" ")).join(" ")].join(" "),
      titleText: a.title,
    }));

    return items;
  }

  const ALL = loadAll();

  /* ---------- 搜索 ---------- */
  function search(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    const results = [];
    for (const it of ALL) {
      const hay = it.haystack.toLowerCase();
      const titleHay = it.titleText.toLowerCase();
      let score = 0, matched = true;
      for (const t of terms) {
        if (hay.indexOf(t) === -1) { matched = false; break; }
        score += 1;
        if (titleHay.indexOf(t) !== -1) score += 3;   // 标题命中权重更高
      }
      if (matched) results.push({ item: it, score });
    }
    return results.sort((a, b) => b.score - a.score).map((r) => r.item);
  }

  /* ---------- 高亮 ---------- */
  function highlight(text, query) {
    const raw = String(text || "");
    const q = String(query || "").trim();
    if (!q) return esc(raw);
    const terms = q.split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!terms.length) return esc(raw);
    const re = new RegExp("(" + terms.join("|") + ")", "gi");
    return esc(raw).replace(re, '<mark class="hl">$1</mark>');
  }

  /* ---------- 渲染 ---------- */
  function render(query) {
    const box = document.getElementById("searchResults");
    const q = String(query || "").trim();
    if (!q) {
      box.innerHTML = `
        <section class="section-block">
          <h2 class="section-title">搜索说明</h2>
          <p class="fs-13 text-sub">输入关键词即可同时搜索四类内容：</p>
          <ul class="roadmap-list" style="margin-top:10px">
            <li class="rule"><b>项目库</b><span class="rd-note">项目名称、别名、原理、效果、品牌、价格</span></li>
            <li class="rule"><b>产品与设备</b><span class="rd-note">产品名、厂商、产地、适应症、注册状态</span></li>
            <li class="rule"><b>政策法规</b><span class="rd-note">政策标题、要点、实务影响</span></li>
            <li class="rule"><b>趋势洞察</b><span class="rd-note">文章标题、摘要、正文内容</span></li>
          </ul>
        </section>`;
      return;
    }

    const results = search(q);
    if (!results.length) {
      box.innerHTML = `
        <section class="section-block">
          <div class="building" style="padding:50px 20px;border:none;background:transparent">
            <div class="building-icon">🔍</div>
            <h3>没有找到与「${esc(q)}」相关的内容</h3>
            <p>试试更短的关键词，比如只输入项目名或品类</p>
          </div>
        </section>`;
      return;
    }

    // 按类型分组
    const groups = {};
    results.forEach((it) => { (groups[it.type] = groups[it.type] || []).push(it); });
    const order = ["项目库", "产品与设备", "政策法规", "趋势洞察"];

    let html = `<section class="section-block">
      <h2 class="section-title">搜索结果</h2>
      <p class="fs-13 text-sub">「<b>${esc(q)}</b>」共找到 <b style="color:var(--brand)">${results.length}</b> 条结果</p>
    </section>`;

    order.forEach((type) => {
      const list = groups[type];
      if (!list || !list.length) return;
      const icon = list[0].icon;
      html += `<section class="section-block">
        <h2 class="section-title">${icon} ${esc(type)}<span class="more">${list.length} 条</span></h2>
        <div class="search-result-list">
          ${list.map((it) => `
            <a class="search-result" href="${esc(it.url)}">
              <div class="sr-title">${highlight(it.title, q)}</div>
              ${it.subtitle ? `<div class="sr-sub">${highlight(it.subtitle, q)}</div>` : ""}
              ${it.desc ? `<div class="sr-desc">${highlight(it.desc, q)}</div>` : ""}
              <div class="sr-tags">${(it.tags || []).filter(Boolean).map((t) => `<span class="tag tag-line">${esc(t)}</span>`).join("")}</div>
            </a>`).join("")}
        </div>
      </section>`;
    });

    box.innerHTML = html;
  }

  /* ---------- 事件 ---------- */
  const input = document.getElementById("globalSearch");
  let timer = null;

  function doSearch(value, updateUrl) {
    const q = value.trim();
    if (updateUrl) {
      const url = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
      history.replaceState(null, "", url);
    }
    render(q);
  }

  input.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => doSearch(e.target.value, true), 240);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { clearTimeout(timer); doSearch(e.target.value, true); }
  });
  document.getElementById("searchBtn").addEventListener("click", () => doSearch(input.value, true));
  document.querySelectorAll(".hint-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.q;
      doSearch(btn.dataset.q, true);
    });
  });

  /* ---------- 初始化（支持 ?q= 直接搜索） ---------- */
  const initial = new URLSearchParams(location.search).get("q") || "";
  if (initial) {
    input.value = initial;
    render(initial);
  } else {
    render("");
  }
})();
