/* 知予 · 文章详情页 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.insights();
  const wrap = document.getElementById("articleWrap");
  if (!DATA || !wrap) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


  /* 按当前语言取字段（英文模式优先使用 en 字段） */
  const pick = (obj, field) => {
    const isEn = window.zhiyuI18n && window.zhiyuI18n.isEnglish;
    if (isEn && obj && obj.en && obj.en[field]) return obj.en[field];
    return obj ? obj[field] : "";
  };

  const id = new URLSearchParams(location.search).get("id");
  const a = (DATA.articles || []).find((x) => x.id === id);
  if (!a) {
    wrap.innerHTML = '<div class="building" style="padding:50px 20px"><div class="building-icon">📄</div><h3>文章不存在</h3><p>该文章可能已被移除或链接有误</p><p class="mt-16"><a class="btn btn-primary" href="insights.html">← 返回洞察列表</a></p></div>';
    return;
  }

  document.title = pick(a, "title") + " · Zhiyu";
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", pick(a, "title"));
  const ogDesc = document.querySelector('meta[property="og:description"]') || document.createElement("meta");
  ogDesc.setAttribute("property", "og:description");
  ogDesc.setAttribute("content", pick(a, "summary") || "");
  document.head.appendChild(ogDesc);

  /* 内容块渲染 */
  function renderBlock(b) {
    if (b.type === "h2") return `<h2 class="art-h2">${esc(b.text)}</h2>`;
    if (b.type === "p") return `<p class="art-p">${esc(b.text)}</p>`;
    if (b.type === "ul") return `<ul class="art-ul">${(b.items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    if (b.type === "note") return `<div class="notice art-note"><span>💡</span><div>${esc(b.text)}</div></div>`;
    return "";
  }

  /* 正文渲染：会员文章对未登录用户显示预览 + 遮罩 */
  function renderBody(article) {
    const mem = window.zhiyuMembership;
    const blocks = article.content || [];
    const isMemberArticle = article.tier === "member" || article.tier === "pro";
    const canRead = !mem || mem.canAccess(article.tier || "free");
    if (!isMemberArticle || canRead) {
      return blocks.map(renderBlock).join("");
    }
    // 未登录：显示前 2 段预览 + 遮罩（遮罩内保留后续内容模糊预览）
    const preview = blocks.slice(0, 2).map(renderBlock).join("");
    const blurred = blocks.slice(2, 6).map(renderBlock).join("");
    return preview + (mem ? mem.gateHtml({
      title: "会员专享文章",
      desc: "登录后可阅读全文（注册会员免费）",
      preview: blurred,
    }) : "");
  }

  const related = (DATA.articles || []).filter((x) => x.id !== a.id && x.category === a.category).slice(0, 3);
  const more = (DATA.articles || []).filter((x) => x.id !== a.id).slice(0, 3);
  const rel = related.length ? related : more;

  wrap.innerHTML = `
    <a href="insights.html" class="back-link">← 返回洞察列表</a>

    <div class="flex items-center gap-8" style="flex-wrap:wrap;margin:18px 0 12px">
      <span class="tag">${esc(a.category)}</span>
      ${window.zhiyuMembership ? window.zhiyuMembership.tierBadge(a.tier) : ""}
      ${(a.tags || []).map((t) => `<span class="tag tag-line">${esc(t)}</span>`).join("")}
    </div>

    <h1 class="art-title">${esc(pick(a, "title"))}</h1>
    ${a.subtitle ? `<p class="art-subtitle">${esc(pick(a, "subtitle"))}</p>` : ""}
    <div class="art-meta">
      <span>${esc(a.author)}</span><span class="dot-sep">·</span>
      <span>${esc(a.publishedAt)}</span><span class="dot-sep">·</span>
      <span>${esc(a.readingTime)}</span>
    </div>

    <div class="art-body">
      ${renderBody(a)}
    </div>

    <div class="notice notice-info mt-24">
      <span>ℹ️</span>
      <div>${esc(DATA.dataPolicy || "")}</div>
    </div>

    <h2 class="section-title">📖 相关阅读</h2>
    <div class="article-grid">
      ${rel.map((r) => `
        <a class="article-card" href="article.html?id=${encodeURIComponent(r.id)}">
          <div style="margin-bottom:8px"><span class="tag">${esc(r.category)}</span></div>
          <div class="article-title" style="font-size:16px">${esc(r.title)}</div>
          <div class="article-meta">${esc(r.publishedAt)} · ${esc(r.readingTime)}</div>
        </a>`).join("")}
    </div>`;

  if (window.zhiyuMembership) window.zhiyuMembership.bindGate(wrap);
})();
