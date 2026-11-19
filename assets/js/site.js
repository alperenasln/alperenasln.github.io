(function () {
  "use strict";
  var root = document.documentElement;

  /* Theme toggle (persisted per viewer; page works without storage) */
  var KEY = "aa-theme";
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  var themeBtn = document.getElementById("theme-toggle");
  function syncLabel() {
    if (!themeBtn) return;
    var dark = isDark();
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    var icon = themeBtn.querySelector(".ph");
    if (icon) icon.className = "ph " + (dark ? "ph-sun" : "ph-moon");
  }
  syncLabel();
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    syncLabel();
  });

  /* Mobile menu */
  var hdr = document.querySelector(".hdr");
  var menuBtn = document.getElementById("menu-toggle");
  if (hdr && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = hdr.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    hdr.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        hdr.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open menu");
      });
    });
  }

  var hasIO = "IntersectionObserver" in window;

  /* Active nav link */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if (hasIO && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = "#" + e.target.id;
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* Reveal on scroll (content is visible without JS) */
  var rv = document.querySelectorAll(".rv");
  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* Contact form → Formspree, errors next to fields */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (form && window.fetch) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) {
        var bad = form.querySelector(":invalid");
        if (bad) { bad.focus(); bad.reportValidity(); }
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      status.className = "status";
      status.textContent = "Sending…";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("status " + r.status);
          form.reset();
          status.className = "status ok";
          status.textContent = "Sent. I'll get back to you soon.";
        })
        .catch(function () {
          status.className = "status err";
          status.textContent = "Could not send. Please email me directly.";
        })
        .then(function () { btn.disabled = false; });
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
