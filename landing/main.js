(() => {
  const doc = document;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── Page load ─────────────────────────────────────────────────────── */
  const finishLoad = () => doc.body.classList.add("is-loaded");
  window.addEventListener("load", () => window.setTimeout(finishLoad, 420), { once: true });
  window.setTimeout(finishLoad, 1700);

  /* ── Navigation + scroll chrome ────────────────────────────────────── */
  const nav = doc.querySelector(".nav");
  const progressBar = doc.querySelector(".scroll-progress i");
  let scrollQueued = false;

  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      if (nav) nav.classList.toggle("is-scrolled", y > 24);
      if (progressBar) progressBar.style.width = `${max > 0 ? Math.min(1, y / max) * 100 : 0}%`;
      scrollQueued = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Reveal on scroll ──────────────────────────────────────────────── */
  const revealItems = doc.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-in"));
  }

  /* ── Mobile menu ───────────────────────────────────────────────────── */
  const burger = doc.querySelector(".nav__burger");
  const menu = doc.querySelector(".mobile-menu");
  const closeButton = doc.querySelector(".mobile-menu__close");
  const pageMain = doc.querySelector("main");
  const pageFooter = doc.querySelector(".footer");

  const setMenu = (open) => {
    if (!menu || !burger) return;
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    doc.body.classList.toggle("is-locked", open);
    if (nav) nav.inert = open;
    if (pageMain) pageMain.inert = open;
    if (pageFooter) pageFooter.inert = open;
    if (open) closeButton?.focus({ preventScroll: true });
    else burger.focus({ preventScroll: true });
  };

  burger?.addEventListener("click", () => setMenu(!menu?.classList.contains("is-open")));
  closeButton?.addEventListener("click", () => setMenu(false));
  menu?.querySelectorAll("[data-menu-link]").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.classList.contains("is-open")) setMenu(false);
  });

  /* ── Card spotlight ────────────────────────────────────────────────── */
  if (finePointer) {
    doc.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  /* ── Hero phone parallax ───────────────────────────────────────────── */
  const heroPhone = doc.querySelector(".phone--hero");
  const heroVisual = doc.querySelector(".hero__visual");
  if (heroPhone && heroVisual && finePointer && !reduceMotion) {
    let frame = 0;
    let target = { x: 0, y: 0 };
    const render = () => {
      frame = 0;
      heroPhone.style.transform = `rotate(${-5 + target.x * 3.2}deg) translate3d(${target.y * 10}px, ${target.x * -8}px, 0)`;
    };
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      target = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      };
      if (!frame) frame = window.requestAnimationFrame(render);
    });
    heroVisual.addEventListener("pointerleave", () => {
      target = { x: 0, y: 0 };
      if (!frame) frame = window.requestAnimationFrame(render);
    });
  }

  /* ── Custom cursor ─────────────────────────────────────────────────── */
  if (finePointer && !reduceMotion && window.matchMedia("(min-width: 1025px)").matches) {
    const cursor = doc.querySelector(".cursor");
    if (cursor) {
      doc.body.classList.add("has-cursor");
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      let cx = x;
      let cy = y;
      let visible = false;

      const loop = () => {
        cx += (x - cx) * 0.18;
        cy += (y - cy) * 0.18;
        cursor.style.left = `${cx}px`;
        cursor.style.top = `${cy}px`;
        window.requestAnimationFrame(loop);
      };

      doc.addEventListener("pointermove", (event) => {
        x = event.clientX;
        y = event.clientY;
        if (x < 4 && y < 4) {
          cursor.classList.remove("is-visible");
          visible = false;
          return;
        }
        if (!visible) {
          visible = true;
          cursor.classList.add("is-visible");
        }
      });

      doc.addEventListener("pointerover", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const interactive = target?.closest("a, button, [data-cursor]");
        cursor.classList.toggle("is-link", Boolean(interactive));
      });

      doc.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
      doc.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
      doc.addEventListener("pointerleave", () => {
        cursor.classList.remove("is-link", "is-visible");
        visible = false;
      });
      window.requestAnimationFrame(loop);
    }
  }

  /* ── Feature: split selector ───────────────────────────────────────── */
  const splitDemo = doc.querySelector("[data-mini-split]");
  if (splitDemo) {
    const splitData = {
      push: { name: "PUSH", stats: "5 MOVES · 16 SETS · 52 MIN" },
      pull: { name: "PULL", stats: "5 MOVES · 17 SETS · 57 MIN" },
      legs: { name: "LEGS", stats: "5 MOVES · 19 SETS · 61 MIN" },
    };
    const images = splitDemo.querySelectorAll("[data-split-img]");
    const tabs = splitDemo.querySelectorAll("[data-split]");
    const name = splitDemo.querySelector("[data-split-name]");
    const stats = splitDemo.querySelector("[data-split-stats]");

    const selectSplit = (key) => {
      const data = splitData[key];
      if (!data) return;
      images.forEach((img) => img.classList.toggle("is-active", img.dataset.splitImg === key));
      tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.split === key));
      if (name) name.textContent = data.name;
      if (stats) stats.textContent = data.stats;
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => selectSplit(tab.dataset.split)));

    if (!reduceMotion) {
      const order = ["push", "pull", "legs"];
      let index = 0;
      let timer;
      const start = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => {
          index = (index + 1) % order.length;
          selectSplit(order[index]);
        }, 4200);
      };
      splitDemo.addEventListener("pointerenter", () => window.clearInterval(timer));
      splitDemo.addEventListener("pointerleave", start);
      start();
    }
  }

  /* ── Feature: language toggle ──────────────────────────────────────── */
  const langDemo = doc.querySelector("[data-lang-demo]");
  if (langDemo) {
    const toggle = langDemo.querySelector("[data-lang-toggle]");
    const spans = toggle?.querySelectorAll("span") ?? [];
    langDemo.setAttribute("data-lang", "fa");
    toggle?.addEventListener("click", () => {
      const next = langDemo.getAttribute("data-lang") === "fa" ? "en" : "fa";
      langDemo.setAttribute("data-lang", next);
      spans.forEach((span) => {
        const isEn = span.textContent.trim().toLowerCase() === "en";
        span.classList.toggle("is-active", next === "en" ? isEn : !isEn);
      });
    });
  }

  /* ── Screens gallery ───────────────────────────────────────────────── */
  const gallery = doc.querySelector("[data-screens]");
  if (gallery) {
    const cards = Array.from(gallery.querySelectorAll(".screen-card"));

    const currentIndex = () => {
      const galleryRect = gallery.getBoundingClientRect();
      const center = galleryRect.left + galleryRect.width / 2;
      let best = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const diff = Math.abs(rect.left + rect.width / 2 - center);
        if (diff < distance) {
          distance = diff;
          best = index;
        }
      });
      return best;
    };

    const goTo = (direction) => {
      const first = cards[0];
      const second = cards[1] ?? first;
      const gap = Math.abs(
        second.getBoundingClientRect().left - first.getBoundingClientRect().left,
      );
      gallery.scrollBy({
        left: direction * (gap || first.offsetWidth),
        behavior: reduceMotion ? "auto" : "smooth",
      });
      window.setTimeout(markCurrent, 520);
    };

    const markCurrent = () => {
      const active = currentIndex();
      cards.forEach((card, index) => card.classList.toggle("is-current", index === active));
    };

    let scrollFrame = 0;
    gallery.addEventListener(
      "scroll",
      () => {
        if (scrollFrame) return;
        scrollFrame = window.requestAnimationFrame(() => {
          markCurrent();
          scrollFrame = 0;
        });
      },
      { passive: true },
    );

    const snapToNearest = () => {
      const card = cards[currentIndex()];
      if (!card) return;
      const galleryRect = gallery.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const delta = cardRect.left + cardRect.width / 2 - (galleryRect.left + galleryRect.width / 2);
      gallery.scrollBy({ left: delta, behavior: reduceMotion ? "auto" : "smooth" });
      window.setTimeout(markCurrent, 520);
    };

    // Start from the first card (the rightmost in RTL) rather than from whichever
    // card happens to sit at the viewport centre on a wide screen.
    cards.forEach((card, index) => card.classList.toggle("is-current", index === 0));

    doc.querySelector("[data-screen-next]")?.addEventListener("click", () => goTo(-1));
    doc.querySelector("[data-screen-prev]")?.addEventListener("click", () => goTo(1));

    if (finePointer) {
      let down = false;
      let startX = 0;
      let startScroll = 0;
      let moved = 0;

      gallery.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        down = true;
        moved = 0;
        startX = event.clientX;
        startScroll = gallery.scrollLeft;
      });

      gallery.addEventListener("pointermove", (event) => {
        if (!down) return;
        const diff = event.clientX - startX;
        moved = Math.abs(diff);
        if (moved > 6) gallery.classList.add("is-dragging");
        gallery.scrollLeft = startScroll - diff;
      });

      const endDrag = () => {
        if (!down) return;
        down = false;
        gallery.classList.remove("is-dragging");
        if (moved > 40) snapToNearest();
      };

      gallery.addEventListener("pointerup", endDrag);
      gallery.addEventListener("pointerleave", endDrag);
      gallery.addEventListener("pointercancel", endDrag);
      gallery.addEventListener("click", (event) => {
        if (moved > 6) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
    }
  }

  /* ── back to top ───────────────────────────────────────────────────── */
  doc.querySelectorAll("[data-top]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
})();
