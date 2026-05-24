"use client";
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// Magnetic dipole field — moment along +Y axis
function dipoleField(x: number, y: number, z: number): THREE.Vector3 {
  const r2 = x * x + y * y + z * z;
  if (r2 < 0.012) return new THREE.Vector3(0, 0, 0);
  const r5 = Math.pow(r2, 2.5);
  return new THREE.Vector3((3 * x * y) / r5, (3 * y * y - r2) / r5, (3 * z * y) / r5);
}

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

    // ── Core setup ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020b18, 0.026);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 150);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020b18, 1);
    mount.appendChild(renderer.domElement);

    // ── Groups ─────────────────────────────────────────────────────────
    const world = new THREE.Group();
    scene.add(world);
    const magnetGroup = new THREE.Group();
    world.add(magnetGroup);

    // ── Lighting ───────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x071424, 2.5));

    const nLight = new THREE.PointLight(0x3b82f6, 35, 16);
    nLight.position.set(0, 2.5, 0);
    world.add(nLight);

    const sLight = new THREE.PointLight(0xef4444, 28, 16);
    sLight.position.set(0, -2.5, 0);
    world.add(sLight);

    const keyLight = new THREE.DirectionalLight(0x4488cc, 1.8);
    keyLight.position.set(-6, 5, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xaa2222, 1.0);
    fillLight.position.set(6, -5, -7);
    scene.add(fillLight);

    // ── Bar magnet ─────────────────────────────────────────────────────
    const POLE_Y = 1.85;
    const R = 0.27;

    // North (blue) body
    const nBodyMat = new THREE.MeshPhongMaterial({
      color: 0x0d2055,
      emissive: 0x1e40af,
      emissiveIntensity: 0.55,
      shininess: 200,
      specular: new THREE.Color(0x93c5fd),
    });
    const nBody = new THREE.Mesh(new THREE.CylinderGeometry(R, R, POLE_Y, 52), nBodyMat);
    nBody.position.y = POLE_Y / 2;
    magnetGroup.add(nBody);

    // North pole face (glowing cap)
    const nCapMat = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      emissive: 0x3b82f6,
      emissiveIntensity: 1.1,
      shininess: 400,
      specular: new THREE.Color(0xbfdbfe),
    });
    const nCap = new THREE.Mesh(new THREE.CircleGeometry(R, 52), nCapMat);
    nCap.position.y = POLE_Y;
    nCap.rotation.x = -Math.PI / 2;
    magnetGroup.add(nCap);

    // South (red) body
    const sBodyMat = new THREE.MeshPhongMaterial({
      color: 0x4a0808,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.55,
      shininess: 200,
      specular: new THREE.Color(0xfca5a5),
    });
    const sBody = new THREE.Mesh(new THREE.CylinderGeometry(R, R, POLE_Y, 52), sBodyMat);
    sBody.position.y = -POLE_Y / 2;
    magnetGroup.add(sBody);

    // South pole face
    const sCapMat = new THREE.MeshPhongMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 1.1,
      shininess: 400,
      specular: new THREE.Color(0xfecdd3),
    });
    const sCap = new THREE.Mesh(new THREE.CircleGeometry(R, 52), sCapMat);
    sCap.position.y = -POLE_Y;
    sCap.rotation.x = Math.PI / 2;
    magnetGroup.add(sCap);

    // Chrome equator band
    const chromeMat = new THREE.MeshPhongMaterial({
      color: 0xaab8c8,
      shininess: 600,
      specular: new THREE.Color(0xffffff),
    });
    magnetGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(R + 0.042, R + 0.042, 0.2, 52), chromeMat));

    // ── Pole halos ─────────────────────────────────────────────────────
    // Inner tight ring
    const nHaloInner = new THREE.Mesh(
      new THREE.TorusGeometry(R + 0.1, 0.013, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending }),
    );
    nHaloInner.position.y = POLE_Y;
    nHaloInner.rotation.x = Math.PI / 2;
    magnetGroup.add(nHaloInner);

    const sHaloInner = new THREE.Mesh(
      new THREE.TorusGeometry(R + 0.1, 0.013, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending }),
    );
    sHaloInner.position.y = -POLE_Y;
    sHaloInner.rotation.x = Math.PI / 2;
    magnetGroup.add(sHaloInner);

    // Outer wide ring
    const nHaloOuter = new THREE.Mesh(
      new THREE.TorusGeometry(R + 0.28, 0.018, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending }),
    );
    nHaloOuter.position.y = POLE_Y;
    nHaloOuter.rotation.x = Math.PI / 2;
    magnetGroup.add(nHaloOuter);

    const sHaloOuter = new THREE.Mesh(
      new THREE.TorusGeometry(R + 0.28, 0.018, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending }),
    );
    sHaloOuter.position.y = -POLE_Y;
    sHaloOuter.rotation.x = Math.PI / 2;
    magnetGroup.add(sHaloOuter);

    // ── Atmospheric glow spheres (large soft pole atmosphere) ──────────
    const nAtmosMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const nAtmos = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), nAtmosMat);
    nAtmos.position.y = POLE_Y;
    world.add(nAtmos);

    const sAtmosMat = new THREE.MeshBasicMaterial({
      color: 0x991b1b,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const sAtmos = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), sAtmosMat);
    sAtmos.position.y = -POLE_Y;
    world.add(sAtmos);

    // ── Expanding pulse rings ──────────────────────────────────────────
    const PULSE_COUNT = 4;
    const nPulseRings: PulseRing[] = [];
    const sPulseRings: PulseRing[] = [];

    for (let i = 0; i < PULSE_COUNT; i++) {
      const makeRing = (y: number, color: number, offset: number): PulseRing => {
        const m = new THREE.Mesh(
          new THREE.RingGeometry(R - 0.02, R + 0.05, 52),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          }),
        );
        m.position.y = y;
        m.rotation.x = Math.PI / 2;
        world.add(m);
        return { mesh: m, t: offset };
      };
      nPulseRings.push(makeRing(POLE_Y, 0x3b82f6, i / PULSE_COUNT));
      sPulseRings.push(makeRing(-POLE_Y, 0xef4444, i / PULSE_COUNT));
    }

    // ── Field lines — 12 azimuthal × 3 elevations = 36 lines ──────────
    const N_AZ = 12;
    const ELEVATIONS = [24, 50, 72]; // degrees from pole axis
    const R_START = 0.45;
    const ELEV_COLORS = [0x00e5ff, 0x38bdf8, 0x1d4ed8];
    const ELEV_OPACITIES = [0.82, 0.48, 0.22];

    const fieldLineCurves: THREE.CatmullRomCurve3[] = [];

    for (let az = 0; az < N_AZ; az++) {
      const phi = (az / N_AZ) * Math.PI * 2;
      for (let ei = 0; ei < ELEVATIONS.length; ei++) {
        const theta = (ELEVATIONS[ei] * Math.PI) / 180;
        const x0 = R_START * Math.sin(theta) * Math.cos(phi);
        const y0 = POLE_Y + R_START * Math.cos(theta);
        const z0 = R_START * Math.sin(theta) * Math.sin(phi);
        const pts = traceFieldLine(x0, y0, z0, POLE_Y);
        if (pts.length < 8) continue;
        const curve = new THREE.CatmullRomCurve3(pts);
        fieldLineCurves.push(curve);

        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(130));
        world.add(
          new THREE.Line(
            geo,
            new THREE.LineBasicMaterial({
              color: ELEV_COLORS[ei],
              transparent: true,
              opacity: ELEV_OPACITIES[ei],
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          ),
        );
      }
    }

    // ── Flow particles along field lines ───────────────────────────────
    const PER_LINE = 9;
    const totalFlow = fieldLineCurves.length * PER_LINE;
    const flowPos = new Float32Array(totalFlow * 3);
    const flowCols = new Float32Array(totalFlow * 3);

    for (let i = 0; i < totalFlow; i++) {
      const t = Math.random();
      // Blend cyan → blue → white
      flowCols[i * 3]     = 0.25 + t * 0.75;
      flowCols[i * 3 + 1] = 0.72 + t * 0.28;
      flowCols[i * 3 + 2] = 1.0;
    }

    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
    flowGeo.setAttribute("color", new THREE.BufferAttribute(flowCols, 3));

    world.add(
      new THREE.Points(
        flowGeo,
        new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.1,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true,
        }),
      ),
    );

    const flowT = Array.from({ length: totalFlow }, (_, i) => (i % PER_LINE) / PER_LINE);
    const flowSpeed = Array.from({ length: totalFlow }, () => 0.002 + Math.random() * 0.0018);

    // ── Iron filing ambient cloud ──────────────────────────────────────
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
      const yv = fPos[i * 3 + 1];
      const mix = Math.random();
      if (yv > 0) {
        // North hemisphere: blue tones
        fCol[i * 3]     = 0.08 + mix * 0.22;
        fCol[i * 3 + 1] = 0.28 + mix * 0.42;
        fCol[i * 3 + 2] = 0.75 + mix * 0.25;
      } else {
        // South hemisphere: red tones
        fCol[i * 3]     = 0.45 + mix * 0.45;
        fCol[i * 3 + 1] = 0.06 + mix * 0.14;
        fCol[i * 3 + 2] = 0.06 + mix * 0.14;
      }
    }

    const fGeo = new THREE.BufferGeometry();
    fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
    fGeo.setAttribute("color", new THREE.BufferAttribute(fCol, 3));
    scene.add(
      new THREE.Points(
        fGeo,
        new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.033,
          transparent: true,
          opacity: 0.42,
          sizeAttenuation: true,
        }),
      ),
    );

    // ── Animation ──────────────────────────────────────────────────────
    let animId: number;
    let time = 0;
    let camX = 0, camY = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;

      // World slow rotation
      world.rotation.y = time * 0.14;

      // Magnet breathe + tilt
      magnetGroup.position.y = Math.sin(time * 0.62) * 0.14;
      magnetGroup.rotation.z = Math.sin(time * 0.44) * 0.055;

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

      // Pole light pulsing
      nLight.intensity = 35 + Math.sin(time * 2.1) * 12;
      sLight.intensity = 28 + Math.cos(time * 1.8) * 10;

      // Inner halo rings — pulse scale + opacity
      nHaloInner.scale.setScalar(1 + Math.sin(time * 2.9) * 0.1);
      sHaloInner.scale.setScalar(1 + Math.cos(time * 3.3) * 0.1);
      (nHaloInner.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(time * 2.1) * 0.3;
      (sHaloInner.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.cos(time * 2.5) * 0.3;

      // Outer halo rings — slower pulse
      nHaloOuter.scale.setScalar(1 + Math.sin(time * 1.4) * 0.15);
      sHaloOuter.scale.setScalar(1 + Math.cos(time * 1.7) * 0.15);
      (nHaloOuter.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(time * 1.4) * 0.18;
      (sHaloOuter.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.cos(time * 1.7) * 0.18;

      // Atmospheric glow spheres — breathe with magnet
      nAtmos.scale.setScalar(1 + Math.sin(time * 0.62) * 0.08);
      sAtmos.scale.setScalar(1 + Math.cos(time * 0.62) * 0.08);
      (nAtmosMat).opacity = 0.07 + Math.sin(time * 1.6) * 0.03;
      (sAtmosMat).opacity = 0.07 + Math.cos(time * 1.9) * 0.03;

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

      // Smooth camera parallax
      camX += (mouseRef.current.x * 2.8 - camX) * 0.028;
      camY += (-mouseRef.current.y * 1.8 - camY) * 0.028;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

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
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onMouseMove]);

  return <div ref={mountRef} className="w-full h-full" />;
}
