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

  // floor lifts the darkest reflection so the dark button label stays above 4.5:1;
  // a lower baseColor keeps the clipped white highlights thin instead of glowing
  const FIELD = {
    baseColor: [0.05, 0.05, 0.056], amplitude: 0.3, frequencyX: 3, frequencyY: 3,
    speed: 0.12, hoverBoost: 1, floor: 0, gain: 0.45, bevel: 0,
    aa: false, scale: 0.6, maxDpr: 1, interactive: false,
  };
  const PRESETS = {
    hero: FIELD,
    field: FIELD,
    button: {
      baseColor: [0.19, 0.19, 0.2], amplitude: 0.18, frequencyX: 2.2, frequencyY: 2.2,
      speed: 0.35, hoverBoost: 1.8, floor: 0.46, gain: 0.9, bevel: 0.22,
      aa: true, scale: 1, maxDpr: 2, interactive: true,
    },
    mark: {
      baseColor: [0.16, 0.16, 0.17], amplitude: 0.25, frequencyX: 2.5, frequencyY: 2.5,
      speed: 0.18, hoverBoost: 1, floor: 0.12, gain: 1, bevel: 0,
      aa: false, scale: 0.75, maxDpr: 1.5, interactive: false,
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

  function createChrome(el, p) {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", {
      antialias: false, alpha: false, depth: false, stencil: false,
      premultipliedAlpha: false, powerPreference: "low-power",
    });
    if (!gl) return null;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, frag(p.aa));
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
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
    let raf = 0, last = 0;

    const draw = () => {
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      // layout size, not getBoundingClientRect: a host inside a scaled-in bar would report 0 height
      const dpr = Math.min(window.devicePixelRatio || 1, p.maxDpr) * p.scale;
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
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
      if (raf || reduceMotion || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    document.addEventListener("visibilitychange", onVisibility);

    const host = p.interactive ? el.closest("a, button") || el : null;
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
    };
    const onEnter = () => (boostTarget = p.hoverBoost);
    const onLeave = () => {
      boostTarget = 1;
      tx = 0;
      ty = 0;
    };
    if (host) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);
    }

    resize();
    start();
    requestAnimationFrame(() => el.classList.add("is-live"));

    return {
      destroy() {
        stop();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        if (host) {
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerenter", onEnter);
          host.removeEventListener("pointerleave", onLeave);
        }
        el.classList.remove("is-live");
        const lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
        canvas.remove();
      },
    };
  }

  // a stale or missing stylesheet leaves hosts static; never inject a canvas into unstyled layout
  const hosts = Array.from(document.querySelectorAll("[data-liquid-chrome]")).filter(
    (el) => getComputedStyle(el).position === "absolute"
  );
  const instances = new Map();

  const mount = (el) => {
    if (instances.has(el)) return;
    let inst = null;
    try {
      inst = createChrome(el, PRESETS[el.dataset.liquidChrome] || PRESETS.button);
    } catch (_) {
      inst = null;
    }
    instances.set(el, inst);
  };
  const unmount = (el) => {
    const inst = instances.get(el);
    if (inst) inst.destroy();
    instances.delete(el);
  };

  // contexts live only near the viewport, so a phone never holds more than a handful
  if ("IntersectionObserver" in window) {
    const chromeIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? mount(e.target) : unmount(e.target))),
      { rootMargin: "300px 0px" }
    );
    hosts.forEach((el) => chromeIO.observe(el));
  } else {
    hosts.forEach(mount);
  }

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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealables.forEach((el) => io.observe(el));

    // failsafe: never leave on-screen content hidden if an observer callback is delayed
    let queued = false;
    const sweep = () => {
      queued = false;
      const limit = window.innerHeight * 0.95;
      revealables.forEach((el) => {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < limit) el.classList.add("in");
      });
    };
    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      setTimeout(sweep, 600);
    }, { passive: true });
    setTimeout(sweep, 1500);
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
