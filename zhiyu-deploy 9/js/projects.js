/* 知予 · 项目库页面逻辑 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.projects();
  if (!DATA) return;
  const projects = DATA.projects || [];
  const api = window.medbeautyAPI;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* 按当前语言取字段（英文模式优先使用 en 字段） */
  const pick = (obj, field) => {
    const isEn = window.zhiyuI18n && window.zhiyuI18n.isEnglish;
    if (isEn && obj && obj.en && obj.en[field]) return obj.en[field];
    return obj ? obj[field] : "";
  };

  /* 配图地址：支持本地文件名（images/xxx.svg）、站内路径或外部 URL */
  function imgSrc(image) {
    if (!image) return "";
    if (/^https?:\/\//i.test(image) || image.indexOf("/") === 0) return image;
    return "images/" + image;
  }

  const state = { category: "全部", region: "全部", keyword: "", favorites: [] };

  document.getElementById("totalCount").textContent = DATA.total;
  document.getElementById("dataVersion").textContent = "v" + DATA.version;

  /* ---------- 筛选器渲染 ---------- */
  function renderChips() {
    document.getElementById("categoryChips").innerHTML = (DATA.categories || []).map((c) =>
      `<span class="chip${state.category === c ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}</span>`).join("");
    document.getElementById("regionChips").innerHTML = (DATA.regions || []).map((r) =>
      `<span class="chip${state.region === r ? " active" : ""}" data-region="${esc(r)}">${esc(r)}${r === "全部" ? "" : "热门"}</span>`).join("");
  }

  /* ---------- 列表 ---------- */
  function filtered() {
    const kw = state.keyword.trim().toLowerCase();
    return projects.filter((p) => {
      if (state.category !== "全部" && p.category !== state.category) return false;
      if (state.region !== "全部" && !(p.hotIn || []).includes(state.region)) return false;
      if (kw) {
        const hay = [p.name, p.summary, (p.aliases || []).join(" "), (p.brands || []).join(" ")].join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    }).sort((a, b) => ((b.industry && b.industry.heatScore) || 0) - ((a.industry && a.industry.heatScore) || 0));
  }

  function render() {
    const list = filtered();
    document.getElementById("resultCount").textContent = `共 ${list.length} 个`;
    document.getElementById("emptyState").hidden = list.length !== 0;
    document.getElementById("projectGrid").innerHTML = list.map((p) => {
      const heat = (p.industry && p.industry.heatScore) || 60;
      const fav = state.favorites.includes(p.id);
      return `
        <article class="p-card" data-id="${esc(p.id)}">
          ${p.image ? `<img class="p-card-img" src="${esc(imgSrc(p.image))}" alt="${esc(pick(p, "name"))}" loading="lazy" onerror="this.style.display='none'">` : ""}
          <div class="p-card-body">
            <div class="flex justify-between" style="align-items:flex-start;gap:8px">
              <div style="min-width:0">
                <div class="p-card-name">${esc(pick(p, "name"))}</div>
                <div class="p-card-alias">${esc((p.aliases || []).slice(0, 3).join(" · "))}</div>
              </div>
              <button class="fav-btn" data-fav="${esc(p.id)}" title="收藏" style="border:none;background:none;font-size:17px;cursor:pointer;opacity:${fav ? 1 : .35}">${fav ? "★" : "☆"}</button>
            </div>
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
  }

  /* ---------- 详情 ---------- */
  function openDetail(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    const ind = p.industry || {};
    const heat = ind.heatScore || 60;
    document.getElementById("detailContent").innerHTML = `
      <div class="detail-head">
        ${p.image ? `<img class="detail-thumb" src="${esc(imgSrc(p.image))}" alt="${esc(pick(p, "name"))}" onerror="this.style.display='none'">` : ""}
        <div style="min-width:0">
          <div class="detail-title">${esc(pick(p, "name"))}</div>
          <div class="detail-sub">${esc((p.aliases || []).join(" · "))}</div>
          <div class="mt-8 flex gap-8" style="flex-wrap:wrap">
            <span class="tag">${esc(p.category)}</span>
            ${(p.hotIn || []).map((r) => `<span class="tag tag-line">${esc(r)}热门</span>`).join("")}
            <span class="tag tag-accent">关注度 ${heat}</span>
          </div>
        </div>
      </div>

      <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:16px">
        <div style="height:100%;width:${heat}%;background:linear-gradient(90deg,var(--brand-light),var(--accent))"></div>
      </div>

      <div class="card" style="background:var(--brand-lighter);border:none;padding:13px 15px;margin-bottom:16px">
        <span class="fs-13" style="color:#295A68">${esc(pick(p, "summary"))}</span>
      </div>

      <div class="detail-block"><h4>🔬 技术原理</h4><p>${esc(p.principle)}</p></div>
      <div class="detail-block"><h4>📋 操作流程</h4><p>${esc(p.procedure)}</p></div>
      <div class="detail-block"><h4>✅ 主要效果</h4><ul>${(p.effects || []).map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>
      <div class="detail-block"><h4>👤 适合人群</h4><p>${esc(p.suitedFor)}</p></div>
      <div class="kv-grid" style="margin-bottom:16px">
        <div class="kv"><div class="kv-label">维持时间</div><div class="kv-value">${esc(p.duration)}</div></div>
        <div class="kv"><div class="kv-label">恢复期</div><div class="kv-value">${esc(p.recovery)}</div></div>
      </div>
      <div class="detail-block"><h4>⚠️ 风险提示</h4><ul>${(p.risks || []).map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>

      <div class="detail-block"><h4>💰 参考价格（中韩对照）</h4>
        <div class="kv-grid">
          <div class="kv"><div class="kv-label">🇨🇳 中国大陆</div><div class="kv-value">${esc((p.priceCn || "").replace("参考价：约 ", ""))}</div></div>
          <div class="kv"><div class="kv-label">🇰🇷 韩国</div><div class="kv-value">${esc((p.priceKr || "").replace("参考价：约 ", ""))}</div></div>
        </div>
      </div>

      <div class="detail-block"><h4>🏭 常见品牌与厂商</h4><p>${esc((p.brands || []).join("、"))}</p></div>
      <div class="detail-block"><h4>🌐 技术与产品来源</h4><p>${esc(ind.origin || "多国厂商")}</p></div>
      <div class="detail-block"><h4>📜 监管提示</h4><p class="fs-13">${esc(ind.policyNote || "")}</p></div>
      ${p.note ? `<div class="notice"><span>💡</span><div>${esc(p.note)}</div></div>` : ""}

      <div class="flex gap-8 mt-16">
        <button class="btn btn-primary" data-fav-detail="${esc(p.id)}" style="flex:1">
          ${state.favorites.includes(p.id) ? "★ 已收藏" : "☆ 收藏该项目"}
        </button>
      </div>
      <p class="text-light fs-12 mt-16" style="border-top:1px dashed var(--border);padding-top:12px">
        ${esc(ind.dataNote || "价格与关注度为平台整理，仅供参考")}。本页信息不构成医疗建议，项目风险与适应症请以执业医师面诊评估为准。
      </p>`;
    document.getElementById("detailMask").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDetail() {
    document.getElementById("detailMask").classList.remove("open");
    document.body.style.overflow = "";
    if (location.search.includes("id=")) history.replaceState(null, "", "projects.html");
  }

  /* ---------- 收藏（登录后云端同步） ---------- */
  async function loadFavorites() {
    const local = JSON.parse(localStorage.getItem("zhiyu_favs") || "[]");
    state.favorites = local;
    render();
    if (api && api.enabled && window.zhiyuAuth && window.zhiyuAuth.loggedIn) {
      try {
        const cloud = await api.fetchFavorites();
        state.favorites = Array.from(new Set([...local, ...cloud]));
        localStorage.setItem("zhiyu_favs", JSON.stringify(state.favorites));
        render();
      } catch (e) { console.warn("云端收藏同步失败", e); }
    }
  }
  async function toggleFav(id) {
    const i = state.favorites.indexOf(id);
    const adding = i === -1;
    if (adding) state.favorites.push(id); else state.favorites.splice(i, 1);
    localStorage.setItem("zhiyu_favs", JSON.stringify(state.favorites));
    render();
    const openId = document.getElementById("detailMask").classList.contains("open");
    if (openId && document.querySelector(".detail-title")) openDetail(id);
    if (api && api.enabled && window.zhiyuAuth && window.zhiyuAuth.loggedIn) {
      try { adding ? await api.addFavorite(id) : await api.removeFavorite(id); }
      catch (e) { console.warn("云端同步失败", e); }
    } else if (adding && window.zhiyuAuth && !window.zhiyuAuth.loggedIn) {
      console.info("未登录：收藏仅保存在本机，登录后可云端同步");
    }
  }

  /* ---------- 事件 ---------- */
  document.getElementById("categoryChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.category = c.dataset.cat; renderChips(); render();
  });
  document.getElementById("regionChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.region = c.dataset.region; renderChips(); render();
  });
  let timer = null;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.keyword = e.target.value; render(); }, 180);
  });
  document.getElementById("projectGrid").addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav]");
    if (favBtn) { e.stopPropagation(); toggleFav(favBtn.dataset.fav); return; }
    const card = e.target.closest(".p-card");
    if (card) openDetail(card.dataset.id);
  });
  document.getElementById("detailContent").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav-detail]");
    if (btn) toggleFav(btn.dataset.favDetail);
  });
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  document.getElementById("detailMask").addEventListener("click", (e) => {
    if (e.target.id === "detailMask") closeDetail();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });

  /* ---------- 初始化 ---------- */
  renderChips();
  render();
  loadFavorites();

  // 支持 ?id=xxx 直接打开项目，?q=xxx 直接搜索
  const params = new URLSearchParams(location.search);
  if (params.get("id")) setTimeout(() => openDetail(params.get("id")), 200);
  const initialQ = params.get("q");
  if (initialQ) {
    document.getElementById("searchInput").value = initialQ;
    state.keyword = initialQ;
    render();
  }
})();
