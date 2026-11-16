/* ============ PROMPTLY — script.js ============ */
(function () {
  "use strict";

  var GCASH_NUMBER_RAW = "09927959830"; // copied to clipboard (no spaces, easy to paste in GCash)

  /* ---------- OFFICIAL PROMPT quiz settings (edit the answers here) ---------- */
  var BIRTHDAY = { month: 10, day: 5 }; // October 5
  var QUIZ = [
    { type: "birthday", text: "When is my birthday?", hint: "Type it like: October 27" },
    { type: "choice", text: "Who is my crush?", options: ["Ruellah", "Wella"], answer: "Ruellah" },
    { type: "choice", text: "What does Leo wear?", options: ["Baggy jeans", "Skinny jeans"], answer: "Baggy jeans" },
    { type: "choice", text: "What is my favorite line?", options: ["Ywa", "Yeah~"], answer: "Yeah~" },
    { type: "choice", text: "Is he handsome or not?", options: ["Handsome", "Not"], answer: "Handsome" }
  ];
  var WRONG_MESSAGES = ["Hmm, not quite. Try again! 💜", "Almost! One more try 🌷", "Nope, think harder! ✨"];

  var OFFICIAL_PROMPT = `PROMPT: Guided Critical Evaluative Essay Generator
Improved version
I need your help creating a Critical Evaluative Analysis Essay based on this video:
Video message:
"Your students don't need perfect lessons, they don't need perfect classrooms, they don't even need a perfect teacher. They need someone who is patient, consistent, and willing to keep believing in them even on the hard days. Your presence matters more than your perfection."
I want you to guide me through the writing process using multiple-choice options.
IMPORTANT: The essay must focus on ME, not merely analyze or summarize the video. The video should only serve as the starting point for my personal realization, self-evaluation, and real-life application.
STEP 1 – PERSONAL REFLECTION
Ask me multiple-choice questions and provide 4–5 possible answers for each:

1. How do I usually react when I struggle with lessons?
2. What are my expectations toward my teachers?
3. What weaknesses or attitudes have I recognized in myself?
4. What personal realization did I gain from the video?
5. What do I want to improve about myself?
6. How can I apply the lesson in my everyday life?

Allow me to choose, combine, or modify the options.
STEP 2 – INTRODUCTION
Provide possible ideas for:

* An interesting opening question.
* My personal connection to the video's message.
* My realization about myself.
* A clear thesis statement using WHAT AND WHY.

The introduction must already show my personal realization.
STEP 3 – BODY
Help me develop ONE complete body paragraph containing:

* My personal argument and self-evaluation.
* My weaknesses, experiences, or attitudes.
* Supporting explanations and real-life examples.
* A counterargument and rebuttal.
* Credible supporting evidence with citations.
* My specific real-life application.

The body must explain what I will actually change or practice in my life.
STEP 4 – CONCLUSION
Provide possible ideas for:

* Restating my thesis.
* Summarizing what I learned about myself.
* Emphasizing my personal commitment to change.
* Ending with a meaningful statement.

My realization and application must remain evident until the conclusion.
STEP 5 – FINAL ESSAY
After I select my ideas, construct my complete essay.
STRICT REQUIREMENTS:

1. Exactly THREE paragraphs:
   * Introduction
   * Body
   * Conclusion
2. Keep the essay concise, clear, and meaningful.
3. Focus on my personal experiences, realizations, weaknesses, and improvements.
4. Do not make the essay mainly about the qualities of a good teacher.
5. Make the thesis statement the central idea of the body.
6. Include arguments, counterarguments, and rebuttals.
7. Include credible evidence and citations.
8. Apply the APC-CSL strategy.
9. Use a suitable text structure, such as cause and effect.
10. Connect the introduction, body, and conclusion smoothly.
11. Include a separate APA 7th edition reference list.
12. Do not invent personal experiences, research, or references.

MOST IMPORTANT: My realization and application must be reflected throughout the introduction, body, and conclusion. The essay should answer these questions:

* What did I realize about myself?
* Why do I need to change or improve?
* What will I do to apply this realization?
* How will this help me become a better person?

Present the choices ONE SECTION AT A TIME. Wait for my answers before proceeding. Do not write the final essay until I have selected my ideas.`;
  var TIMEZONE = "Asia/Manila";

  var screens = {
    home: document.getElementById("screen-home"),
    no: document.getElementById("screen-no"),
    example: document.getElementById("screen-example"),
    official: document.getElementById("screen-official"),
    prize: document.getElementById("screen-prize"),
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
    if (name === "official") { startQuiz(); }
    if (name === "prize" && !quizPassed) { name = "official"; next = screens.official; startQuiz(); }

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

  /* ---------- Official prompt quiz ---------- */
  var quizPassed = false;
  var quizIndex = 0;
  var wrongCount = 0;
  var quizBody = document.getElementById("quiz-body");
  var quizFeedback = document.getElementById("quiz-feedback");
  var quizCount = document.getElementById("quiz-count");
  var quizHint = document.getElementById("quiz-hint");
  var quizDots = document.getElementById("quiz-dots");

  var MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

  // Understands: "October 5", "oct 5", "5 October", "October 5th, 2005", "10/5", "10-5", "5/10"
  function parseBirthday(raw) {
    var s = String(raw).toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, "$1").replace(/\b(19|20)\d{2}\b/g, " ");
    var m, d, i, found;
    s = s.replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();

    for (i = 0; i < MONTHS.length; i++) {
      var full = MONTHS[i];
      var abbr = full.slice(0, 3);
      var re = new RegExp("\\b(" + full + "|" + abbr + (full === "september" ? "|sept" : "") + ")\\b");
      if (re.test(s)) { m = i + 1; found = true; break; }
    }
    if (found) {
      var dm = s.match(/\b(\d{1,2})\b/);
      if (dm) { d = Number(dm[1]); return { month: m, day: d }; }
      return null;
    }
    var nm = s.match(/^(\d{1,2})\s*[\/\-\s]\s*(\d{1,2})$/);
    if (nm) {
      var a = Number(nm[1]), b = Number(nm[2]);
      if (a === BIRTHDAY.month && b === BIRTHDAY.day) { return { month: a, day: b }; }
      if (b === BIRTHDAY.month && a === BIRTHDAY.day) { return { month: b, day: a }; }
      return { month: a, day: b };
    }
    return null;
  }

  function isBirthdayCorrect(raw) {
    var p = parseBirthday(raw);
    return !!p && p.month === BIRTHDAY.month && p.day === BIRTHDAY.day;
  }

  function renderDots() {
    quizDots.innerHTML = "";
    QUIZ.forEach(function (_, i) {
      var dot = document.createElement("span");
      if (i < quizIndex) { dot.className = "is-done"; }
      else if (i === quizIndex) { dot.className = "is-active"; }
      quizDots.appendChild(dot);
    });
  }

  function setFeedback(text, kind) {
    quizFeedback.textContent = text || "";
    quizFeedback.className = "quiz-feedback" + (kind ? " " + kind : "");
  }

  function wrong() {
    var msg = WRONG_MESSAGES[wrongCount % WRONG_MESSAGES.length];
    wrongCount += 1;
    setFeedback(msg, "bad");
    quizBody.classList.remove("shake");
    void quizBody.offsetWidth;
    quizBody.classList.add("shake");
  }

  function correct(after) {
    setFeedback("Correct! ✨", "ok");
    var controls = quizBody.querySelectorAll("button, input");
    controls.forEach(function (c) { c.disabled = true; });
    setTimeout(after, 700);
  }

  function nextQuestion() {
    quizIndex += 1;
    if (quizIndex >= QUIZ.length) {
      quizPassed = true;
      document.getElementById("prompt-text").textContent = OFFICIAL_PROMPT;
      go("prize");
    } else {
      renderQuestion();
    }
  }

  function renderQuestion() {
    var q = QUIZ[quizIndex];
    wrongCount = 0;
    setFeedback("");
    renderDots();
    quizCount.textContent = "Question " + (quizIndex + 1) + " of " + QUIZ.length;
    document.getElementById("official-title").textContent = q.text;
    quizHint.textContent = q.hint || "Pick one.";
    quizBody.innerHTML = "";
    quizBody.classList.remove("shake");

    if (q.type === "birthday") {
      var row = document.createElement("div");
      row.className = "quiz-input-row";
      var input = document.createElement("input");
      input.type = "text";
      input.className = "quiz-input";
      input.placeholder = "e.g. October 5";
      input.setAttribute("aria-label", "My birthday");
      input.autocomplete = "off";
      var submit = document.createElement("button");
      submit.type = "button";
      submit.className = "btn btn-primary";
      submit.textContent = "CHECK";
      function check() {
        if (!input.value.trim()) { setFeedback("Type a date first 🌷", "bad"); return; }
        if (isBirthdayCorrect(input.value)) { correct(nextQuestion); } else { wrong(); }
      }
      submit.addEventListener("click", check);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(); } });
      row.appendChild(input);
      row.appendChild(submit);
      quizBody.appendChild(row);
      setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
    } else {
      var grid = document.createElement("div");
      grid.className = "quiz-options";
      q.options.forEach(function (opt) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "option-btn";
        b.textContent = opt;
        b.addEventListener("click", function () {
          if (opt === q.answer) { b.classList.add("is-right"); correct(nextQuestion); } else { wrong(); }
        });
        grid.appendChild(b);
      });
      quizBody.appendChild(grid);
    }
    quizBody.classList.remove("fade-in");
    void quizBody.offsetWidth;
    quizBody.classList.add("fade-in");
  }

  function startQuiz() {
    quizPassed = false;
    quizIndex = 0;
    renderQuestion();
  }

  function copyPrompt() {
    var btn = document.getElementById("btn-copy-prompt");
    function ok() {
      showToast("Prompt copied! ✓");
      btn.textContent = "COPIED ✓";
      btn.classList.add("copied");
      setTimeout(function () { btn.textContent = "COPY PROMPT"; btn.classList.remove("copied"); }, 2200);
    }
    function fail() { showToast("Couldn't copy. Select the text and copy it manually."); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(OFFICIAL_PROMPT).then(ok).catch(function () { if (fallbackCopy(OFFICIAL_PROMPT)) { ok(); } else { fail(); } });
    } else if (fallbackCopy(OFFICIAL_PROMPT)) { ok(); } else { fail(); }
  }

  /* ---------- Wire up buttons ---------- */
  document.getElementById("btn-official").addEventListener("click", function () { go("official"); });
  document.getElementById("btn-copy-prompt").addEventListener("click", copyPrompt);
  document.getElementById("btn-yes").addEventListener("click", function () { go("payment"); });
  document.getElementById("btn-no").addEventListener("click", function () { go("no"); });
  document.getElementById("btn-example").addEventListener("click", function () { go("example"); });

  // Show a friendly note if example.png is missing
  var exampleImg = document.getElementById("example-img");
  var exampleMissing = document.getElementById("example-missing");
  // Tries these names in order, so a double extension still works
  var imageCandidates = ["example.png", "example.png.png", "example.jpg", "example.jpeg"];
  var imageIndex = 0;
  function imageMissing() {
    imageIndex += 1;
    if (imageIndex < imageCandidates.length) {
      exampleImg.src = imageCandidates[imageIndex];
    } else {
      exampleImg.hidden = true;
      exampleMissing.hidden = false;
    }
  }
  exampleImg.addEventListener("error", imageMissing);
  if (exampleImg.complete && exampleImg.naturalWidth === 0) { imageMissing(); }
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
