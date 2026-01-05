const countersEl = document.querySelectorAll(".counter");

countersEl.forEach((counterEl) => {
  counterEl.innerText = "0";
  incrementCounter();
  function incrementCounter() {
    let currentNum = +counterEl.innerText;
    const dataCeil = counterEl.getAttribute("data-ceil");
    const increment = dataCeil / 15;
    currentNum = Math.ceil(currentNum + increment);

    if (currentNum < dataCeil) {
      counterEl.innerText = currentNum;
      setTimeout(incrementCounter, 60);
    } else {
      counterEl.innerText = dataCeil;
    }
  }
});


if (document.getElementsByClassName("mySlides").length > 0) {
  let slideIndex = 1;
  let autoSlideInterval;
  showSlides(slideIndex);
  startAutoSlide();

  // Next/previous controls
  function plusSlides(n) {
    clearInterval(autoSlideInterval);
    showSlides(slideIndex += n);
    startAutoSlide();
  }

  // Thumbnail image controls
  function currentSlide(n) {
    clearInterval(autoSlideInterval);
    showSlides(slideIndex = n);
    startAutoSlide();
  }

  function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" activedot", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " activedot";
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      slideIndex++;
      showSlides(slideIndex);
    }, 5000); // Change slide every 3 seconds
  }
}


const containerEl = document.querySelector(".auto-text");

const careers = ["Undergrduate..", "Web Developer..", "Programmer..", "Blogger.."];

let careerIndex = 0;

let characterIndex = 0;

updateText();

function updateText() {
  characterIndex++;
  containerEl.innerHTML = `
    <h1> I am ${careers[careerIndex].slice(0, 1) === "I" ? "an" : "a"} ${careers[
      careerIndex
    ].slice(0, characterIndex)}</h1>
    `;

  if (characterIndex === careers[careerIndex].length) {
    careerIndex++;
    characterIndex = 0;
  }

  if (careerIndex === careers.length) {
    careerIndex = 0;
  }
  setTimeout(updateText, 400);
}

function redirectToex() {
  // Replace 'destination.html' with the actual URL of the destination page
  window.location.href = 'about.html#ex';
}

function redirectToEd() {
  // Replace 'destination.html' with the actual URL of the destination page
  window.location.href = 'about.html#ed';
}
function redirectToCe() {
  // Replace 'destination.html' with the actual URL of the destination page
  window.location.href = 'about.html#ce';
}


function downloadcv() {
  // Replace 'destination.html' with the actual URL of the destination page
  window.location.href = 'https://drive.google.com/file/d/1pkWLeyfHztBT08SRTD-q8zyjBDC5mdgd/view?usp=sharing';
}
function visitblog() {
  // Replace 'destination.html' with the actual URL of the destination page
  window.location.href = 'https://bahasurunayanakantha.wordpress.com';
}



const dayEl = document.getElementById("day");
const hourEl = document.getElementById("hour");
const minuteEl = document.getElementById("minute");
const secondEl = document.getElementById("second");

const newYearTime = new Date("Jan 1, 2027 00:00:00").getTime();

updateCountdown();

function updateCountdown() {
  const now = new Date().getTime();
  const gap = newYearTime - now;

  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const d = Math.floor(gap / day);
  const h = Math.floor((gap % day) / hour);
  const m = Math.floor((gap % hour) / minute);
  const s = Math.floor((gap % minute) / second);
  dayEl.innerText = d;
  hourEl.innerText = h;
  minuteEl.innerText = m;
  secondEl.innerText = s;
  setTimeout(updateCountdown, 1000)
}

const tabs = document.querySelector(".tabs");
const btns = document.querySelectorAll(".button");
const articles = document.querySelectorAll(".content");
tabs.addEventListener("click", function (e) {
  const id = e.target.dataset.id;
  if (id) {
    // remove selected from other buttons
    btns.forEach(function (btn) {
      btn.classList.remove("live");
    });
    e.target.classList.add("live");
    // hide other articles
    articles.forEach(function (article) {
      article.classList.remove("live");
    });
    const element = document.getElementById(id);
    element.classList.add("live");
  }
});