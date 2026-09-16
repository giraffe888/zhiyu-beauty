/* 知予 · 轻量 SVG 图表模块（零外部依赖，纯手写）
 * 提供：横向条形图、环形图、价格区间图
 * 所有图表使用 viewBox 与响应式宽度，颜色沿用品牌色系 */
(function () {
  "use strict";

  const C = {
    brand: "#0F4C5C",
    brand2: "#1E7A90",
    brand3: "#7FB3C4",
    gold: "#D89449",
    gold2: "#E8B678",
    ok: "#2E8B66",
    palette: ["#0F4C5C", "#1E7A90", "#37A0B8", "#D89449", "#7FB3C4", "#2E8B66", "#9AA8F0", "#E8B678"],
    text: "#16262C",
    sub: "#6B7F87",
    light: "#93A5AC",
    grid: "#E2EBEE",
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const FONT = "PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif";

  function mount(el, svg) {
    if (typeof el === "string") el = document.getElementById(el);
    if (el) el.innerHTML = svg;
  }

  /* ---------- 横向条形图 ---------- */
  function bar(el, data, opts) {
    opts = opts || {};
    const labelW = opts.labelWidth || 128;
    const valW = opts.valueWidth || 66;
    const rowH = opts.rowHeight || 34;
    const gap = opts.gap || 8;
    const padT = 8, padB = 8;
    const W = 760;
    const H = padT + data.length * (rowH + gap) + padB;
    const chartW = W - labelW - valW - 20;
    const max = Math.max.apply(null, data.map((d) => d.value)) || 1;

    let rows = "";
    data.forEach((d, i) => {
      const y = padT + i * (rowH + gap);
      const w = Math.max(2, (d.value / max) * chartW);
      const color = d.color || C.palette[i % C.palette.length];
      rows += `
        <text x="${labelW - 14}" y="${y + rowH / 2 + 6}" font-size="13.5" fill="${C.text}" text-anchor="end" font-family="${FONT}">${esc(d.label)}</text>
        <rect x="${labelW}" y="${y + rowH / 2 - 9}" width="${chartW}" height="18" rx="9" fill="${C.grid}" opacity="0.55"/>
        <rect x="${labelW}" y="${y + rowH / 2 - 9}" width="${w}" height="18" rx="9" fill="${color}">
          <animate attributeName="width" from="0" to="${w}" dur="0.7s" fill="freeze"/>
        </rect>
        <text x="${labelW + chartW + 12}" y="${y + rowH / 2 + 6}" font-size="13.5" font-weight="700" fill="${color}" font-family="${FONT}">${esc(d.display != null ? d.display : d.value)}</text>`;
    });

    mount(el, `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${Math.round(H * 0.9)}" preserveAspectRatio="xMidYMid meet" role="img">${rows}</svg>`);
  }

  /* ---------- 环形图（带图例） ---------- */
  function donut(el, data, opts) {
    opts = opts || {};
    const size = opts.size || 240;
    const cx = 130, cy = size / 2 + 10;
    const r = 82, inner = 50;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let angle = -Math.PI / 2;
    let paths = "";

    data.forEach((d, i) => {
      const a2 = angle + (d.value / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const xi2 = cx + inner * Math.cos(a2), yi2 = cy + inner * Math.sin(a2);
      const xi1 = cx + inner * Math.cos(angle), yi1 = cy + inner * Math.sin(angle);
      const large = (a2 - angle) > Math.PI ? 1 : 0;
      const color = d.color || C.palette[i % C.palette.length];
      paths += `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L${xi2.toFixed(2)} ${yi2.toFixed(2)} A${inner} ${inner} 0 ${large} 0 ${xi1.toFixed(2)} ${yi1.toFixed(2)} Z"
        fill="${color}" opacity="0.92"/>`;
      angle = a2;
    });

    // 图例
    const legendX = 290;
    const legend = data.map((d, i) => {
      const y = 60 + i * 34;
      const color = d.color || C.palette[i % C.palette.length];
      const pct = Math.round((d.value / total) * 100);
      return `<g>
        <rect x="${legendX}" y="${y - 11}" width="13" height="13" rx="4" fill="${color}"/>
        <text x="${legendX + 22}" y="${y}" font-size="14" fill="${C.text}" font-family="${FONT}">${esc(d.label)}</text>
        <text x="${legendX + 178}" y="${y}" font-size="14" font-weight="700" fill="${color}" text-anchor="end" font-family="${FONT}">${d.value} · ${pct}%</text>
      </g>`;
    }).join("");

    const W = 520;
    mount(el, `<svg viewBox="0 0 ${W} ${size + 20}" width="100%" height="${size + 20}" role="img">
      <circle cx="${cx}" cy="${cy}" r="${inner - 4}" fill="none"/>
      ${paths}
      <text x="${cx}" y="${cy - 2}" font-size="13" fill="${C.sub}" text-anchor="middle" font-family="${FONT}">合计</text>
      <text x="${cx}" y="${cy + 24}" font-size="24" font-weight="800" fill="${C.brand}" text-anchor="middle" font-family="${FONT}">${total}</text>
      ${legend}
    </svg>`);
  }

  /* ---------- 价格区间图（区间条 + 单位标注） ---------- */
  function rangeBars(el, items, opts) {
    opts = opts || {};
    const unit = opts.unit || "";
    const labelW = 128;
    const valW = 150;
    const rowH = 30;
    const gap = 10;
    const W = 780;
    const H = items.length * (rowH + gap) + 30;
    const chartW = W - labelW - valW - 20;
    const max = Math.max.apply(null, items.map((d) => d.max)) || 1;
    // 取整到合适的刻度
    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const niceMax = Math.ceil(max / pow) * pow;

    let rows = "", gridLines = "";
    // 网格线
    for (let i = 0; i <= 4; i++) {
      const x = labelW + (chartW * i) / 4;
      const v = (niceMax * i) / 4;
      gridLines += `<line x1="${x}" y1="6" x2="${x}" y2="${H - 24}" stroke="${C.grid}" stroke-width="1"/>
        <text x="${x}" y="${H - 8}" font-size="11" fill="${C.light}" text-anchor="middle" font-family="${FONT}">${formatNum(v)}</text>`;
    }

    items.forEach((d, i) => {
      const y = 12 + i * (rowH + gap);
      const x1 = labelW + (d.min / niceMax) * chartW;
      const x2 = labelW + (d.max / niceMax) * chartW;
      const color = d.color || C.gold;
      rows += `
        <text x="${labelW - 14}" y="${y + rowH / 2 + 5}" font-size="13.5" fill="${C.text}" text-anchor="end" font-family="${FONT}">${esc(d.label)}</text>
        <rect x="${x1}" y="${y + rowH / 2 - 8}" width="${Math.max(3, x2 - x1)}" height="16" rx="8" fill="${color}" opacity="0.85"/>
        <circle cx="${x1}" cy="${y + rowH / 2}" r="3.5" fill="${color}"/>
        <circle cx="${x2}" cy="${y + rowH / 2}" r="3.5" fill="${color}"/>
        <text x="${labelW + chartW + 12}" y="${y + rowH / 2 + 5}" font-size="12.5" fill="${C.sub}" font-family="${FONT}">${esc(d.rangeText || (formatNum(d.min) + "-" + formatNum(d.max)))}</text>`;
    });

    mount(el, `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img">
      ${gridLines}${rows}
      <text x="${labelW}" y="0" font-size="0">${esc(unit)}</text>
    </svg>`);
  }

  function formatNum(n) {
    if (n >= 10000) return (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1) + "万";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
    return String(Math.round(n));
  }

  window.zhiyuCharts = { bar, donut, rangeBars, colors: C, formatNum };
})();
