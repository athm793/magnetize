"use client";
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// Magnetic dipole field — moment along +Y axis
function dipoleField(x: number, y: number, z: number): THREE.Vector3 {
  const r2 = x * x + y * y + z * z;
  if (r2 < 0.004) return new THREE.Vector3(0, 0, 0);
  const r5 = Math.pow(r2, 2.5);
  return new THREE.Vector3(
    (3 * x * y) / r5,
    (3 * y * y - r2) / r5,
    (3 * z * y) / r5,
  );
}

// Integrate a field line starting at (x0,y0,z0) following B direction
function traceFieldLine(x0: number, y0: number, z0: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  let x = x0, y = y0, z = z0;
  const POLE_Y = 1.6;
  for (let i = 0; i < 400; i++) {
    pts.push(new THREE.Vector3(x, y, z));
    const b = dipoleField(x, y, z);
    const len = b.length();
    if (len < 0.00005) break;
    const dt = 0.045;
    x += (b.x / len) * dt;
    y += (b.y / len) * dt;
    z += (b.z / len) * dt;
    if (x * x + y * y + z * z > 64) break;          // left the scene
    if (y < -POLE_Y && x * x + z * z < 0.16) break; // reached S pole
  }
  return pts;
}

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

    // ── Core setup ──────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020b18, 0.038);

    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020b18, 1);
    mount.appendChild(renderer.domElement);

    // ── World group — rotates slowly as one unit ─────────────
    const world = new THREE.Group();
    scene.add(world);

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.04));

    const nLight = new THREE.PointLight(0x60a5fa, 18, 9);
    nLight.position.set(0, 1.8, 0);
    world.add(nLight);

    const sLight = new THREE.PointLight(0xf87171, 12, 9);
    sLight.position.set(0, -1.8, 0);
    world.add(sLight);

    const rimA = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimA.position.set(-4, 2, 4);
    scene.add(rimA);

    const rimB = new THREE.DirectionalLight(0xfb7185, 0.4);
    rimB.position.set(4, -2, -4);
    scene.add(rimB);

    // ── Bar magnet ───────────────────────────────────────────
    const POLE_Y = 1.6;
    const R = 0.26;

    // N pole cap glow disc
    const diskGeo = new THREE.CircleGeometry(R * 1.6, 32);
    const nDiskMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const nDisk = new THREE.Mesh(diskGeo, nDiskMat);
    nDisk.position.y = POLE_Y + 0.01;
    nDisk.rotation.x = -Math.PI / 2;
    world.add(nDisk);

    const sDiskMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const sDisk = new THREE.Mesh(diskGeo.clone(), sDiskMat);
    sDisk.position.y = -POLE_Y - 0.01;
    sDisk.rotation.x = Math.PI / 2;
    world.add(sDisk);

    // N pole cylinder
    const cylGeo = (h: number) => new THREE.CylinderGeometry(R, R, h, 40, 1);

    const nMat = new THREE.MeshPhongMaterial({
      color: 0x1e3a8a,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.55,
      shininess: 140,
      specular: new THREE.Color(0x93c5fd),
    });
    const nCyl = new THREE.Mesh(cylGeo(POLE_Y), nMat);
    nCyl.position.y = POLE_Y / 2;
    world.add(nCyl);

    const sMat = new THREE.MeshPhongMaterial({
      color: 0x7f1d1d,
      emissive: 0xdc2626,
      emissiveIntensity: 0.55,
      shininess: 140,
      specular: new THREE.Color(0xfca5a5),
    });
    const sCyl = new THREE.Mesh(cylGeo(POLE_Y), sMat);
    sCyl.position.y = -POLE_Y / 2;
    world.add(sCyl);

    // Chrome equator band
    const bandMat = new THREE.MeshPhongMaterial({
      color: 0x94a3b8,
      shininess: 300,
      specular: new THREE.Color(0xffffff),
    });
    world.add(new THREE.Mesh(new THREE.CylinderGeometry(R + 0.025, R + 0.025, 0.1, 40), bandMat));

    // Pole label halos (torus)
    const nHalo = new THREE.Mesh(
      new THREE.TorusGeometry(R + 0.07, 0.012, 8, 60),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    );
    nHalo.position.y = POLE_Y;
    nHalo.rotation.x = Math.PI / 2;
    world.add(nHalo);

    const sHalo = new THREE.Mesh(
      new THREE.TorusGeometry(R + 0.07, 0.012, 8, 60),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    );
    sHalo.position.y = -POLE_Y;
    sHalo.rotation.x = Math.PI / 2;
    world.add(sHalo);

    // ── Field lines ──────────────────────────────────────────
    // 8 azimuthal × 2 elevation → 16 field lines
    const N_AZ = 8;
    const ELEVATIONS = [32, 62]; // degrees from Y axis
    const R_START = 0.4;
    const fieldLineCurves: THREE.CatmullRomCurve3[] = [];

    for (let az = 0; az < N_AZ; az++) {
      const phi = (az / N_AZ) * Math.PI * 2;
      for (let ei = 0; ei < ELEVATIONS.length; ei++) {
        const theta = (ELEVATIONS[ei] * Math.PI) / 180;
        const x0 = R_START * Math.sin(theta) * Math.cos(phi);
        const y0 = POLE_Y + R_START * Math.cos(theta);
        const z0 = R_START * Math.sin(theta) * Math.sin(phi);
        const pts = traceFieldLine(x0, y0, z0);
        if (pts.length < 6) continue;
        const curve = new THREE.CatmullRomCurve3(pts);
        fieldLineCurves.push(curve);

        const linePts = curve.getPoints(100);
        const geo = new THREE.BufferGeometry().setFromPoints(linePts);
        const mat = new THREE.LineBasicMaterial({
          color: ei === 0 ? 0x00e5ff : 0x0ea5e9,
          transparent: true,
          opacity: ei === 0 ? 0.65 : 0.38,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        world.add(new THREE.Line(geo, mat));
      }
    }

    // ── Flowing particles along field lines ──────────────────
    const PER_LINE = 5;
    const totalFlow = fieldLineCurves.length * PER_LINE;
    const flowPos = new Float32Array(totalFlow * 3);
    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
    const flowMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.07,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const flowPoints = new THREE.Points(flowGeo, flowMat);
    world.add(flowPoints);

    // Track t value per particle
    const flowT = Array.from({ length: totalFlow }, (_, i) =>
      (i % PER_LINE) / PER_LINE,
    );
    const flowSpeed = Array.from({ length: totalFlow }, () => 0.0016 + Math.random() * 0.001);

    // ── Iron filing ambient particles ─────────────────────────
    const FILING_N = 900;
    const filingPos = new Float32Array(FILING_N * 3);
    const filingCol = new Float32Array(FILING_N * 3);
    for (let i = 0; i < FILING_N; i++) {
      const r = 3 + Math.random() * 6;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      filingPos[i * 3]     = r * Math.sin(p) * Math.cos(t);
      filingPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      filingPos[i * 3 + 2] = r * Math.cos(p);
      // Color: mix between blue and silver
      const mix = Math.random();
      filingCol[i * 3]     = 0.58 * mix + 0.35;
      filingCol[i * 3 + 1] = 0.80 * mix + 0.15;
      filingCol[i * 3 + 2] = 1.0;
    }
    const filingGeo = new THREE.BufferGeometry();
    filingGeo.setAttribute("position", new THREE.BufferAttribute(filingPos, 3));
    filingGeo.setAttribute("color", new THREE.BufferAttribute(filingCol, 3));
    scene.add(new THREE.Points(filingGeo, new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.025,
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
    })));

    // ── Animation ─────────────────────────────────────────────
    let animId: number;
    let time = 0;
    let camX = 0, camY = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;

      // Slow Y-rotation of whole scene
      world.rotation.y = time * 0.18;

      // Update flow particles
      for (let i = 0; i < totalFlow; i++) {
        const lineIdx = Math.floor(i / PER_LINE);
        flowT[i] = (flowT[i] + flowSpeed[i]) % 1;
        const p = fieldLineCurves[lineIdx].getPoint(flowT[i]);
        flowPos[i * 3]     = p.x;
        flowPos[i * 3 + 1] = p.y;
        flowPos[i * 3 + 2] = p.z;
      }
      flowGeo.attributes.position.needsUpdate = true;

      // Pulse pole lights
      nLight.intensity = 18 + Math.sin(time * 2.2) * 5;
      sLight.intensity = 12 + Math.cos(time * 1.9) * 4;

      // Pulse halos
      nHalo.scale.setScalar(1 + Math.sin(time * 3) * 0.06);
      sHalo.scale.setScalar(1 + Math.cos(time * 3.3) * 0.06);
      (nHalo.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(time * 2) * 0.25;
      (sHalo.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.cos(time * 2.4) * 0.25;
      (nDiskMat).opacity = 0.2 + Math.sin(time * 2) * 0.12;
      (sDiskMat).opacity = 0.2 + Math.cos(time * 2.3) * 0.12;

      // Mouse parallax on camera (smooth damp)
      camX += (mouseRef.current.x * 2.5 - camX) * 0.03;
      camY += (-mouseRef.current.y * 1.5 - camY) * 0.03;
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
