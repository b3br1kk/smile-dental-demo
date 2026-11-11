/* ==========================================================================
   SMILE® DENTAL STUDIO (НЕФТЕЮГАНСК, 13 МКР, Д. 42) — APP.JS
   Choreography:
   1. Center Iris Aperture Expand Preloader -> Hero Reveal
   2. Live VITA Shade & Light Switcher in Hero
   3. Pinned Horizontal Panorama Gallery Track (#services)
   4. Slide-Out Aesthetic & Warranty Passport (#booking) with Scroll-Then-Act (1220ms) & Reset-On-Leave
   ========================================================================== */

(function () {
  "use strict";

  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined";

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL + ANCHOR INTERCEPTION
     -------------------------------------------------------------------------- */
  let lenis = null;
  if (hasLenis && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.12,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    if (hasGSAP && hasScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  function smoothScrollTo(targetSelector, offset = -84) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.15 });
    } else {
      const top = target.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      if (link.classList.contains("js-pick-service")) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        smoothScrollTo(href, href === "#top" ? 0 : -84);
      }
    });
  });

  /* --------------------------------------------------------------------------
     2. SLIDING NAVBAR INDICATOR PILL
     -------------------------------------------------------------------------- */
  const nav = document.getElementById("main-nav");
  const navIndicator = document.getElementById("nav-indicator");
  const navLinks = nav ? Array.from(nav.querySelectorAll(".nav__link")) : [];

  function moveNavIndicator(linkEl) {
    if (!nav || !navIndicator || !linkEl) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    const left = linkRect.left - navRect.left - 4;
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.transform = `translate3d(${left}px, 0, 0)`;
    navIndicator.style.opacity = "1";
  }

  if (navLinks.length > 0) {
    const activeLink = nav.querySelector(".nav__link.is-active") || navLinks[0];
    window.addEventListener("load", () => moveNavIndicator(activeLink));
    window.addEventListener("resize", () => {
      const current = nav.querySelector(".nav__link.is-active") || navLinks[0];
      moveNavIndicator(current);
    });

    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => moveNavIndicator(link));
      link.addEventListener("click", () => {
        navLinks.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
        moveNavIndicator(link);
      });
    });

    nav.addEventListener("mouseleave", () => {
      const current = nav.querySelector(".nav__link.is-active") || navLinks[0];
      moveNavIndicator(current);
    });
  }

  /* --------------------------------------------------------------------------
     3. PRELOADER -> 4-PART SIMULTANEOUS HORIZONTAL CURTAIN & WORDMARK HANDOFF
     -------------------------------------------------------------------------- */
  function initHorizontalCurtainReveal() {
    const preloader = document.getElementById("preloader");
    const parts = preloader ? Array.from(preloader.querySelectorAll(".preloader__part")) : [];
    const masks = preloader ? Array.from(preloader.querySelectorAll(".preloader__mask")) : [];
    const words = preloader ? Array.from(preloader.querySelectorAll(".preloader__word")) : [];
    const heroTitle = document.getElementById("hero-title");
    const heroAperture = document.getElementById("hero-aperture");
    const heroReveals = document.querySelectorAll(".hero-reveal");

    if (!preloader || !parts.length || !heroTitle || !hasGSAP || prefersReducedMotion || window.scrollY > 80) {
      if (preloader) preloader.classList.add("is-hidden");
      return;
    }

    const heroRect = heroTitle.getBoundingClientRect();
    const startOffsetX = Math.round(
      Math.max(0, (window.innerWidth - heroRect.width) * 0.45 - heroRect.left)
    );
    const startOffsetY = Math.round(
      (window.innerHeight - heroRect.height) * 0.52 - heroRect.top
    );

    const startClips = [
      "inset(0% 74.8% 0% 0%)",
      "inset(0% 49.8% 0% 25%)",
      "inset(0% 24.8% 0% 50%)",
      "inset(0% 0% 0% 75%)",
    ];
    const endClips = [
      "inset(0% 100% 0% 0%)",
      "inset(0% 75% 0% 25%)",
      "inset(0% 50% 0% 50%)",
      "inset(0% 25% 0% 75%)",
    ];

    parts.forEach((part, idx) => {
      gsap.set(part, { clipPath: startClips[idx] });
    });

    gsap.set(masks, {
      left: heroRect.left + startOffsetX,
      top: heroRect.top + startOffsetY,
      x: 0,
      y: 0,
      opacity: 1,
    });
    gsap.set(words, { y: 0, yPercent: 112, color: "#141518" });
    gsap.set(heroTitle, { x: startOffsetX, y: startOffsetY });
    gsap.set(heroReveals, { y: 26, autoAlpha: 0 });
    if (heroAperture) {
      gsap.set(heroAperture, { xPercent: 8, scale: 1.06 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(heroTitle, { clearProps: "transform" });
        if (heroAperture) gsap.set(heroAperture, { clearProps: "transform" });
        preloader.classList.add("is-hidden");
        if (hasScrollTrigger) ScrollTrigger.refresh();
      },
    });

    // Beat 1: Dark wordmark rises out of baseline mask in the center of the loading screen
    tl.to(
      words,
      {
        y: 0,
        yPercent: 0,
        duration: 0.62,
        ease: "power4.out",
      },
      0.05
    );

    // Beat 2: All 4 vertical parts simultaneously wipe horizontally while wordmark glides into Hero & slices Dark -> White
    parts.forEach((part, idx) => {
      tl.to(
        part,
        {
          clipPath: endClips[idx],
          duration: 0.94,
          ease: "expo.inOut",
        },
        0.72
      );
    });

    tl.to(
      masks,
      {
        x: -startOffsetX,
        y: -startOffsetY,
        duration: 0.94,
        ease: "expo.inOut",
      },
      0.72
    ).to(
      heroTitle,
      {
        x: 0,
        y: 0,
        duration: 0.94,
        ease: "expo.inOut",
      },
      0.72
    );

    if (heroAperture) {
      tl.to(
        heroAperture,
        {
          xPercent: 0,
          scale: 1,
          duration: 0.94,
          ease: "expo.inOut",
        },
        0.72
      );
    }

    // Beat 3: Hero UI elements rise smoothly after horizontal curtains open
    tl.to(
      heroReveals,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.58,
        stagger: 0.06,
        ease: "power3.out",
      },
      1.38
    );
  }

  initHorizontalCurtainReveal();

  /* --------------------------------------------------------------------------
     4. HERO VITA TONE SWITCHER
     -------------------------------------------------------------------------- */
  const vitaSwatches = document.querySelectorAll(".vita-swatch");
  const heroVitaLabel = document.getElementById("hero-vita-label");
  const heroBgImg = document.getElementById("hero-bg-img");

  vitaSwatches.forEach((btn) => {
    btn.addEventListener("click", () => {
      vitaSwatches.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const label = btn.getAttribute("data-label");
      const filter = btn.getAttribute("data-filter");
      if (heroVitaLabel && label) heroVitaLabel.textContent = label;
      if (heroBgImg && filter) heroBgImg.style.filter = filter;
    });
  });

  /* --------------------------------------------------------------------------
     5. PINNED HORIZONTAL PANORAMA GALLERY TRACK (#services)
        - Initial dwell buffer (0.00 -> 0.22) so user calmly reads Card 01 first
        - Exact width math accounting for container padding so Card 04 is never clipped
        - Final dwell buffer (0.82 -> 1.00) so Card 04 stays readable before unpin
     -------------------------------------------------------------------------- */
  function initHorizontalGallery() {
    if (!hasGSAP || !hasScrollTrigger || prefersReducedMotion) return;

    const pinWrap = document.getElementById("horiz-pin");
    const track = document.getElementById("horiz-track");
    const countEl = document.getElementById("horiz-count");
    const fillEl = document.getElementById("horiz-fill");

    if (!pinWrap || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1081px)", () => {
      const getScrollAmount = () => {
        const viewportEl = pinWrap.querySelector(".horiz-viewport");
        if (!viewportEl) return 0;
        const style = window.getComputedStyle(viewportEl);
        const padLeft = parseFloat(style.paddingLeft) || 0;
        const padRight = parseFloat(style.paddingRight) || 0;
        const visibleWidth = viewportEl.clientWidth - padLeft - padRight;
        return Math.max(0, track.scrollWidth - visibleWidth + 32);
      };

      const tlHoriz = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrap,
          pin: true,
          scrub: 0.45,
          start: "top top",
          end: () => `+=${getScrollAmount() + 920}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            let idx = 1;
            if (p < 0.28) idx = 1;
            else if (p < 0.52) idx = 2;
            else if (p < 0.76) idx = 3;
            else idx = 4;
            if (countEl) countEl.textContent = `0${idx} / 04`;
            if (fillEl) fillEl.style.width = `${Math.max(25, Math.round(p * 100))}%`;
          },
        },
      });

      // 1. Calm arrival dwell so Card 01 doesn't start moving prematurely
      tlHoriz.to(track, { x: 0, duration: 0.22, ease: "none" });
      // 2. Smooth horizontal pan across all 4 cards (Card 04 lands completely inside right margin)
      tlHoriz.to(track, { x: () => -getScrollAmount(), duration: 0.60, ease: "none" });
      // 3. Calm exit dwell on Card 04 before unpinning
      tlHoriz.to(track, { x: () => -getScrollAmount(), duration: 0.18, ease: "none" });
    });
  }

  initHorizontalGallery();

  /* --------------------------------------------------------------------------
     6. THERMAL AESTHETIC & VITA RECEIPT DISPENSER (#booking)
        - Full PASSPORT_DATA with concrete ₽ price orientirs for all 6 options
        - Frequent 12-step vertical thermal printer feed-out from .receipt-dispenser__slot-lip
        - Scroll-Then-Act (1220ms delay when triggered via .js-pick-service)
        - Strict lock (isJumpingToBooking + isPassportAnimating) so it NEVER plays twice!
        - Reset-On-Leave (retracts when scrolling away so it replays on return)
     -------------------------------------------------------------------------- */
  const PASSPORT_DATA = {
    "Бесплатный осмотр и подбор оттенка VITA": {
      code: "VITA #00 · ДИАГНОСТИКА",
      cabinet: "ЭСТЕТИКА И ОРТОПЕДИЯ",
      title: "Бесплатный осмотр и подбор оттенка по шкале VITA",
      shade: "B1 / A1 VITA",
      swatch: "#F7F5EE",
      price: "от 4 800 ₽ (после осмотра)",
      steps: [
        ["01. Первичный осмотр врача и диагностика эмали", "0 ₽"],
        ["02. Примерка эталонной палитры из 16 оттенков VITA", "0 ₽"],
        ["03. Ориентир: чистка Air-Flow / световая реставрация", "от 4 800 ₽"],
        ["04. Ориентир: отбеливание Zoom / коронки из циркония", "от 18 000 ₽"],
      ],
    },
    "Коронки из циркония и керамики": {
      code: "ОРТОПЕДИЯ #01 · ЦИРКОНИЙ",
      cabinet: "ОРТОПЕДИЯ · КАБ. №1",
      title: "Коронки из диоксида циркония и керамики в тон зубам",
      shade: "A1 / A2 VITA",
      swatch: "#F3EFE4",
      price: "от 24 000 ₽",
      steps: [
        ["01. Осмотр стоматолога-ортопеда и план протезирования", "0 ₽"],
        ["02. Точный подбор цвета и прозрачности края по VITA", "0 ₽"],
        ["03. Временная эстетическая коронка на время изготовления", "от 3 500 ₽"],
        ["04. Постоянная коронка из циркония / керамики под ключ", "от 24 000 ₽"],
      ],
    },
    "Бережное отбеливание Zoom": {
      code: "ЭСТЕТИКА #02 · ZOOM",
      cabinet: "ЭСТЕТИКА · КАБ. №2",
      title: "Бережное фотоотбеливание эмали Zoom с защитой дёсен",
      shade: "BL2 / B1 VITA",
      swatch: "#FDFCF8",
      price: "от 18 000 ₽",
      steps: [
        ["01. Осмотр эмали и прогноз будущего оттенка по VITA", "0 ₽"],
        ["02. Изоляция дёсен защитным гелем перед процедурой", "включено"],
        ["03. Осветление эмали на 4–8 тонов за 1 визит (60 мин)", "от 18 000 ₽"],
        ["04. Глубокое фторирование для снятия чувствительности", "включено"],
      ],
    },
    "Профгигиена Air-Flow и ультразвук": {
      code: "ГИГИЕНА #03 · AIR-FLOW",
      cabinet: "ГИГИЕНА И ПРОФИЛАКТИКА",
      title: "Комплексная профгигиена Air-Flow, ультразвук и полировка",
      shade: "Природный тон",
      swatch: "#EFEAD8",
      price: "от 4 800 ₽",
      steps: [
        ["01. Осмотр полости рта и оценка состояния эмали", "0 ₽"],
        ["02. Бережное снятие зубного камня ультразвуком", "включено"],
        ["03. Снятие пигментного налёта Air-Flow + полировка", "от 4 800 ₽"],
        ["04. Защитное укрепляющее покрытие фторлаком", "включено"],
      ],
    },
    "Лечение кариеса и художественная реставрация": {
      code: "ТЕРАПИЯ #04 · РЕСТАВРАЦИЯ",
      cabinet: "ТЕРАПИЯ · КАБ. №1",
      title: "Лечение кариеса без боли и художественная реставрация",
      shade: "A2 / A3 VITA",
      swatch: "#ECE5D0",
      price: "от 5 200 ₽",
      steps: [
        ["01. Первичный осмотр врача-терапевта и план лечения", "0 ₽"],
        ["02. Мягкая двухэтапная анестезия без боли и стресса", "от 650 ₽"],
        ["03. Художественная световая реставрация точно в цвет зуба", "от 5 200 ₽"],
        ["04. Многоступенчатая полировка до зеркального блеска", "включено"],
      ],
    },
    "Съёмное протезирование / починка протеза": {
      code: "ОРТОПЕДИЯ #05 · ПРОТЕЗЫ",
      cabinet: "ОРТОПЕДИЯ · КАБ. №1",
      title: "Современные съёмные и бюгельные протезы · бережная починка",
      shade: "A2 / A3 VITA",
      swatch: "#ECE5D0",
      price: "от 14 500 ₽",
      steps: [
        ["01. Консультация стоматолога-ортопеда и диагностика", "0 ₽"],
        ["02. Бережная починка или перебазировка протеза", "от 3 800 ₽"],
        ["03. Изготовление удобного съёмного / бюгельного протеза", "от 14 500 ₽"],
        ["04. Индивидуальная подгонка для мягкой посадки", "включено"],
      ],
    },
  };

  const passportEl = document.getElementById("aesthetic-passport");
  const passportCode = document.getElementById("passport-code");
  const passportCabinet = document.getElementById("passport-cabinet");
  const passportTitle = document.getElementById("passport-title");
  const passportShade = document.getElementById("passport-shade");
  const passportSwatch = document.getElementById("passport-swatch");
  const passportSteps = document.getElementById("passport-steps");
  const passportPrice = document.getElementById("passport-price");
  const passportTabs = document.querySelectorAll(".passport-tab");
  const serviceSelect = document.getElementById("inp-service");
  const serviceHint = document.getElementById("service-picked-hint");

  let passportTl = null;
  let isPassportVisible = false;
  let isPassportAnimating = false;
  let isJumpingToBooking = false;
  let jumpTimeoutId = null;

  function renderPassportContent(serviceKey) {
    const key =
      serviceKey && PASSPORT_DATA[serviceKey]
        ? serviceKey
        : "Бесплатный осмотр и подбор оттенка VITA";
    const data = PASSPORT_DATA[key];
    if (passportCode) passportCode.textContent = data.code;
    if (passportCabinet) passportCabinet.textContent = data.cabinet;
    if (passportTitle) passportTitle.textContent = data.title;
    if (passportShade) passportShade.textContent = data.shade;
    if (passportSwatch && data.swatch) passportSwatch.style.background = data.swatch;
    if (passportPrice) passportPrice.textContent = data.price;
    if (passportSteps) {
      passportSteps.innerHTML = data.steps
        .map(([name, val]) => `<li><span>${name}</span><strong>${val}</strong></li>`)
        .join("");
    }
    passportTabs.forEach((tab) => {
      const match = tab.getAttribute("data-passport-service") === key;
      tab.classList.toggle("is-active", match);
    });
  }

  function playPassportSlideIn(serviceKey) {
    if (serviceKey) renderPassportContent(serviceKey);
    if (!passportEl || !hasGSAP || prefersReducedMotion) {
      isPassportVisible = true;
      isPassportAnimating = false;
      return;
    }

    if (passportTl) passportTl.kill();
    isPassportAnimating = true;

    gsap.set(passportEl, {
      yPercent: -104,
      xPercent: 0,
      x: 0,
      y: 0,
      rotation: 0,
      autoAlpha: 1,
    });

    const feedSteps = [-94, -85, -76, -67, -58, -49, -40, -31, -22, -14, -6, 0];
    passportTl = gsap.timeline({
      onComplete: () => {
        isPassportVisible = true;
        isPassportAnimating = false;
      },
    });

    feedSteps.forEach((pct, idx) => {
      const isLast = idx === feedSteps.length - 1;
      passportTl.to(passportEl, {
        yPercent: pct,
        xPercent: 0,
        x: 0,
        y: 0,
        rotation: 0,
        duration: isLast ? 0.12 : 0.062,
        ease: isLast ? "power3.out" : "power2.out",
      });
      if (!isLast) {
        passportTl.to(passportEl, { duration: 0.038 });
      }
    });
  }

  function playPassportRetractOut() {
    if (!passportEl || !hasGSAP || prefersReducedMotion) return;
    if (passportTl) passportTl.kill();
    isPassportAnimating = false;

    const retractSteps = [-15, -32, -50, -68, -86, -104];
    passportTl = gsap.timeline({
      onComplete: () => {
        isPassportVisible = false;
      },
    });

    retractSteps.forEach((pct) => {
      passportTl.to(passportEl, {
        yPercent: pct,
        xPercent: 0,
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.048,
        ease: "power2.in",
      });
    });
  }

  if (passportEl && hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    gsap.set(passportEl, { yPercent: -104, xPercent: 0, autoAlpha: 1 });

    ScrollTrigger.create({
      trigger: "#booking",
      start: "top 68%",
      end: "bottom 18%",
      onEnter: () => {
        if (!isPassportVisible && !isPassportAnimating && !isJumpingToBooking) {
          playPassportSlideIn();
        }
      },
      onEnterBack: () => {
        if (!isPassportVisible && !isPassportAnimating && !isJumpingToBooking) {
          playPassportSlideIn();
        }
      },
      onLeave: () => {
        if (!isJumpingToBooking) playPassportRetractOut();
      },
      onLeaveBack: () => {
        if (!isJumpingToBooking) playPassportRetractOut();
      },
    });
  }

  function selectServiceAndAnimate(serviceKey, scrollFirst = false) {
    renderPassportContent(serviceKey);

    if (serviceSelect) {
      let matched = false;
      Array.from(serviceSelect.options).forEach((opt) => {
        const isMatch = opt.value === serviceKey;
        opt.selected = isMatch;
        if (isMatch) matched = true;
      });
      if (matched) serviceSelect.value = serviceKey;
    }

    const catEntry = PASSPORT_DATA[serviceKey];
    if (serviceHint) {
      serviceHint.textContent = catEntry
        ? `Выбрано: «${serviceKey}» (ориентир: ${catEntry.price}). Первичный осмотр и подбор тона VITA — 0 ₽.`
        : `Выбрано: «${serviceKey}». Первичный осмотр и подбор тона VITA — 0 ₽.`;
    }

    if (scrollFirst) {
      isJumpingToBooking = true;
      if (jumpTimeoutId) clearTimeout(jumpTimeoutId);
      if (passportEl && hasGSAP && !prefersReducedMotion) {
        if (passportTl) passportTl.kill();
        gsap.set(passportEl, { yPercent: -104, xPercent: 0 });
        isPassportVisible = false;
        isPassportAnimating = false;
      }
      // Scroll 1 mouse wheel notch lower (+54px offset) so the passport & form are framed right in front of the user
      smoothScrollTo("#booking", 54);
      jumpTimeoutId = setTimeout(() => {
        isJumpingToBooking = false;
        playPassportSlideIn(serviceKey);
      }, 1220);
    } else {
      playPassportSlideIn(serviceKey);
    }
  }

  passportTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const serviceKey = tab.getAttribute("data-passport-service");
      if (serviceKey) selectServiceAndAnimate(serviceKey, false);
    });
  });

  document.querySelectorAll(".js-pick-service").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute("data-service");
      if (serviceKey) selectServiceAndAnimate(serviceKey, true);
    });
  });

  if (serviceSelect) {
    serviceSelect.addEventListener("change", () => {
      const val = serviceSelect.value;
      if (PASSPORT_DATA[val]) {
        selectServiceAndAnimate(val, false);
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. BOOKING FORM VALIDATION & FEEDBACK
     -------------------------------------------------------------------------- */
  const bookingForm = document.getElementById("booking-form");
  const formFeedback = document.getElementById("form-feedback");

  if (bookingForm && formFeedback) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("inp-name");
      const phoneInput = document.getElementById("inp-phone");
      const nameVal = nameInput ? nameInput.value.trim() : "";
      const phoneVal = phoneInput ? phoneInput.value.trim() : "";

      if (nameVal.length < 2 || phoneVal.replace(/\D/g, "").length < 10) {
        formFeedback.hidden = false;
        formFeedback.style.background = "rgba(217, 83, 56, 0.12)";
        formFeedback.style.borderColor = "rgba(217, 83, 56, 0.35)";
        formFeedback.style.color = "#A3321B";
        formFeedback.textContent = "Пожалуйста, укажите ваше имя и контактный номер телефона.";
        return;
      }

      formFeedback.hidden = false;
      formFeedback.style.background = "rgba(34, 160, 107, 0.12)";
      formFeedback.style.borderColor = "rgba(34, 160, 107, 0.3)";
      formFeedback.style.color = "#146341";
      formFeedback.textContent = `Спасибо, ${nameVal}! Это демо-концепт: в рабочей версии администратор «Смайл» свяжется с вами по номеру ${phoneVal} для подтверждения окна.`;
      bookingForm.reset();
    });
  }
})();
