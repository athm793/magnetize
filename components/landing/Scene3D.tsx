"use client";
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050f, 0.045);

    // ── Camera ───────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 11);

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x05050f, 1);
    mount.appendChild(renderer.domElement);

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.06));

    const violetLight = new THREE.PointLight(0x7c3aed, 12, 25);
    violetLight.position.set(-5, 5, 3);
    scene.add(violetLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 6, 20);
    blueLight.position.set(5, -3, -3);
    scene.add(blueLight);

    const pinkLight = new THREE.PointLight(0xa855f7, 5, 18);
    pinkLight.position.set(0, 7, -5);
    scene.add(pinkLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.4);
    rimLight.position.set(-3, 2, 5);
    scene.add(rimLight);

    // ── Central torus knot ───────────────────────────────────
    const torusGeo = new THREE.TorusKnotGeometry(1.8, 0.5, 220, 24, 2, 3);

    const torusMat = new THREE.MeshPhongMaterial({
      color: 0x5b21b6,
      emissive: 0x2e1065,
      emissiveIntensity: 0.4,
      shininess: 120,
      specular: new THREE.Color(0xa78bfa),
      transparent: true,
      opacity: 0.92,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    // Wireframe shell
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wire = new THREE.Mesh(torusGeo, wireMat);
    scene.add(wire);

    // ── Particle field ───────────────────────────────────────
    const COUNT = 3500;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    const c1 = new THREE.Color(0x7c3aed);
    const c2 = new THREE.Color(0x60a5fa);
    const c3 = new THREE.Color(0xffffff);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const r = 5 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const t = Math.random();
      const pc = t < 0.5
        ? c1.clone().lerp(c2, t * 2)
        : c2.clone().lerp(c3, (t - 0.5) * 2);
      col[i3] = pc.r; col[i3 + 1] = pc.g; col[i3 + 2] = pc.b;
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    ptGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const ptMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(ptGeo, ptMat);
    scene.add(particles);

    // ── Floating orbs ────────────────────────────────────────
    const orbGroup = new THREE.Group();
    const orbData: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];

    const orbDefs = [
      { p: [-3.5, 2.5, -2], s: 0.18, c: 0xa855f7 },
      { p: [3.5, -2,   -3], s: 0.14, c: 0x60a5fa },
      { p: [-4.5, -2.5, 1], s: 0.12, c: 0x7c3aed },
      { p: [4.2,  3.2,  2], s: 0.16, c: 0xa78bfa },
      { p: [-2.2, 4.5, -1], s: 0.13, c: 0x818cf8 },
      { p: [2.5,  -4.5, 0], s: 0.15, c: 0x60a5fa },
      { p: [-4.2, 0.5,  3], s: 0.11, c: 0xc4b5fd },
      { p: [4.5,  0.5, -4], s: 0.14, c: 0x7c3aed },
      { p: [0.5,  4,    4], s: 0.10, c: 0xa855f7 },
      { p: [-0.5, -4,  -2], s: 0.12, c: 0x60a5fa },
      { p: [3,    1.5, -5], s: 0.09, c: 0xc4b5fd },
      { p: [-3,  -1.5,  5], s: 0.10, c: 0x818cf8 },
    ];

    orbDefs.forEach(({ p, s, c }, i) => {
      const geo = new THREE.SphereGeometry(s, 20, 20);
      const mat = new THREE.MeshPhongMaterial({
        color: c,
        emissive: c,
        emissiveIntensity: 0.6,
        shininess: 80,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p[0], p[1], p[2]);
      orbGroup.add(mesh);
      orbData.push({ mesh, baseY: p[1], phase: i * 0.63 });
    });
    scene.add(orbGroup);

    // Connecting lines between adjacent orbs
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6d28d9,
      transparent: true,
      opacity: 0.12,
    });
    for (let i = 0; i < orbDefs.length; i++) {
      const a = new THREE.Vector3(...(orbDefs[i].p as [number, number, number]));
      const b = new THREE.Vector3(...(orbDefs[(i + 3) % orbDefs.length].p as [number, number, number]));
      const lineGeo = new THREE.BufferGeometry().setFromPoints([a, b]);
      scene.add(new THREE.Line(lineGeo, lineMat));
    }

    // ── Ring halo around torus ───────────────────────────────
    const ringGeo = new THREE.TorusGeometry(3.2, 0.015, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.25 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.01, 8, 120), new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.12 }));
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    // ── Animation ────────────────────────────────────────────
    let animId: number;
    let time = 0;
    let camX = 0, camY = 0.5;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;

      // Torus rotation
      torus.rotation.x = time * 0.25;
      torus.rotation.y = time * 0.38;
      wire.rotation.x = torus.rotation.x;
      wire.rotation.y = torus.rotation.y;

      // Particle drift
      particles.rotation.y = time * 0.04;
      particles.rotation.x = Math.sin(time * 0.07) * 0.15;

      // Orb float
      orbData.forEach(({ mesh, baseY, phase }) => {
        mesh.position.y = baseY + Math.sin(time * 1.2 + phase) * 0.18;
      });

      // Ring rotation
      ring1.rotation.z = time * 0.15;
      ring2.rotation.z = -time * 0.10;
      ring2.rotation.y = time * 0.08;

      // Pulsing lights
      violetLight.intensity = 12 + Math.sin(time * 1.8) * 3;
      blueLight.intensity   =  6 + Math.cos(time * 1.3) * 1.5;
      pinkLight.intensity   =  5 + Math.sin(time * 2.1 + 1) * 1.5;

      // Camera parallax — smooth damp toward mouse
      camX += (mouseRef.current.x * 1.8 - camX) * 0.03;
      camY += (0.5 - mouseRef.current.y * 1.0 - camY) * 0.03;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ───────────────────────────────────────────────
    function onResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [handleMouseMove]);

  return <div ref={mountRef} className="w-full h-full" />;
}
