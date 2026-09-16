/* 知予 · Hero 轮播（三张图，3 秒自动切换） */
(function () {
  "use strict";
  const slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  const dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  const carousel = document.getElementById("heroCarousel");
  if (slides.length < 2) return;

  const INTERVAL = 3000;   // 3 秒切换间隔
  let index = 0;
  let timer = null;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === index));
    dots.forEach((d, k) => d.classList.toggle("active", k === index));
  }
  function start() {
    stop();
    timer = setInterval(() => show(index + 1), INTERVAL);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // 点击指示点手动切换，并重新计时
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { show(i); start(); });
  });

  // 鼠标悬停时暂停，移开后继续
  if (carousel) {
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
  }

  // 页面切到后台时暂停，省电
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else start();
  });

  start();
})();
