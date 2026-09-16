/* 知予 · 商务合作表单 */
(function () {
  "use strict";
  const api = window.medbeautyAPI;
  const form = document.getElementById("bookingForm");
  const msg = document.getElementById("bkMsg");
  const submitBtn = document.getElementById("bkSubmit");

  function show(text, ok) {
    msg.className = "msg " + (ok ? "ok" : "err");
    msg.textContent = text;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const company = document.getElementById("bkCompany").value.trim();
    const contact = document.getElementById("bkContact").value.trim();
    const phone = document.getElementById("bkPhone").value.trim();
    const type = document.getElementById("bkType").value;
    const message = document.getElementById("bkMessage").value.trim();

    if (!contact) { show("请填写联系人", false); return; }
    if (!/^[0-9+\-\s]{6,20}$/.test(phone)) { show("请填写有效的联系电话（手机号或微信号）", false); return; }
    if (!api || !api.enabled) { show("提交服务暂时不可用，请稍后再试或通过其他方式联系我们", false); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "提交中…";
    // 复用 appointments 表字段：name=联系人, phone=电话, project=合作类型, city=公司名称, note=需求说明
    try {
      await api.submitAppointment({
        name: contact,
        phone: phone,
        project: type || null,
        city: company || null,
        note: message || null,
      });
      form.reset();
      show("✅ 提交成功！我们会在 1-2 个工作日内联系你。", true);
    } catch (err) {
      show("提交失败：" + (err.message || "请稍后重试"), false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "提交合作需求";
    }
  });
})();
