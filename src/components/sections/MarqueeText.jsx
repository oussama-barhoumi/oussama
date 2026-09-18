import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

/* ─── horizontalLoop helper (by GSAP / GreenSock) ─────────────────────────── */
function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};
  let tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: 'none' },
    onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
  }),
    length = items.length,
    startX = items[0].offsetLeft,
    times = [],
    widths = [],
    xPercents = [],
    curIndex = 0,
    pixelsPerSecond = (config.speed || 1) * 100,
    snap =
      config.snap === false
        ? (v) => v
        : gsap.utils.snap(config.snap || 1),
    totalWidth,
    curX,
    distanceToStart,
    distanceToLoop,
    item,
    i;

  gsap.set(items, {
    xPercent: (i, el) => {
      let w = (widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px')));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, 'x', 'px')) / w) * 100 +
        gsap.getProperty(el, 'xPercent')
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });

  totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth *
    gsap.getProperty(items[length - 1], 'scaleX') +
    (parseFloat(config.paddingRight) || 0);

  for (i = 0; i < length; i++) {
    item = items[i];
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop =
      distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');

    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(
            ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
          ),
        },
        {
          xPercent: xPercents[i],
          duration:
            (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add('label' + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index, vars) {
    vars = vars || {};
    Math.abs(index - curIndex) > length / 2 &&
      (index += index > curIndex ? -length : length);
    let newIndex = gsap.utils.wrap(0, length, index),
      time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true);
  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }
  return tl;
}
/* ─────────────────────────────────────────────────────────────────────────── */

const PHRASE = 'Somewhere between code and imagination, I built this';
// Repeat enough copies to fill any viewport width
const COPIES = 8;

export default function MarqueeText() {
  const railRef = useRef(null);
  const tlRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const items = railRef.current.querySelectorAll('h4');

    // Base speed
    const BASE_SPEED = 1.5;

    // Kill any previous tweens on items to avoid hot-reload conflicts
    gsap.killTweensOf(items);

    const tl = horizontalLoop(items, {
      repeat: -1,
      speed: 1,
      paddingRight: 160,
    });

    tl.timeScale(BASE_SPEED);
    tlRef.current = tl;

    observerRef.current = Observer.create({
      onChangeY(self) {
        const dir = self.deltaY < 0 ? -1 : 1;
        gsap
          .timeline({ defaults: { ease: 'none' } })
          .to(tl, {
            timeScale: dir * BASE_SPEED * 5,
            duration: 0.25,
            overwrite: true,
          })
          .to(tl, { timeScale: BASE_SPEED, duration: 1.2 }, '+=0.2');
      },
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(items);
      observerRef.current?.kill();
    };
  }, []);

  return (
    <>
      {/* Fontshare Panchang font */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=panchang@200,300,400,500,600,700,800&display=swap');

        .marquee-rail {
          display: flex;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          will-change: transform;
        }

        .marquee-rail h4 {
          font-family: 'Panchang', sans-serif;
          font-style: normal;
          font-weight: 750;
          font-size: clamp(5rem, 11vw, 10.5rem);
          line-height: 1.05;
          color: rgba(255, 255, 255, 0.94);
          letter-spacing: 0.03em;
          word-spacing: 0.3em;
          padding-right: 160px;
          flex-shrink: 0;
          user-select: none;
          text-shadow: 0 0 50px rgba(220, 80, 60, 0.45);
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 5,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div className="marquee-rail rail" ref={railRef}>
          {Array.from({ length: COPIES }).map((_, i) => (
            <h4 key={i}>{PHRASE}</h4>
          ))}
        </div>
      </div>
    </>
  );
}
