/* ============ PROMPTLY — script.js ============ */
(function () {
  "use strict";

  var GCASH_NUMBER_RAW = "09927959830"; // copied to clipboard (no spaces, easy to paste in GCash)
  var TIMEZONE = "Asia/Manila";

  var screens = {
    home: document.getElementById("screen-home"),
    no: document.getElementById("screen-no"),
    payment: document.getElementById("screen-payment"),
    gcash: document.getElementById("screen-gcash"),
    personal: document.getElementById("screen-personal")
  };
  var progressItems = document.querySelectorAll("#progress li");
  var toastEl = document.getElementById("toast");
  var copyBtn = document.getElementById("btn-copy");
  var copyLabel = document.getElementById("copy-label");
  var current = "home";
  var toastTimer = null;
  var copyTimer = null;

  /* ---------- Date: tomorrow in Asia/Manila ---------- */
  function getTomorrowInManila() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    // Build the calendar date at UTC noon, add one day (safe across month/year ends)
    var tomorrow = new Date(Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day) + 1, 12));
    return tomorrow;
  }

  function fmt(date, options) {
    options.timeZone = "UTC"; // the date was built from Manila calendar parts, stored in UTC
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  function fillTomorrow() {
    var d = getTomorrowInManila();
    document.getElementById("tomorrow-date").textContent =
      fmt(d, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    document.getElementById("cal-month").textContent = fmt(d, { month: "short" }).toUpperCase();
    document.getElementById("cal-day").textContent = fmt(d, { day: "numeric" });
    document.getElementById("cal-weekday").textContent = fmt(d, { weekday: "long" });
  }

  /* ---------- Progress ---------- */
  function updateProgress(step) {
    progressItems.forEach(function (li) {
      var n = Number(li.getAttribute("data-step"));
      li.classList.toggle("is-done", n < step);
      li.classList.toggle("is-active", n === step);
      if (n === step) { li.setAttribute("aria-current", "step"); } else { li.removeAttribute("aria-current"); }
    });
  }

  /* ---------- Navigation ---------- */
  function show(name, pushHistory) {
    if (!screens[name]) { name = "home"; }
    var prev = screens[current];
    var next = screens[name];

    if (name === "personal") { fillTomorrow(); }

    if (prev && prev !== next) { prev.hidden = true; }
    next.hidden = false;
    // restart the entrance animation
    next.style.animation = "none";
    void next.offsetWidth;
    next.style.animation = "";

    current = name;
    updateProgress(Number(next.getAttribute("data-step")));

    if (pushHistory !== false) {
      try { history.pushState({ screen: name }, "", location.pathname + location.search); } catch (e) { /* ignore */ }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    var heading = next.querySelector("h1, h2");
    if (heading) { heading.focus({ preventScroll: true }); }
  }

  function go(name) {
    var prev = screens[current];
    if (!prev) { show(name); return; }
    prev.classList.add("leaving");
    setTimeout(function () {
      prev.classList.remove("leaving");
      show(name);
    }, 220);
  }

  /* ---------- Toast ---------- */
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- Copy to clipboard ---------- */
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyNumber() {
    function success() {
      showToast("GCash number copied! ✓");
      copyBtn.classList.add("copied");
      copyLabel.textContent = "COPIED ✓";
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () {
        copyBtn.classList.remove("copied");
        copyLabel.textContent = "COPY GCASH NUMBER";
      }, 2200);
    }
    function failure() {
      showToast("Couldn't copy. Please long-press the number to copy.");
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(GCASH_NUMBER_RAW).then(success).catch(function () {
        if (fallbackCopy(GCASH_NUMBER_RAW)) { success(); } else { failure(); }
      });
    } else if (fallbackCopy(GCASH_NUMBER_RAW)) {
      success();
    } else {
      failure();
    }
  }

  /* ---------- Wire up buttons ---------- */
  document.getElementById("btn-yes").addEventListener("click", function () { go("payment"); });
  document.getElementById("btn-no").addEventListener("click", function () { go("no"); });
  document.getElementById("pay-online").addEventListener("click", function () { go("gcash"); });
  document.getElementById("pay-personal").addEventListener("click", function () { go("personal"); });
  document.getElementById("btn-done").addEventListener("click", function () { go("home"); });
  copyBtn.addEventListener("click", copyNumber);

  // Generic back / navigation buttons: <button data-go="home">
  document.querySelectorAll("[data-go]").forEach(function (btn) {
    btn.addEventListener("click", function () { go(btn.getAttribute("data-go")); });
  });

  // Brand link goes home without reloading the page
  document.getElementById("brand-link").addEventListener("click", function (e) {
    e.preventDefault();
    if (current !== "home") { go("home"); }
  });

  // Browser/phone back button support (no page reloads)
  window.addEventListener("popstate", function (e) {
    var name = e.state && e.state.screen ? e.state.screen : "home";
    show(name, false);
  });

  // Initial state
  try { history.replaceState({ screen: "home" }, "", location.pathname + location.search); } catch (e) { /* ignore */ }
  updateProgress(1);
})();
