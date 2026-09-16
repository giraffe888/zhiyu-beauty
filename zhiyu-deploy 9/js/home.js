/* 知予 · 首页仪表盘 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.projects();
  if (!DATA) return;
  const projects = DATA.projects || [];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


  /* 按当前语言取字段（英文模式优先使用 en 字段） */
  const pick = (obj, field) => {
    const isEn = window.zhiyuI18n && window.zhiyuI18n.isEnglish;
    if (isEn && obj && obj.en && obj.en[field]) return obj.en[field];
    return obj ? obj[field] : "";
  };

  /* ---------- 核心指标 ---------- */
  const koreaCount = projects.filter((p) => (p.hotIn || []).includes("韩国")).length;
  const cnCount = projects.filter((p) => (p.hotIn || []).includes("中国")).length;
  const injectCount = projects.filter((p) => p.category === "注射类").length;
  const deviceCount = projects.filter((p) => p.category === "光电类").length;

  const metrics = [
    { label: "收录医美项目", value: DATA.total, unit: "个", sub: `数据版本 v${DATA.version}`, accent: false },
    { label: "覆盖项目分类", value: (DATA.categories || []).length - 1, unit: "类", sub: "注射 / 光电 / 皮肤管理 / 手术", accent: false },
    { label: "韩国市场热门", value: koreaCount, unit: "个", sub: "韩国皮肤科与整形外科常见项目", accent: true },
    { label: "中国市场热门", value: cnCount, unit: "个", sub: "国内平台高关注度项目", accent: true },
  ];
  document.getElementById("metricGrid").innerHTML = metrics.map((m) => `
    <div class="metric${m.accent ? " accent" : ""}">
      <div class="metric-label">${esc(m.label)}</div>
      <div class="metric-value">${esc(m.value)}<span class="unit">${esc(m.unit)}</span></div>
      <div class="metric-sub">${esc(m.sub)}</div>
    </div>`).join("");

  /* ---------- 热门项目 Top 6 ---------- */
  const hot = projects
    .slice()
    .sort((a, b) => ((b.industry && b.industry.heatScore) || 0) - ((a.industry && a.industry.heatScore) || 0))
    .slice(0, 6);

  document.getElementById("hotProjects").innerHTML = hot.map((p) => {
    const heat = (p.industry && p.industry.heatScore) || 60;
    return `
      <article class="p-card" data-id="${esc(p.id)}">
        ${p.image ? `<img class="p-card-img" src="${esc(/^https?:\/\//i.test(p.image) || p.image.indexOf("/") === 0 ? p.image : "images/" + p.image)}" alt="${esc(pick(p, "name"))}" loading="lazy" onerror="this.style.display='none'">` : ""}
        <div class="p-card-body">
          <div class="p-card-name">${esc(pick(p, "name"))}</div>
          <div class="p-card-alias">${esc((p.aliases || []).slice(0, 3).join(" · "))}</div>
          <div class="p-card-summary">${esc(pick(p, "summary"))}</div>
          <div class="p-card-foot">
            <span class="tag">${esc(p.category)}</span>
            ${(p.hotIn || []).map((r) => `<span class="tag tag-line">${esc(r)}</span>`).join("")}
            <span class="heat-bar" title="平台关注度指数">
              <span class="heat-track"><span class="heat-fill" style="width:${heat}%"></span></span>${heat}
            </span>
          </div>
        </div>
      </article>`;
  }).join("");

  document.getElementById("hotProjects").addEventListener("click", (e) => {
    const card = e.target.closest(".p-card");
    if (card) location.href = "projects.html?id=" + encodeURIComponent(card.dataset.id);
  });

  /* ---------- 分类分布 ---------- */
  const cats = (DATA.categories || []).filter((c) => c !== "全部");
  const dist = cats.map((c) => {
    const n = projects.filter((p) => p.category === c).length;
    const pct = Math.round((n / projects.length) * 100);
    return `<div style="margin-bottom:12px">
        <div class="flex justify-between fs-13" style="margin-bottom:5px">
          <span>${esc(c)}</span><span class="text-sub">${n} 个 · ${pct}%</span>
        </div>
        <div style="height:7px;background:var(--border);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--brand-light),var(--accent));border-radius:4px"></div>
        </div>
      </div>`;
  }).join("");
  document.getElementById("categoryDist").innerHTML = dist +
    `<p class="text-light fs-12 mt-8">注射类 ${injectCount} 个 · 光电类 ${deviceCount} 个 · 合计 ${projects.length} 个</p>`;

  /* ---------- 价格速览（取关注度最高的 5 个） ---------- */
  document.getElementById("priceOverview").innerHTML = hot.slice(0, 5).map((p) => `
    <div class="flex justify-between items-center" style="padding:9px 0;border-bottom:1px solid var(--border)">
      <span class="fs-13">${esc(pick(p, "name"))}</span>
      <span class="fs-12 text-sub" style="text-align:right">
        🇨🇳 ${esc((p.priceCn || "").replace("参考价：约 ", ""))}<br>
        🇰🇷 ${esc((p.priceKr || "").replace("参考价：约 ", ""))}
      </span>
    </div>`).join("") +
    `<p class="text-light fs-12 mt-8">价格为公开渠道参考区间，机构、城市、品牌差异较大，仅供行业参考。</p>`;

  /* ---------- 最新洞察 ---------- */
  const INS = window.zhiyuData.insights();
  const insBox = document.getElementById("latestInsights");
  if (insBox && INS && INS.articles) {
    insBox.innerHTML = INS.articles.slice(0, 4).map((a) => `
      <a class="article-card" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="flex items-center gap-8" style="flex-wrap:wrap;margin-bottom:9px">
          <span class="tag">${esc(a.category)}</span>
        </div>
        <div class="article-title" style="font-size:16px">${esc(pick(a, "title"))}</div>
        <div class="article-summary">${esc(pick(a, "summary"))}</div>
        <div class="article-meta">${esc(a.author)} · ${esc(a.publishedAt)} · ${esc(a.readingTime)}</div>
      </a>`).join("");
  }

  /* ---------- 更新日志 ---------- */
  const logs = [
    { date: "2026-09-10", text: "第二期上线：产品与设备库、政策法规库、趋势洞察内容体系" },
    { date: "2026-09-10", text: "平台升级为「知予 · 中韩医美产业信息平台」，重构信息架构与品牌视觉" },
    { date: "2026-09-10", text: "项目库升级为行业版：新增关注度指数、技术来源、监管提示与数据说明" },
    { date: "2026-09-10", text: "数据版本更新至 v2.0.0（19 个项目，覆盖注射 / 光电 / 皮肤管理 / 手术四类）" },
  ];
  document.getElementById("changelog").innerHTML = logs.map((l) => `
    <div class="flex gap-12" style="padding:9px 0;border-bottom:1px solid var(--border)">
      <span class="tag tag-line" style="flex-shrink:0">${esc(l.date)}</span>
      <span class="fs-13">${esc(l.text)}</span>
    </div>`).join("");
})();
