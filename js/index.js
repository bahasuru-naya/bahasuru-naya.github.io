// ─── Counter Animations  ───────────────────────────
const countersEl = document.querySelectorAll(".counter");

countersEl.forEach((counterEl) => {
  const dataCeil = +counterEl.getAttribute("data-ceil");
  const suffix = counterEl.innerText.includes('+') ? '+' : ''; // preserve + sign
  let startTime = null;
  const duration = 1200; // ms

  counterEl.innerText = "0";

  function animateCounter(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    counterEl.innerText = Math.ceil(eased * dataCeil) + (progress < 1 ? '' : suffix);
    if (progress < 1) requestAnimationFrame(animateCounter);
  }

  requestAnimationFrame(animateCounter);
});


// ─── Typing / Auto-text Animation ────────────────────────────────────────────
const containerEl = document.querySelector(".auto-text");

if (containerEl) {
  const careers = ["Learner...","AI/ML Enthusiast...", "Web Developer...", "Programmer...", "Researcher...", "Problem Solver..."];
  let careerIndex = 0;
  let characterIndex = 0;
  let lastTyped = 0;
  const typingDelay = 130; // ms per character

  function typingLoop(timestamp) {
    if (timestamp - lastTyped >= typingDelay) {
      lastTyped = timestamp;
      characterIndex++;
      const word = careers[careerIndex];
      const article = word[0] === 'I' ? 'an' : 'a';
      containerEl.innerHTML = `<h1> I am ${article} ${word.slice(0, characterIndex)}</h1>`;

      if (characterIndex >= word.length) {
        careerIndex = (careerIndex + 1) % careers.length;
        characterIndex = 0;
      }
    }
    requestAnimationFrame(typingLoop);
  }

  requestAnimationFrame(typingLoop);
}

// ─── Navigation helpers ───────────────────────────────────────────────────────
function redirectToex() { window.location.href = 'about.html#ex'; }
function redirectToEd() { window.location.href = 'about.html#ed'; }
function redirectToCe() { window.location.href = 'about.html#ce'; }
function downloadcv() { window.location.href = 'https://drive.google.com/file/d/1pkWLeyfHztBT08SRTD-q8zyjBDC5mdgd/view?usp=sharing'; }

// ─── Graduation Countdown ─────────────────────────────────────────────────────
const dayEl = document.getElementById("day");
const hourEl = document.getElementById("hour");
const minuteEl = document.getElementById("minute");
const secondEl = document.getElementById("second");

if (dayEl && hourEl && minuteEl && secondEl) {
  const target = new Date("Jan 1, 2027 00:00:00").getTime();

  function updateCountdown() {
    const gap = target - Date.now();
    const s = 1000, m = s * 60, h = m * 60, d = h * 24;
    dayEl.innerText = Math.floor(gap / d);
    hourEl.innerText = Math.floor((gap % d) / h);
    minuteEl.innerText = Math.floor((gap % h) / m);
    secondEl.innerText = Math.floor((gap % m) / s);
    setTimeout(updateCountdown, 1000);
  }

  updateCountdown();
}

// ─── Tab Switcher ─────────────────────────────────────────────────────────────
const tabsEl = document.querySelector(".tabs");
const btns = document.querySelectorAll(".button");
const articles = document.querySelectorAll(".content");

if (tabsEl) {
  tabsEl.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    btns.forEach(btn => btn.classList.remove("live"));
    e.target.classList.add("live");
    articles.forEach(article => article.classList.remove("live"));
    const el = document.getElementById(id);
    if (el) el.classList.add("live");
  });
}

// project count
// Dynamically count projects from projects.html
async function updateProjectCount() {
  try {
    const response = await fetch('projects.html');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const projectCount = doc.querySelectorAll('span#noofproject').length;

    // Update counter in stats
    const counter = document.querySelector('.stats-container .counter');
    if (counter) {
      counter.textContent = projectCount;
      counter.setAttribute('data-ceil', String(projectCount).padStart(2, '0'));
    }

    // Update navbar badge
    const navBadge = document.querySelector('.project-badge');
    if (navBadge) {
      navBadge.textContent = projectCount + "+";
    }
  } catch (error) {
    console.log('Could not fetch project count automatically');
  }
}

// Call on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateProjectCount);
} else {
  updateProjectCount();
}