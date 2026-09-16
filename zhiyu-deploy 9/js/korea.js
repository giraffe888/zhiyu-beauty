/* 知予 · 赴韩医美指南（仅展示官方来源信息，未核实数据保持待接入状态） */
(function () {
  "use strict";
  const DATA = window.__ZHIYU_KOREA_GUIDE__;
  if (!DATA) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* 数据状态标签 */
  function statusBadge(status) {
    if (status === "verified") return '<span class="data-status verified">✓ 已核实</span>';
    if (status === "pending") return '<span class="data-status pending">⏳ 待官方核实</span>';
    return '<span class="data-status">—</span>';
  }
  const pendingCell = '<span class="pending-value">待核实后录入</span>';

  /* 顶部数据说明 */
  const noticeEl = document.getElementById("dataNoticeText");
  if (noticeEl) {
    noticeEl.innerHTML = `<b>数据采集原则：</b>${esc(DATA.statusNote)}`;
  }

  /* 官方来源区块 */
  function sourceBlock(sources) {
    if (!sources || !sources.length) return "";
    return `<div class="source-box">
      <div class="source-title">📚 官方数据来源与查询入口</div>
      <div class="source-list">
        ${sources.map((s) => `
          <div class="source-item">
            <div class="source-name">${esc(s.name)}</div>
            <div class="source-covers">可查内容：${esc(s.covers)}</div>
            ${s.note ? `<div class="source-note">${esc(s.note)}</div>` : ""}
            <a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">前往官方网站 ↗</a>
          </div>`).join("")}
      </div>
    </div>`;
  }

  /* 板块 1：数据表格 */
  function renderStats(section) {
    const cols = section.columns || [];
    const rows = section.rows || [];
    return `<div class="table-wrap">
      <table>
        <thead><tr>${cols.map((c) => `<th>${esc(c.label)}${c.unit ? `<br><span style="font-weight:400;font-size:11px">（${esc(c.unit)}）</span>` : ""}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((r) => `<tr>
            ${cols.map((c) => {
              const v = r[c.key];
              if (c.key === "sourceUrl") {
                return `<td>${v ? `<a class="src-link" href="${esc(v)}" target="_blank" rel="noopener noreferrer">官方入口 ↗</a>` : "—"}</td>`;
              }
              if (c.key === "source") return `<td style="font-size:12.5px;color:var(--text-sub)">${esc(v || "")}</td>`;
              if (v === null || v === undefined || v === "") return `<td>${pendingCell}</td>`;
              return `<td>${esc(v)}</td>`;
            }).join("")}
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  }

  /* 板块 2、3：条目列表 */
  function renderItems(section) {
    return `<div class="guide-items">
      ${(section.items || []).map((it) => `
        <div class="guide-item">
          <div class="guide-head">
            <div class="guide-topic">${esc(it.topic)}</div>
            ${statusBadge(it.status)}
          </div>
          ${it.keyPoints && it.keyPoints.length
            ? `<ul class="guide-points">${it.keyPoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>`
            : `<div class="guide-pending">该条目的具体规定待官方核实后录入</div>`}
          ${it.note ? `<div class="guide-note">📌 ${esc(it.note)}</div>` : ""}
          <div class="guide-source">
            官方来源：${esc(it.officialSource || "")}
            ${it.sourceUrl ? `<a class="src-link" href="${esc(it.sourceUrl)}" target="_blank" rel="noopener noreferrer">前往查询 ↗</a>` : ""}
          </div>
        </div>`).join("")}
    </div>`;
  }

  /* 渲染所有板块 */
  const box = document.getElementById("koreaSections");
  if (box) {
    box.innerHTML = (DATA.sections || []).map((s) => `
      <section class="section-block">
        <h2 class="section-title">${esc(s.title)}</h2>
        <p class="fs-13 text-sub" style="margin-bottom:14px">${esc(s.description)}</p>
        <div class="fs-12" style="margin-bottom:14px">${statusBadge(s.dataStatus || "pending")}</div>
        ${s.rows ? renderStats(s) : ""}
        ${s.items ? renderItems(s) : ""}
        ${sourceBlock(s.officialSources)}
      </section>`).join("");
  }

  /* 免责声明 */
  const dEl = document.getElementById("disclaimerBox");
  if (dEl) dEl.textContent = DATA.disclaimer || "";
})();
