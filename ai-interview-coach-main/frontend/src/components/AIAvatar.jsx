import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  useAnimations,
  Environment,
  ContactShadows,
  Html,
  OrbitControls,
} from '@react-three/drei';
import * as THREE from 'three';

// ─── Error Boundary ───────────────────────────────────────────────────────────
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AIAvatar] Canvas Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10,12,28,0.95)',
            color: '#fff',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            Unable to load interviewer model
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', maxWidth: '240px' }}>
            {this.state.error?.message || 'Unknown WebGL error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '8px',
              padding: '8px 20px',
              background: 'rgba(139,92,246,0.2)',
              color: '#a78bfa',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── 3D Avatar ────────────────────────────────────────────────────────────────
function InterviewerAvatar({ url, isSpeaking, isListening, onModelLoad, modelHeight, aiState }) {
  const group = useRef();

  // Load GLB (throws on failure, caught by CanvasErrorBoundary)
  const gltf = useGLTF(url);
  const { scene, animations } = gltf;
  const { actions } = useAnimations(animations, group);

  // Bone refs for procedural animation
  const bones = useRef({
    head: null,
    neck: null,
    spine: null,
    leftShoulder: null,
    rightShoulder: null,
  });

  // Morph-target mesh refs (lip sync / blinking)
  const morphMeshes = useRef([]);

  // Auto-scale / auto-center offsets
  const [offsets, setOffsets] = useState({ x: 0, y: 0, z: 0 });
  const [boundsCalculated, setBoundsCalculated] = useState(false);

  // Blink timer
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);
  const blinkDuration = useRef(0);
  const nextBlink = useRef(4);

  useEffect(() => {
    if (!scene || boundsCalculated) return;

    console.log('[AIAvatar] Model loaded successfully:', url);

    let meshCount = 0;
    let materialCount = 0;
    let boneCount = 0;

    scene.traverse((child) => {
      if (child.isBone) {
        boneCount++;
        const nl = child.name.toLowerCase();
        if (nl.includes('head') && !nl.includes('headtop')) bones.current.head = child;
        if (nl.includes('neck')) bones.current.neck = child;
        if (nl.includes('leftshoulder') || nl === 'left_shoulder') bones.current.leftShoulder = child;
        if (nl.includes('rightshoulder') || nl === 'right_shoulder') bones.current.rightShoulder = child;
        if ((nl.includes('spine') || nl.includes('chest')) && !bones.current.spine) {
          bones.current.spine = child;
        }
      }

      if (child.isMesh) {
        meshCount++;
        if (child.material) {
          materialCount += Array.isArray(child.material)
            ? child.material.length
            : 1;
        }

        // Collect morph target meshes
        if (child.morphTargetDictionary && child.morphTargetInfluences) {
          morphMeshes.current.push(child);
        }

        // Hide colliders
        const nl = child.name.toLowerCase();
        if (
          nl.includes('collider') ||
          nl.includes('bounds') ||
          nl.includes('collision') ||
          nl.includes('envelope') ||
          nl.includes('cage')
        ) {
          child.visible = false;
          console.log('[AIAvatar] Hidden collider mesh:', child.name);
        }
      }
    });

    // ── Calculate Visual Bounding Box (ignoring helpers/bones)
    const box = new THREE.Box3();
    let hasMesh = false;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.updateMatrixWorld(true);
        const meshBox = new THREE.Box3().setFromObject(child);
        if (!meshBox.isEmpty()) {
          if (!hasMesh) {
            box.copy(meshBox);
            hasMesh = true;
          } else {
            box.union(meshBox);
          }
        }
      }
    });

    if (!hasMesh) {
      box.setFromObject(scene);
    }

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const height = size.y;
    const width = size.x;

    // Log details as requested
    console.log('[AIAvatar] ── Model Dimensions ──');
    console.log(`  Width  (X): ${width.toFixed(4)}`);
    console.log(`  Height (Y): ${height.toFixed(4)}`);
    console.log(`  Center    : X=${center.x.toFixed(3)} Y=${center.y.toFixed(3)} Z=${center.z.toFixed(3)}`);
    console.log(`  Mesh count     : ${meshCount}`);
    console.log(`  Material count : ${materialCount}`);
    console.log(`  Bone count     : ${boneCount}`);

    // Offsets to center the model's width/depth and align its bottom bounding edge at Y=0
    const offsetX = -center.x;
    const offsetY = -box.min.y;
    const offsetZ = -center.z;

    setOffsets({ x: offsetX, y: offsetY, z: offsetZ });

    // Inform the parent component to handle global environment layout scaling
    if (onModelLoad) {
      onModelLoad({
        height,
        width,
        center,
        offsetX,
        offsetY,
        offsetZ,
        loaded: true
      });
    }

    setBoundsCalculated(true);
  }, [scene, url, onModelLoad, boundsCalculated]);

  // Stop walking/running animations
  useEffect(() => {
    if (!actions) return;
    const walkKeywords = ['walk', 'run', 'locomotion', 'move', 'jog', 'strafe', 'tpose', 't-pose', 'entry', 'exit'];
    Object.entries(actions).forEach(([name, action]) => {
      const nl = name.toLowerCase();
      if (walkKeywords.some((k) => nl.includes(k))) {
        action.stop();
        console.log('[AIAvatar] Stopped walk/locomotion animation:', name);
      }
    });

    // Play default non-walk idle
    const idleKey = Object.keys(actions).find((k) => {
      const nl = k.toLowerCase();
      return !walkKeywords.some((w) => nl.includes(w));
    });
    if (idleKey) {
      console.log('[AIAvatar] Playing base idle clip:', idleKey);
      actions[idleKey].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  // ─── useFrame procedural animations ────────────────────────────────────────
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const currentHeight = modelHeight || 1.8;

    // Breathing — gentle Y oscillation based on model scale height
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.4) * 0.006 * currentHeight;
    }

    // Spine lean (leaning forward when listening)
    if (bones.current.spine) {
      const target = isListening ? 0.07 : Math.sin(t * 1.4) * 0.008;
      bones.current.spine.rotation.x = THREE.MathUtils.lerp(
        bones.current.spine.rotation.x,
        target,
        0.04
      );
    }

    // Shoulders
    if (bones.current.leftShoulder && bones.current.rightShoulder) {
      const breathe = Math.sin(t * 1.4) * 0.007;
      const talk = isSpeaking ? Math.sin(t * 4.5) * 0.012 : 0;
      bones.current.leftShoulder.rotation.z = breathe + talk;
      bones.current.rightShoulder.rotation.z = -(breathe + talk);
    }

    // Head
    if (bones.current.head) {
      if (isSpeaking) {
        bones.current.head.rotation.x = Math.sin(t * 3.8) * 0.022;
        bones.current.head.rotation.y = Math.cos(t * 2.3) * 0.032;
        bones.current.head.rotation.z = Math.sin(t * 1.7) * 0.012;
      } else if (isListening) {
        const nodCycle = Math.sin(t * 0.45);
        const targetX = nodCycle > 0.35 ? 0.055 + Math.sin(t * 7) * 0.04 : 0.035;
        bones.current.head.rotation.x = THREE.MathUtils.lerp(
          bones.current.head.rotation.x, targetX, 0.1
        );
        bones.current.head.rotation.y = Math.sin(t * 0.3) * 0.018;
        bones.current.head.rotation.z = 0;
      } else if (aiState === 'Analyzing') {
        // Thinking / analyzing: head tilted slightly and look slightly down-sideways
        bones.current.head.rotation.x = Math.sin(t * 0.8) * 0.01 + 0.04;
        bones.current.head.rotation.y = Math.cos(t * 0.5) * 0.015 - 0.02;
        bones.current.head.rotation.z = Math.sin(t * 0.5) * 0.01;
      } else {
        // Idle
        bones.current.head.rotation.x = Math.sin(t * 1.1) * 0.013;
        bones.current.head.rotation.y = Math.cos(t * 0.55) * 0.018;
        bones.current.head.rotation.z = 0;
      }
    }

    // Blink (morph target)
    blinkTimer.current += delta;
    if (!isBlinking.current && blinkTimer.current >= nextBlink.current) {
      isBlinking.current = true;
      blinkDuration.current = 0;
      blinkTimer.current = 0;
      nextBlink.current = 3.5 + Math.random() * 3;
    }
    if (isBlinking.current) {
      blinkDuration.current += delta;
      const blinkProgress = blinkDuration.current / 0.14;
      const influence = blinkProgress < 0.5
        ? blinkProgress * 2
        : Math.max(0, 2 - blinkProgress * 2);

      morphMeshes.current.forEach((mesh) => {
        Object.keys(mesh.morphTargetDictionary).forEach((key) => {
          const kl = key.toLowerCase();
          if (kl.includes('blink') || kl.includes('eye_close') || kl.includes('eyeclose')) {
            mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]] = influence;
          }
        });
      });

      if (blinkDuration.current >= 0.14) {
        isBlinking.current = false;
        morphMeshes.current.forEach((mesh) => {
          Object.keys(mesh.morphTargetDictionary).forEach((key) => {
            const kl = key.toLowerCase();
            if (kl.includes('blink') || kl.includes('eye_close') || kl.includes('eyeclose')) {
              mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]] = 0;
            }
          });
        });
      }
    }

    // Lip sync
    if (morphMeshes.current.length > 0) {
      morphMeshes.current.forEach((mesh) => {
        Object.keys(mesh.morphTargetDictionary).forEach((key) => {
          const kl = key.toLowerCase();
          if (
            kl.includes('jawopen') ||
            kl.includes('mouth_open') ||
            kl.includes('mouthopen') ||
            kl.includes('viseme_aa') ||
            kl.includes('viseme_o')
          ) {
            const idx = mesh.morphTargetDictionary[key];
            const target = isSpeaking ? Math.abs(Math.sin(t * 11)) * 0.55 : 0;
            mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
              mesh.morphTargetInfluences[idx],
              target,
              isSpeaking ? 1 : 0.25
            );
          }
        });
      });
    }
  });

  return (
    <group ref={group} dispose={null}>
      <group position={[offsets.x, offsets.y, offsets.z]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// ─── Proportional Office Desk ──────────────────────────────────────────────────
function InterviewDesk({ scaleFactor }) {
  return (
    <group position={[0, 0, 0.53 * 1.8 * scaleFactor]} scale={scaleFactor}>
      {/* Desk top slab */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.035, 1.3]} />
        <meshStandardMaterial color="#1a202c" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* modesty front panel */}
      <mesh position={[0, 0.27, 0.62]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.56, 0.035]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.7} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-2.1, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.07, 0.56, 0.9]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.5} />
      </mesh>

      {/* Right leg */}
      <mesh position={[2.1, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.07, 0.56, 0.9]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.5} />
      </mesh>

      {/* Purple accent strip */}
      <mesh position={[0, 0.572, 0.64]}>
        <boxGeometry args={[4.5, 0.008, 0.008]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>

      {/* Laptop — scaled down 35% (width 28cm vs 42cm), rotated 180 on Y so back faces candidate */}
      <group position={[0.25, 0.568, -0.05]} rotation={[0, Math.PI, 0]}>
        {/* Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.008, 0.20]} />
          <meshStandardMaterial color="#2d3748" roughness={0.3} metalness={0.75} />
        </mesh>
        
        {/* Keyboard Area */}
        <mesh position={[0, 0.005, 0.02]}>
          <boxGeometry args={[0.25, 0.002, 0.12]} />
          <meshStandardMaterial color="#1a202c" roughness={0.6} />
        </mesh>
        
        {/* Screen hinge group */}
        <group position={[0, 0.004, -0.09]} rotation={[0.25, 0, 0]}>
          {/* Lid (Back of screen - faces candidate) */}
          <mesh position={[0, 0.09, -0.004]} castShadow>
            <boxGeometry args={[0.28, 0.18, 0.008]} />
            <meshStandardMaterial color="#2d3748" roughness={0.3} metalness={0.75} />
          </mesh>
          
          {/* Display (Front of screen - faces interviewer) */}
          <mesh position={[0, 0.09, 0.001]}>
            <boxGeometry args={[0.26, 0.16, 0.002]} />
            <meshStandardMaterial color="#0b0f19" roughness={0.5} emissive="#1e3a8a" emissiveIntensity={0.25} />
          </mesh>
          
          {/* Glowing back logo */}
          <mesh position={[0, 0.09, -0.009]} rotation={[0, Math.PI, 0]}>
            <boxGeometry args={[0.03, 0.03, 0.002]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        </group>
      </group>

      {/* Notepad */}
      <mesh position={[-0.8, 0.57, -0.05]} rotation={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.008, 0.20]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Pen */}
      <mesh position={[-0.64, 0.576, -0.04]} rotation={[0, -0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.22, 8]} />
        <meshStandardMaterial color="#3b4a6b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── Proportional Chair ────────────────────────────────────────────────────────
function InterviewChair({ scaleFactor }) {
  return (
    <group position={[0, 0, -0.3 * 1.8 * scaleFactor]} scale={scaleFactor}>
      {/* Backrest */}
      <mesh position={[0, 1.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.1, 0.07]} />
        <meshStandardMaterial color="#0d1425" roughness={0.65} />
      </mesh>
      {/* Headrest */}
      <mesh position={[0, 1.68, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.26, 0.09]} />
        <meshStandardMaterial color="#0d1425" roughness={0.55} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, 0.54, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.075, 0.64]} />
        <meshStandardMaterial color="#0d1425" roughness={0.65} />
      </mesh>
      {/* Cylinder */}
      <mesh position={[0, 0.24, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.48, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ─── Camera Rig — dynamically handles positioning based on model height ─────
function CameraRig({ modelHeight }) {
  const { camera } = useThree();

  useEffect(() => {
    if (modelHeight) {
      // Dynamic camera placement targeting upper torso & centering the head
      const cameraY = 0.72 * modelHeight;
      const cameraZ = 3.3 * modelHeight;
      camera.position.set(0, cameraY, cameraZ);
      camera.lookAt(0, 0.72 * modelHeight, 0);
      camera.updateProjectionMatrix();
    }
  }, [modelHeight, camera]);

  return null;
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function AIAvatar({ aiState: externalAiState }) {
  const [localAiState, setLocalAiState] = useState('Idle');
  const aiState = externalAiState || localAiState;

  const isSpeaking = aiState === 'Speaking';
  const isListening = aiState === 'Listening';
  const isStandalone = !externalAiState;

  const modelPath = "/models/Hitem3d-1781792382042.glb";

  useEffect(() => {
    console.log("AIAvatar Mounted");
    console.log("Loading GLB:", modelPath);

    // Check if the GLB file exists and log loading status
    fetch(modelPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          console.log(`[AIAvatar] GLB file check SUCCESS: ${modelPath} exists and is accessible. Status: ${res.status}`);
        } else {
          console.error(`[AIAvatar] GLB file check FAILED: ${modelPath} returned status ${res.status}`);
        }
      })
      .catch((err) => {
        console.error(`[AIAvatar] GLB file check ERROR for ${modelPath}:`, err);
      });
  }, [modelPath]);

  // Configuration computed dynamically based on THREE.Box3 bounds
  const [modelConfig, setModelConfig] = useState({
    height: 1.8,
    width: 1.0,
    center: new THREE.Vector3(0, 0.9, 0),
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0,
    loaded: false,
  });

  const handleModelLoad = useCallback((config) => {
    setModelConfig((prev) => {
      // Avoid render-loop updates if configurations are identical
      if (
        prev.height === config.height &&
        prev.width === config.width &&
        prev.offsetX === config.offsetX &&
        prev.offsetY === config.offsetY &&
        prev.offsetZ === config.offsetZ &&
        prev.loaded === config.loaded
      ) {
        return prev;
      }
      return config;
    });
  }, []);

  const scaleFactor = modelConfig.height / 1.8;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'transparent' }}>

      {/* Debug Buttons (only visible in standalone view) */}
      {isStandalone && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Idle', 'Speaking', 'Listening'].map((s) => (
            <button
              key={s}
              onClick={() => setLocalAiState(s)}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                border: `1px solid ${aiState === s ? '#7c3aed' : '#334155'}`,
                background: aiState === s ? 'rgba(124,58,237,0.3)' : 'rgba(15,23,42,0.8)',
                color: aiState === s ? '#a78bfa' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* State Badge */}
      {!isStandalone && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isSpeaking ? '#22c55e' : isListening ? '#a855f7' : '#3b82f6',
            boxShadow: `0 0 8px ${isSpeaking ? '#22c55e' : isListening ? '#a855f7' : '#3b82f6'}`,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: '#94a3b8', textTransform: 'uppercase' }}>
            {aiState}
          </span>
        </div>
      )}

      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 1.4, 4], fov: 35 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {/* Fixed Camera configuration - No CameraRig updates */}

          {/* ── Scaled Lighting Setup ── */}
          <ambientLight intensity={isListening ? 0.3 : 0.55} color="#c8d4f0" />

          {/* Key Light */}
          <directionalLight
            position={[2.5 * scaleFactor, 4.5 * scaleFactor, 3 * scaleFactor]}
            intensity={isSpeaking ? 1.7 : 1.4}
            castShadow
            color={isListening ? '#f3e8ff' : '#fdfcfb'}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5 * scaleFactor}
            shadow-camera-far={20 * scaleFactor}
            shadow-camera-left={-4 * scaleFactor}
            shadow-camera-right={4 * scaleFactor}
            shadow-camera-top={4 * scaleFactor}
            shadow-camera-bottom={-4 * scaleFactor}
          />

          {/* Fill Light */}
          <directionalLight
            position={[-2.5 * scaleFactor, 3 * scaleFactor, 2 * scaleFactor]}
            intensity={0.4}
            color="#b4c8ff"
          />

          {/* Rim Light */}
          <directionalLight
            position={[0, 3.5 * scaleFactor, -4 * scaleFactor]}
            intensity={0.55}
            color="#7c3aed"
          />

          {/* Face fill */}
          <pointLight
            position={[0, 0.5 * modelConfig.height, 2.8 * scaleFactor]}
            intensity={0.45}
            color="#ffffff"
            distance={5 * scaleFactor}
          />

          {/* Active Speaking / Listening Visual Indicator Glows */}
          {isSpeaking && (
            <pointLight
              position={[0, 0.6 * modelConfig.height, 1.5 * scaleFactor]}
              intensity={1.2}
              color="#22c55e"
              distance={3.5 * scaleFactor}
            />
          )}
          {isListening && (
            <pointLight
              position={[0, 0.9 * modelConfig.height, 1.5 * scaleFactor]}
              intensity={1.4}
              color="#a855f7"
              distance={3.5 * scaleFactor}
            />
          )}

          <Environment preset="studio" />

          {/* Fixed camera controls - zoom, rotate, and pan disabled */}
          <OrbitControls
            enableZoom={false}
            enableRotate={false}
            enablePan={false}
            target={[0, 1.1, 0]}
          />

          <Suspense
            fallback={
              <Html center>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(10,14,35,0.92)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '20px 28px',
                  minWidth: 200,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: '3px solid rgba(124,58,237,0.25)',
                    borderTopColor: '#7c3aed',
                    animation: 'spin 0.9s linear infinite',
                  }} />
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Loading AI Interviewer...
                  </span>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              </Html>
            }
          >
            <InterviewerAvatar
              url="/models/Hitem3d-1781792382042.glb"
              isSpeaking={isSpeaking}
              isListening={isListening}
              onModelLoad={handleModelLoad}
              modelHeight={modelConfig.height}
              aiState={aiState}
            />
            <InterviewChair scaleFactor={scaleFactor} />
            <InterviewDesk scaleFactor={scaleFactor} />
          </Suspense>

          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.55}
            scale={10 * scaleFactor}
            blur={2.5}
            far={4 * scaleFactor}
            color="#000000"
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

// Preload the model file
useGLTF.preload('/models/Hitem3d-1781792382042.glb');
