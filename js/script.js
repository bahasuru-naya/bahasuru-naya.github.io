const preloader = document.querySelector(".preloader");
window.addEventListener("load", () => {
  preloader.style.opacity = "0";
  preloader.style.visibility = "hidden";
  setTimeout(() => {
    preloader.style.zIndex = "-999";
  }, 500);

  // Initialize reveal animations after load
  initRevealAnimations();
  
  // Initialize galaxy star field
  initGalaxyStars();
});

// Galaxy Star Field Animation
function initGalaxyStars() {
  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Star class
  class Star {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = Math.random() * 0.1 - 0.05;
      this.speedX = Math.random() * 0.1 - 0.05;
      
      // Color variations matching theme
      const colorType = Math.random();
      if (colorType < 0.5) {
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.6})`;
      } else if (colorType < 0.75) {
        this.color = `rgba(99, 102, 241, ${Math.random() * 0.6 + 0.5})`; // indigo
      } else if (colorType < 0.9) {
        this.color = `rgba(139, 92, 246, ${Math.random() * 0.6 + 0.5})`; // purple
      } else {
        this.color = `rgba(34, 211, 238, ${Math.random() * 0.6 + 0.5})`; // cyan
      }
      
      this.opacity = Math.random() * 0.4 + 0.7;
      this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
    }
    
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      
      // Twinkle effect
      this.opacity += this.twinkleSpeed * this.twinkleDirection;
      if (this.opacity <= 0.5 || this.opacity >= 1) {
        this.twinkleDirection *= -1;
      }
      
      // Reset if out of bounds
      if (this.y < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
        this.reset();
      }
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = this.color;
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Create stars
  const stars = [];
  const starCount = Math.min(500, Math.floor((canvas.width * canvas.height) / 3000));
  
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
      star.update();
      star.draw();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Scroll reveal animation
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.descrip, .blog, .featureproject, .section-center, .countdown, .lhe');

  const revealOnScroll = () => {
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementTop < windowHeight - 100) {
        element.classList.add('reveal', 'active');
      }
    });
  };

  // Initial check
  revealOnScroll();

  // Add scroll listener
  window.addEventListener('scroll', revealOnScroll, { passive: true });
}



// Get the button:
let mybutton = document.getElementById("myBtn");
let nav = document.getElementsByClassName("navbar");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
    if (nav[0]) nav[0].style.backdropFilter = "blur(10px)";
  } else {
    mybutton.style.display = "none";
    if (nav[0]) nav[0].style.backdropFilter = "blur(1px)";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}




