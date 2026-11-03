import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  time: number; // Current playhead time in seconds
  isPlaying: boolean;
  colorScheme?: {
    accent: string;
    secondary: string;
  };
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  time,
  isPlaying,
  colorScheme = { accent: '#00F0FF', secondary: '#FF007A' },
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    meshGroup: THREE.Group;
    particles: THREE.Points;
    outerRing: THREE.LineSegments;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // Create Three.js Scene
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // 1. Central Icosahedron Wireframe
    const geoIcosahedron = new THREE.IcosahedronGeometry(1.7, 1);
    const wireframeGeo = new THREE.WireframeGeometry(geoIcosahedron);
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(colorScheme.accent),
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const icosaWire = new THREE.LineSegments(wireframeGeo, lineMat);
    meshGroup.add(icosaWire);

    // 2. Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorScheme.secondary),
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    meshGroup.add(innerCore);

    // 3. Orbiting Particles
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(colorScheme.accent);
    const color2 = new THREE.Color(colorScheme.secondary);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const mixed = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Outer Celestial Orbit Ring
    const ringGeo = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
    const ringWire = new THREE.WireframeGeometry(ringGeo);
    const ringMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(colorScheme.accent),
      transparent: true,
      opacity: 0.4,
    });
    const outerRing = new THREE.LineSegments(ringWire, ringMat);
    outerRing.rotation.x = Math.PI / 3;
    scene.add(outerRing);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      meshGroup,
      particles,
      outerRing,
    };

    const handleResize = () => {
      if (!container || !sceneRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geoIcosahedron.dispose();
      lineMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update scene when time or playhead changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera, renderer, scene, meshGroup, particles, outerRing } = sceneRef.current;

    const t = time;

    // Smooth rotational choreography
    meshGroup.rotation.x = t * 0.45;
    meshGroup.rotation.y = t * 0.7;
    meshGroup.rotation.z = Math.sin(t * 0.8) * 0.2;

    // Pulse scale dynamically
    const pulse = 1 + Math.sin(t * 3.5) * 0.06;
    meshGroup.scale.set(pulse, pulse, pulse);

    particles.rotation.y = -t * 0.25;
    particles.rotation.z = t * 0.15;

    outerRing.rotation.z = t * 0.3;
    outerRing.rotation.y = Math.sin(t * 0.5) * 0.4;

    // Camera orbit
    camera.position.x = Math.sin(t * 0.3) * 1.2;
    camera.position.y = Math.cos(t * 0.2) * 0.6;
    camera.position.z = 6.8 + Math.sin(t * 0.5) * 0.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }, [time]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center overflow-hidden"
    />
  );
};
