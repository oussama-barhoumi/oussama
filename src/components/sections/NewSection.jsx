import React, { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

import './NewSection.css';

gsap.registerPlugin(ScrollTrigger, Draggable);

/* ─── Card data ─────────────────────────────────────────────────────────── */
const SKILL_CARDS = [
  {
    index: '01',
    category: 'DEVELOPMENT',
    title: ['FULL', 'STACK'],
    description: 'Scalable front-end & back-end systems, APIs and databases.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sc-icon">
        <rect x="8" y="22" width="64" height="36" rx="3" stroke="currentColor" strokeWidth="1.4"/>
        <polyline points="20,36 30,44 20,52" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="34" y1="52" x2="56" y2="52" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="8" y1="62" x2="72" y2="62" stroke="rgba(197,83,71,0.5)" strokeWidth="1"/>
        <line x1="28" y1="62" x2="28" y2="70" stroke="rgba(197,83,71,0.5)" strokeWidth="1"/>
        <line x1="52" y1="62" x2="52" y2="70" stroke="rgba(197,83,71,0.5)" strokeWidth="1"/>
        <line x1="20" y1="70" x2="60" y2="70" stroke="rgba(197,83,71,0.5)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    index: '02',
    category: 'DESIGN',
    title: ['UI', 'UX'],
    description: 'Visual systems, motion & interaction for digital products.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sc-icon">
        <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="40" cy="40" r="6" fill="rgba(197,83,71,0.8)"/>
        <line x1="40" y1="12" x2="40" y2="22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="40" y1="58" x2="40" y2="68" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="12" y1="40" x2="22" y2="40" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="58" y1="40" x2="68" y2="40" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="40" cy="40" r="16" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 5"/>
      </svg>
    ),
  },
  {
    index: '03',
    category: 'CREATIVE TECH',
    title: ['3D', 'WEBGL'],
    description: 'Three.js, WebGL & immersive 3D experiences for the web.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sc-icon">
        <polygon points="40,10 68,56 12,56" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <polygon points="40,26 56,56 24,56" stroke="rgba(197,83,71,0.65)" strokeWidth="1" strokeLinejoin="round"/>
        <line x1="40" y1="10" x2="40" y2="26" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <circle cx="40" cy="10" r="2.5" fill="rgba(197,83,71,0.9)"/>
        <circle cx="68" cy="56" r="2.5" fill="rgba(255,255,255,0.5)"/>
        <circle cx="12" cy="56" r="2.5" fill="rgba(255,255,255,0.5)"/>
      </svg>
    ),
  },
  {
    index: '04',
    category: 'INTELLIGENCE',
    title: ['AI', 'LLMs'],
    description: 'LLMs, AI agents & intelligent interfaces for modern products.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sc-icon">
        <circle cx="40" cy="40" r="10" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="40" cy="14" r="4" stroke="rgba(197,83,71,0.9)" strokeWidth="1.3"/>
        <circle cx="40" cy="66" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/>
        <circle cx="14" cy="40" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/>
        <circle cx="66" cy="40" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/>
        <circle cx="19" cy="19" r="3" stroke="rgba(197,83,71,0.5)" strokeWidth="1"/>
        <circle cx="61" cy="19" r="3" stroke="rgba(197,83,71,0.5)" strokeWidth="1"/>
        <circle cx="19" cy="61" r="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <circle cx="61" cy="61" r="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <line x1="40" y1="30" x2="40" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="40" y1="50" x2="40" y2="62" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="30" y1="40" x2="18" y2="40" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="50" y1="40" x2="62" y2="40" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="33" y1="33" x2="22" y2="22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <line x1="47" y1="33" x2="58" y2="22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <line x1="33" y1="47" x2="22" y2="58" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
        <line x1="47" y1="47" x2="58" y2="58" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      </svg>
    ),
  },
];

/* ─── Seamless loop builder (adapted from GreenSock demo) ───────────────── */
function buildSeamlessLoop(items, spacing, animateFunc) {
  const overlap    = Math.ceil(1 / spacing);
  const startTime  = items.length * spacing + 0.5;
  const loopTime   = (items.length + overlap) * spacing + 1;
  const rawSeq     = gsap.timeline({ paused: true });
  const seamless   = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      this._time === this._dur && (this._tTime += this._dur - 0.01);
    },
  });
  const total = items.length + overlap * 2;

  for (let i = 0; i < total; i++) {
    const index = i % items.length;
    const time  = i * spacing;
    rawSeq.add(animateFunc(items[index]), time);
  }

  rawSeq.time(startTime);
  seamless
    .to(rawSeq, { time: loopTime, duration: loopTime - startTime, ease: 'none' })
    .fromTo(rawSeq,
      { time: overlap * spacing + 1 },
      { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: 'none' }
    );
  return seamless;
}

const WEDDING_GIF =
  '/gif/From Klickpin.com- Wedding DIY Ideas 71 Ideas to Copy-pin-id-434386326559649685.gif';

const TRANSITION_DISTANCE = '+=700%';

const INITIAL_VIDEO_SCALE = 0.035;
const INITIAL_VIDEO_X = '-7vw';
const INITIAL_VIDEO_Y = '15vh';

export default function NewSection() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const statementRef = useRef(null);

  const mediaFrameRef = useRef(null);

  const aboutRef = useRef(null);
  const educationRef = useRef(null);
  const focusRef = useRef(null);
  const skillsRef = useRef(null);

  // Education individual articles
  const educationItem1Ref = useRef(null);
  const educationItem2Ref = useRef(null);
  const educationItem3Ref = useRef(null);



  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const firstName = firstNameRef.current;
      const lastName = lastNameRef.current;
      const statement = statementRef.current;
      const frame = mediaFrameRef.current;

      const about = aboutRef.current;
      const education = educationRef.current;
      const focus = focusRef.current;
      const skills = skillsRef.current;

      const educationItem1 = educationItem1Ref.current;
      const educationItem2 = educationItem2Ref.current;
      const educationItem3 = educationItem3Ref.current;

      if (
        !firstName ||
        !lastName ||
        !statement ||
        !frame ||
        !about ||
        !education ||
        !focus ||
        !skills ||
        !educationItem1 ||
        !educationItem2 ||
        !educationItem3
      ) {
        return;
      }

      // =========================================================
      // INITIAL STATES
      // =========================================================

      gsap.set(firstName, {
        opacity: 0,
        y: 50,
      });

      gsap.set(lastName, {
        opacity: 0,
        y: 50,
      });

      gsap.set(statement, {
        opacity: 0,
        y: 35,
      });

      gsap.set(frame, {
        opacity: 0,
        scale: INITIAL_VIDEO_SCALE,
        x: INITIAL_VIDEO_X,
        y: INITIAL_VIDEO_Y,
        borderRadius: 28,
        zIndex: 100,
        transformOrigin: 'center center',
        willChange: 'transform',
      });

      // =========================================================
      // ABOUT
      // =========================================================

      gsap.set(about, {
        opacity: 0,
        y: '100vh',
      });

      // =========================================================
      // EDUCATION CONTAINER
      //
      // Container stays centered.
      // Only individual articles move.
      // =========================================================

      gsap.set(education, {
        opacity: 0,
        y: 0,
      });

      // Every article starts BELOW the viewport
      gsap.set(
        [
          educationItem1,
          educationItem2,
          educationItem3,
        ],
        {
          opacity: 0,
          y: '110vh',
        }
      );

      // =========================================================
      // FOCUS
      // =========================================================

      gsap.set(focus, {
        opacity: 0,
        y: '100vh',
      });

      // =========================================================
      // SKILLS
      // =========================================================

      gsap.set(skills, {
        opacity: 0,
        y: '100vh',
      });

      // =========================================================
      // MASTER TIMELINE
      // =========================================================

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: TRANSITION_DISTANCE,
          scrub: 1,
          pin: stageRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // =========================================================
      // 0 → 15%
      // OUSSAMA
      // =========================================================

      timeline.to(
        firstName,
        {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: 'power3.out',
        },
        0
      );

      // =========================================================
      // 15 → 30%
      // BARHOUMI
      // =========================================================

      timeline.to(
        lastName,
        {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: 'power3.out',
        },
        0.16
      );

      // =========================================================
      // 30 → 48%
      // STATEMENT
      // =========================================================

      timeline.to(
        statement,
        {
          opacity: 1,
          y: 0,
          duration: 0.16,
          ease: 'power3.out',
        },
        0.32
      );

      // =========================================================
      // 48 → 55%
      // GIF APPEARS
      // =========================================================

      timeline.to(
        frame,
        {
          opacity: 1,
          scale: INITIAL_VIDEO_SCALE,
          x: INITIAL_VIDEO_X,
          y: INITIAL_VIDEO_Y,
          borderRadius: 28,
          duration: 0.07,
          ease: 'power2.out',
        },
        0.49
      );

      // =========================================================
      // GIF GROWTH
      // =========================================================

      timeline.to(
        frame,
        {
          scale: 0.12,
          x: '-4vw',
          y: '5vh',
          borderRadius: 22,
          duration: 0.12,
          ease: 'power2.inOut',
        },
        0.55
      );

      timeline.to(
        frame,
        {
          scale: 0.30,
          x: '-2vw',
          y: '2vh',
          borderRadius: 16,
          duration: 0.12,
          ease: 'power2.inOut',
        },
        0.67
      );

      timeline.to(
        frame,
        {
          scale: 0.65,
          x: '-0.5vw',
          y: '0.5vh',
          borderRadius: 8,
          duration: 0.10,
          ease: 'power2.inOut',
        },
        0.79
      );

      // =========================================================
      // GIF → FULLSCREEN
      // =========================================================

      timeline.to(
        frame,
        {
          scale: 1,
          x: 0,
          y: 0,
          borderRadius: 0,
          opacity: 1,
          duration: 0.11,
          ease: 'power2.inOut',
        },
        0.89
      );

      // =========================================================
      // ABOUT
      //
      // BOTTOM → CENTER → TOP
      // =========================================================

      timeline.to(
        about,
        {
          opacity: 1,
          y: 0,
          duration: 0.18,
          ease: 'power3.out',
        },
        1.02
      );

      timeline.to(
        about,
        {
          opacity: 0,
          y: '-100vh',
          duration: 0.18,
          ease: 'power3.in',
        },
        1.42
      );

      // =========================================================
      // EDUCATION
      //
      // ARTICLE 01:
      // BOTTOM → CENTER → TOP
      // =========================================================

      timeline.to(
        education,
        {
          opacity: 1,
          duration: 0.12,
          ease: 'power2.out',
        },
        1.42
      );

      timeline.to(
        educationItem1,
        {
          opacity: 1,
          y: 0,
          duration: 0.16,
          ease: 'power3.out',
        },
        1.44
      );

      timeline.to(
        educationItem1,
        {
          opacity: 0,
          y: '-110vh',
          duration: 0.20,
          ease: 'power3.in',
        },
        1.72
      );

      // =========================================================
      // ARTICLE 02:
      // BOTTOM → CENTER → TOP
      // =========================================================

      timeline.to(
        educationItem2,
        {
          opacity: 1,
          y: 0,
          duration: 0.16,
          ease: 'power3.out',
        },
        1.74
      );

      timeline.to(
        educationItem2,
        {
          opacity: 0,
          y: '-110vh',
          duration: 0.20,
          ease: 'power3.in',
        },
        2.02
      );

      // =========================================================
      // ARTICLE 03:
      // BOTTOM → CENTER → TOP
      // =========================================================

      timeline.to(
        educationItem3,
        {
          opacity: 1,
          y: 0,
          duration: 0.16,
          ease: 'power3.out',
        },
        2.04
      );

      timeline.to(
        educationItem3,
        {
          opacity: 0,
          y: '-110vh',
          duration: 0.20,
          ease: 'power3.in',
        },
        2.32
      );

      timeline.to(
        education,
        {
          opacity: 0,
          duration: 0.10,
          ease: 'power2.in',
        },
        2.32
      );

      // =========================================================
      // CURRENTLY LEARNING
      //
      // BOTTOM → CENTER → TOP
      // =========================================================

      timeline.to(
        focus,
        {
          opacity: 1,
          y: 0,
          duration: 0.18,
          ease: 'power3.out',
        },
        2.34
      );

      timeline.to(
        focus,
        {
          opacity: 0,
          y: '-100vh',
          duration: 0.18,
          ease: 'power3.in',
        },
        2.90
      );

      // =========================================================
      // WHAT I DO
      //
      // BOTTOM → CENTER
      // STAYS
      // =========================================================

      timeline.to(
        skills,
        {
          opacity: 1,
          y: 0,
          duration: 0.18,
          ease: 'power3.out',
        },
        2.92
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ─── Seamless card loop ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!skillsRef.current) return;
    const container = skillsRef.current;
    const cardEls   = Array.from(container.querySelectorAll('.wid-card'));
    if (!cardEls.length) return;

    const spacing = 0.18;
    const snap    = gsap.utils.snap(spacing);
    const wrapT   = gsap.utils.wrap;

    // Initial state — all cards off-screen right, invisible
    gsap.set(cardEls, { xPercent: 400, opacity: 0, scale: 0 });

    const animateFunc = (el) => {
      const tl = gsap.timeline();
      tl.fromTo(el,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false }
      ).fromTo(el,
        { xPercent: 400 },
        { xPercent: -400, duration: 1, ease: 'none', immediateRender: false },
        0
      );
      return tl;
    };

    const loop = buildSeamlessLoop(cardEls, spacing, animateFunc);
    const dur  = loop.duration();
    const wrap = (v) => wrapT(0, dur)(v);

    let offset   = 0;
    let dragging = false;

    // Smooth snap-to helper
    const gotoOffset = (target) => {
      const snapped = snap(target);
      gsap.to({ v: offset }, {
        v: snapped,
        duration: 0.55,
        ease: 'power3',
        onUpdate() { offset = this.targets()[0].v; loop.time(wrap(offset)); },
      });
    };

    // Auto-advance via ticker (~1 card every 2.5 s)
    const tick = (_t, dt) => {
      if (dragging) return;
      offset += dt * 0.000072;
      loop.time(wrap(offset));
    };
    gsap.ticker.add(tick);

    // Prev / Next buttons
    const nextBtn = container.querySelector('.wid-next');
    const prevBtn = container.querySelector('.wid-prev');
    const onNext  = () => gotoOffset(offset + spacing);
    const onPrev  = () => gotoOffset(offset - spacing);
    nextBtn?.addEventListener('click', onNext);
    prevBtn?.addEventListener('click', onPrev);

    // Draggable — drag the invisible proxy, trigger on the card list
    const proxy = container.querySelector('.wid-drag-proxy');
    const [drg] = Draggable.create(proxy, {
      type: 'x',
      trigger: container.querySelector('.wid-cards-list'),
      onPress() { dragging = true; this._startOffset = offset; },
      onDrag()  {
        offset = this._startOffset + (this.startX - this.x) * 0.0012;
        loop.time(wrap(offset));
      },
      onDragEnd() { dragging = false; gotoOffset(offset); },
    });

    return () => {
      gsap.ticker.remove(tick);
      loop.kill();
      drg?.kill();
      nextBtn?.removeEventListener('click', onNext);
      prevBtn?.removeEventListener('click', onPrev);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="new-section"
      className="new-section"
    >
      <div
        ref={stageRef}
        className="new-section__stage"
      >
        <div className="new-section__background" />

        {/* =====================================================
            INTRO
        ====================================================== */}

        <div className="new-section__content">
          <h2 className="new-section__heading">

            <span
              ref={firstNameRef}
              className="new-section__name"
            >
              OUSsAMA
            </span>

            <span
              ref={lastNameRef}
              className="new-section__name"
            >
              BARHOUMI
            </span>

          </h2>

          <p
            ref={statementRef}
            className="new-section__statement"
          >
            I'M OBSESSED WITH WHAT I DO.
          </p>
        </div>

        {/* =====================================================
            GIF
        ====================================================== */}

        <div
          ref={mediaFrameRef}
          className="new-section__media-frame"
        >
          <img
            src={WEDDING_GIF}
            alt=""
            className="new-section__media"
            draggable="false"
          />
        </div>

        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <div className="new-section__info">

          {/* ===================================================
              ABOUT
          ==================================================== */}

          <article
            ref={aboutRef}
            className="new-section__info-block new-section__about"
          >
            <h2>
              I BUILD DIGITAL
              <br />
              EXPERIENCES.
            </h2>

            <p>
              I'm a developer and creative technologist
              focused on building digital experiences
              through code, design, 3D and AI.
            </p>
          </article>

          {/* ===================================================
              EDUCATION
          ==================================================== */}

          <article
            ref={educationRef}
            className="new-section__info-block new-section__education"
          >
            <span className="new-section__eyebrow">
              ABOUT ME
            </span>

            <div className="education-stage">

              {/* ARTICLE 01 */}

              <div
                ref={educationItem1Ref}
                className="education-item"
              >
                <span className="education-number">
                  01
                </span>

                <div>
                  <h3>
                    1337 CODING SCHOOL
                  </h3>

                  <p>
                    Full-stack development,
                    problem solving and
                    project-based learning.
                  </p>
                </div>
              </div>

              {/* ARTICLE 02 */}

              <div
                ref={educationItem2Ref}
                className="education-item"
              >
                <span className="education-number">
                  02
                </span>

                <div>
                  <h3>
                    BAC — SCIENCES PHYSIQUES
                  </h3>

                  <p>
                    Scientific background with a
                    focus on mathematics, physics
                    and analytical thinking.
                  </p>
                </div>
              </div>

              {/* ARTICLE 03 */}

              <div
                ref={educationItem3Ref}
                className="education-item"
              >
                <span className="education-number">
                  03
                </span>

                <div>
                  <h3>
                    LIONSGEEK
                  </h3>

                  <p>
                    Additional professional training
                    and practical learning.
                  </p>
                </div>
              </div>

            </div>
          </article>

          {/* ===================================================
              CURRENTLY LEARNING
          ==================================================== */}

          <article
            ref={focusRef}
            className="new-section__info-block new-section__focus"
          >
            <span className="new-section__eyebrow">
              CURRENTLY LEARNING
            </span>

            <h2>
              LLMs
              <br />
              & AI
            </h2>

            <p>
              Exploring large language models,
              AI agents and intelligent interfaces
              to understand how AI can become part
              of modern digital products.
            </p>
          </article>

          {/* ===================================================
              WHAT I DO
          ==================================================== */}

          <article
            ref={skillsRef}
            className="new-section__info-block new-section__skills"
          >
            <span className="new-section__eyebrow">
              WHAT I DO
            </span>

            {/* ── Carousel stage ── */}
            <div className="wid-stage">
              <ul className="wid-cards-list">
                {SKILL_CARDS.map((card) => (
                  <li key={card.index} className="wid-card">

                    <div className="wid-card-top">
                      <span className="wid-card-index">/ {card.index}</span>
                      <span className="wid-card-category">{card.category}</span>
                    </div>

                    <div className="wid-card-icon">
                      {card.icon}
                    </div>

                    <div className="wid-card-bottom">
                      <h3 className="wid-card-title">
                        {card.title.map((line, li) => (
                          <span key={li}>{line}</span>
                        ))}
                      </h3>
                      <p className="wid-card-desc">{card.description}</p>
                      <span className="wid-card-arrow" aria-hidden="true">↗</span>
                    </div>

                  </li>
                ))}
              </ul>

              {/* invisible drag proxy */}
              <div className="wid-drag-proxy" />
            </div>

            {/* ── Prev / Next ── */}
            <div className="wid-nav">
              <button className="wid-btn wid-prev" aria-label="Previous card">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 3.5L5.5 9L11 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="wid-btn wid-next" aria-label="Next card">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M7 3.5L12.5 9L7 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

          </article>

        </div>
      </div>
    </section>
  );
}