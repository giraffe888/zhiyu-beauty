/* 知予 · 全站公共布局（导航 + 页脚） */
(function () {
  "use strict";

  const NAV = [
    { href: "index.html", label: "首页" },
    { href: "market.html", label: "行情" },
    { href: "projects.html", label: "项目库" },
    { href: "products.html", label: "产品库" },
    { href: "policy.html", label: "政策" },
    { href: "insights.html", label: "洞察" },
    { href: "directory.html", label: "资源" },
    { href: "community.html", label: "交流" },
    { href: "tools.html", label: "工具" },
  ];

  const LOGO = `<img class="brand-logo" src="brand/logo.svg" alt="知予" width="36" height="36">`;

  function currentPage() {
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    return file === "" ? "index.html" : file;
  }

  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    const cur = currentPage();
    const navHtml = NAV.map((n) => {
      const active = n.href.toLowerCase() === cur ? " active" : "";
      return `<a class="nav-item${active}" href="${n.href}">${n.label}</a>`;
    }).join("");

    host.outerHTML = `
      <header class="site-header">
        <div class="header-top">
          <a class="brand" href="index.html">
            ${LOGO}
            <span class="brand-text">
              <span class="brand-name">知予</span>
              <span class="brand-slogan">中韩医美产业信息平台</span>
            </span>
          </a>
          <nav class="main-nav" id="mainNav">${navHtml}</nav>
          <div class="header-actions">
            <a class="icon-btn" id="headerSearch" href="search.html" title="全站搜索" aria-label="搜索">🔍</a>
            <button class="lang-btn" id="langBtn" title="Switch to English">EN</button>
            <button class="user-btn" id="userBtn" title="登录后可收藏、订阅、参与交流">👤 登录</button>
            <button class="menu-toggle" id="menuToggle" aria-label="菜单">☰</button>
          </div>
        </div>
      </header>`;

    // 语言切换
    const langBtn = document.getElementById("langBtn");
    if (langBtn && window.zhiyuI18n) {
      langBtn.addEventListener("click", () => window.zhiyuI18n.toggle());
      window.zhiyuI18n.updateButton();
    }

    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => nav.classList.toggle("open"));
      nav.addEventListener("click", (e) => { if (e.target.classList.contains("nav-item")) nav.classList.remove("open"); });
    }
  }

  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    const links1 = NAV.slice(0, 5).map((n) => `<a href="${n.href}">${n.label}</a>`).join("");
    const links2 = NAV.slice(5).map((n) => `<a href="${n.href}">${n.label}</a>`).join("");
    host.outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <div class="footer-brand">知予 · 中韩医美产业信息平台</div>
              <p class="footer-desc">
                连接中韩医美产业信息，为机构、企业与投资者提供行情数据、技术产品动态与资源对接服务。
              </p>
            </div>
            <div><div class="footer-title">信息频道</div><div class="footer-links">${links1}</div></div>
            <div><div class="footer-title">产业服务</div><div class="footer-links">${links2}</div></div>
            <div>
              <div class="footer-title">关于我们</div>
              <div class="footer-links">
                <a href="about.html">平台介绍</a>
                <a href="korea.html">赴韩医美指南</a>
                <a href="roadmap.html">更新日志</a>
                <a href="booking.html">商务合作</a>
                <a href="admin.html">内容管理</a>
              </div>
              <div class="footer-contact">
                <span class="xhs-label">小红书</span>
                <span class="xhs-id" id="xhsId">26151137376</span>
                <button class="copy-btn" id="copyXhs" data-copy="26151137376" title="复制小红书号">复制</button>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="disclaimer">
            免责声明：本站所载信息与数据来源于公开渠道或行业估算，仅供行业研究与信息交流参考，
            不构成医疗建议、投资建议或任何形式的服务承诺。医美相关决策请咨询具备资质的专业机构与执业医师。
          </p>
          <p class="mt-8">© 2026 知予 Zhiyu · 中韩医美产业信息平台</p>
        </div>
      </footer>`;
  }

  /* 复制小红书号 */
  function bindCopy() {
    const btn = document.getElementById("copyXhs");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy || "";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // 非安全上下文降级：临时选中文本
          const span = document.getElementById("xhsId");
          const range = document.createRange();
          range.selectNodeContents(span);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        btn.textContent = "已复制";
        setTimeout(() => { btn.textContent = "复制"; }, 1800);
      } catch (e) {
        alert("小红书号：" + text);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { renderHeader(); renderFooter(); bindCopy(); });
  } else {
    renderHeader(); renderFooter(); bindCopy();
  }
})();
