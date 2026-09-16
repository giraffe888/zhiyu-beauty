/* 知予 · 政策法规库 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.policies();
  if (!DATA) return;
  const list = DATA.policies || [];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* 按当前语言取字段（英文模式优先使用 en 字段） */
  const pick = (obj, field) => {
    const isEn = window.zhiyuI18n && window.zhiyuI18n.isEnglish;
    if (isEn && obj && obj.en && obj.en[field]) return obj.en[field];
    return obj ? obj[field] : "";
  };

  const state = { region: "全部", category: "全部", keyword: "" };

  document.getElementById("totalCount").textContent = DATA.total;
  document.getElementById("dataVersion").textContent = "v" + DATA.version;
  document.getElementById("dataPolicy").textContent = DATA.dataPolicy || "";

  /* ---------- 指标 ---------- */
  const cnCount = list.filter((p) => p.region === "中国").length;
  const krCount = list.filter((p) => p.region === "韩国").length;
  const catCount = DATA.categories.length - 1;
  document.getElementById("metricGrid").innerHTML = [
    { label: "收录政策条目", value: DATA.total, unit: "条", sub: `覆盖 ${catCount} 个合规领域` },
    { label: "中国监管", value: cnCount, unit: "条", sub: "中国大陆监管框架" },
    { label: "韩国监管", value: krCount, unit: "条", sub: "韩国监管框架", accent: true },
    { label: "对比领域", value: catCount, unit: "个", sub: "支持中韩横向对照", accent: true },
  ].map((m) => `
    <div class="metric${m.accent ? " accent" : ""}">
      <div class="metric-label">${esc(m.label)}</div>
      <div class="metric-value">${esc(m.value)}<span class="unit">${esc(m.unit)}</span></div>
      <div class="metric-sub">${esc(m.sub)}</div>
    </div>`).join("");

  /* ---------- 筛选 ---------- */
  function renderChips() {
    document.getElementById("regionChips").innerHTML = (DATA.regions || []).map((r) =>
      `<span class="chip${state.region === r ? " active" : ""}" data-region="${esc(r)}">${r === "中国" ? "🇨🇳 " : r === "韩国" ? "🇰🇷 " : ""}${esc(r)}</span>`).join("");
    document.getElementById("categoryChips").innerHTML = (DATA.categories || []).map((c) =>
      `<span class="chip${state.category === c ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}</span>`).join("");
  }
  function filtered() {
    const kw = state.keyword.trim().toLowerCase();
    return list.filter((p) => {
      if (state.region !== "全部" && p.region !== state.region) return false;
      if (state.category !== "全部" && p.category !== state.category) return false;
      if (kw) {
        const hay = [p.title, p.summary, p.category, p.region, (p.keyPoints || []).join(" "), p.impact || ""].join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }

  function render() {
    const rows = filtered();
    document.getElementById("resultCount").textContent = `共 ${rows.length} 条`;
    document.getElementById("emptyState").hidden = rows.length !== 0;
    document.getElementById("policyList").innerHTML = rows.map((p) => `
      <article class="policy-card" data-id="${esc(p.id)}">
        <div class="flex items-center gap-8" style="flex-wrap:wrap;margin-bottom:8px">
          <span class="tag ${p.region === "韩国" ? "tag-accent" : ""}">${p.region === "中国" ? "🇨🇳 中国" : "🇰🇷 韩国"}</span>
          <span class="tag tag-line">${esc(p.category)}</span>
        </div>
        <div class="policy-title">${esc(pick(p, "title"))}</div>
        <div class="policy-summary">${esc(pick(p, "summary"))}</div>
        <div class="policy-foot">
          <span class="text-light fs-12">${(p.keyPoints || []).length} 个要点</span>
          <span class="fs-12" style="color:var(--brand);font-weight:600">查看详情 →</span>
        </div>
      </article>`).join("");
  }

  /* ---------- 详情 ---------- */
  function openDetail(id) {
    const p = list.find((x) => x.id === id);
    if (!p) return;
    document.getElementById("detailContent").innerHTML = `
      <div style="padding-right:34px;margin-bottom:14px">
        <div class="flex gap-8" style="flex-wrap:wrap;margin-bottom:8px">
          <span class="tag ${p.region === "韩国" ? "tag-accent" : ""}">${p.region === "中国" ? "🇨🇳 中国" : "🇰🇷 韩国"}</span>
          <span class="tag tag-line">${esc(p.category)}</span>
        </div>
        <div class="detail-title" style="font-size:19px">${esc(pick(p, "title"))}</div>
      </div>

      <div class="card" style="background:var(--brand-lighter);border:none;padding:13px 15px;margin-bottom:16px">
        <span class="fs-13" style="color:#295A68">${esc(pick(p, "summary"))}</span>
      </div>

      <div class="detail-block"><h4>📌 核心要点</h4>
        <ul>${(p.keyPoints || []).map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
      </div>

      <div class="detail-block"><h4>💼 实务影响</h4><p>${esc(p.impact || "")}</p></div>

      ${(p.practicalTips || []).length ? `<div class="detail-block"><h4>✅ 建议动作</h4>
        <ul>${p.practicalTips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>` : ""}

      <div class="notice"><span>⚠️</span><div>${esc(DATA.dataPolicy || "")}</div></div>`;
    document.getElementById("detailMask").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDetail() {
    document.getElementById("detailMask").classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---------- 中韩对比（按类别并列） ---------- */
  const cats = (DATA.categories || []).filter((c) => c !== "全部");
  document.getElementById("compareBox").innerHTML = cats.map((c) => {
    const cn = list.filter((p) => p.region === "中国" && p.category === c);
    const kr = list.filter((p) => p.region === "韩国" && p.category === c);
    if (!cn.length && !kr.length) return "";
    const cell = (arr, flag, label, color) => `
      <div class="compare-cell" style="border-left:3px solid ${color}">
        <div class="compare-head">${flag} ${label}</div>
        ${arr.length
          ? arr.map((p) => `<div class="compare-item" data-id="${esc(p.id)}">${esc(pick(p, "title"))}</div>`).join("")
          : '<div class="text-light fs-12" style="padding:6px 0">暂无收录条目</div>'}
      </div>`;
    return `<div class="compare-row">
        <div class="compare-cat">${esc(c)}</div>
        <div class="compare-grid">
          ${cell(cn, "🇨🇳", "中国", "var(--brand)")}
          ${cell(kr, "🇰🇷", "韩国", "var(--accent)")}
        </div>
      </div>`;
  }).join("");

  document.getElementById("compareBox").addEventListener("click", (e) => {
    const item = e.target.closest("[data-id]");
    if (item) openDetail(item.dataset.id);
  });

  /* ---------- 事件 ---------- */
  document.getElementById("regionChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.region = c.dataset.region; renderChips(); render();
  });
  document.getElementById("categoryChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.category = c.dataset.cat; renderChips(); render();
  });
  let timer = null;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.keyword = e.target.value; render(); }, 180);
  });
  document.getElementById("policyList").addEventListener("click", (e) => {
    const card = e.target.closest(".policy-card");
    if (card) openDetail(card.dataset.id);
  });
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  document.getElementById("detailMask").addEventListener("click", (e) => { if (e.target.id === "detailMask") closeDetail(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });

  renderChips();
  render();

  // 支持 ?q=xxx 直接搜索（从全站搜索结果跳转而来）
  const initialQ2 = new URLSearchParams(location.search).get("q");
  if (initialQ2) {
    document.getElementById("searchInput").value = initialQ2;
    state.keyword = initialQ2;
    render();
  }
})();
