"use client";
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// Dipole field — moment along +Y (N pole at top, S at bottom in base coords)
function dipoleField(x: number, y: number, z: number): THREE.Vector3 {
  const r2 = x * x + y * y + z * z;
  if (r2 < 0.012) return new THREE.Vector3(0, 0, 0);
  const r5 = Math.pow(r2, 2.5);
  return new THREE.Vector3((3 * x * y) / r5, (3 * y * y - r2) / r5, (3 * z * y) / r5);
}

// Trace from N pole toward S (standard direction)
function traceFieldLine(x0: number, y0: number, z0: number, poleY: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  let x = x0, y = y0, z = z0;
  for (let i = 0; i < 500; i++) {
    pts.push(new THREE.Vector3(x, y, z));
    const b = dipoleField(x, y, z);
    const len = b.length();
    if (len < 0.00001) break;
    const dt = 0.042;
    x += (b.x / len) * dt;
    y += (b.y / len) * dt;
    z += (b.z / len) * dt;
    if (x * x + y * y + z * z > 90) break;
    if (y < -poleY && x * x + z * z < 0.22) break;
  }
  return pts;
}

// Trace from S pole exterior toward N pole.
// The dipole B field points toward N even at the S pole exterior,
// so tracing forward from near S naturally arcs up to N.
function traceFieldLineSouth(x0: number, y0: number, z0: number, poleY: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  let x = x0, y = y0, z = z0;
  for (let i = 0; i < 500; i++) {
    pts.push(new THREE.Vector3(x, y, z));
    const b = dipoleField(x, y, z);
    const len = b.length();
    if (len < 0.00001) break;
    const dt = 0.042;
    x += (b.x / len) * dt;
    y += (b.y / len) * dt;
    z += (b.z / len) * dt;
    if (x * x + y * y + z * z > 90) break;
    if (y > poleY && x * x + z * z < 0.22) break; // reached N pole
  }
  return pts;
}

// Rotate 90° CCW around Z: (x,y,z) → (-y, x, z)
// This maps: N pole (+Y) → left (-X), S pole (-Y) → right (+X)
// Matching the N|S logo: N on left (blue), S on right (red)
function rotZ(p: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(-p.y, p.x, p.z);
}

type PulseRing = { mesh: THREE.Mesh; t: number };

export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Core ───────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020b18, 0.024);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 150);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020b18, 1);
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);
    const magnetGroup = new THREE.Group();
    world.add(magnetGroup);

    // ── Lights ─────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x06101e, 3));

    // N pole light (left, -X after rotation)
    const nLight = new THREE.PointLight(0x3b82f6, 38, 16);
    nLight.position.set(-2.8, 0, 0);
    world.add(nLight);

    // S pole light (right, +X after rotation)
    const sLight = new THREE.PointLight(0xef4444, 30, 16);
    sLight.position.set(2.8, 0, 0);
    world.add(sLight);

    const keyLight = new THREE.DirectionalLight(0x3366cc, 1.8);
    keyLight.position.set(-6, 3, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xaa2222, 1.0);
    fillLight.position.set(6, -3, -7);
    scene.add(fillLight);

    // ── Bar magnet — horizontal (N left, S right) ───────────────────────
    // Base geometry is vertical (along Y), then rotated 90° around Z
    const POLE = 1.85;
    const R = 0.27;

    // N body (left side, blue)
    const nBodyMat = new THREE.MeshPhongMaterial({
      color: 0x0c1f55,
      emissive: 0x1e40af,
      emissiveIntensity: 0.6,
      shininess: 200,
      specular: new THREE.Color(0x93c5fd),
    });
    const nBody = new THREE.Mesh(new THREE.CylinderGeometry(R, R, POLE, 52), nBodyMat);
    nBody.rotation.z = Math.PI / 2;
    nBody.position.x = -POLE / 2;   // left side
    magnetGroup.add(nBody);

    // N pole face cap (far left)
    const nCapMat = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      emissive: 0x3b82f6,
      emissiveIntensity: 1.1,
      shininess: 400,
      specular: new THREE.Color(0xbfdbfe),
    });
    const nCap = new THREE.Mesh(new THREE.CircleGeometry(R, 52), nCapMat);
    nCap.position.x = -POLE;
    nCap.rotation.y = -Math.PI / 2;
    magnetGroup.add(nCap);

    // S body (right side, red)
    const sBodyMat = new THREE.MeshPhongMaterial({
      color: 0x4a0808,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6,
      shininess: 200,
      specular: new THREE.Color(0xfca5a5),
    });
    const sBody = new THREE.Mesh(new THREE.CylinderGeometry(R, R, POLE, 52), sBodyMat);
    sBody.rotation.z = Math.PI / 2;
    sBody.position.x = POLE / 2;    // right side
    magnetGroup.add(sBody);

    // S pole face cap (far right)
    const sCapMat = new THREE.MeshPhongMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 1.1,
      shininess: 400,
      specular: new THREE.Color(0xfecdd3),
    });
    const sCap = new THREE.Mesh(new THREE.CircleGeometry(R, 52), sCapMat);
    sCap.position.x = POLE;
    sCap.rotation.y = Math.PI / 2;
    magnetGroup.add(sCap);

    // Chrome equator band (center)
    const chromeMat = new THREE.MeshPhongMaterial({
      color: 0xaab8c8,
      shininess: 600,
      specular: new THREE.Color(0xffffff),
    });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.044, R + 0.044, 0.2, 52), chromeMat);
    band.rotation.z = Math.PI / 2;
    magnetGroup.add(band);

    // ── Pole halos (torus rings in YZ plane = perpendicular to X axis) ──
    // rotation.y = π/2 makes the torus face along X
    const makeHalo = (posX: number, color: number, tubeR: number, torusR: number, opacity: number): THREE.Mesh => {
      const h = new THREE.Mesh(
        new THREE.TorusGeometry(torusR, tubeR, 8, 72),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending }),
      );
      h.position.x = posX;
      h.rotation.y = Math.PI / 2;
      magnetGroup.add(h);
      return h;
    };

    const nHaloInner = makeHalo(-POLE, 0x60a5fa, 0.013, R + 0.1, 0.95);
    const sHaloInner = makeHalo(POLE,  0xf87171, 0.013, R + 0.1, 0.95);
    const nHaloOuter = makeHalo(-POLE, 0x93c5fd, 0.018, R + 0.3, 0.3);
    const sHaloOuter = makeHalo(POLE,  0xfca5a5, 0.018, R + 0.3, 0.3);

    // ── Atmospheric glow spheres at each pole ──────────────────────────
    const nAtmosMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a, transparent: true, opacity: 0.09,
      blending: THREE.AdditiveBlending, side: THREE.BackSide,
    });
    const nAtmos = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 16), nAtmosMat);
    nAtmos.position.x = -POLE;
    world.add(nAtmos);

    const sAtmosMat = new THREE.MeshBasicMaterial({
      color: 0x991b1b, transparent: true, opacity: 0.09,
      blending: THREE.AdditiveBlending, side: THREE.BackSide,
    });
    const sAtmos = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 16), sAtmosMat);
    sAtmos.position.x = POLE;
    world.add(sAtmos);

    // ── Expanding pulse rings ──────────────────────────────────────────
    const PULSE_COUNT = 4;
    const nPulseRings: PulseRing[] = [];
    const sPulseRings: PulseRing[] = [];

    for (let i = 0; i < PULSE_COUNT; i++) {
      const makeRing = (posX: number, color: number, offset: number): PulseRing => {
        const m = new THREE.Mesh(
          new THREE.RingGeometry(R - 0.02, R + 0.06, 52),
          new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
          }),
        );
        m.position.x = posX;
        m.rotation.y = Math.PI / 2;
        world.add(m);
        return { mesh: m, t: offset };
      };
      nPulseRings.push(makeRing(-POLE, 0x3b82f6, i / PULSE_COUNT));
      sPulseRings.push(makeRing(POLE,  0xef4444, i / PULSE_COUNT));
    }

    // ── Field lines — traced in base coords, then rotZ applied ─────────
    // rotZ: (x,y,z) → (-y, x, z) — puts N on left, S on right
    const N_AZ = 12;
    const ELEVATIONS = [24, 50, 72];
    const R_START = 0.45;

    // N-pole lines: cyan → blue
    const N_COLORS = [0x00e5ff, 0x38bdf8, 0x1d4ed8];
    const N_OPACITIES = [0.82, 0.48, 0.22];
    // S-pole lines: orange → red
    const S_COLORS = [0xff7043, 0xef4444, 0x991b1b];
    const S_OPACITIES = [0.80, 0.46, 0.20];

    const fieldLineCurves: THREE.CatmullRomCurve3[] = [];

    // ── N-pole lines (emerge from left / blue side) ────────────────────
    for (let az = 0; az < N_AZ; az++) {
      const phi = (az / N_AZ) * Math.PI * 2;
      for (let ei = 0; ei < ELEVATIONS.length; ei++) {
        const theta = (ELEVATIONS[ei] * Math.PI) / 180;
        const x0 = R_START * Math.sin(theta) * Math.cos(phi);
        const y0 = POLE + R_START * Math.cos(theta);
        const z0 = R_START * Math.sin(theta) * Math.sin(phi);

        const rawPts = traceFieldLine(x0, y0, z0, POLE);
        if (rawPts.length < 8) continue;

        const pts = rawPts.map(rotZ);
        const curve = new THREE.CatmullRomCurve3(pts);
        fieldLineCurves.push(curve);

        world.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(130)),
          new THREE.LineBasicMaterial({
            color: N_COLORS[ei], transparent: true, opacity: N_OPACITIES[ei],
            blending: THREE.AdditiveBlending, depthWrite: false,
          }),
        ));
      }
    }

    // ── S-pole lines (emerge from right / red side) ────────────────────
    for (let az = 0; az < N_AZ; az++) {
      const phi = (az / N_AZ) * Math.PI * 2;
      for (let ei = 0; ei < ELEVATIONS.length; ei++) {
        const theta = (ELEVATIONS[ei] * Math.PI) / 180;
        // Start just outside S pole in base coords (-Y axis)
        const x0 = R_START * Math.sin(theta) * Math.cos(phi);
        const y0 = -(POLE + R_START * Math.cos(theta));
        const z0 = R_START * Math.sin(theta) * Math.sin(phi);

        const rawPts = traceFieldLineSouth(x0, y0, z0, POLE);
        if (rawPts.length < 8) continue;

        const pts = rawPts.map(rotZ);
        const curve = new THREE.CatmullRomCurve3(pts);
        fieldLineCurves.push(curve); // add to curves → particles flow on these too

        world.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(130)),
          new THREE.LineBasicMaterial({
            color: S_COLORS[ei], transparent: true, opacity: S_OPACITIES[ei],
            blending: THREE.AdditiveBlending, depthWrite: false,
          }),
        ));
      }
    }

    // Track how many N-pole curves came first (for particle coloring)
    const nLineCurveCount = fieldLineCurves.length / 2;

    // ── Flow particles ─────────────────────────────────────────────────
    const PER_LINE = 9;
    const totalFlow = fieldLineCurves.length * PER_LINE;
    const flowPos = new Float32Array(totalFlow * 3);
    const flowCols = new Float32Array(totalFlow * 3);

    for (let i = 0; i < totalFlow; i++) {
      const lineIdx = Math.floor(i / PER_LINE);
      const t = Math.random();
      if (lineIdx < nLineCurveCount) {
        // N-pole curves → cyan/blue particles
        flowCols[i * 3]     = 0.25 + t * 0.75;
        flowCols[i * 3 + 1] = 0.72 + t * 0.28;
        flowCols[i * 3 + 2] = 1.0;
      } else {
        // S-pole curves → red/orange particles
        flowCols[i * 3]     = 1.0;
        flowCols[i * 3 + 1] = 0.18 + t * 0.32;
        flowCols[i * 3 + 2] = 0.05 + t * 0.1;
      }
    }

    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
    flowGeo.setAttribute("color", new THREE.BufferAttribute(flowCols, 3));
    world.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({
      vertexColors: true, size: 0.1, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })));

    const flowT = Array.from({ length: totalFlow }, (_, i) => (i % PER_LINE) / PER_LINE);
    const flowSpeed = Array.from({ length: totalFlow }, () => 0.002 + Math.random() * 0.0018);

    // ── Iron filing cloud ──────────────────────────────────────────────
    const FILING_N = 2800;
    const fPos = new Float32Array(FILING_N * 3);
    const fCol = new Float32Array(FILING_N * 3);
    for (let i = 0; i < FILING_N; i++) {
      const r = 3.5 + Math.random() * 7.5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      fPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      fPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      fPos[i * 3 + 2] = r * Math.cos(ph);
      const xv = fPos[i * 3];  // x determines N/S hemisphere now
      const mix = Math.random();
      if (xv < 0) {
        // Left (N) hemisphere: blue
        fCol[i * 3]     = 0.08 + mix * 0.22;
        fCol[i * 3 + 1] = 0.28 + mix * 0.42;
        fCol[i * 3 + 2] = 0.75 + mix * 0.25;
      } else {
        // Right (S) hemisphere: red
        fCol[i * 3]     = 0.45 + mix * 0.45;
        fCol[i * 3 + 1] = 0.06 + mix * 0.14;
        fCol[i * 3 + 2] = 0.06 + mix * 0.14;
      }
    }
    const fGeo = new THREE.BufferGeometry();
    fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
    fGeo.setAttribute("color", new THREE.BufferAttribute(fCol, 3));
    scene.add(new THREE.Points(fGeo, new THREE.PointsMaterial({
      vertexColors: true, size: 0.033, transparent: true, opacity: 0.4, sizeAttenuation: true,
    })));

    // ── Animation ──────────────────────────────────────────────────────
    let animId: number;
    let time = 0;
    let camX = 0, camY = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;

      // Rotate world around Y — horizontal magnet poles sweep in/out of screen
      world.rotation.y = time * 0.12;

      // Magnet breathes: bob in Y, gentle Z tilt (tips one end up, one down)
      magnetGroup.position.y = Math.sin(time * 0.62) * 0.12;
      magnetGroup.rotation.z = Math.sin(time * 0.44) * 0.045;

      // Flow particles
      for (let i = 0; i < totalFlow; i++) {
        const lineIdx = Math.floor(i / PER_LINE);
        flowT[i] = (flowT[i] + flowSpeed[i]) % 1;
        const p = fieldLineCurves[lineIdx].getPoint(flowT[i]);
        flowPos[i * 3]     = p.x;
        flowPos[i * 3 + 1] = p.y;
        flowPos[i * 3 + 2] = p.z;
      }
      flowGeo.attributes.position.needsUpdate = true;

      // Pulse lights
      nLight.intensity = 38 + Math.sin(time * 2.1) * 12;
      sLight.intensity = 30 + Math.cos(time * 1.8) * 10;

      // Inner halos
      nHaloInner.scale.setScalar(1 + Math.sin(time * 2.9) * 0.1);
      sHaloInner.scale.setScalar(1 + Math.cos(time * 3.3) * 0.1);
      (nHaloInner.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(time * 2.1) * 0.3;
      (sHaloInner.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.cos(time * 2.5) * 0.3;

      // Outer halos
      nHaloOuter.scale.setScalar(1 + Math.sin(time * 1.4) * 0.15);
      sHaloOuter.scale.setScalar(1 + Math.cos(time * 1.7) * 0.15);
      (nHaloOuter.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(time * 1.4) * 0.18;
      (sHaloOuter.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.cos(time * 1.7) * 0.18;

      // Atmospheric spheres breathe with magnet
      nAtmos.scale.setScalar(1 + Math.sin(time * 0.62) * 0.09);
      sAtmos.scale.setScalar(1 + Math.cos(time * 0.62) * 0.09);
      nAtmosMat.opacity = 0.07 + Math.sin(time * 1.6) * 0.04;
      sAtmosMat.opacity = 0.07 + Math.cos(time * 1.9) * 0.04;

      // Expanding pulse rings
      for (const ring of nPulseRings) {
        ring.t = (ring.t + 0.0038) % 1;
        ring.mesh.scale.setScalar(1 + ring.t * 7);
        (ring.mesh.material as THREE.MeshBasicMaterial).opacity =
          Math.max(0, 0.7 * (1 - ring.t) * (1 - ring.t));
      }
      for (const ring of sPulseRings) {
        ring.t = (ring.t + 0.0038) % 1;
        ring.mesh.scale.setScalar(1 + ring.t * 7);
        (ring.mesh.material as THREE.MeshBasicMaterial).opacity =
          Math.max(0, 0.7 * (1 - ring.t) * (1 - ring.t));
      }

      // Camera mouse parallax
      camX += (mouseRef.current.x * 2.6 - camX) * 0.028;
      camY += (-mouseRef.current.y * 1.6 - camY) * 0.028;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Render a single static frame instead of looping
      renderer.render(scene, camera);
    } else {
      animate();
    }

    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else if (!prefersReducedMotion) {
        animate();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    function onResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onMouseMove]);

  return <div ref={mountRef} className="w-full h-full" />;
}
