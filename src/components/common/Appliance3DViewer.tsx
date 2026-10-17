import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  RotateCcw,
  Ruler,
  Shield,
  ChevronDown,
  ChevronUp,
  Camera,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types';

interface Appliance3DViewerProps {
  product: Product;
  theme?: 'black' | 'cream';
  className?: string;
  showControls?: boolean;
  initialCameraView?: 'isometric' | 'front' | 'side' | 'top';
}

export const Appliance3DViewer: React.FC<Appliance3DViewerProps> = ({
  product,
  theme = 'black',
  className = '',
  showControls = true,
  initialCameraView = 'isometric',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'black';

  // Interactive control states
  const [doorOpenRatio, setDoorOpenRatio] = useState(0); // 0 to 1
  const [showDimensions, setShowDimensions] = useState(true);
  const [showClearance, setShowClearance] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeLighting, setActiveLighting] = useState<'warm' | 'cool' | 'noir'>('warm');
  const [currentView, setCurrentView] = useState<'isometric' | 'front' | 'side' | 'top'>(initialCameraView);

  // Mutable refs for Three.js animation tick
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const doorGroupRef = useRef<THREE.Group | null>(null);
  const basketGroupRef = useRef<THREE.Group | null>(null);
  const dimensionsGroupRef = useRef<THREE.Group | null>(null);
  const clearanceGroupRef = useRef<THREE.Group | null>(null);
  const targetDoorAngleRef = useRef(0);
  const targetBasketOffsetRef = useRef(0);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Measurements in real scale (1 unit = 10 cm, so 50 cm = 5 units)
  const widthCm = product.dimensions.widthCm || 45;
  const heightCm = product.dimensions.heightCm || 32;
  const depthCm = product.dimensions.depthCm || 35;
  const clearanceCm = product.dimensions.ventilationClearanceCm || 10;
  const isOTG = product.category === 'OTG';

  // Convert to 3D world units (1 unit = 10 cm)
  const scale = 0.1;
  const w = widthCm * scale;
  const h = heightCm * scale;
  const d = depthCm * scale;
  const clr = clearanceCm * scale;

  useEffect(() => {
    targetDoorAngleRef.current = doorOpenRatio * (Math.PI / 2.1); // ~85 degrees open
    targetBasketOffsetRef.current = doorOpenRatio * (d * 0.55); // slide basket out
  }, [doorOpenRatio, d]);

  useEffect(() => {
    if (dimensionsGroupRef.current) {
      dimensionsGroupRef.current.visible = showDimensions;
    }
  }, [showDimensions]);

  useEffect(() => {
    if (clearanceGroupRef.current) {
      clearanceGroupRef.current.visible = showClearance;
    }
  }, [showClearance]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.6;
    }
  }, [autoRotate]);

  // Handle camera view presets
  const setCameraView = (view: 'isometric' | 'front' | 'side' | 'top') => {
    setCurrentView(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const maxDim = Math.max(w, h, d);
    const dist = maxDim * 2.15;

    const targetPos = new THREE.Vector3();
    switch (view) {
      case 'front':
        targetPos.set(0, h * 0.52, dist * 1.12);
        break;
      case 'side':
        targetPos.set(dist * 1.18, h * 0.52, 0);
        break;
      case 'top':
        targetPos.set(0.01, dist * 1.35, 0.01);
        break;
      case 'isometric':
      default:
        targetPos.set(dist * 0.82, dist * 0.72, dist * 0.92);
        break;
    }

    camera.position.copy(targetPos);
    controls.target.set(0, h * 0.48, 0);
    controls.update();
  };

  // Zoom helper for effortless button control
  const handleZoom = (factor: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    const newLen = THREE.MathUtils.clamp(
      dir.length() * factor,
      controls.minDistance,
      controls.maxDistance
    );
    dir.setLength(newLen);
    camera.position.copy(controls.target).add(dir);
    controls.update();
  };

  // Switch studio lighting presets
  const changeLighting = (mode: 'warm' | 'cool' | 'noir') => {
    setActiveLighting(mode);
    const key = keyLightRef.current;
    const fill = fillLightRef.current;
    if (!key || !fill) return;

    if (mode === 'warm') {
      key.color.setHex(0xfff1db);
      key.intensity = 2.4;
      fill.color.setHex(0xffecd2);
      fill.groundColor.setHex(0x221a14);
      fill.intensity = 1.15;
    } else if (mode === 'cool') {
      key.color.setHex(0xffffff);
      key.intensity = 2.3;
      fill.color.setHex(0xf4f4f5);
      fill.groundColor.setHex(0x18181b);
      fill.intensity = 1.05;
    } else {
      key.color.setHex(0xffb366);
      key.intensity = 2.7;
      fill.color.setHex(0x3f3f46);
      fill.groundColor.setHex(0x050507);
      fill.intensity = 0.85;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. Scene, Camera & Renderer Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // --- 2. Procedural Studio Environment ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // --- 3. Studio Lighting Rig ---
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.4);
    keyLight.position.set(w * 1.5, h * 2.5, d * 2.2);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0005;
    const dMax = Math.max(w, h, d) * 1.5;
    keyLight.shadow.camera.left = -dMax;
    keyLight.shadow.camera.right = dMax;
    keyLight.shadow.camera.top = dMax;
    keyLight.shadow.camera.bottom = -dMax;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.HemisphereLight(0xffedd5, 0x181512, 1.2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0xfde68a, 1.0);
    rimLight.position.set(-w * 2, h * 1.5, -d * 2);
    scene.add(rimLight);

    // --- 4. OrbitControls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.minDistance = Math.max(w, h, d) * 0.75;
    controls.maxDistance = Math.max(w, h, d) * 4.5;
    controlsRef.current = controls;

    // --- 5. Kitchen Countertop Ground & Tape Measure Scale ---
    const counterWidth = Math.max(w + clr * 2.5, 9);
    const counterDepth = Math.max(d + clr * 2.5, 9);
    const counterGeo = new THREE.BoxGeometry(counterWidth, 0.4, counterDepth);
    const counterMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0d0d10 : 0xede8dc,
      roughness: 0.32,
      metalness: 0.12,
    });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.y = -0.2;
    counter.receiveShadow = true;
    scene.add(counter);

    // Countertop measurement grid lines (10 cm = 1.0 unit grid spacing, Obsidian/Champagne Gold)
    const gridHelper = new THREE.GridHelper(
      Math.max(counterWidth, counterDepth),
      Math.round(Math.max(counterWidth, counterDepth)),
      isDark ? 0xfbbf24 : 0xb45309,
      isDark ? 0x27272a : 0xd6cebe
    );
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    // Soft radial contact shadow under appliance
    const shadowGeo = new THREE.PlaneGeometry(w * 1.3, d * 1.3);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.26)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005;
    scene.add(contactShadow);

    // --- 6. Procedural Composite Appliance Model ---
    const applianceRoot = new THREE.Group();
    applianceRoot.position.y = 0;
    scene.add(applianceRoot);

    const brushedMetalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1c1c21 : 0x27272a,
      metalness: 0.86,
      roughness: 0.22,
    });

    const chromeTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f5,
      metalness: 0.95,
      roughness: 0.1,
    });

    const glassDoorMat = new THREE.MeshPhysicalMaterial({
      color: 0x050507,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      ior: 1.52,
      thickness: 0.3,
      transparent: true,
      opacity: 0.92,
    });

    const interiorCavityMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.45,
      metalness: 0.6,
    });

    const heatingElementMat = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      emissive: 0xff3b00,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });

    const rubberFootMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.8,
    });

    // Interactive meshes list for direct click-to-open raycasting
    const interactiveMeshes: THREE.Object3D[] = [];

    // Four rubberized feet
    const footRadius = 0.14;
    const footHeight = 0.12;
    const footGeo = new THREE.CylinderGeometry(footRadius, footRadius * 1.15, footHeight, 16);
    const fx = w * 0.44;
    const fz = d * 0.44;
    [
      [-fx, -fz],
      [fx, -fz],
      [-fx, fz],
      [fx, fz],
    ].forEach(([x, z]) => {
      const foot = new THREE.Mesh(footGeo, rubberFootMat);
      foot.position.set(x, footHeight * 0.5, z);
      foot.castShadow = true;
      applianceRoot.add(foot);
    });

    const bodyY = footHeight;

    if (isOTG) {
      const chassisHeight = h - footHeight;
      const chassisGeo = new THREE.BoxGeometry(w, chassisHeight, d);
      const chassis = new THREE.Mesh(chassisGeo, brushedMetalMat);
      chassis.position.set(0, bodyY + chassisHeight * 0.5, 0);
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      applianceRoot.add(chassis);

      const cavityW = w * 0.72;
      const cavityH = chassisHeight * 0.78;
      const cavityD = d * 0.85;
      const cavityGeo = new THREE.BoxGeometry(cavityW, cavityH, cavityD);
      const cavity = new THREE.Mesh(cavityGeo, interiorCavityMat);
      cavity.position.set(-w * 0.1, bodyY + chassisHeight * 0.5, 0.02);
      applianceRoot.add(cavity);

      const coilRadius = 0.05;
      const coilLength = cavityW * 0.88;
      const coilGeo = new THREE.CylinderGeometry(coilRadius, coilRadius, coilLength, 12);
      coilGeo.rotateZ(Math.PI / 2);

      const topCoil1 = new THREE.Mesh(coilGeo, heatingElementMat);
      topCoil1.position.set(-w * 0.1, bodyY + cavityH * 0.88, -d * 0.2);
      applianceRoot.add(topCoil1);

      const topCoil2 = new THREE.Mesh(coilGeo, heatingElementMat);
      topCoil2.position.set(-w * 0.1, bodyY + cavityH * 0.88, d * 0.15);
      applianceRoot.add(topCoil2);

      const botCoil1 = new THREE.Mesh(coilGeo, heatingElementMat);
      botCoil1.position.set(-w * 0.1, bodyY + cavityH * 0.18, -d * 0.2);
      applianceRoot.add(botCoil1);

      const botCoil2 = new THREE.Mesh(coilGeo, heatingElementMat);
      botCoil2.position.set(-w * 0.1, bodyY + cavityH * 0.18, d * 0.15);
      applianceRoot.add(botCoil2);

      const wireRackGeo = new THREE.BoxGeometry(cavityW * 0.94, 0.02, cavityD * 0.88);
      const wireRackMat = new THREE.MeshStandardMaterial({
        color: 0xd4d4d8,
        metalness: 0.95,
        roughness: 0.15,
      });
      const wireRack = new THREE.Mesh(wireRackGeo, wireRackMat);
      wireRack.position.set(-w * 0.1, bodyY + cavityH * 0.5, 0);
      applianceRoot.add(wireRack);

      const spitGeo = new THREE.CylinderGeometry(0.03, 0.03, cavityW * 0.98, 8);
      spitGeo.rotateZ(Math.PI / 2);
      const spit = new THREE.Mesh(spitGeo, chromeTrimMat);
      spit.position.set(-w * 0.1, bodyY + cavityH * 0.52, 0);
      applianceRoot.add(spit);

      const consoleW = w * 0.22;
      const consoleX = w * 0.36;

      const displayGeo = new THREE.BoxGeometry(consoleW * 0.75, 0.45, 0.04);
      const displayMat = new THREE.MeshBasicMaterial({ color: 0x050507 });
      const display = new THREE.Mesh(displayGeo, displayMat);
      display.position.set(consoleX, bodyY + chassisHeight * 0.78, d * 0.505);
      applianceRoot.add(display);

      const dialRadius = 0.22;
      const dialDepth = 0.14;
      const dialGeo = new THREE.CylinderGeometry(dialRadius, dialRadius, dialDepth, 24);
      dialGeo.rotateX(Math.PI / 2);
      [0.55, 0.35, 0.18].forEach((relY) => {
        const dial = new THREE.Mesh(dialGeo, chromeTrimMat);
        dial.position.set(consoleX, bodyY + chassisHeight * relY, d * 0.52);
        dial.castShadow = true;
        applianceRoot.add(dial);
      });

      const doorGroup = new THREE.Group();
      const doorPivotY = bodyY + chassisHeight * 0.06;
      const doorPivotZ = d * 0.5;
      doorGroup.position.set(-w * 0.1, doorPivotY, doorPivotZ);

      const doorFrameH = chassisHeight * 0.88;
      const doorFrameW = cavityW + 0.15;
      const glassGeo = new THREE.BoxGeometry(doorFrameW, doorFrameH, 0.06);
      const doorGlass = new THREE.Mesh(glassGeo, glassDoorMat);
      doorGlass.position.set(0, doorFrameH * 0.5, 0.03);
      doorGlass.castShadow = true;
      doorGroup.add(doorGlass);

      const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, doorFrameW * 0.8, 16);
      handleGeo.rotateZ(Math.PI / 2);
      const handle = new THREE.Mesh(handleGeo, chromeTrimMat);
      handle.position.set(0, doorFrameH * 0.92, 0.25);
      doorGroup.add(handle);

      interactiveMeshes.push(doorGlass, handle);
      applianceRoot.add(doorGroup);
      doorGroupRef.current = doorGroup;
    } else {
      const fryerHeight = h - footHeight;

      const topRadius = w * 0.44;
      const bottomRadius = w * 0.48;
      const bodyGeo = new THREE.CylinderGeometry(topRadius, bottomRadius, fryerHeight, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x141418 : 0x222226,
        roughness: 0.18,
        metalness: 0.45,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.set(0, bodyY + fryerHeight * 0.5, 0);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      applianceRoot.add(bodyMesh);

      const topGrilleGeo = new THREE.CylinderGeometry(topRadius * 0.82, topRadius * 0.82, 0.08, 24);
      const topGrilleMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.6,
        metalness: 0.2,
      });
      const topGrille = new THREE.Mesh(topGrilleGeo, topGrilleMat);
      topGrille.position.set(0, bodyY + fryerHeight + 0.02, 0);
      applianceRoot.add(topGrille);

      const panelGeo = new THREE.BoxGeometry(w * 0.62, fryerHeight * 0.32, 0.06);
      const panelMat = new THREE.MeshPhysicalMaterial({
        color: 0x050507,
        roughness: 0.08,
        metalness: 0.3,
        clearcoat: 1.0,
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(0, bodyY + fryerHeight * 0.72, d * 0.46);
      panel.rotation.x = -0.15;
      applianceRoot.add(panel);

      // Warm Champagne Gold Digital LED Status Readout
      const ledGeo = new THREE.PlaneGeometry(w * 0.4, 0.3);
      const ledMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, bodyY + fryerHeight * 0.74, d * 0.5);
      led.rotation.x = -0.15;
      applianceRoot.add(led);

      const basketGroup = new THREE.Group();
      const basketW = w * 0.72;
      const basketH = fryerHeight * 0.44;
      const basketD = d * 0.72;
      const drawerGeo = new THREE.BoxGeometry(basketW, basketH, basketD);
      const drawerMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x1c1c22 : 0x27272a,
        roughness: 0.25,
        metalness: 0.5,
      });
      const drawer = new THREE.Mesh(drawerGeo, drawerMat);
      drawer.position.set(0, 0, 0);
      drawer.castShadow = true;
      basketGroup.add(drawer);

      const handleW = 0.16;
      const handleH = basketH * 0.65;
      const handleD = 0.55;
      const bHandleGeo = new THREE.BoxGeometry(handleW, handleH, handleD);
      const bHandle = new THREE.Mesh(bHandleGeo, chromeTrimMat);
      bHandle.position.set(0, 0, basketD * 0.5 + handleD * 0.5);
      bHandle.castShadow = true;
      basketGroup.add(bHandle);

      interactiveMeshes.push(drawer, bHandle);
      basketGroup.position.set(0, bodyY + basketH * 0.5 + 0.1, 0);
      applianceRoot.add(basketGroup);
      basketGroupRef.current = basketGroup;
    }

    // --- 7. Real-World 3D Measurements & Caliper Lines (Obsidian & Champagne Gold) ---
    const dimensionsGroup = new THREE.Group();
    dimensionsGroupRef.current = dimensionsGroup;
    scene.add(dimensionsGroup);

    const dimColor = isDark ? 0xfbbf24 : 0xb45309;
    const dimLineMat = new THREE.LineBasicMaterial({
      color: dimColor,
      linewidth: 2,
    });

    const createDimensionMarker = (
      start: THREE.Vector3,
      end: THREE.Vector3,
      tickSize: number,
      text: string
    ) => {
      const group = new THREE.Group();

      const points = [start, end];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, dimLineMat);
      group.add(line);

      const isX = Math.abs(end.x - start.x) > 0.1;
      const isY = Math.abs(end.y - start.y) > 0.1;

      let tick1P: [THREE.Vector3, THREE.Vector3];
      let tick2P: [THREE.Vector3, THREE.Vector3];

      if (isX) {
        tick1P = [
          new THREE.Vector3(start.x, start.y, start.z - tickSize),
          new THREE.Vector3(start.x, start.y, start.z + tickSize),
        ];
        tick2P = [
          new THREE.Vector3(end.x, end.y, end.z - tickSize),
          new THREE.Vector3(end.x, end.y, end.z + tickSize),
        ];
      } else if (isY) {
        tick1P = [
          new THREE.Vector3(start.x - tickSize, start.y, start.z),
          new THREE.Vector3(start.x + tickSize, start.y, start.z),
        ];
        tick2P = [
          new THREE.Vector3(end.x - tickSize, end.y, end.z),
          new THREE.Vector3(end.x + tickSize, end.y, end.z),
        ];
      } else {
        tick1P = [
          new THREE.Vector3(start.x - tickSize, start.y, start.z),
          new THREE.Vector3(start.x + tickSize, start.y, start.z),
        ];
        tick2P = [
          new THREE.Vector3(end.x - tickSize, end.y, end.z),
          new THREE.Vector3(end.x + tickSize, end.y, end.z),
        ];
      }

      const t1Geo = new THREE.BufferGeometry().setFromPoints(tick1P);
      const t2Geo = new THREE.BufferGeometry().setFromPoints(tick2P);
      group.add(new THREE.Line(t1Geo, dimLineMat));
      group.add(new THREE.Line(t2Geo, dimLineMat));

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const lCtx = labelCanvas.getContext('2d');
      if (lCtx) {
        lCtx.fillStyle = isDark ? 'rgba(9, 9, 11, 0.92)' : 'rgba(250, 248, 244, 0.95)';
        lCtx.strokeStyle = isDark ? '#fbbf24' : '#b45309';
        lCtx.lineWidth = 4;
        lCtx.fillRect(2, 2, 252, 60);
        lCtx.strokeRect(2, 2, 252, 60);

        lCtx.fillStyle = isDark ? '#fef3c7' : '#1c1917';
        lCtx.font = 'bold 25px sans-serif';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        lCtx.fillText(text, 128, 32);
      }

      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const spriteMat = new THREE.SpriteMaterial({ map: labelTex, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(mid);
      sprite.scale.set(1.35, 0.34, 1);
      group.add(sprite);

      return group;
    };

    // 1. Width Dimension Line
    const wStart = new THREE.Vector3(-w * 0.5, 0.15, d * 0.5 + 0.4);
    const wEnd = new THREE.Vector3(w * 0.5, 0.15, d * 0.5 + 0.4);
    dimensionsGroup.add(createDimensionMarker(wStart, wEnd, 0.15, `W: ${widthCm} cm`));

    // 2. Height Dimension Line
    const hStart = new THREE.Vector3(-w * 0.5 - 0.4, 0, d * 0.5);
    const hEnd = new THREE.Vector3(-w * 0.5 - 0.4, h, d * 0.5);
    dimensionsGroup.add(createDimensionMarker(hStart, hEnd, 0.15, `H: ${heightCm} cm`));

    // 3. Depth Dimension Line
    const dStart = new THREE.Vector3(w * 0.5 + 0.4, 0.15, -d * 0.5);
    const dEnd = new THREE.Vector3(w * 0.5 + 0.4, 0.15, d * 0.5);
    dimensionsGroup.add(createDimensionMarker(dStart, dEnd, 0.15, `D: ${depthCm} cm`));

    // --- 8. Recommended Ventilation Clearance Safety Zone ---
    const clearanceGroup = new THREE.Group();
    clearanceGroupRef.current = clearanceGroup;
    clearanceGroup.visible = false;
    scene.add(clearanceGroup);

    const safeBoxW = w + clr * 2;
    const safeBoxH = h + clr * 1.5;
    const safeBoxD = d + clr * 2;
    const clearanceBoxGeo = new THREE.BoxGeometry(safeBoxW, safeBoxH, safeBoxD);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const clearanceBox = new THREE.Mesh(clearanceBoxGeo, wireframeMat);
    clearanceBox.position.set(0, safeBoxH * 0.5, 0);
    clearanceGroup.add(clearanceBox);

    // Direct 3D Click Raycaster: Click door or basket directly in 3D to open/close!
    const raycaster = new THREE.Raycaster();
    const pointerDownPos = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos.set(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist > 6) return; // Ignore orbit drags
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);
      if (hits.length > 0) {
        setDoorOpenRatio((prev) => (prev > 0.2 ? 0 : 1));
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // Initial camera setup
    setCameraView(initialCameraView);

    // --- 9. Animation & Render Loop with Exponential Damping ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (doorGroupRef.current) {
        doorGroupRef.current.rotation.x = THREE.MathUtils.damp(
          doorGroupRef.current.rotation.x,
          targetDoorAngleRef.current,
          8,
          delta
        );
      }

      if (basketGroupRef.current) {
        basketGroupRef.current.position.z = THREE.MathUtils.damp(
          basketGroupRef.current.position.z,
          targetBasketOffsetRef.current,
          8,
          delta
        );
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- 10. Responsive ResizeObserver (Adapts immediately when dock collapses/expands) ---
    const updateSize = () => {
      if (!container) return;
      const wRes = container.clientWidth || 600;
      const hRes = container.clientHeight || 360;
      if (wRes === 0 || hRes === 0) return;
      camera.aspect = wRes / hRes;
      camera.updateProjectionMatrix();
      renderer.setSize(wRes, hRes);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    if (resizeObserver) {
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', updateSize);

    // --- Cleanup on unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
      });
      renderer.dispose();
      counterGeo.dispose();
      counterMat.dispose();
      brushedMetalMat.dispose();
      chromeTrimMat.dispose();
      glassDoorMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [widthCm, heightCm, depthCm, clearanceCm, isOTG, isDark]);

  return (
    <div
      className={`flex flex-col w-full h-full min-h-[460px] sharp-box overflow-hidden select-none ${
        isDark ? 'bg-[#050507] text-white' : 'bg-[#faf8f4] text-stone-900'
      } ${className}`}
    >
      {/* ZONE 1: NON-OVERLAPPING TOP STATUS & QUICK CAMERA BAR */}
      <div
        className={`shrink-0 px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 z-10 ${
          isDark
            ? 'bg-black/75 border-white/15 text-white backdrop-blur-xl'
            : 'bg-white/90 border-amber-900/15 text-stone-900 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`px-2 py-0.5 sharp-pill text-[10px] font-bold uppercase tracking-wider font-mono border shrink-0 ${
              isDark
                ? 'bg-white/10 text-amber-200 border-white/20'
                : 'bg-amber-100 text-amber-900 border-amber-900/20'
            }`}
          >
            1:1 Scale 3D
          </span>
          <span className="font-display text-xs sm:text-sm font-bold tracking-tight truncate">
            {product.brand} {product.model}
          </span>
          <span className="hidden md:inline text-[11px] font-mono opacity-75 shrink-0">
            ({widthCm}W × {heightCm}H × {depthCm}D cm)
          </span>
        </div>

        {/* Quick Camera Zoom & Reset Strip (Docked in Top Bar, Never Blocking Model) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline text-[10px] opacity-60 font-mono mr-1">
            Drag to orbit · Click door to open
          </span>
          <button
            type="button"
            onClick={() => handleZoom(0.82)}
            className={`p-1.5 sharp-pill border transition ${
              isDark
                ? 'bg-zinc-900/90 hover:bg-zinc-800 border-white/15 text-zinc-200'
                : 'bg-white hover:bg-amber-50 border-amber-900/15 text-stone-700'
            }`}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.22)}
            className={`p-1.5 sharp-pill border transition ${
              isDark
                ? 'bg-zinc-900/90 hover:bg-zinc-800 border-white/15 text-zinc-200'
                : 'bg-white hover:bg-amber-50 border-amber-900/15 text-stone-700'
            }`}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCameraView('isometric')}
            className={`p-1.5 sharp-pill border transition ${
              isDark
                ? 'bg-zinc-900/90 hover:bg-zinc-800 border-white/15 text-zinc-200'
                : 'bg-white hover:bg-amber-50 border-amber-900/15 text-stone-700'
            }`}
            title="Reset 3D View"
            aria-label="Reset 3D View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ZONE 2: 100% UNOBSTRUCTED 3D WEBGL VIEWPORT CANVAS */}
      <div className="relative flex-1 w-full min-h-[260px] sm:min-h-[320px] overflow-hidden">
        <div
          ref={containerRef}
          data-testid="appliance-3d-canvas"
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* ZONE 3: DOCKED BELOW-CANVAS SIMULATION CONTROLLER (ZERO OVERLAP ON 3D MODEL) */}
      {showControls && (
        <div
          className={`shrink-0 border-t transition-all duration-300 z-10 ${
            isDark
              ? 'bg-black/85 border-white/15 text-zinc-100 backdrop-blur-2xl'
              : 'bg-[#faf8f4]/95 border-amber-900/15 text-stone-900 backdrop-blur-2xl'
          }`}
        >
          {/* Compact Controller Header Bar */}
          <div
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className={`px-4 py-2 flex items-center justify-between cursor-pointer border-b ${
              isDark
                ? 'border-white/10 hover:bg-white/5'
                : 'border-amber-900/10 hover:bg-amber-100/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ruler className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                3D Simulation Deck
              </span>
              <span className="text-[10px] opacity-60 hidden sm:inline">
                — Docked outside viewport for unobstructed 3D control
              </span>
            </div>
            <button
              type="button"
              className="text-[11px] opacity-75 hover:opacity-100 flex items-center gap-1 font-semibold"
            >
              <span>{isDockCollapsed ? 'Expand Deck' : 'Minimize Deck'}</span>
              {isDockCollapsed ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Docked Control Deck Body */}
          {!isDockCollapsed && (
            <div className="p-3 sm:px-4 sm:py-3 space-y-2.5 text-xs">
              {/* Row 1: Door / Basket Slider + Camera Preset Angles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Door / Basket Interactive Control */}
                <div className="flex items-center gap-2.5 flex-1">
                  <span className="font-semibold text-[11px] whitespace-nowrap">
                    {isOTG ? 'Oven Door:' : 'Fryer Basket:'}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={doorOpenRatio}
                    onChange={(e) => setDoorOpenRatio(parseFloat(e.target.value))}
                    aria-label={isOTG ? 'Oven Door Swing' : 'Pull-Out Basket'}
                    className="w-full max-w-[140px] accent-amber-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setDoorOpenRatio((prev) => (prev > 0 ? 0 : 1))}
                    className={`px-2.5 py-1 sharp-pill text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition ${
                      doorOpenRatio > 0
                        ? isDark
                          ? 'bg-white text-black border-white font-extrabold'
                          : 'bg-stone-900 text-amber-50 border-stone-800'
                        : isDark
                        ? 'bg-zinc-900 text-zinc-200 border-white/15 hover:border-white/35'
                        : 'bg-white text-stone-800 border-amber-900/15'
                    }`}
                  >
                    {doorOpenRatio > 0 ? 'Close' : isOTG ? 'Open Door' : 'Pull Basket'}
                  </button>
                </div>

                {/* Camera View Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[11px] font-semibold opacity-70 shrink-0 flex items-center gap-1 mr-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Angle:</span>
                  </span>
                  {(['isometric', 'front', 'side', 'top'] as const).map((v) => {
                    const labels = {
                      isometric: '3D Iso',
                      front: 'Front',
                      side: 'Side',
                      top: 'Top',
                    };
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCameraView(v)}
                        className={`px-2.5 py-1 sharp-pill text-[11px] font-semibold transition border whitespace-nowrap ${
                          currentView === v
                            ? isDark
                              ? 'bg-white text-black font-extrabold border-white shadow-sm'
                              : 'bg-stone-900 text-amber-50 border-stone-800'
                            : isDark
                            ? 'bg-zinc-900/90 text-zinc-300 border-white/10 hover:text-white'
                            : 'bg-white text-stone-700 border-amber-900/15'
                        }`}
                      >
                        {labels[v]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Calipers, Safety Clearance, Auto Spin & Studio Lighting */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${
                  isDark ? 'border-white/10' : 'border-amber-900/10'
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowDimensions((p) => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 sharp-pill text-[11px] font-semibold border transition ${
                      showDimensions
                        ? isDark
                          ? 'bg-amber-400/15 text-amber-200 border-amber-300/40'
                          : 'bg-amber-100 text-stone-900 border-amber-900/30 font-bold'
                        : 'opacity-55 hover:opacity-90 border-transparent'
                    }`}
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Calipers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowClearance((p) => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 sharp-pill text-[11px] font-semibold border transition ${
                      showClearance
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'opacity-55 hover:opacity-90 border-transparent'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>Safety (+{clearanceCm}cm)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoRotate((p) => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 sharp-pill text-[11px] font-semibold border transition ${
                      autoRotate
                        ? isDark
                          ? 'bg-white/15 text-white border-white/35 font-bold'
                          : 'bg-stone-900 text-amber-50 border-stone-800'
                        : 'opacity-55 hover:opacity-90 border-transparent'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Auto Spin</span>
                  </button>
                </div>

                {/* Studio Lighting Preset */}
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 opacity-60 mr-0.5" />
                  {(['warm', 'cool', 'noir'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => changeLighting(mode)}
                      className={`px-2 py-0.5 sharp-pill text-[10px] font-bold uppercase transition ${
                        activeLighting === mode
                          ? isDark
                            ? 'bg-white text-black'
                            : 'bg-stone-900 text-white'
                          : 'opacity-55 hover:opacity-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
