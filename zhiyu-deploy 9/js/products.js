/* 知予 · 产品与设备库 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.products();
  if (!DATA) return;
  const products = DATA.products || [];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


  /* ---------- 注册状态辅助 ---------- */
  function regClass(status) {
    if (!status) return "pending";
    if (status.indexOf("已获批") === 0 || status.indexOf("已许可") === 0) return "ok";
    if (status.indexOf("已引进") === 0 || status.indexOf("已流通") === 0) return "info";
    return "pending";
  }
  function regBadge(flag, status) {
    if (!status) status = "待核实";
    return `<span class="reg-badge ${regClass(status)}">${flag} ${esc(status)}</span>`;
  }


  /* 按当前语言取字段（英文模式优先使用 en 字段） */
  const pick = (obj, field) => {
    const isEn = window.zhiyuI18n && window.zhiyuI18n.isEnglish;
    if (isEn && obj && obj.en && obj.en[field]) return obj.en[field];
    return obj ? obj[field] : "";
  };

  const CAT_ICON = {
    "玻尿酸": "💧",
    "肉毒素": "💉",
    "水光与再生": "✨",
    "光电设备": "⚡",
  };
  const state = { category: "全部", keyword: "" };

  document.getElementById("totalCount").textContent = DATA.total;
  document.getElementById("dataVersion").textContent = "v" + DATA.version;
  document.getElementById("dataPolicy").textContent = DATA.dataPolicy || "";

  /* ---------- 指标 ---------- */
  const origins = {};
  products.forEach((p) => {
    const o = (p.origin || "").split(" / ")[0];
    origins[o] = (origins[o] || 0) + 1;
  });
  const topOrigin = Object.keys(origins).sort((a, b) => origins[b] - origins[a])[0] || "-";
  const krCount = products.filter((p) => (p.hotIn || []).includes("韩国")).length;
  const cnCount = products.filter((p) => (p.hotIn || []).includes("中国")).length;

  document.getElementById("metricGrid").innerHTML = [
    { label: "收录产品与设备", value: DATA.total, unit: "个", sub: `覆盖 ${DATA.categories.length - 1} 个分类` },
    { label: "中国市场竞争", value: cnCount, unit: "个", sub: "在中国市场有流通的产品", accent: true },
    { label: "韩国市场竞争", value: krCount, unit: "个", sub: "在韩国市场有流通的产品", accent: true },
    { label: "主要来源地", value: topOrigin, unit: "", sub: `共 ${origins[topOrigin] || 0} 个产品` },
  ].map((m) => `
    <div class="metric${m.accent ? " accent" : ""}">
      <div class="metric-label">${esc(m.label)}</div>
      <div class="metric-value" style="${String(m.value).length > 5 ? "font-size:20px" : ""}">${esc(m.value)}<span class="unit">${esc(m.unit)}</span></div>
      <div class="metric-sub">${esc(m.sub)}</div>
    </div>`).join("");

  /* ---------- 筛选 ---------- */
  function renderChips() {
    document.getElementById("categoryChips").innerHTML = (DATA.categories || []).map((c) =>
      `<span class="chip${state.category === c ? " active" : ""}" data-cat="${esc(c)}">${c === "全部" ? c : (CAT_ICON[c] || "") + " " + esc(c)}</span>`).join("");
  }
  function filtered() {
    const kw = state.keyword.trim().toLowerCase();
    return products.filter((p) => {
      if (state.category !== "全部" && p.category !== state.category) return false;
      if (kw) {
        const hay = [p.name, p.enName, p.manufacturer, p.category, (p.indications || []).join(" "), (p.features || "")].join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  function render() {
    const list = filtered();
    document.getElementById("resultCount").textContent = `共 ${list.length} 个`;
    document.getElementById("emptyState").hidden = list.length !== 0;
    document.getElementById("productGrid").innerHTML = list.map((p) => `
      <article class="product-card" data-id="${esc(p.id)}">
        <div class="flex justify-between items-center" style="margin-bottom:10px">
          <span class="tag">${CAT_ICON[p.category] || ""} ${esc(p.category)}</span>
          <span class="tag tag-line">${esc((p.origin || "").split(" / ")[0])}</span>
        </div>
        <div class="product-name">${esc(pick(p, "name"))}</div>
        <div class="product-en">${esc(p.enName || "")}</div>
        <div class="product-mfr">${esc(p.manufacturer || "")}</div>
        <div class="product-tags">
          ${(p.indications || []).slice(0, 3).map((i) => `<span class="tag tag-line">${esc(i)}</span>`).join("")}
        </div>
        <div class="reg-row-mini">
          ${regBadge("🇨🇳", p.cnRegStatus)}
          ${regBadge("🇰🇷", p.krRegStatus)}
        </div>
        <div class="product-foot">
          <span class="text-light fs-12">价格带：${esc(p.priceBand || "-")}</span>
          <span class="fs-12" style="color:var(--brand);font-weight:600">查看详情 →</span>
        </div>
      </article>`).join("");
  }


  /* ---------- 注册信息卡片 ---------- */
  function regCard(country, status, number, date, holder, source, sourceUrl, verifiedAt, shortName) {
    const st = status || "待核实";
    return `
      <div class="reg-card">
        <div class="reg-card-head">${country} <span class="reg-badge ${regClass(st)}">${esc(st)}</span></div>
        <div class="reg-line"><span class="reg-k">注册证号</span>
          <span class="${number ? "reg-v" : "reg-empty"}">${number ? esc(number) : "待官方核实后录入"}</span></div>
        <div class="reg-line"><span class="reg-k">批准日期</span>
          <span class="${date ? "reg-v" : "reg-empty"}">${date ? esc(date) : "—"}</span></div>
        <div class="reg-line"><span class="reg-k">注册人 / 代理人</span>
          <span class="${holder ? "reg-v" : "reg-empty"}">${holder ? esc(holder) : "—"}</span></div>
        <div class="reg-line"><span class="reg-k">数据来源</span>
          <span class="reg-v" style="font-size:12px">${esc(source || "-")}</span></div>
        <div class="reg-line"><span class="reg-k">核实日期</span>
          <span class="${verifiedAt ? "reg-v" : "reg-empty"}">${verifiedAt ? esc(verifiedAt) : "未核实"}</span></div>
        ${sourceUrl ? `<a class="btn btn-sm reg-verify" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">去 ${esc(shortName)} 官方验证 ↗</a>` : ""}
      </div>`;
  }

  /* 注册信息渲染：详情为会员内容，官方验证入口保持公开 */
  function renderRegistration(p) {
    const mem = window.zhiyuMembership;
    const canSee = !mem || mem.canAccess(p.registrationTier || "free");
    if (canSee) {
      return `
        <div class="reg-grid">
          ${regCard("🇨🇳 中国", p.cnRegStatus, p.cnRegNumber, p.cnRegDate, p.cnRegHolder, p.cnRegSource, p.cnRegSourceUrl, p.cnVerifiedAt, "NMPA")}
          ${regCard("🇰🇷 韩国", p.krRegStatus, p.krRegNumber, p.krRegDate, p.krRegHolder, p.krRegSource, p.krRegSourceUrl, p.krVerifiedAt, "MFDS")}
        </div>
        <p class="text-light fs-12" style="margin-top:10px">
          注册信息以官方数据库为准。点击上方按钮可前往官方查询入口自行核验，未核实的编号平台留空处理。
        </p>`;
    }
    // 未登录：显示公开的注册状态 + 官方验证入口，详情加遮罩
    const publicPart = `
      <div class="reg-grid">
        <div class="reg-card">
          <div class="reg-card-head">🇨🇳 中国 <span class="reg-badge ${regClass(p.cnRegStatus)}">${esc(p.cnRegStatus || "待核实")}</span></div>
          <a class="btn btn-sm reg-verify" href="${esc(p.cnRegSourceUrl || "#")}" target="_blank" rel="noopener noreferrer">去 NMPA 官方验证 ↗</a>
        </div>
        <div class="reg-card">
          <div class="reg-card-head">🇰🇷 韩国 <span class="reg-badge ${regClass(p.krRegStatus)}">${esc(p.krRegStatus || "待核实")}</span></div>
          <a class="btn btn-sm reg-verify" href="${esc(p.krRegSourceUrl || "#")}" target="_blank" rel="noopener noreferrer">去 MFDS 官方验证 ↗</a>
        </div>
      </div>`;
    const gated = mem ? mem.gateHtml({
      title: "注册详情为会员内容",
      desc: "登录后可查看注册证号、批准日期与注册人（免费）",
      preview: `<div style="padding:16px">
        <div class="reg-line"><span class="reg-k">注册证号</span><span class="reg-v">国械注进20XXXXXXXX</span></div>
        <div class="reg-line"><span class="reg-k">批准日期</span><span class="reg-v">20XX-XX-XX</span></div>
        <div class="reg-line"><span class="reg-k">注册人 / 代理人</span><span class="reg-v">XXXX 公司</span></div>
      </div>`,
    }) : "";
    return publicPart + `<div style="margin-top:12px">${gated}</div>
      <p class="text-light fs-12" style="margin-top:10px">
        注册状态与官方验证入口对所有访客开放；注册证号等明细为会员内容。未核实的编号平台留空处理。
      </p>`;
  }

  /* ---------- 详情 ---------- */
  function openDetail(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    document.getElementById("detailContent").innerHTML = `
      <div class="detail-head">
        <div style="width:60px;height:60px;border-radius:14px;background:var(--brand-lighter);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">
          ${CAT_ICON[p.category] || "🧪"}
        </div>
        <div style="min-width:0">
          <div class="detail-title">${esc(pick(p, "name"))}</div>
          <div class="detail-sub">${esc(p.enName || "")}</div>
          <div class="mt-8 flex gap-8" style="flex-wrap:wrap">
            <span class="tag">${esc(p.category)}</span>
            <span class="tag tag-line">产地：${esc(p.origin || "-")}</span>
            <span class="tag tag-accent">价格带：${esc(p.priceBand || "-")}</span>
          </div>
        </div>
      </div>

      <div class="kv-grid" style="margin-bottom:16px">
        <div class="kv"><div class="kv-label">厂商 / 品牌方</div><div class="kv-value">${esc(p.manufacturer || "-")}</div></div>
        <div class="kv"><div class="kv-label">主要市场</div><div class="kv-value">${esc((p.hotIn || []).join(" · ") || "-")}</div></div>
      </div>

      <div class="detail-block"><h4>🎯 主要适应症</h4>
        <div class="flex gap-8" style="flex-wrap:wrap">
          ${(p.indications || []).map((i) => `<span class="tag tag-line">${esc(i)}</span>`).join("")}
        </div>
      </div>
      <div class="detail-block"><h4>📋 产品特点</h4><p>${esc((window.zhiyuI18n && window.zhiyuI18n.isEnglish && p.en && p.en.summary) || p.features || "")}</p></div>

      <div class="detail-block"><h4>📋 注册信息与可验证来源</h4>
        ${renderRegistration(p)}
      </div>

      <div class="detail-block"><h4>📝 状态说明（原文）</h4>
        <div class="kv-grid">
          <div class="kv"><div class="kv-label">🇨🇳 中国</div><div class="kv-value" style="font-weight:500;font-size:13px">${esc(p.approvalCn || "-")}</div></div>
          <div class="kv"><div class="kv-label">🇰🇷 韩国</div><div class="kv-value" style="font-weight:500;font-size:13px">${esc(p.approvalKr || "-")}</div></div>
        </div>
      </div>

      ${p.note ? `<div class="notice"><span>💡</span><div>${esc(p.note)}</div></div>` : ""}

      <p class="text-light fs-12 mt-16" style="border-top:1px dashed var(--border);padding-top:12px">
        ${esc(DATA.dataPolicy || "")}。本页信息不构成产品推荐或采购建议。
      </p>`;
    document.getElementById("detailMask").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDetail() {
    document.getElementById("detailMask").classList.remove("open");
    document.body.style.overflow = "";
  }

  /* 详情内会员遮罩按钮绑定 */
  document.getElementById("detailContent").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-member-login]");
    if (btn && window.zhiyuAuth) window.zhiyuAuth.open();
  });

  /* ---------- 产地分布 ---------- */
  const sortedOrigins = Object.keys(origins).sort((a, b) => origins[b] - origins[a]);
  document.getElementById("originDist").innerHTML = sortedOrigins.map((o) => {
    const n = origins[o];
    const pct = Math.round((n / products.length) * 100);
    const isKr = o === "韩国", isCn = o === "中国";
    return `<div style="margin-bottom:11px">
        <div class="flex justify-between fs-13" style="margin-bottom:4px">
          <span>${isKr ? "🇰🇷" : isCn ? "🇨🇳" : "🌐"} ${esc(o)}</span>
          <span class="text-sub">${n} 个 · ${pct}%</span>
        </div>
        <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${isKr ? "var(--accent)" : isCn ? "var(--brand)" : "#9BB4BD"};border-radius:4px"></div>
        </div>
      </div>`;
  }).join("");

  /* ---------- 事件 ---------- */
  document.getElementById("categoryChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.category = c.dataset.cat; renderChips(); render();
  });
  let timer = null;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.keyword = e.target.value; render(); }, 180);
  });
  document.getElementById("productGrid").addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (card) openDetail(card.dataset.id);
  });
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  document.getElementById("detailMask").addEventListener("click", (e) => { if (e.target.id === "detailMask") closeDetail(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });

  /* ---------- 初始化 ---------- */
  renderChips();
  render();

  // 支持 ?q=xxx 直接搜索（从全站搜索结果跳转而来）
  const initialQ = new URLSearchParams(location.search).get("q");
  if (initialQ) {
    document.getElementById("searchInput").value = initialQ;
    state.keyword = initialQ;
    render();
  }
})();
