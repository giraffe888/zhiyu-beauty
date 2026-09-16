/* 知予 · 会员内容分级
 * 等级设计：
 *   guest  访客    —— 可浏览免费内容
 *   member 注册会员 —— 登录即可访问「会员内容」（免费）
 *   pro    专业会员 —— 完整报告与数据导出（规划中，暂未开放）
 */
(function () {
  "use strict";

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const TIERS = {
    guest: { key: "guest", name: "访客", level: 0, badge: "" },
    member: { key: "member", name: "注册会员", level: 1, badge: "会员" },
    pro: { key: "pro", name: "专业会员", level: 2, badge: "专业会员" },
  };

  function current() {
    if (window.zhiyuAuth && window.zhiyuAuth.loggedIn) return "member";
    return "guest";
  }

  function canAccess(tier) {
    const t = tier || "free";
    if (t === "free") return true;
    if (t === "member") return current() !== "guest";
    if (t === "pro") return false;   // 付费层级未开放
    return true;
  }

  /* 会员内容遮罩（用于文章、产品注册详情等） */
  function gateHtml(opts) {
    opts = opts || {};
    const title = opts.title || "会员专享内容";
    const desc = opts.desc || "登录后可查看完整内容（免费）";
    const preview = opts.preview || "";
    return `<div class="paywall">
      <div class="paywall-preview">${preview}</div>
      <div class="paywall-mask">
        <div class="paywall-icon">🔒</div>
        <div class="paywall-title">${esc(title)}</div>
        <p class="paywall-desc">${esc(desc)}</p>
        <div class="paywall-actions">
          <button class="btn btn-primary" data-member-login>登录 / 注册（免费）</button>
          <a class="btn" href="account.html">了解会员权益</a>
        </div>
        <p class="paywall-note">专业会员（完整报告与数据导出）即将开放</p>
      </div>
    </div>`;
  }

  /* 绑定遮罩内的登录按钮 */
  function bindGate(root) {
    const scope = root || document;
    const btns = scope.querySelectorAll("[data-member-login]");
    Array.prototype.forEach.call(btns, (btn) => {
      if (btn.__bound) return;
      btn.__bound = true;
      btn.addEventListener("click", () => {
        if (window.zhiyuAuth) window.zhiyuAuth.open();
      });
    });
  }

  /* 会员标记徽章 */
  function tierBadge(tier) {
    if (tier === "member") return '<span class="tier-badge member">会员专享</span>';
    if (tier === "pro") return '<span class="tier-badge pro">专业会员</span>';
    return "";
  }

  window.zhiyuMembership = {
    TIERS,
    current,
    currentName() { return TIERS[current()].name; },
    isLoggedIn() { return current() !== "guest"; },
    canAccess,
    gateHtml,
    bindGate,
    tierBadge,
  };

  /* 说明：不在会员模块中监听登录状态并自动刷新 ——
     因为 auth.js 在每次页面加载时都会触发一次状态回调，
     若在此处刷新会造成「加载 → 回调 → 刷新」的无限循环。
     登录成功后的内容解锁由 auth.js 在提交成功后按需处理。 */
})();
