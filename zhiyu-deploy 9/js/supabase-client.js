/* 知予 · Supabase REST 客户端（零外部依赖，直接用浏览器 fetch 调 REST API）
 * 包含：登录/注册/收藏/点赞/评论/排行/预约
 * 优点：不需要加载任何外部 SDK，彻底避免 CDN 加载失败问题 */
(function () {
  "use strict";

  const cfg = window.MEDBEAUTY_SUPABASE || {};
  const configured = cfg.url && cfg.url.indexOf("请填入") === -1 && cfg.anonKey && cfg.anonKey.indexOf("请填入") === -1;
  const BASE = configured ? cfg.url.replace(/\/+$/, "") : "";
  const SESSION_KEY = "medbeauty_session";
  const AUTH_EVENT = "medbeauty-auth-change";

  let session = loadSession();

  /* ---------- 会话持久化 ---------- */
  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return s && s.access_token ? s : null;
    } catch (e) { return null; }
  }
  function saveSession(s) {
    if (s) {
      session = s;
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } else {
      session = null;
      localStorage.removeItem(SESSION_KEY);
    }
    try { window.dispatchEvent(new CustomEvent(AUTH_EVENT)); } catch (e) { /* 忽略 */ }
  }
  function normalizeSession(s, user) {
    return {
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      user: user || s.user || null,
      expires_at: Math.floor(Date.now() / 1000) + (s.expires_in || 3600),
    };
  }

  /* ---------- 基础请求 ---------- */
  async function request(path, options = {}) {
    const headers = { apikey: cfg.anonKey, ...(options.headers || {}) };
    if (options.auth && session && session.access_token) {
      headers.Authorization = "Bearer " + session.access_token;
    }
    const res = await fetch(BASE + path, { ...options, headers });
    if (!res.ok) {
      let msg = "HTTP " + res.status;
      try {
        const j = await res.json();
        msg = j.msg || j.error_description || j.message || j.error || msg;
      } catch (e) { /* 非 JSON 响应 */ }
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    const ct = res.headers.get("content-type") || "";
    return ct.indexOf("application/json") !== -1 ? res.json() : res.text();
  }

  /* ---------- token 自动刷新 ---------- */
  async function ensureSession() {
    if (!session) return null;
    const now = Date.now() / 1000;
    if (session.expires_at && session.expires_at > now + 60) return session;
    try {
      const data = await request("/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      const s = normalizeSession(data, data.user);
      saveSession(s);
      return s;
    } catch (e) {
      saveSession(null);
      return null;
    }
  }

  /* ---------- API ---------- */
  const api = {
    enabled: configured,
    reason: configured ? "" : "Supabase 未配置，请在 js/config.js 填入项目 URL 与密钥",

    /* 云服务健康检查（用于诊断连接问题） */
    async checkHealth() {
      if (!configured) return { ok: false, error: "尚未配置 Supabase（js/config.js）" };
      try {
        const res = await fetch(BASE + "/auth/v1/settings", { headers: { apikey: cfg.anonKey } });
        if (!res.ok) {
          let detail = "HTTP " + res.status;
          try {
            const j = await res.json();
            detail = j.msg || j.message || j.error_description || j.error || detail;
          } catch (e) { /* 非 JSON */ }
          if (res.status === 503) detail = "服务暂时不可用（HTTP 503）——项目可能已暂停或达到限额";
          if (res.status === 401) detail = "密钥无效（HTTP 401）——请检查 js/config.js 中的 anon key";
          return { ok: false, error: detail, status: res.status };
        }
        const j = await res.json();
        return {
          ok: true,
          mailerAutoconfirm: j.mailer_autoconfirm,
          disableSignup: j.disable_signup,
          providers: j.external || {},
        };
      } catch (e) {
        return { ok: false, error: "网络无法连接 Supabase（" + (e.message || "未知错误") + "）" };
      }
    },

    /* 认证 */
    async signUp(email, password) {
      try {
        const data = await request("/auth/v1/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (data.session) saveSession(normalizeSession(data.session, data.user));
        return { data, error: null };
      } catch (error) {
        // 补充常见原因提示，便于自查
        const m = String(error && error.message || "");
        let hint = "";
        if (/rate limit|rate_limit|too many/i.test(m)) hint = "（邮件发送频率受限，请稍后再试）";
        else if (/already registered|already exists|已注册/i.test(m)) hint = "（该邮箱已注册，请直接登录或使用其他邮箱）";
        else if (/password/i.test(m) && /short|least|length/i.test(m)) hint = "（密码强度不足，请使用至少 6 位密码）";
        else if (/confirm/i.test(m)) hint = "（需邮箱验证，请查收确认邮件）";
        else if (/503|unavailable|paused/i.test(m)) hint = "（Supabase 项目可能已暂停，请到控制台恢复）";
        if (hint) error.message = m + hint;
        return { data: null, error };
      }
    },
    async signIn(email, password) {
      try {
        const data = await request("/auth/v1/token?grant_type=password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        saveSession(normalizeSession(data, data.user));
        return { data, error: null };
      } catch (error) { return { data: null, error }; }
    },
    async signOut() {
      try { await request("/auth/v1/logout", { method: "POST", auth: true }); } catch (e) { /* 忽略 */ }
      saveSession(null);
      return { error: null };
    },
    async getSession() { return ensureSession(); },
    onAuthChange(cb) {
      window.addEventListener(AUTH_EVENT, () => cb("SIGNED_IN", session));
    },

    /* 收藏 */
    async fetchFavorites() {
      await ensureSession();
      const data = await request("/rest/v1/favorites?select=project_id", { auth: true });
      return (data || []).map((r) => r.project_id);
    },
    async addFavorite(projectId) {
      await ensureSession();
      return request("/rest/v1/favorites", {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify([{ project_id: projectId }]),
      });
    },
    async removeFavorite(projectId) {
      await ensureSession();
      return request("/rest/v1/favorites?project_id=eq." + encodeURIComponent(projectId), {
        method: "DELETE", auth: true, headers: { Prefer: "return=minimal" },
      });
    },

    /* 点赞 */
    async fetchLikes() {
      await ensureSession();
      const data = await request("/rest/v1/likes?select=project_id", { auth: true });
      return (data || []).map((r) => r.project_id);
    },
    async like(projectId) {
      await ensureSession();
      return request("/rest/v1/likes", {
        method: "POST", auth: true,
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify([{ project_id: projectId }]),
      });
    },
    async unlike(projectId) {
      await ensureSession();
      return request("/rest/v1/likes?project_id=eq." + encodeURIComponent(projectId), {
        method: "DELETE", auth: true, headers: { Prefer: "return=minimal" },
      });
    },
    async getLikeCounts() {
      const data = await request("/rest/v1/likes_count?select=project_id,like_count");
      return data || [];
    },

    /* 评论 */
    async fetchComments(projectId) {
      const data = await request(
        "/rest/v1/comments?select=*&project_id=eq." + encodeURIComponent(projectId) +
        "&order=created_at.desc&limit=100"
      );
      return data || [];
    },
    async addComment(projectId, content) {
      await ensureSession();
      return request("/rest/v1/comments", {
        method: "POST", auth: true,
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify([{ project_id: projectId, content }]),
      });
    },
    async deleteComment(id) {
      await ensureSession();
      return request("/rest/v1/comments?id=eq." + encodeURIComponent(id), {
        method: "DELETE", auth: true, headers: { Prefer: "return=minimal" },
      });
    },

    /* 收藏排行 */
    async fetchRanking() {
      const data = await request("/rest/v1/favorite_ranking?select=project_id,favorite_count");
      return data || [];
    },

    /* 预约 */
    async submitAppointment(info) {
      return request("/rest/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify([info]),
      });
    },
  };

  window.medbeautyAPI = api;
})();
