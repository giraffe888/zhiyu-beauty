/* 知予 · 会员认证模块（登录 / 注册 / 登出 / 会话状态）
   依赖：config.js、supabase-client.js、layout.js（提供 #userBtn） */
(function () {
  "use strict";

  const api = window.medbeautyAPI;
  let session = null;
  let authMode = "login";
  const listeners = [];

  function emit() { listeners.forEach((cb) => { try { cb(session); } catch (e) { console.warn(e); } }); }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 注入登录弹窗 ---------- */
  function injectModal() {
    if (document.getElementById("authMask")) return;
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="modal-mask" id="authMask">
        <div class="modal" style="max-width:400px">
          <button class="modal-close" id="authClose" aria-label="关闭">✕</button>
          <div style="text-align:center;padding:6px 2px">
            <div style="font-size:38px;margin-bottom:6px">🔷</div>
            <h3 id="authTitle" style="font-size:19px;margin-bottom:4px">登录知予</h3>
            <p id="authTip" class="text-sub fs-13" style="margin-bottom:16px">登录后可收藏内容、订阅行业动态</p>
            <div id="authErr" class="msg err" style="display:none;background:var(--danger-bg);border-radius:8px;padding:8px 12px;text-align:left"></div>
            <input class="input" id="authEmail" type="email" placeholder="邮箱" autocomplete="email" style="margin-bottom:10px;text-align:center">
            <input class="input" id="authPassword" type="password" placeholder="密码（至少 6 位）" autocomplete="current-password" style="margin-bottom:12px;text-align:center">
            <button class="btn btn-primary btn-block" id="authSubmitBtn">登 录</button>
            <button class="btn btn-block" id="authSwitchBtn" style="margin-top:8px;border-color:transparent;color:var(--brand)">还没有账号？注册一个</button>
            <p class="text-light fs-12" id="authStatus" style="margin-top:10px;min-height:16px"></p>
            <button class="auth-diag" id="authDiagBtn" type="button">🔍 检测云服务连接</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(div.firstElementChild);
  }

  const $ = (id) => document.getElementById(id);

  function openAuth() {
    injectModal();
    authMode = "login";
    $("authTitle").textContent = "登录知予";
    $("authSubmitBtn").textContent = "登 录";
    $("authSwitchBtn").textContent = "还没有账号？注册一个";
    $("authTip").textContent = "登录后可收藏内容、订阅行业动态";
    $("authErr").style.display = "none";
    $("authMask").classList.add("open");
    setTimeout(() => $("authEmail").focus(), 100);
  }
  function closeAuth() { const m = $("authMask"); if (m) m.classList.remove("open"); }
  function showErr(msg) { const el = $("authErr"); el.textContent = msg; el.style.display = "block"; }

  /* ---------- 提交 ---------- */
  async function submit() {
    if (!api || !api.enabled) { showErr("云服务尚未配置，请联系管理员"); return; }
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    if (!email || !password) { showErr("请填写邮箱和密码"); return; }
    if (authMode === "signup" && password.length < 6) { showErr("密码至少 6 位"); return; }
    $("authSubmitBtn").disabled = true;
    $("authStatus").textContent = "请稍候…";
    const res = authMode === "login" ? await api.signIn(email, password) : await api.signUp(email, password);
    $("authSubmitBtn").disabled = false;
    $("authStatus").textContent = "";
    if (res.error) {
      showErr((authMode === "signup" ? "注册失败：" : "登录失败：") + res.error.message);
      return;
    }
    if (authMode === "signup" && (!res.data || !res.data.session)) {
      showErr("注册成功！请到邮箱查收确认邮件后登录");
      return;
    }
    closeAuth();
    await refresh();
    // 登录/注册成功后，若当前页面存在会员内容遮罩，刷新一次以解锁内容
    // （仅在用户主动提交成功后触发，不会造成循环刷新）
    if (document.querySelector(".paywall")) {
      setTimeout(function () { location.reload(); }, 350);
    }
  }

  /* ---------- 会话 ---------- */
  async function refresh() {
    if (!api || !api.enabled) { updateUI(); return null; }
    try { session = await api.getSession(); } catch (e) { session = null; }
    updateUI();
    emit();
    return session;
  }
  function updateUI() {
    const btn = $("userBtn");
    if (!btn) return;
    if (!api || !api.enabled) {
      btn.innerHTML = "👤 未配置";
      btn.title = "云服务未配置（js/config.js）";
      return;
    }
    if (session) {
      const email = (session.user && session.user.email) || "";
      const name = email.split("@")[0].slice(0, 10) || "会员";
      btn.innerHTML = "👤 " + esc(name);
      btn.title = "点击进入会员中心 / 退出登录";
      btn.dataset.loggedIn = "1";
    } else {
      btn.innerHTML = "👤 登录";
      btn.title = "登录后可收藏内容、订阅行业动态";
      btn.dataset.loggedIn = "";
    }
  }

  async function handleUserBtn() {
    if (session) {
      if (confirm("要退出登录吗？")) {
        await api.signOut();
        session = null;
        updateUI();
        emit();
      }
    } else {
      openAuth();
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    injectModal();
    const btn = $("userBtn");
    if (btn) btn.addEventListener("click", handleUserBtn);

    $("authClose").addEventListener("click", closeAuth);
    $("authMask").addEventListener("click", (e) => { if (e.target === $("authMask")) closeAuth(); });
    $("authSubmitBtn").addEventListener("click", submit);
    $("authSwitchBtn").addEventListener("click", () => {
      authMode = authMode === "login" ? "signup" : "login";
      $("authTitle").textContent = authMode === "login" ? "登录知予" : "注册知予";
      $("authSubmitBtn").textContent = authMode === "login" ? "登 录" : "注 册";
      $("authSwitchBtn").textContent = authMode === "login" ? "还没有账号？注册一个" : "已有账号？去登录";
      $("authTip").textContent = authMode === "login" ? "登录后可收藏内容、订阅行业动态" : "注册后即可收藏内容、参与行业交流";
      $("authErr").style.display = "none";
    });
    $("authPassword").addEventListener("keydown", (e) => { if (e.key === "Enter") $("authSubmitBtn").click(); });
    $("authDiagBtn").addEventListener("click", async () => {
      const btn = $("authDiagBtn");
      btn.disabled = true;
      btn.textContent = "检测中…";
      const r = await api.checkHealth();
      btn.disabled = false;
      btn.textContent = "🔍 检测云服务连接";
      const st = $("authStatus");
      if (r.ok) {
        const confirmState = r.mailerAutoconfirm === false ? "已开启（注册后需邮箱确认）" : "已关闭（注册后可直接登录）";
        const signupState = r.disableSignup ? "已禁用注册" : "正常开放";
        st.innerHTML = `<span style="color:var(--ok);font-weight:600">✓ 云服务连接正常</span><br>
          <span style="font-size:11.5px">邮箱确认：${confirmState}<br>注册功能：${signupState}</span>`;
      } else {
        st.innerHTML = `<span style="color:var(--danger);font-weight:600">✗ 连接失败</span><br>
          <span style="font-size:11.5px">${esc(r.error)}<br>
          常见原因：① Supabase 项目已暂停（免费版 7 天不活动会暂停，需到控制台恢复）② 密钥或地址有误  ③ 网络无法访问</span>`;
      }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAuth(); });

    refresh();
  }

  // 等待 layout 注入完成后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0));
  } else {
    setTimeout(init, 0);
  }

  /* ---------- 对外接口 ---------- */
  window.zhiyuAuth = {
    get session() { return session; },
    get loggedIn() { return !!session; },
    open: openAuth,
    close: closeAuth,
    refresh,
    requireLogin(msg) {
      if (session) return true;
      if (msg) alert(msg);
      openAuth();
      return false;
    },
    onChange(cb) { listeners.push(cb); if (typeof cb === "function") cb(session); },
  };
})();
