import { useEffect, useMemo, useRef, useState } from "react";

const scenes = [
  {
    id: "01",
    title: "Signal Chamber",
    kicker: "Realtime visual direction",
    body: "A cinematic canvas space that reacts to scroll velocity, pointer drift, and staged content reveals.",
    stat: "1700vh rhythm",
  },
  {
    id: "02",
    title: "Kinetic Index",
    kicker: "Scroll driven sequencing",
    body: "The page turns progress into a visible instrument: loading percentage, vertical meter, and chapter markers all move together.",
    stat: "60fps canvas",
  },
  {
    id: "03",
    title: "Chromatic Engine",
    kicker: "Dynamic background system",
    body: "Layered ribbons, particles, and depth grids advance toward the viewer to create a high-end digital showcase feel.",
    stat: "4 motion layers",
  },
  {
    id: "04",
    title: "Launch Surface",
    kicker: "Presentation ready",
    body: "A polished one-page experience for studios, launches, portfolios, and future interactive brand moments.",
    stat: "Original build",
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function VisualCanvas({ progress, mouse }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const progressRef = useRef(progress);
  const mouseRef = useRef(mouse);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    mouseRef.current = mouse;
  }, [mouse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    const particles = Array.from({ length: 150 }, (_, index) => ({
      seed: index * 13.17,
      orbit: 0.18 + Math.random() * 0.82,
      radius: 0.6 + Math.random() * 2.6,
      speed: 0.25 + Math.random() * 0.9,
      hue: ["#f4f0e6", "#75f0cf", "#ff6b4a", "#c9ff45", "#8da1ff"][
        index % 5
      ],
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawRibbon = (time, offset, color, amplitude, thickness) => {
      ctx.beginPath();
      const base = height * (0.32 + offset * 0.34);
      for (let x = -80; x <= width + 80; x += 18) {
        const wave =
          Math.sin(x * 0.006 + time * 0.0012 + offset * 4) * amplitude +
          Math.cos(x * 0.013 - time * 0.001 + progressRef.current * 7) *
            amplitude *
            0.38;
        const y =
          base +
          wave +
          (progressRef.current - 0.5) * height * (0.34 - offset * 0.16);
        if (x === -80) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 22;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const draw = (time) => {
      const p = progressRef.current;
      const mx = (mouseRef.current.x - 0.5) * 2;
      const my = (mouseRef.current.y - 0.5) * 2;
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#050505");
      bg.addColorStop(0.42, "#10100d");
      bg.addColorStop(0.72, "#071411");
      bg.addColorStop(1, "#0c0808");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2 + mx * 34, height / 2 + my * 22);
      ctx.rotate((p - 0.5) * 0.18);

      const horizon = -height * (0.12 + p * 0.18);
      ctx.strokeStyle = "rgba(244, 240, 230, 0.11)";
      ctx.lineWidth = 1;
      for (let i = -12; i <= 12; i += 1) {
        const x = i * (width / 13);
        ctx.beginPath();
        ctx.moveTo(x * 0.08, horizon);
        ctx.lineTo(x * 1.85, height);
        ctx.stroke();
      }
      for (let i = 0; i < 24; i += 1) {
        const depth = i / 24;
        const y = horizon + Math.pow(depth, 2.25) * height * 1.42;
        const alpha = 0.04 + depth * 0.13;
        ctx.strokeStyle = `rgba(201, 255, 69, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(-width, y + Math.sin(time * 0.001 + i) * 5);
        ctx.lineTo(width, y + Math.cos(time * 0.001 + i) * 5);
        ctx.stroke();
      }

      particles.forEach((particle) => {
        const depth = (particle.orbit + p * particle.speed + time * 0.00003) % 1;
        const scale = 0.28 + Math.pow(depth, 2.4) * 2.8;
        const angle = particle.seed + time * 0.00018 + p * 4.2;
        const x =
          Math.cos(angle) * width * 0.22 * scale +
          Math.sin(particle.seed) * width * 0.08;
        const y =
          Math.sin(angle * 0.72) * height * 0.14 * scale +
          (depth - 0.44) * height * 0.88;
        ctx.globalAlpha = clamp(0.12 + depth * 0.78, 0, 0.86);
        ctx.fillStyle = particle.hue;
        ctx.beginPath();
        ctx.arc(x, y, particle.radius * scale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      drawRibbon(time, 0.1, "rgba(255, 107, 74, 0.78)", 72, 2.4);
      drawRibbon(time, 0.52, "rgba(117, 240, 207, 0.70)", 92, 2);
      drawRibbon(time, 0.84, "rgba(201, 255, 69, 0.62)", 58, 1.6);

      const panelCount = 7;
      for (let i = 0; i < panelCount; i += 1) {
        const phase = (i / panelCount + p * 1.12 + time * 0.00002) % 1;
        const z = Math.pow(phase, 2.2);
        const size = 44 + z * Math.min(width, height) * 0.52;
        const x = Math.sin(i * 1.7 + p * 6) * width * 0.26 * z;
        const y = Math.cos(i * 1.1 - p * 5) * height * 0.18 * z;
        ctx.strokeStyle = `rgba(244, 240, 230, ${0.04 + z * 0.18})`;
        ctx.lineWidth = 1 + z * 2;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      }

      ctx.restore();

      const vignette = ctx.createRadialGradient(
        width * (0.5 + mx * 0.04),
        height * (0.44 + my * 0.04),
        width * 0.05,
        width / 2,
        height / 2,
        width * 0.68,
      );
      vignette.addColorStop(0, "rgba(255,255,255,0.05)");
      vignette.addColorStop(0.58, "rgba(0,0,0,0.02)");
      vignette.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      frameRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <canvas className="visual-canvas" ref={canvasRef} aria-hidden="true" />;
}

export function App() {
  const skipLoader =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("skipLoader") === "1";
  const [loadProgress, setLoadProgress] = useState(skipLoader ? 100 : 0);
  const [loaded, setLoaded] = useState(skipLoader);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (skipLoader) return undefined;

    let raf = 0;
    const startedAt = performance.now();

    const tick = (now) => {
      const elapsed = now - startedAt;
      const eased = 1 - Math.pow(1 - clamp(elapsed / 1800, 0, 1), 3);
      setLoadProgress(Math.round(eased * 100));
      if (eased >= 1) {
        setLoaded(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [skipLoader]);

  useEffect(() => {
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    };

    const updateMouse = (event) => {
      setMouse({
        x: clamp(event.clientX / window.innerWidth, 0, 1),
        y: clamp(event.clientY / window.innerHeight, 0, 1),
      });
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    window.addEventListener("pointermove", updateMouse);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      window.removeEventListener("pointermove", updateMouse);
    };
  }, []);

  const activeIndex = useMemo(() => {
    return clamp(Math.floor(scrollProgress * scenes.length), 0, scenes.length - 1);
  }, [scrollProgress]);

  return (
    <main className={loaded ? "site is-loaded" : "site"}>
      <VisualCanvas progress={scrollProgress} mouse={mouse} />

      <div className="noise" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Astra Studio home">
          <span className="brand-mark">AS</span>
          <span>Astra Studio</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#motion">Motion</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          className="mail-button"
          onClick={() => window.location.assign("mailto:hello@astra.invalid")}
          type="button"
        >
          <span>Start a signal</span>
          <span className="button-mark" aria-hidden="true" />
        </button>
      </header>

      <aside className="progress-rail" aria-label="Page progress">
        <span>{String(Math.round(scrollProgress * 100)).padStart(2, "0")}%</span>
        <div className="rail-track">
          <div
            className="rail-fill"
            style={{ transform: `scaleY(${scrollProgress})` }}
          />
        </div>
        <span>100%</span>
      </aside>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Immersive WebGL-style showcase</p>
          <h1>
            Motion systems for brands that need the screen to feel alive.
          </h1>
          <p className="lede">
            An original dynamic visual website inspired by high-end showcase
            pacing: loading percentage, scroll-driven camera movement, kinetic
            background, and progress feedback.
          </p>
        </div>
        <div className="hero-status" aria-label="Scene progress status">
          <span>Scene {scenes[activeIndex].id}</span>
          <strong>{scenes[activeIndex].title}</strong>
        </div>
      </section>

      <section className="sticky-stage" id="work">
        <div className="scene-card">
          <p>{scenes[activeIndex].kicker}</p>
          <h2>{scenes[activeIndex].title}</h2>
          <span>{scenes[activeIndex].body}</span>
        </div>
        <div className="scene-counter">
          <span>{scenes[activeIndex].id}</span>
          <strong>{scenes[activeIndex].stat}</strong>
        </div>
      </section>

      <section className="chapter-list" id="motion">
        {scenes.map((scene, index) => (
          <article
            className={index === activeIndex ? "chapter active" : "chapter"}
            key={scene.id}
          >
            <span>{scene.id}</span>
            <h3>{scene.title}</h3>
            <p>{scene.kicker}</p>
          </article>
        ))}
      </section>

      <section className="final-panel" id="contact">
        <p className="eyebrow">Final frame</p>
        <h2>Built for scroll, launch films, digital portfolios, and product reveals.</h2>
        <button
          className="launch-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          type="button"
        >
          Replay motion
        </button>
      </section>

      <div className="bottom-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      {!loaded && (
        <div className="preloader">
          <div className="preloader-inner">
            <p>{loadProgress}%</p>
            <div className="loader-word">
              <span />
              <strong>ASTRA</strong>
              <span />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
