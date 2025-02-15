// -------------------------
// Menu Controller (unchanged)
// -------------------------
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

// -------------------------
// Gradient Animation Controller (unchanged)
// -------------------------
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

// -------------------------
// Work Section Controller (Interactive Panels)
// Revised to animate the same card element for opening/closing
// -------------------------
class WorkController {
  constructor() {
    this.container = document.querySelector(".work-scroll");
    this.track = document.querySelector(".work-track");
    this.autoScrollActive = true;
    this.scrollSpeed = 1;
    this.isResetting = false;
    this.projects = [
      {
        title: "AI Analytics Platform",
        description: "Data Processing & Visualization",
        image: "https://via.placeholder.com/400x250",
      },
      {
        title: "Smart Factory System",
        description: "Industrial IoT Solution",
        image: "https://via.placeholder.com/400x250",
      },
      {
        title: "Predictive Maintenance",
        description: "Machine Learning Implementation",
        image: "https://via.placeholder.com/400x250",
      },
      {
        title: "Supply Chain Optimization",
        description: "AI-Powered Logistics",
        image: "https://via.placeholder.com/400x250",
      },
      {
        title: "Customer Experience Platform",
        description: "NLP & Sentiment Analysis",
        image: "https://via.placeholder.com/400x250",
      },
    ];

    // For panel expansion
    this.currentCard = null;
    this.originalParent = null;
    this.originalNextSibling = null;
    this.originalRect = null;

    this.init();
  }

  init() {
    if (this.container && this.track) {
      // Create project cards (first instance)
      this.projects.forEach((project, index) => {
        const card = this.createProjectCard(project, index);
        this.track.appendChild(card);
      });
      // Clone projects for infinite scroll
      this.projects.forEach((project, index) => {
        const card = this.createProjectCard(project, index);
        this.track.appendChild(card);
      });
      this.setupScroll();
      this.setupProjectOverlay();
      this.animateAutoScroll();
    }
  }

  createProjectCard(project, index) {
    const card = document.createElement("article");
    card.className = "work-card";
    card.setAttribute("data-index", index);
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

      scrollVelocity = this.container.scrollLeft - lastScrollLeft;
      lastScrollLeft = this.container.scrollLeft;
    };

    const handleDragEnd = () => {
      isDragging = false;
      this.container.style.cursor = "grab";
      this.scrollSpeed = Math.min(Math.abs(scrollVelocity * 0.1), 2);
      if (this.scrollSpeed < 0.5) this.scrollSpeed = 1;
      this.resumeAutoScroll();
    };

    this.container.addEventListener("mousedown", handleDragStart);
    this.container.addEventListener("mousemove", handleDragMove);
    this.container.addEventListener("mouseup", handleDragEnd);
    this.container.addEventListener("mouseleave", handleDragEnd);

    this.container.addEventListener("touchstart", handleDragStart);
    this.container.addEventListener("touchmove", handleDragMove);
    this.container.addEventListener("touchend", handleDragEnd);

    // Seamless reset when scrolling beyond half the track width
    this.container.addEventListener("scroll", () => {
      if (this.isResetting) return;
      const scrollWidth = this.track.scrollWidth / 2;
      if (this.container.scrollLeft >= scrollWidth) {
        this.isResetting = true;
        this.container.scrollLeft = 0;
        this.isResetting = false;
      }
    });
  }

  animateAutoScroll() {
    const autoScroll = () => {
      if (
        !this.autoScrollActive ||
        this.currentCard ||
        this.container.matches(":hover")
      ) {
        requestAnimationFrame(autoScroll);
        return;
      }
      this.container.scrollLeft += this.scrollSpeed;
      if (this.container.scrollLeft >= this.track.scrollWidth / 2) {
        this.container.scrollLeft = 0;
      }
      requestAnimationFrame(autoScroll);
    };
    autoScroll();
  }

  pauseAutoScroll() {
    this.autoScrollActive = false;
  }

  resumeAutoScroll() {
    this.autoScrollActive = true;
  }

  setupProjectOverlay() {
    // Attach click events on each card so that clicking it expands the panel
    const cards = this.track.querySelectorAll(".work-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (this.currentCard) return; // already expanded
        const index = card.getAttribute("data-index");
        const project = this.projects[index];
        this.openProjectPanel(card, project);
      });
    });
  }

  openProjectPanel(card, project) {
    // Pause auto-scroll and disable background scrolling
    this.pauseAutoScroll();
    document.body.style.overflow = "hidden";

    // Save reference and original parent info
    this.currentCard = card;
    this.originalParent = card.parentNode;
    this.originalNextSibling = card.nextSibling;
    this.originalRect = card.getBoundingClientRect();

    // Move the card into the overlay container
    const overlay = document.getElementById("projectOverlay");
    overlay.innerHTML = ""; // clear any previous content
    overlay.appendChild(card);
    overlay.classList.add("active");

    // Set the card’s style so that it sits exactly where it was
    card.style.position = "fixed";
    card.style.top = this.originalRect.top + "px";
    card.style.left = this.originalRect.left + "px";
    card.style.width = this.originalRect.width + "px";
    card.style.height = this.originalRect.height + "px";
    card.style.margin = "0";
    card.style.zIndex = "1200";
    card.style.transition = "all 0.7s cubic-bezier(0.77, 0, 0.175, 1)";

    // (Optionally) append extra details into the card if not already there
    let extra = card.querySelector(".project-extra");
    if (!extra) {
      extra = document.createElement("div");
      extra.className = "project-extra";
      extra.innerHTML = `${project.description} – Detailed information about ${project.title}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
      extra.style.opacity = "0";
      extra.style.transition = "opacity 0.5s ease";
      card.appendChild(extra);
    }

    // Create a close button if one isn’t already in place
    let closeBtn = card.querySelector(".close-panel");
    if (!closeBtn) {
      closeBtn = document.createElement("button");
      closeBtn.className = "close-panel";
      closeBtn.innerHTML = "&times;";
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "1rem";
      closeBtn.style.right = "1rem";
      closeBtn.style.background = "transparent";
      closeBtn.style.border = "none";
      closeBtn.style.fontSize = "2rem";
      closeBtn.style.color = "white";
      closeBtn.style.cursor = "pointer";
      card.appendChild(closeBtn);
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeProjectPanel();
      });
    }

    // Force reflow so the browser registers the starting position
    card.getBoundingClientRect();

    // Calculate target (expanded) dimensions: 75vw x 75vh, centered
    const finalWidth = window.innerWidth * 0.75;
    const finalHeight = window.innerHeight * 0.75;
    const finalLeft = (window.innerWidth - finalWidth) / 2;
    const finalTop = (window.innerHeight - finalHeight) / 2;

    // Animate to the expanded state
    requestAnimationFrame(() => {
      card.style.top = finalTop + "px";
      card.style.left = finalLeft + "px";
      card.style.width = finalWidth + "px";
      card.style.height = finalHeight + "px";
      card.style.borderRadius = "10px";
    });

    // Fade in extra details after the main expansion
    card.addEventListener(
      "transitionend",
      function handleTransition(e) {
        if (e.propertyName === "top") {
          extra.style.opacity = "1";
          card.removeEventListener("transitionend", handleTransition);
        }
      },
      { once: true }
    );
  }

  closeProjectPanel() {
    if (!this.currentCard) return;
    const card = this.currentCard;
    const overlay = document.getElementById("projectOverlay");
    const extra = card.querySelector(".project-extra");

    // Fade out the extra details
    if (extra) {
      extra.style.opacity = "0";
    }
    // Animate back to the saved original dimensions and position
    card.style.top = this.originalRect.top + "px";
    card.style.left = this.originalRect.left + "px";
    card.style.width = this.originalRect.width + "px";
    card.style.height = this.originalRect.height + "px";
    card.style.borderRadius = "8px";

    // When the transition is complete, restore the card into the track
    card.addEventListener(
      "transitionend",
      () => {
        // Clear inline styles added during expansion
        card.style.position = "";
        card.style.top = "";
        card.style.left = "";
        card.style.width = "";
        card.style.height = "";
        card.style.margin = "";
        card.style.zIndex = "";
        card.style.transition = "";
        card.style.borderRadius = "";

        // Remove the close button and extra details if desired
        const closeBtn = card.querySelector(".close-panel");
        if (closeBtn) closeBtn.remove();
        if (extra) extra.remove();

        // Place the card back into its original location in the track
        if (this.originalNextSibling) {
          this.originalParent.insertBefore(card, this.originalNextSibling);
        } else {
          this.originalParent.appendChild(card);
        }

        // Hide the overlay and reset stored variables
        overlay.classList.remove("active");
        overlay.innerHTML = "";
        this.currentCard = null;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.originalRect = null;
        document.body.style.overflow = "";
        this.resumeAutoScroll();
      },
      { once: true }
    );
  }
}

// -------------------------
// Intersection Observer for Animations (unchanged)
// -------------------------
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

// -------------------------
// Initialize All Controllers on DOMContentLoaded
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  new MenuController();
  new GradientController();
  new WorkController();
  new AnimationController();
});
