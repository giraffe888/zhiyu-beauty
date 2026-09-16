/* 知予 · 会员中心 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.projects();
  const api = window.medbeautyAPI;
  const auth = window.zhiyuAuth;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ROLE_KEY = "zhiyu_role";

  const ROLES = [
    { k: "operator", name: "机构运营者", icon: "🏥", desc: "医美机构、诊所、皮肤管理中心" },
    { k: "brand", name: "企业 / 品牌方", icon: "🏢", desc: "产品厂商、设备厂商、代理商" },
    { k: "investor", name: "投资机构", icon: "📊", desc: "关注医美赛道的投资人与机构" },
    { k: "practitioner", name: "行业从业者", icon: "🧑‍⚕️", desc: "医师、咨询师、产品与运营人员" },
    { k: "individual", name: "行业关注者", icon: "👤", desc: "对医美行业感兴趣的个人" },
  ];

  function roleCard(key) {
    const cur = localStorage.getItem(ROLE_KEY) || "individual";
    return ROLES.map((r) => `
      <div class="card card-hover" data-role="${r.k}" style="${cur === r.k ? "border-color:var(--brand);box-shadow:0 0 0 3px rgba(15,76,92,.08)" : ""};padding:14px">
        <div class="flex items-center gap-8">
          <span style="font-size:22px">${r.icon}</span>
          <div style="min-width:0">
            <div style="font-weight:700;font-size:14px">${esc(r.name)}${cur === r.k ? ' <span class="tag" style="margin-left:4px">当前</span>' : ""}</div>
            <div class="text-light fs-12">${esc(r.desc)}</div>
          </div>
        </div>
      </div>`).join("");
  }

  async function renderFavorites() {
    const box = document.getElementById("favBox");
    if (!box) return;
    let ids = JSON.parse(localStorage.getItem("zhiyu_favs") || "[]");
    if (api && api.enabled && auth && auth.loggedIn) {
      try { ids = Array.from(new Set([...ids, ...(await api.fetchFavorites())])); } catch (e) { /* 忽略 */ }
    }
    const list = (DATA.projects || []).filter((p) => ids.includes(p.id));
    if (!list.length) {
      box.innerHTML = '<p class="text-sub fs-13">还没有收藏内容。去 <a href="projects.html">项目库</a> 收藏感兴趣的项目吧。</p>';
      return;
    }
    box.innerHTML = list.map((p) => `
      <div class="flex items-center gap-12" style="padding:10px 0;border-bottom:1px solid var(--border)">
        ${p.image ? `<img src="images/${esc(p.image)}" alt="" style="width:44px;height:44px;border-radius:9px;object-fit:cover" onerror="this.style.display='none'">` : ""}
        <div style="flex:1;min-width:0">
          <a href="projects.html?id=${esc(p.id)}" style="font-weight:600;font-size:14px">${esc(p.name)}</a>
          <div class="text-light fs-12">${esc(p.category)} · 关注度 ${(p.industry && p.industry.heatScore) || 60}</div>
        </div>
      </div>`).join("");
  }

  function renderLoggedIn(session) {
    const email = (session.user && session.user.email) || "会员";
    const role = localStorage.getItem(ROLE_KEY) || "individual";
    const roleName = (ROLES.find((r) => r.k === role) || ROLES[4]).name;
    document.getElementById("accountBody").innerHTML = `
      <div class="card" style="margin-bottom:18px">
        <div class="flex items-center gap-12">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--brand-lighter);display:flex;align-items:center;justify-content:center;font-size:22px">👤</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700">${esc(email)}</div>
            <div class="text-light fs-12">会员类型：${esc(roleName)} · 注册用户</div>
          </div>
          <button class="btn btn-sm" id="logoutBtn">退出登录</button>
        </div>
      </div>

      <h2 class="section-title">会员身份</h2>
      <p class="text-sub fs-13" style="margin:-8px 0 12px">选择你的身份，我们将据此推荐相关内容与服务（企业认证功能开发中）。</p>
      <div class="grid-2" id="roleBox">${roleCard()}</div>

      <h2 class="section-title">我的收藏</h2>
      <div class="card" id="favBox"><p class="text-sub fs-13">加载中…</p></div>

      <h2 class="section-title">订阅设置（开发中）</h2>
      <div class="card">
        <label class="flex items-center gap-8 fs-13" style="padding:8px 0;cursor:pointer">
          <input type="checkbox"> 每周行业动态摘要
        </label>
        <label class="flex items-center gap-8 fs-13" style="padding:8px 0;cursor:pointer">
          <input type="checkbox"> 政策与合规变化提醒
        </label>
        <label class="flex items-center gap-8 fs-13" style="padding:8px 0;cursor:pointer">
          <input type="checkbox"> 中韩新品与项目上新提醒
        </label>
        <p class="text-light fs-12 mt-8">订阅推送功能将在第二期上线，届时可绑定邮箱或微信接收。</p>
      </div>

      <h2 class="section-title">企业认证（开发中）</h2>
      <div class="card">
        <p class="text-sub fs-13">
          认证企业可认领机构主页、发布资源需求、获得优先展示。
          认证需核验营业执照与相关资质，功能将在第三期上线。
        </p>
      </div>`;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      if (!confirm("确定退出登录？")) return;
      await api.signOut();
      location.reload();
    });
    document.getElementById("roleBox").addEventListener("click", (e) => {
      const card = e.target.closest("[data-role]");
      if (!card) return;
      localStorage.setItem(ROLE_KEY, card.dataset.role);
      document.getElementById("roleBox").innerHTML = roleCard();
    });
    renderFavorites();
  }

  /* 初始化 */
  function boot() {
    document.getElementById("loginPrompt")?.addEventListener("click", () => auth.open());
    if (auth && auth.session) {
      renderLoggedIn(auth.session);
    } else {
      auth.onChange((s) => { if (s) renderLoggedIn(s); });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 50));
  else setTimeout(boot, 50);
})();
