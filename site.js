(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Liquid chrome (vanilla WebGL port of React Bits LiquidChrome) ---------- */

  const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  const frag = (aa) => `
precision highp float;
${aa ? "#define AA" : ""}
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;
uniform float uFloor;
uniform float uGain;
uniform float uBevel;
varying vec2 vUv;

vec3 renderImage(vec2 uvCoord) {
  vec2 fragCoord = uvCoord * uResolution;
  vec2 uv = (2.0 * fragCoord - uResolution) / min(uResolution.x, uResolution.y);
  for (float i = 1.0; i < 10.0; i++) {
    uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
    uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
  }
  vec2 diff = uvCoord - uMouse;
  float dist = length(diff);
  float falloff = exp(-dist * 20.0);
  float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
  uv += (diff / (dist + 0.0001)) * ripple * falloff;
  vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
  return clamp(color, 0.0, 1.0);
}

void main() {
  vec3 col = vec3(0.0);
#ifdef AA
  vec2 px = 1.0 / uResolution;
  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      col += renderImage(vUv + vec2(float(i), float(j)) * px);
    }
  }
  col /= 9.0;
#else
  col = renderImage(vUv);
#endif
  col = uFloor + (1.0 - uFloor) * col;
  // horizon reflection: brighter sky above, darker ground band near the lower edge
  float sky = smoothstep(0.35, 1.0, vUv.y);
  float ground = 1.0 - smoothstep(0.05, 0.3, vUv.y) * (1.0 - smoothstep(0.3, 0.45, vUv.y));
  col *= mix(1.0, mix(0.9, 1.08, sky) * mix(0.82, 1.0, ground), uBevel > 0.0 ? 1.0 : 0.0);
  float lower = smoothstep(0.0, 0.45, vUv.y);
  float upper = smoothstep(1.0, 0.72, vUv.y);
  col *= mix(1.0 - uBevel, 1.0, lower) * mix(1.0 - uBevel * 0.5, 1.0, upper);
  gl_FragColor = vec4(col * uGain, 1.0);
}`;

  // floor lifts the darkest reflection so a dark label stays above 4.5:1
  const PRESETS = {
    button: {
      baseColor: [0.28, 0.28, 0.295], amplitude: 0.18, frequencyX: 2.2, frequencyY: 2.2,
      speed: 0.4, hoverBoost: 2.4, floor: 0.44, gain: 1, bevel: 0.3,
      aa: true, scale: 1, maxDpr: 2, interactive: true,
    },
    hero: {
      baseColor: [0.05, 0.05, 0.056], amplitude: 0.3, frequencyX: 3, frequencyY: 3,
      speed: 0.12, hoverBoost: 1, floor: 0, gain: 0.45, bevel: 0,
      aa: false, scale: 0.6, maxDpr: 1, interactive: false,
    },
  };

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function mountChrome(el, p) {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", {
      antialias: false, alpha: false, depth: false, stencil: false,
      premultipliedAlpha: false, powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, frag(p.aa));
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n) => gl.getUniformLocation(prog, n);
    const uTime = u("uTime");
    const uRes = u("uResolution");
    const uMouse = u("uMouse");
    gl.uniform3fv(u("uBaseColor"), p.baseColor);
    gl.uniform1f(u("uAmplitude"), p.amplitude);
    gl.uniform1f(u("uFrequencyX"), p.frequencyX);
    gl.uniform1f(u("uFrequencyY"), p.frequencyY);
    gl.uniform1f(u("uFloor"), p.floor);
    gl.uniform1f(u("uGain"), p.gain);
    gl.uniform1f(u("uBevel"), p.bevel);

    el.appendChild(canvas);

    let t = Math.random() * 20;
    let mx = 0, my = 0, tx = 0, ty = 0;
    let boost = 1, boostTarget = 1;
    let raf = 0, last = 0, inView = false;

    const draw = () => {
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, p.maxDpr) * p.scale;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      draw();
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = Math.min(1, dt * 3);
      boost += (boostTarget - boost) * k;
      mx += (tx - mx) * k;
      my += (ty - my) * k;
      t += dt * p.speed * boost;
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || reduceMotion || document.hidden || !inView) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    new ResizeObserver(resize).observe(el);
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    }).observe(el);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    if (p.interactive) {
      const host = el.closest("a, button") || el;
      host.addEventListener("pointermove", (e) => {
        const r = host.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width;
        ty = 1 - (e.clientY - r.top) / r.height;
      });
      host.addEventListener("pointerenter", () => (boostTarget = p.hoverBoost));
      host.addEventListener("pointerleave", () => {
        boostTarget = 1;
        tx = 0;
        ty = 0;
      });
    }

    resize();
    el.classList.add("is-live");
  }

  document.querySelectorAll("[data-liquid-chrome]").forEach((el) => {
    const preset = PRESETS[el.dataset.liquidChrome] || PRESETS.button;
    try {
      mountChrome(el, preset);
    } catch (_) {
      /* static silver fallback stays in place */
    }
  });

  /* ---------- Scroll reveals ---------- */

  const revealables = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ---------- Grid spotlight ---------- */

  const hero = document.querySelector(".hero");
  if (hero && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let pending = false, px = 0, py = 0;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        hero.style.setProperty("--mx", px + "px");
        hero.style.setProperty("--my", py + "px");
        hero.classList.add("spot-on");
        pending = false;
      });
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("spot-on"));
  }

  /* ---------- Live lead demo ---------- */

  const demo = document.querySelector("[data-demo]");
  if (demo && !reduceMotion) {
    const rows = Array.from(demo.querySelectorAll("[data-step]"));
    const delays = [700, 1500, 1700, 1700, 1700];
    let i = 0;
    demo.classList.add("is-playing");

    const next = () => {
      if (i < rows.length) {
        rows[i].classList.add("on");
        i += 1;
        setTimeout(next, delays[i] || 1700);
        return;
      }
      setTimeout(() => {
        demo.classList.add("is-resetting");
        setTimeout(() => {
          rows.forEach((r) => r.classList.remove("on"));
          demo.classList.remove("is-resetting");
          i = 0;
          setTimeout(next, 500);
        }, 500);
      }, 4200);
    };
    setTimeout(next, delays[0]);
  }
})();
