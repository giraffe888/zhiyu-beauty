/* 知予 · 内容管理后台（支持：医美项目 / 产品与设备 / 政策法规 / 洞察文章） */
(function () {
  "use strict";

  const PIN_KEY = "zhiyu_admin_pin";
  const DEFAULT_PIN = "123456";

  /* ============ 类型配置（配置驱动） ============ */
  const TYPES = {
    projects: {
      label: "医美项目", icon: "💉", storeKey: "zhiyu_admin_projects", dataKey: "projects",
      titleField: "name", metaFields: ["category"],
      source: () => window.__ZHIYU_DATA__,
      fields: [
        { key: "id", label: "项目 ID（英文唯一）", type: "text", required: true },
        { key: "name", label: "项目名称", type: "text", required: true },
        { key: "aliases", label: "别名", type: "list", hint: "每行一个" },
        { key: "category", label: "分类", type: "select", options: ["注射类", "光电类", "皮肤管理", "手术类"] },
        { key: "popularity", label: "热度（1-5）", type: "number", min: 1, max: 5, def: 3 },
        { key: "hotIn", label: "热门地区", type: "multiselect", options: ["韩国", "中国"] },
        { key: "image", label: "配图", type: "text", hint: "可填：images/ 下的文件名（如 botox.svg）｜或完整图片 URL（https://...）" },
        { key: "summary", label: "一句话简介", type: "textarea" },
        { key: "principle", label: "技术原理", type: "textarea" },
        { key: "procedure", label: "操作流程", type: "textarea" },
        { key: "duration", label: "维持时间", type: "text" },
        { key: "recovery", label: "恢复期", type: "text" },
        { key: "effects", label: "主要效果", type: "list" },
        { key: "suitedFor", label: "适合人群", type: "textarea" },
        { key: "risks", label: "风险提示", type: "list" },
        { key: "brands", label: "常见品牌", type: "list" },
        { key: "priceCn", label: "中国参考价", type: "text" },
        { key: "priceKr", label: "韩国参考价", type: "text" },
        { key: "note", label: "备注", type: "textarea" },
      ],
    },
    products: {
      label: "产品与设备", icon: "🧪", storeKey: "zhiyu_admin_products", dataKey: "products",
      titleField: "name", metaFields: ["category", "manufacturer"],
      source: () => window.__ZHIYU_PRODUCTS__,
      fields: [
        { key: "id", label: "产品 ID（英文唯一）", type: "text", required: true },
        { key: "name", label: "产品名称", type: "text", required: true },
        { key: "enName", label: "英文名", type: "text" },
        { key: "category", label: "分类", type: "select", options: ["玻尿酸", "肉毒素", "水光与再生", "光电设备"] },
        { key: "manufacturer", label: "厂商 / 品牌方", type: "text" },
        { key: "origin", label: "原产地", type: "text", hint: "如：韩国 / 美国" },
        { key: "indications", label: "主要适应症", type: "list", hint: "每行一个" },
        { key: "features", label: "产品特点", type: "textarea" },
        { key: "priceBand", label: "价格带", type: "select", options: ["中端", "中高端", "高端"] },
        { key: "hotIn", label: "主要市场", type: "multiselect", options: ["中国", "韩国", "全球", "欧洲"] },
        { key: "popularity", label: "关注度（1-5）", type: "number", min: 1, max: 5, def: 3 },
        { key: "approvalCn", label: "中国注册状态（原文描述）", type: "textarea", hint: "对状态的文字说明" },
        { key: "cnRegStatus", label: "🇨🇳 中国 · 注册状态", type: "select", options: ["已获批", "已引进（以官方为准）", "待核实", "未查到"] },
        { key: "cnRegNumber", label: "🇨🇳 中国 · 注册证号", type: "text", hint: "⚠️ 必须从 NMPA 官方数据库核实后填写，未核实请留空" },
        { key: "cnRegDate", label: "🇨🇳 中国 · 批准日期", type: "text", hint: "如 2023-05-18" },
        { key: "cnRegHolder", label: "🇨🇳 中国 · 注册人/代理人", type: "text" },
        { key: "cnVerifiedAt", label: "🇨🇳 中国 · 信息核实日期", type: "date", hint: "你实际去官方核验的日期" },
        { key: "approvalKr", label: "韩国许可状态（原文描述）", type: "textarea", hint: "对状态的文字说明" },
        { key: "krRegStatus", label: "🇰🇷 韩国 · 许可状态", type: "select", options: ["已许可", "已流通（以官方为准）", "待核实", "未查到"] },
        { key: "krRegNumber", label: "🇰🇷 韩国 · 许可编号", type: "text", hint: "⚠️ 必须从 MFDS 官方数据库核实后填写" },
        { key: "krRegDate", label: "🇰🇷 韩国 · 许可日期", type: "text" },
        { key: "krRegHolder", label: "🇰🇷 韩国 · 许可持有人", type: "text" },
        { key: "krVerifiedAt", label: "🇰🇷 韩国 · 信息核实日期", type: "date" },
        { key: "note", label: "备注", type: "textarea" },
      ],
    },
    policies: {
      label: "政策法规", icon: "📜", storeKey: "zhiyu_admin_policies", dataKey: "policies",
      titleField: "title", metaFields: ["region", "category"],
      source: () => window.__ZHIYU_POLICIES__,
      fields: [
        { key: "id", label: "条目 ID（英文唯一）", type: "text", required: true },
        { key: "region", label: "地区", type: "select", options: ["中国", "韩国"] },
        { key: "category", label: "合规领域", type: "select", options: ["机构资质", "人员资质", "产品准入", "广告合规", "药品管理", "跨境相关", "运营合规"] },
        { key: "title", label: "政策标题", type: "text", required: true },
        { key: "summary", label: "一句话说明", type: "textarea" },
        { key: "keyPoints", label: "核心要点", type: "list", hint: "每行一个要点" },
        { key: "impact", label: "实务影响", type: "textarea" },
        { key: "practicalTips", label: "建议动作", type: "list", hint: "每行一个建议" },
      ],
    },
    insights: {
      label: "洞察文章", icon: "📈", storeKey: "zhiyu_admin_insights", dataKey: "articles",
      titleField: "title", metaFields: ["category", "publishedAt"],
      source: () => window.__ZHIYU_INSIGHTS__,
      fields: [
        { key: "id", label: "文章 ID（英文唯一）", type: "text", required: true },
        { key: "title", label: "文章标题", type: "text", required: true },
        { key: "subtitle", label: "副标题", type: "text" },
        { key: "category", label: "分类", type: "select", options: ["市场分析", "技术趋势", "经营实务", "合规观察"] },
        { key: "tags", label: "标签", type: "list", hint: "每行一个" },
        { key: "summary", label: "摘要", type: "textarea" },
        { key: "featured", label: "设为精选", type: "checkbox" },
        { key: "author", label: "作者", type: "text", def: "知予研究" },
        { key: "publishedAt", label: "发布日期", type: "date" },
        { key: "readingTime", label: "阅读时长", type: "text", hint: "如：6 分钟" },
        { key: "body", label: "正文", type: "markdown", hint: "## 小标题｜普通段落｜- 列表项｜> 提示框（空行分段）" },
      ],
    },
  };

  /* ============ 状态 ============ */
  let currentType = "projects";
  let store = {};           // { projects: {...}, products: {...}, ... }
  let editingId = null;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ============ Markdown ↔ 内容块 ============ */
  function parseMarkdown(text) {
    const lines = String(text || "").split("\n");
    const blocks = [];
    let listBuf = [];
    const flush = () => { if (listBuf.length) { blocks.push({ type: "ul", items: listBuf.slice() }); listBuf = []; } };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flush(); continue; }
      if (line.indexOf("## ") === 0) { flush(); blocks.push({ type: "h2", text: line.slice(3).trim() }); }
      else if (line.indexOf("- ") === 0) { listBuf.push(line.slice(2).trim()); }
      else if (line.indexOf("> ") === 0) { flush(); blocks.push({ type: "note", text: line.slice(2).trim() }); }
      else { flush(); blocks.push({ type: "p", text: line }); }
    }
    flush();
    return blocks;
  }
  function toMarkdown(content) {
    return (content || []).map((b) => {
      if (b.type === "h2") return "## " + b.text;
      if (b.type === "p") return b.text;
      if (b.type === "ul") return (b.items || []).map((i) => "- " + i).join("\n");
      if (b.type === "note") return "> " + b.text;
      return "";
    }).join("\n\n");
  }

  /* ============ 数据加载 / 保存 ============ */
  function loadStore() {
    Object.keys(TYPES).forEach((key) => {
      const cfg = TYPES[key];
      const saved = localStorage.getItem(cfg.storeKey);
      if (saved) {
        try { store[key] = JSON.parse(saved); return; } catch (e) { /* 损坏则回退 */ }
      }
      const src = cfg.source();
      store[key] = src ? JSON.parse(JSON.stringify(src)) : { [cfg.dataKey]: [] };
    });
  }
  function saveType(key) {
    const cfg = TYPES[key];
    store[key].updatedAt = new Date().toISOString().slice(0, 10);
    localStorage.setItem(cfg.storeKey, JSON.stringify(store[key]));
  }
  function items(key) { return store[key][TYPES[key].dataKey] || []; }
  function setItems(key, arr) { store[key][TYPES[key].dataKey] = arr; }
  function totalItems() { return Object.keys(TYPES).reduce((n, k) => n + items(k).length, 0); }

  /* ============ 认证 ============ */
  function getPin() { return localStorage.getItem(PIN_KEY) || DEFAULT_PIN; }
  // 注意：admin.css 中 .admin-login 默认 display:none，需同时加 .show 类才会显示
  function showLogin() {
    $("loginView").hidden = false;
    $("loginView").classList.add("show");
    $("adminView").hidden = true;
    setTimeout(function () { $("pinInput").focus(); }, 50);
  }
  function showAdmin() {
    $("loginView").hidden = true;
    $("loginView").classList.remove("show");
    $("adminView").hidden = false;
    renderAll();
  }
  $("loginBtn").addEventListener("click", () => {
    if ($("pinInput").value === getPin()) {
      sessionStorage.setItem("zhiyu_admin_authed", "1");
      $("loginErr").hidden = true; showAdmin();
    } else { $("loginErr").hidden = false; }
  });
  $("pinInput").addEventListener("keydown", (e) => { if (e.key === "Enter") $("loginBtn").click(); });
  $("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("zhiyu_admin_authed");
    $("pinInput").value = "";
    $("loginErr").hidden = true;
    showLogin();
  });

  /* ============ 标签页 ============ */
  function switchTab(tab) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    $("tab-" + tab).classList.add("active");
    if (tab === "dashboard") renderDashboard();
    if (tab === "content") renderList();
    if (tab === "data") { renderMeta(); renderExportRow(); }
  }
  $("adminTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".tab"); if (!tab) return;
    switchTab(tab.dataset.tab);
  });
  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.goto));
  });

  /* ============ 仪表盘 ============ */
  function renderDashboard() {
    const cfg = TYPES[currentType];
    $("statGrid").innerHTML = [
      { num: totalItems(), label: "内容总条数" },
      { num: items("projects").length, label: "医美项目" },
      { num: items("products").length, label: "产品与设备" },
      { num: items("policies").length + items("insights").length, label: "政策 + 文章" },
    ].map((s) => `<div class="stat-box"><div class="num">${esc(s.num)}</div><div class="label">${esc(s.label)}</div></div>`).join("");

    const max = Math.max(...Object.keys(TYPES).map((k) => items(k).length), 1);
    $("dataDist").innerHTML = Object.keys(TYPES).map((k) => {
      const n = items(k).length;
      return `<div class="dist-row">
          <span class="name">${TYPES[k].icon} ${esc(TYPES[k].label)}</span>
          <div class="bar-bg"><div class="bar" style="width:${(n / max) * 100}%"></div></div>
          <span class="count">${n}</span>
        </div>`;
    }).join("");
  }

  /* ============ 类型切换 ============ */
  function renderTypeSwitch() {
    $("typeSwitch").innerHTML = Object.keys(TYPES).map((k) =>
      `<button class="type-btn${k === currentType ? " active" : ""}" data-type="${k}">
        ${TYPES[k].icon} ${esc(TYPES[k].label)} <span class="type-count">${items(k).length}</span>
      </button>`).join("");
  }
  $("typeSwitch").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-type]"); if (!btn) return;
    currentType = btn.dataset.type;
    $("adminSearch").value = "";
    renderTypeSwitch(); renderList();
  });

  /* ============ 列表 ============ */
  function renderList() {
    const cfg = TYPES[currentType];
    const kw = $("adminSearch").value.trim().toLowerCase();
    let list = items(currentType);
    if (kw) {
      list = list.filter((it) => cfg.fields.some((f) => {
        const v = it[f.key];
        const text = Array.isArray(v) ? v.join(" ") : String(v == null ? "" : v);
        return text.toLowerCase().includes(kw);
      }));
    }
    $("adminList").innerHTML = list.length ? list.map((it) => {
      const title = it[cfg.titleField] || "(未命名)";
      const meta = (cfg.metaFields || []).map((f) => {
        const v = it[f];
        return Array.isArray(v) ? v.join("/") : v;
      }).filter(Boolean).join(" · ");
      return `<div class="admin-item">
          <div class="item-info">
            <div class="item-name">${esc(title)}</div>
            <div class="item-meta">${esc(meta)}${meta ? " · " : ""}${esc(it.id || "")}</div>
          </div>
          <div class="item-actions">
            <button class="btn" data-edit="${esc(it.id)}">✏️ 编辑</button>
            <button class="btn btn-danger" data-del="${esc(it.id)}">🗑️</button>
          </div>
        </div>`;
    }).join("") : `<div class="panel-card"><p style="color:var(--text-sub);text-align:center">没有找到内容</p></div>`;
  }
  $("adminSearch").addEventListener("input", renderList);

  $("adminList").addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) { openEditor(editBtn.dataset.edit); return; }
    const delBtn = e.target.closest("[data-del]");
    if (delBtn && confirm("确定删除该条目？此操作不可撤销（可先导出备份）。")) {
      setItems(currentType, items(currentType).filter((it) => it.id !== delBtn.dataset.del));
      saveType(currentType); renderTypeSwitch(); renderList(); renderDashboard();
    }
  });
  $("addItemBtn").addEventListener("click", () => openEditor(null));

  /* ============ 编辑器（配置驱动） ============ */
  function fieldHtml(f, val) {
    const v = val === undefined || val === null ? "" : val;
    const hint = f.hint ? `<span class="field-hint">${esc(f.hint)}</span>` : "";
    if (f.type === "textarea") {
      return `<label class="full">${esc(f.label)}${hint}<textarea class="admin-input" id="f_${f.key}" rows="3">${esc(v)}</textarea></label>`;
    }
    if (f.type === "list") {
      return `<label class="full">${esc(f.label)}${hint}<textarea class="admin-input" id="f_${f.key}" rows="3">${esc((v || []).join("\n"))}</textarea></label>`;
    }
    if (f.type === "select") {
      return `<label>${esc(f.label)}${hint}<select class="admin-input" id="f_${f.key}">
        ${(f.options || []).map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}
      </select></label>`;
    }
    if (f.type === "multiselect") {
      return `<label class="full">${esc(f.label)}${hint}<span class="multi-box" id="f_${f.key}">
        ${(f.options || []).map((o) => `<label class="multi-item"><input type="checkbox" value="${esc(o)}" ${(v || []).indexOf(o) !== -1 ? "checked" : ""}> ${esc(o)}</label>`).join("")}
      </span></label>`;
    }
    if (f.type === "number") {
      return `<label>${esc(f.label)}${hint}<input type="number" class="admin-input" id="f_${f.key}" value="${esc(v || f.def || "")}" min="${f.min || 0}" max="${f.max || 999}"></label>`;
    }
    if (f.type === "checkbox") {
      return `<label class="full"><span class="multi-item"><input type="checkbox" id="f_${f.key}" ${v ? "checked" : ""}> ${esc(f.label)}</span>${hint}</label>`;
    }
    if (f.type === "markdown") {
      return `<label class="full">${esc(f.label)}${hint}<textarea class="admin-input" id="f_${f.key}" rows="14" style="font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.8">${esc(v)}</textarea></label>`;
    }
    const isDate = f.type === "date";
    return `<label>${esc(f.label)}${hint}<input type="${isDate ? "date" : "text"}" class="admin-input" id="f_${f.key}" value="${esc(v)}"></label>`;
  }

  function openEditor(id) {
    const cfg = TYPES[currentType];
    editingId = id;
    const it = id ? items(currentType).find((x) => x.id === id) : null;
    $("editorTitle").textContent = (it ? "编辑" : "新增") + cfg.label;
    $("deleteItemBtn").style.display = it ? "" : "none";
    let html = '<div class="form-grid">';
    cfg.fields.forEach((f) => {
      let val = it ? it[f.key] : undefined;
      if (f.key === "body" && it) val = toMarkdown(it.content);
      if (f.key === "publishedAt" && it && !val) val = new Date().toISOString().slice(0, 10);
      if (f.key === "publishedAt" && !it) val = new Date().toISOString().slice(0, 10);
      html += fieldHtml(f, val);
    });
    html += "</div>";
    $("editorForm").innerHTML = html;
    $("editorMask").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeEditor() {
    $("editorMask").classList.remove("open");
    document.body.style.overflow = "";
    editingId = null;
  }
  $("editorClose").addEventListener("click", closeEditor);
  $("editorMask").addEventListener("click", (e) => { if (e.target.id === "editorMask") closeEditor(); });

  function collectForm() {
    const cfg = TYPES[currentType];
    const item = {};
    for (const f of cfg.fields) {
      const el = $("f_" + f.key);
      if (!el) continue;
      if (f.type === "list") {
        item[f.key] = el.value.split("\n").map((s) => s.trim()).filter(Boolean);
      } else if (f.type === "multiselect") {
        item[f.key] = Array.prototype.slice.call(el.querySelectorAll("input:checked")).map((i) => i.value);
      } else if (f.type === "number") {
        item[f.key] = parseInt(el.value, 10) || f.def || 0;
      } else if (f.type === "checkbox") {
        item[f.key] = el.checked;
      } else if (f.type === "markdown") {
        item.content = parseMarkdown(el.value);
      } else {
        item[f.key] = el.value.trim();
      }
    }
    return item;
  }

  $("saveItemBtn").addEventListener("click", () => {
    const cfg = TYPES[currentType];
    const item = collectForm();
    const idField = cfg.fields.find((f) => f.key === "id");
    if (idField && idField.required && !item.id) { alert("请填写 ID（英文唯一）"); return; }
    const titleField = cfg.titleField;
    if (item[titleField] !== undefined && !item[titleField]) { alert("请填写" + (cfg.fields.find((f) => f.key === titleField) || {}).label); return; }

    const list = items(currentType);
    const idx = editingId ? list.findIndex((x) => x.id === editingId) : -1;
    if (idx >= 0) {
      // 保留表单外的字段（如项目的 industry）
      const old = list[idx];
      Object.keys(old).forEach((k) => { if (item[k] === undefined) item[k] = old[k]; });
      list[idx] = item;
    } else {
      if (list.some((x) => x.id === item.id)) { alert("该 ID 已存在，请换一个"); return; }
      list.push(item);
    }
    setItems(currentType, list);
    saveType(currentType);
    closeEditor();
    renderTypeSwitch(); renderList(); renderDashboard();
    alert("已保存 ✅ 前台刷新即可看到更新");
  });

  $("deleteItemBtn").addEventListener("click", () => {
    if (!editingId) return;
    if (confirm("确定删除该条目？")) {
      setItems(currentType, items(currentType).filter((x) => x.id !== editingId));
      saveType(currentType); closeEditor();
      renderTypeSwitch(); renderList(); renderDashboard();
    }
  });

  /* ============ 数据管理 ============ */
  function renderMeta() {
    const d = store[currentType];
    $("metaVersion").value = d.version || "";
    $("metaUpdated").value = d.updatedAt || "";
    $("metaType").value = TYPES[currentType].icon + " " + TYPES[currentType].label;
  }
  $("saveMetaBtn").addEventListener("click", () => {
    const d = store[currentType];
    d.version = $("metaVersion").value.trim() || d.version;
    d.updatedAt = $("metaUpdated").value || d.updatedAt;
    saveType(currentType);
    alert("版本信息已保存");
  });

  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportType(key) {
    const cfg = TYPES[key];
    const json = JSON.stringify(store[key], null, 2);
    const fname = { projects: "projects.json", products: "products.json", policies: "policies.json", insights: "insights.json" }[key];
    download(fname, json);
    // 同时导出内嵌版 JS（便于替换部署）
    const varName = { projects: "window.__ZHIYU_DATA__", products: "window.__ZHIYU_PRODUCTS__", policies: "window.__ZHIYU_POLICIES__", insights: "window.__ZHIYU_INSIGHTS__" }[key];
    setTimeout(() => download(fname.replace(".json", ".js"), "/* 知予 · 内嵌数据 */\n" + varName + " = " + json + ";\n"), 700);
  }
  function renderExportRow() {
    $("exportRow").innerHTML = Object.keys(TYPES).map((k) =>
      `<button class="btn" data-export="${k}">⬇️ 导出${TYPES[k].label}（JSON + JS）</button>`).join("");
  }
  $("exportRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-export]"); if (!btn) return;
    exportType(btn.dataset.export);
  });

  function renderImportType() {
    $("importType").innerHTML = Object.keys(TYPES).map((k) =>
      `<option value="${k}" ${k === currentType ? "selected" : ""}>${TYPES[k].label}</option>`).join("");
  }
  $("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return;
    const key = $("importType").value;
    const cfg = TYPES[key];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const arr = parsed[cfg.dataKey];
        if (!Array.isArray(arr) || !arr.length) throw new Error("文件中未找到 " + cfg.dataKey + " 数组");
        if (!confirm(`导入将覆盖当前「${cfg.label}」的 ${items(key).length} 条数据（导入 ${arr.length} 条），确定继续？`)) return;
        store[key] = parsed;
        saveType(key);
        renderTypeSwitch(); renderList(); renderDashboard(); renderMeta();
        $("importMsg").innerHTML = `<div class="msg ok">✅ 导入成功：${arr.length} 条 ${cfg.label}数据</div>`;
      } catch (err) {
        $("importMsg").innerHTML = `<div class="msg err">❌ 导入失败：${esc(err.message)}</div>`;
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  $("resetBtn").addEventListener("click", () => {
    const cfg = TYPES[currentType];
    const src = cfg.source();
    if (!src) { alert("内置默认数据不可用"); return; }
    if (confirm(`恢复默认将丢失当前「${cfg.label}」的全部编辑，确定继续？`)) {
      store[currentType] = JSON.parse(JSON.stringify(src));
      localStorage.removeItem(cfg.storeKey);
      renderTypeSwitch(); renderList(); renderDashboard(); renderMeta();
      alert("已恢复默认数据");
    }
  });

  /* ============ 设置 ============ */
  $("changePinBtn").addEventListener("click", () => {
    const oldPin = $("oldPin").value, np1 = $("newPin").value, np2 = $("newPin2").value;
    if (oldPin !== getPin()) { flashPin("当前密码不正确", "err"); return; }
    if (np1.length < 4) { flashPin("新密码至少 4 位", "err"); return; }
    if (np1 !== np2) { flashPin("两次输入的新密码不一致", "err"); return; }
    localStorage.setItem(PIN_KEY, np1);
    $("oldPin").value = $("newPin").value = $("newPin2").value = "";
    flashPin("✅ 密码已修改", "ok");
  });
  function flashPin(msg, type) {
    const el = $("pinMsg"); el.className = "msg " + type; el.textContent = msg;
    setTimeout(() => { el.textContent = ""; }, 2500);
  }

  /* ============ 初始化 ============ */
  function renderAll() {
    renderTypeSwitch(); renderList(); renderDashboard(); renderMeta(); renderExportRow(); renderImportType();
  }
  loadStore();
  if (sessionStorage.getItem("zhiyu_admin_authed") === "1") showAdmin(); else showLogin();
})();
