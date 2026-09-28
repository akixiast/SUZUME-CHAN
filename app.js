/* suzume - daily anime draw challenge (vanilla JS, no build step) */

const STORAGE_KEY = "suzume.gallery";
const HISTORY_LIMIT = 30;
const CANVAS_BG = "#0e0f11"; // dark paper

/* ---------------- helpers ---------------- */

const $ = (id) => document.getElementById(id);

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function prettyDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysBetween(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000
  );
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/* ---------------- navigation ---------------- */

function showSection(name) {
  document.querySelectorAll(".section").forEach((s) => {
    s.classList.toggle("is-active", s.id === name);
  });
  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.section === name);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => showSection(btn.dataset.section));
});

/* ---------------- today ---------------- */

const dateKey = todayKey();
const dayIndex = Math.floor(
  (new Date().setHours(0, 0, 0, 0) - new Date(new Date().getFullYear(), 0, 0)) / 86400000
);
const todayPrompt = PROMPTS[dayIndex % PROMPTS.length];

$("today-date").textContent = prettyDate(dateKey);
$("prompt-title").textContent = todayPrompt.title;
$("prompt-description").textContent = todayPrompt.description;

const diffEl = $("prompt-difficulty");
diffEl.textContent = todayPrompt.difficulty;

$("prompt-time").textContent = todayPrompt.timeMinutes + " min";
$("draw-prompt-note").textContent = `Drawing: ${todayPrompt.title}`;

/* ---------------- draw mode: digital vs paper ---------------- */

let drawMode = "digital"; // "digital" | "paper"

function setDrawMode(mode) {
  drawMode = mode;
  const digital = mode === "digital";
  $("mode-digital-btn").classList.toggle("is-active", digital);
  $("mode-paper-btn").classList.toggle("is-active", !digital);
  $("digital-pane").hidden = !digital;
  $("paper-pane").hidden = digital;
  $("submit-hint").hidden = true;
}

$("mode-digital-btn").addEventListener("click", () => setDrawMode("digital"));
$("mode-paper-btn").addEventListener("click", () => setDrawMode("paper"));

$("start-digital-btn").addEventListener("click", () => {
  setDrawMode("digital");
  showSection("draw");
});
$("start-paper-btn").addEventListener("click", () => {
  setDrawMode("paper");
  showSection("draw");
});

/* ---------------- today: AniList reference inspo ---------------- */

let customChallenge = null; // set when user picks an Explore card

if (todayPrompt.anime) {
  aniSearchAnime(todayPrompt.anime).then((media) => {
    if (!media) return;
    const box = $("prompt-ref");
    const img = $("prompt-ref-img");
    img.src = media.coverImage.large || media.coverImage.medium;
    img.alt = aniTitle(media.title) + " cover";
    $("prompt-ref-title").textContent =
      aniTitle(media.title) +
      (media.seasonYear ? ` (${media.seasonYear})` : "") +
      (media.averageScore ? ` — ${media.averageScore}%` : "");
    const link = $("prompt-ref-link");
    link.href = media.siteUrl;
    link.textContent = "View " + aniTitle(media.title) + " on AniList →";
    box.hidden = false;
  });
}

/* ---------------- explore: trending on AniList ---------------- */

let exploreLoaded = false;

function exploreCard(media) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "explore-card";
  card.innerHTML = `
    <img loading="lazy" alt="">
    <p class="explore-title"></p>
    <p class="explore-sub"></p>
  `;
  const img = card.querySelector("img");
  img.src = media.coverImage.large || media.coverImage.medium;
  img.alt = aniTitle(media.title) + " cover";
  card.querySelector(".explore-title").textContent = aniTitle(media.title);
  card.querySelector(".explore-sub").textContent =
    (media.seasonYear || "—") +
    (media.averageScore ? ` · ${media.averageScore}%` : "");
  card.addEventListener("click", () => {
    customChallenge = {
      title: "Draw " + aniTitle(media.title),
      anime: aniTitle(media.title),
      media,
    };
    $("prompt-title").textContent = customChallenge.title;
    $("prompt-description").textContent =
      `Bonus challenge — draw ${aniTitle(media.title)} in your own style. ` +
      `Use the cover below as inspo, then hit Start drawing.`;
    const box = $("prompt-ref");
    const refImg = $("prompt-ref-img");
    refImg.src = media.coverImage.large || media.coverImage.medium;
    refImg.alt = aniTitle(media.title) + " cover";
    $("prompt-ref-title").textContent =
      aniTitle(media.title) +
      (media.seasonYear ? ` (${media.seasonYear})` : "") +
      (media.averageScore ? ` — ${media.averageScore}%` : "");
    const link = $("prompt-ref-link");
    link.href = media.siteUrl;
    link.textContent = "View " + aniTitle(media.title) + " on AniList →";
    box.hidden = false;
    $("draw-prompt-note").textContent = `Drawing: ${customChallenge.title}`;
    showSection("today");
  });
  return card;
}

async function loadExplore(force = false) {
  const grid = $("explore-grid");
  const status = $("explore-status");
  status.hidden = false;
  status.textContent = "Loading trending anime…";
  grid.innerHTML = "";
  try {
    const list = await aniTrending(12, force);
    grid.innerHTML = "";
    list.forEach((media) => grid.appendChild(exploreCard(media)));
    status.hidden = true;
    exploreLoaded = true;
  } catch {
    status.textContent =
      "Could not reach AniList (offline or rate limited). Try Refresh.";
  }
}

$("explore-refresh").addEventListener("click", () => loadExplore(true));

// Lazy-load explore the first time user opens it
document
  .querySelector('.nav-btn[data-section="explore"]')
  .addEventListener("click", () => {
    if (!exploreLoaded) loadExplore(false);
  });

/* ---------------- canvas (digital) ---------------- */

const canvas = $("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = CANVAS_BG;
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineCap = "round";
ctx.lineJoin = "round";

let tool = "pen";
let color = "#f7f8f8";
let size = 8;
let drawing = false;
let last = null;
let history = [];

function snapshot() {
  history.push(canvas.toDataURL("image/png"));
  if (history.length > HISTORY_LIMIT) history.shift();
  $("undo-btn").disabled = history.length === 0;
}

function restore(dataUrl) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = dataUrl;
}

function pos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function startDraw(e) {
  drawing = true;
  last = pos(e);
  snapshot();
}

function moveDraw(e) {
  if (!drawing) return;
  const p = pos(e);
  ctx.strokeStyle = tool === "eraser" ? CANVAS_BG : color;
  ctx.lineWidth = tool === "eraser" ? size * 2.5 : size;
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  last = p;
}

function endDraw() {
  drawing = false;
  last = null;
}

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  startDraw(e);
});
canvas.addEventListener("pointermove", moveDraw);
canvas.addEventListener("pointerup", endDraw);
canvas.addEventListener("pointercancel", endDraw);
canvas.addEventListener("pointerleave", endDraw);

/* tools */

function setTool(next) {
  tool = next;
  $("pen-btn").classList.toggle("is-active", next === "pen");
  $("eraser-btn").classList.toggle("is-active", next === "eraser");
}

$("pen-btn").addEventListener("click", () => setTool("pen"));
$("eraser-btn").addEventListener("click", () => setTool("eraser"));

$("color-input").addEventListener("input", (e) => {
  color = e.target.value;
  if (tool === "eraser") setTool("pen");
});

$("size-input").addEventListener("change", (e) => {
  size = Number(e.target.value);
});

$("undo-btn").addEventListener("click", () => {
  history.pop();
  if (history.length) restore(history[history.length - 1]);
  else {
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  $("undo-btn").disabled = history.length === 0;
});

$("clear-btn").addEventListener("click", () => {
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  history = [];
  $("undo-btn").disabled = true;
  $("submit-hint").hidden = true;
});

function canvasIsBlank() {
  const [br, bg, bb] = hexToRgb(CANVAS_BG);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 0; i < data.length; i += 41 * 4) {
    if (data[i] !== br || data[i + 1] !== bg || data[i + 2] !== bb) return false;
  }
  return true;
}

/* ---------------- timer ---------------- */

let durationSeconds = 30 * 60;
let remaining = durationSeconds;
let tick = null;

function paintTimer() {
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  const el = $("timer-display");
  el.textContent = `${m}:${s}`;
  el.classList.toggle("is-over", remaining === 0);
}

function startTimer() {
  if (tick) return;
  if (remaining === 0) remaining = durationSeconds;
  $("timer-display").classList.add("is-running");
  tick = setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    paintTimer();
    if (remaining === 0) {
      clearInterval(tick);
      tick = null;
      $("timer-display").classList.remove("is-running");
    }
  }, 1000);
}

function pauseTimer() {
  if (!tick) return;
  clearInterval(tick);
  tick = null;
  $("timer-display").classList.remove("is-running");
}

function resetTimer() {
  pauseTimer();
  remaining = durationSeconds;
  paintTimer();
}

$("duration-input").addEventListener("change", (e) => {
  durationSeconds = Number(e.target.value) * 60;
  resetTimer();
});
$("timer-start-btn").addEventListener("click", startTimer);
$("timer-pause-btn").addEventListener("click", pauseTimer);
$("timer-reset-btn").addEventListener("click", resetTimer);

paintTimer();

/* ---------------- paper photo upload ---------------- */

let paperImage = null; // compressed dataURL ready for gallery

function fileToGalleryImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // downscale to max 1200px side, export JPEG for storage
      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      off.getContext("2d").drawImage(img, 0, 0, w, h);
      paperImage = off.toDataURL("image/jpeg", 0.82);

      const preview = $("paper-preview");
      preview.src = paperImage;
      preview.hidden = false;
      $("drop-empty").hidden = true;
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

$("photo-input").addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) fileToGalleryImage(file);
});

$("paper-change-btn").addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  $("photo-input").click();
});

$("paper-remove-btn").addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  paperImage = null;
  $("photo-input").value = "";
  $("paper-preview").hidden = true;
  $("paper-preview").removeAttribute("src");
  $("drop-empty").hidden = false;
});

// drag & drop onto the zone
const dropzone = $("dropzone");
["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("is-drag");
  })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-drag");
  })
);
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) fileToGalleryImage(file);
});

/* ---------------- storage ---------------- */

function loadGallery() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGallery(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    alert("Could not save — this browser's storage is full or blocked.");
  }
}

/* ---------------- submit ---------------- */

$("submit-btn").addEventListener("click", () => {
  const hint = $("submit-hint");
  let image = null;
  let mode = drawMode;

  if (drawMode === "digital") {
    if (canvasIsBlank()) {
      hint.textContent = "Digital canvas is empty — draw something first, or switch to Paper upload.";
      hint.hidden = false;
      return;
    }
    image = canvas.toDataURL("image/jpeg", 0.85);
  } else {
    if (!paperImage) {
      hint.textContent = "No paper photo yet — drop a photo or click the box to browse.";
      hint.hidden = false;
      return;
    }
    image = paperImage;
  }

  const items = loadGallery();
  items.unshift({
    id: Date.now(),
    image,
    title: customChallenge ? customChallenge.title : todayPrompt.title,
    date: dateKey,
    mode,
  });
  saveGallery(items);

  hint.textContent = "Saved to gallery.";
  hint.hidden = false;

  renderGallery();
  showSection("gallery");
});

/* ---------------- gallery ---------------- */

function streakFrom(dates) {
  const unique = [...new Set(dates)].sort().reverse();
  if (!unique.length) return 0;

  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    if (daysBetween(unique[i], unique[i - 1]) === 1) streak++;
    else break;
  }
  return streak;
}

function renderGallery() {
  const items = loadGallery();
  const grid = $("gallery-grid");
  grid.innerHTML = "";

  $("gallery-empty").hidden = items.length > 0;
  $("streak-count").textContent = streakFrom(items.map((i) => i.date));

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `
      <img src="${item.image}" alt="">
      <h3></h3>
      <span class="gallery-date"></span>
      <span class="mode-tag"></span>
      <button class="delete-btn" type="button">Delete</button>
    `;
    card.querySelector("img").alt = item.title;
    card.querySelector("h3").textContent = item.title;
    card.querySelector(".gallery-date").textContent = prettyDate(item.date);
    card.querySelector(".mode-tag").textContent =
      item.mode === "paper" ? "▦ paper" : "✒ digital";
    card.querySelector(".delete-btn").addEventListener("click", () => {
      if (!confirm(`Delete "${item.title}" from ${prettyDate(item.date)}?`)) return;
      saveGallery(loadGallery().filter((i) => i.id !== item.id));
      renderGallery();
    });
    grid.appendChild(card);
  });
}

renderGallery();
