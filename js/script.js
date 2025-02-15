// Menu Controller
class MenuController {
  constructor() {
    this.nav = document.querySelector(".main-nav");
    this.menuToggle = document.querySelector(".menu-toggle");
    this.fullMenu = document.querySelector(".full-menu");
    this.menuLinks = document.querySelectorAll(".menu-links a");
    this.isMenuOpen = false;

    this.init();
  }

  init() {
    if (this.menuToggle && this.fullMenu) {
      this.menuToggle.addEventListener("click", () => this.toggleMenu());
      this.menuLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetId = link.getAttribute("href");
          this.closeMenu();
          setTimeout(() => {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              // Use standard smooth scrolling
              targetElement.scrollIntoView({ behavior: "smooth" });
            }
          }, 500);
        });
      });
    }

    window.addEventListener("scroll", () => this.handleScroll());
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuToggle.classList.toggle("active");
    this.fullMenu.classList.toggle("active");
    document.body.style.overflow = this.isMenuOpen ? "hidden" : "";
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.menuToggle.classList.remove("active");
    this.fullMenu.classList.remove("active");
    document.body.style.overflow = "";
  }

  handleScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    this.nav.style.opacity = st > 100 ? "1" : "0.7";

    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }
}

// Gradient Animation Controller
class GradientController {
  constructor() {
    this.gradientShape = document.querySelector(".gradient-shape");
    this.mouse = { x: 0, y: 0 };
    this.lastMouse = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.baseRotation = 0;
    this.isActive = true;

    this.init();
  }

  init() {
    if (this.gradientShape) {
      document.addEventListener("mousemove", (e) => {
        if (this.isActive) {
          this.mouse.x = e.clientX / window.innerWidth;
          this.mouse.y = e.clientY / window.innerHeight;
        }
      });

      document.addEventListener("visibilitychange", () => {
        this.isActive = !document.hidden;
      });

      this.animate();
    }
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  animate() {
    if (this.isActive) {
      this.velocity.x = this.lerp(
        this.velocity.x,
        (this.mouse.x - this.lastMouse.x) * 0.1,
        0.1
      );
      this.velocity.y = this.lerp(
        this.velocity.y,
        (this.mouse.y - this.lastMouse.y) * 0.1,
        0.1
      );

      this.lastMouse.x = this.mouse.x;
      this.lastMouse.y = this.mouse.y;

      this.baseRotation += 0.1;

      const rotateX = this.velocity.y * 20;
      const rotateY = this.velocity.x * -20;
      const scale = 1 + Math.abs(this.velocity.x + this.velocity.y) * 0.5;

      const transform = `
            rotate(${this.baseRotation}deg)
            scale(${scale})
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
          `;

      this.gradientShape.style.transform = transform;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Work Section Controller with Improved Scrolling
class WorkController {
  constructor() {
    this.container = document.querySelector(".work-scroll");
    this.track = document.querySelector(".work-track");
    this.isResetting = false;
    this.scrollSpeed = 1;
    this.projects = [
      {
        title: "AI Analytics Platform",
        description: "Data Processing & Visualization",
        image: "/api/placeholder/400/250",
      },
      {
        title: "Smart Factory System",
        description: "Industrial IoT Solution",
        image: "/api/placeholder/400/250",
      },
      {
        title: "Predictive Maintenance",
        description: "Machine Learning Implementation",
        image: "/api/placeholder/400/250",
      },
      {
        title: "Supply Chain Optimization",
        description: "AI-Powered Logistics",
        image: "/api/placeholder/400/250",
      },
      {
        title: "Customer Experience Platform",
        description: "NLP & Sentiment Analysis",
        image: "/api/placeholder/400/250",
      },
    ];

    this.init();
  }

  init() {
    if (this.container && this.track) {
      this.createProjects();
      this.setupScroll();
      this.startAutoScroll();
    }
  }

  createProjects() {
    // Create initial projects
    this.projects.forEach((project) => {
      this.track.appendChild(this.createProjectCard(project));
    });

    // Clone projects for infinite scroll
    this.projects.forEach((project) => {
      this.track.appendChild(this.createProjectCard(project));
    });
  }

  createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "work-card";
    card.innerHTML = `
          <div class="work-info">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
          </div>
          <div class="work-image">
            <img src="${project.image}" alt="${project.title}" loading="lazy" />
          </div>
        `;
    return card;
  }

  setupScroll() {
    let isDragging = false;
    let startPos = 0;
    let scrollLeft = 0;
    let scrollVelocity = 0;
    let lastScrollLeft = 0;

    const handleDragStart = (e) => {
      isDragging = true;
      startPos = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
      scrollLeft = this.container.scrollLeft;
      lastScrollLeft = scrollLeft;
      this.container.style.cursor = "grabbing";
      this.pauseAutoScroll();
    };

    const handleDragMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
      const walk = (x - startPos) * 2;
      this.container.scrollLeft = scrollLeft - walk;

      // Calculate scroll velocity
      scrollVelocity = this.container.scrollLeft - lastScrollLeft;
      lastScrollLeft = this.container.scrollLeft;
    };

    const handleDragEnd = () => {
      isDragging = false;
      this.container.style.cursor = "grab";

      // Adjust auto-scroll speed based on user interaction
      this.scrollSpeed = Math.min(Math.abs(scrollVelocity * 0.1), 2);
      if (this.scrollSpeed < 0.5) this.scrollSpeed = 1;

      this.startAutoScroll();
    };

    // Mouse events
    this.container.addEventListener("mousedown", handleDragStart);
    this.container.addEventListener("mousemove", handleDragMove);
    this.container.addEventListener("mouseup", handleDragEnd);
    this.container.addEventListener("mouseleave", handleDragEnd);

    // Touch events
    this.container.addEventListener("touchstart", handleDragStart);
    this.container.addEventListener("touchmove", handleDragMove);
    this.container.addEventListener("touchend", handleDragEnd);

    // Improved scroll handling
    this.container.addEventListener("scroll", () => {
      if (this.isResetting) return;

      const scrollWidth = this.track.scrollWidth / 2;
      if (this.container.scrollLeft >= scrollWidth) {
        this.isResetting = true;
        requestAnimationFrame(() => {
          this.container.scrollLeft = 1;
          this.isResetting = false;
        });
      }
    });
  }

  startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      if (!this.container.matches(":hover") && !this.isResetting) {
        this.container.scrollLeft += this.scrollSpeed;

        if (this.container.scrollLeft >= this.track.scrollWidth / 2) {
          this.isResetting = true;
          requestAnimationFrame(() => {
            this.container.scrollLeft = 1;
            this.isResetting = false;
          });
        }
      }
    }, 20);
  }

  pauseAutoScroll() {
    clearInterval(this.autoScrollInterval);
  }
}

// Intersection Observer for Animations
class AnimationController {
  constructor() {
    this.init();
  }

  init() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    }, options);

    document
      .querySelectorAll(
        ".work-card, .about-content, .contact-content, .title-row"
      )
      .forEach((el) => {
        observer.observe(el);
      });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MenuController();
  new GradientController();
  new WorkController();
  new AnimationController();
});
