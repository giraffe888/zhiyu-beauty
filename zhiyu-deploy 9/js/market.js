/* 知予 · 行情页逻辑 */
(function () {
  "use strict";
  const DATA = window.zhiyuData.projects();
  if (!DATA) return;
  const projects = DATA.projects || [];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const heat = (p) => (p.industry && p.industry.heatScore) || 60;

  document.getElementById("dataVersion").textContent = "v" + DATA.version;
  document.getElementById("updatedAt").textContent = DATA.updatedAt;

  const koreaCount = projects.filter((p) => (p.hotIn || []).includes("韩国")).length;
  const cnCount = projects.filter((p) => (p.hotIn || []).includes("中国")).length;
  const topHeat = projects.slice().sort((a, b) => heat(b) - heat(a))[0];

  /* 指标 */
  document.getElementById("metricGrid").innerHTML = [
    { label: "收录项目", value: DATA.total, unit: "个", sub: "覆盖中韩两地主流项目" },
    { label: "关注度最高", value: topHeat ? topHeat.name : "-", unit: "", sub: `指数 ${topHeat ? heat(topHeat) : "-"}`, accent: true },
    { label: "韩国热门项目", value: koreaCount, unit: "个", sub: "韩国市场常见项目数" },
    { label: "中国热门项目", value: cnCount, unit: "个", sub: "国内市场高关注项目数", accent: true },
  ].map((m) => `
    <div class="metric${m.accent ? " accent" : ""}">
      <div class="metric-label">${esc(m.label)}</div>
      <div class="metric-value" style="${String(m.value).length > 6 ? "font-size:19px" : ""}">${esc(m.value)}<span class="unit">${esc(m.unit)}</span></div>
      <div class="metric-sub">${esc(m.sub)}</div>
    </div>`).join("");

  /* 关注度排行 Top 10 */
  const ranked = projects.slice().sort((a, b) => heat(b) - heat(a)).slice(0, 10);
  document.getElementById("rankList").innerHTML = ranked.map((p, i) => `
    <div class="rank-row">
      <span class="rank-no ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}">${i + 1}</span>
      <div>
        <div class="rank-name">${esc(p.name)}</div>
        <div class="rank-meta">${esc(p.category)} · ${esc((p.hotIn || []).join("/"))}</div>
      </div>
      <span class="rank-value">${heat(p)}</span>
    </div>`).join("");

  /* 分类结构 */
  const cats = (DATA.categories || []).filter((c) => c !== "全部");
  document.getElementById("categoryDist").innerHTML = cats.map((c) => {
    const n = projects.filter((p) => p.category === c).length;
    const pct = Math.round((n / projects.length) * 100);
    return `<div style="margin-bottom:11px">
        <div class="flex justify-between fs-13" style="margin-bottom:4px"><span>${esc(c)}</span><span class="text-sub">${n} 个 · ${pct}%</span></div>
        <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--brand);border-radius:4px"></div>
        </div>
      </div>`;
  }).join("");

  /* 地区覆盖 */
  const regions = ["韩国", "中国"];
  document.getElementById("regionDist").innerHTML = regions.map((r) => {
    const n = projects.filter((p) => (p.hotIn || []).includes(r)).length;
    const pct = Math.round((n / projects.length) * 100);
    return `<div style="margin-bottom:11px">
        <div class="flex justify-between fs-13" style="margin-bottom:4px"><span>${r === "韩国" ? "🇰🇷" : "🇨🇳"} ${r}热门</span><span class="text-sub">${n} 个 · ${pct}%</span></div>
        <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:4px"></div>
        </div>
      </div>`;
  }).join("");

  /* ---------- 可视化图表 ---------- */
  const charts = window.zhiyuCharts;

  /* 价格文本解析：支持「800-3500 元」与「8万-30万韩元」 */
  function parsePrice(text) {
    const s = String(text || "").replace(/,/g, "");
    const m = s.match(/(\d+(?:\.\d+)?)\s*(万)?[^\d]*?(\d+(?:\.\d+)?)\s*(万)?/);
    if (m) {
      const a = parseFloat(m[1]) * (m[2] ? 10000 : 1);
      const b = parseFloat(m[3]) * (m[4] ? 10000 : 1);
      return [Math.min(a, b), Math.max(a, b)];
    }
    const single = s.match(/(\d+(?:\.\d+)?)\s*(万)?/);
    if (single) {
      const v = parseFloat(single[1]) * (single[2] ? 10000 : 1);
      return [v, v];
    }
    return null;
  }

  if (charts) {
    // ① 关注度分布（Top 10 横向条形图）
    const top10 = projects.slice().sort((a, b) => heat(b) - heat(a)).slice(0, 10);
    charts.bar("chartAttention", top10.map((p) => ({
      label: p.name.length > 7 ? p.name.slice(0, 7) + "…" : p.name,
      value: heat(p),
      display: heat(p),
    })), { labelWidth: 118, valueWidth: 52, rowHeight: 30 });

    // ② 分类占比（环形图）
    const catData = cats.map((c, i) => ({
      label: c,
      value: projects.filter((p) => p.category === c).length,
      color: ["#0F4C5C", "#1E7A90", "#37A0B8", "#D89449"][i % 4],
    })).filter((d) => d.value > 0);
    charts.donut("chartCategory", catData, { size: 230 });

    // ③④ 中韩价格区间（区间图）
    const cnItems = projects.map((p) => {
      const r = parsePrice(p.priceCn);
      if (!r) return null;
      return { label: p.name.length > 7 ? p.name.slice(0, 7) + "…" : p.name, min: r[0], max: r[1],
               rangeText: zhiyuCharts.formatNum(r[0]) + "-" + zhiyuCharts.formatNum(r[1]) + " 元",
               color: "#0F4C5C" };
    }).filter(Boolean).sort((a, b) => (a.min + a.max) - (b.min + b.max)).slice(0, 12);
    charts.rangeBars("chartPriceCn", cnItems, { unit: "元" });

    const krItems = projects.map((p) => {
      const r = parsePrice(p.priceKr);
      if (!r) return null;
      return { label: p.name.length > 7 ? p.name.slice(0, 7) + "…" : p.name, min: r[0], max: r[1],
               rangeText: zhiyuCharts.formatNum(r[0]) + "-" + zhiyuCharts.formatNum(r[1]) + " 韩元",
               color: "#D89449" };
    }).filter(Boolean).sort((a, b) => (a.min + a.max) - (b.min + b.max)).slice(0, 12);
    charts.rangeBars("chartPriceKr", krItems, { unit: "韩元" });
  }

  /* 价格对照表 */
  document.getElementById("priceTable").innerHTML = projects
    .slice()
    .sort((a, b) => heat(b) - heat(a))
    .map((p) => `
      <tr>
        <td><b>${esc(p.name)}</b></td>
        <td><span class="tag">${esc(p.category)}</span></td>
        <td>${esc((p.priceCn || "").replace("参考价：约 ", ""))}</td>
        <td>${esc((p.priceKr || "").replace("参考价：约 ", ""))}</td>
        <td><b style="color:var(--brand)">${heat(p)}</b></td>
      </tr>`).join("");
})();
