import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
function InterviewerAvatar({ url, isSpeaking, isListening }) {
  const group = useRef();

  // Load GLB — throws on failure (caught by CanvasErrorBoundary)
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

  // Auto-scale / auto-center state
  const [modelConfig, setModelConfig] = useState({ scale: 1, offsetY: 0, offsetX: 0, offsetZ: 0 });

  // Blink timer
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);
  const blinkDuration = useRef(0);
  const nextBlink = useRef(4);

  useEffect(() => {
    if (!scene) return;

    // ── Log model path
    console.log('[AIAvatar] Model path:', url);

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

        // Hide collider geometry
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

    // ── Bounding box — auto scale & center
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    console.log('[AIAvatar] ── Model Dimensions ──');
    console.log(`  Width  (X): ${size.x.toFixed(4)}`);
    console.log(`  Height (Y): ${size.y.toFixed(4)}`);
    console.log(`  Depth  (Z): ${size.z.toFixed(4)}`);
    console.log(`  Center   : X=${center.x.toFixed(3)} Y=${center.y.toFixed(3)} Z=${center.z.toFixed(3)}`);
    console.log(`  Mesh count     : ${meshCount}`);
    console.log(`  Material count : ${materialCount}`);
    console.log(`  Bone count     : ${boneCount}`);

    // Scale so model height = 1.8 units (shows full upper body)
    const targetHeight = 1.8;
    let scale = targetHeight / (size.y || 1);
    if (scale > 300 || scale < 0.0001) scale = 1;

    // Offset to place model bottom at Y=0 and centre on X/Z
    const offsetY = -box.min.y * scale;
    const offsetX = -center.x * scale;
    const offsetZ = -center.z * scale;

    console.log(`[AIAvatar] Auto scale: ${scale.toFixed(4)}`);
    console.log(`[AIAvatar] Offset: X=${offsetX.toFixed(3)} Y=${offsetY.toFixed(3)} Z=${offsetZ.toFixed(3)}`);
    console.log('[AIAvatar] Bones found:', Object.entries(bones.current).filter(([,v]) => v).map(([k]) => k));

    setModelConfig({ scale, offsetY, offsetX, offsetZ });
  }, [scene, url]);

  // Stop any GLB walking/locomotion animations — only keep built-in idle if present
  useEffect(() => {
    if (!actions) return;
    const walkKeywords = ['walk', 'run', 'locomotion', 'move', 'jog', 'strafe'];
    Object.entries(actions).forEach(([name, action]) => {
      const nl = name.toLowerCase();
      if (walkKeywords.some((k) => nl.includes(k))) {
        action.stop();
        console.log('[AIAvatar] Stopped walk animation:', name);
      }
    });

    // Play the first non-walk animation as base idle if it exists
    const idleKey = Object.keys(actions).find((k) => {
      const nl = k.toLowerCase();
      return !walkKeywords.some((w) => nl.includes(w));
    });
    if (idleKey) {
      actions[idleKey].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  // ─── useFrame — procedural animations ───────────────────────────────────────
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Breathing — gentle Y oscillation
    if (group.current) {
      group.current.position.y = -1.0 + Math.sin(t * 1.4) * 0.006;
    }

    // Spine lean (listening = slightly forward)
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
      } else {
        // Idle — very subtle drift
        bones.current.head.rotation.x = Math.sin(t * 1.1) * 0.013;
        bones.current.head.rotation.y = Math.cos(t * 0.55) * 0.018;
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

    // Lip sync (jaw morph)
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
      <group
        scale={modelConfig.scale}
        position={[modelConfig.offsetX, modelConfig.offsetY, modelConfig.offsetZ]}
      >
        <primitive object={scene} />
      </group>
    </group>
  );
}

// ─── Professional Desk ────────────────────────────────────────────────────────
// Desk top at ~Y = 0.55 (lowered 40% from original ~0.95)
// Desk moved forward in Z so it frames avatar nicely
function InterviewDesk() {
  return (
    <group position={[0, -1, 0.95]}>
      {/* Desk surface */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.035, 1.3]} />
        <meshStandardMaterial color="#1a2540" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Desk front modesty panel */}
      <mesh position={[0, 0.27, 0.62]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.56, 0.035]} />
        <meshStandardMaterial color="#0d1425" roughness={0.7} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-2.1, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.07, 0.56, 0.9]} />
        <meshStandardMaterial color="#0d1425" roughness={0.6} />
      </mesh>

      {/* Right leg */}
      <mesh position={[2.1, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.07, 0.56, 0.9]} />
        <meshStandardMaterial color="#0d1425" roughness={0.6} />
      </mesh>

      {/* Desk accent strip — subtle purple glow */}
      <mesh position={[0, 0.572, 0.64]}>
        <boxGeometry args={[4.5, 0.008, 0.008]} />
        <meshBasicMaterial color="#7c3aed" />
      </mesh>

      {/* Laptop — screen faces interviewer, back faces candidate */}
      {/* Rotated 180° on Y so screen is away from camera */}
      <group position={[0.3, 0.585, -0.18]} rotation={[0, Math.PI, 0]}>
        {/* Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.012, 0.30]} />
          <meshStandardMaterial color="#2d3748" roughness={0.3} metalness={0.75} />
        </mesh>
        {/* Keyboard deck bevel */}
        <mesh position={[0, 0.007, 0]}>
          <boxGeometry args={[0.38, 0.004, 0.26]} />
          <meshStandardMaterial color="#1a202c" roughness={0.5} />
        </mesh>
        {/* Screen (facing interviewer) */}
        <mesh position={[0, 0.115, -0.14]} rotation={[-0.28, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.26, 0.012]} />
          <meshStandardMaterial color="#0f1523" roughness={0.25} metalness={0.8} />
        </mesh>
        {/* Screen glow — faint blue emissive on interviewer side */}
        <mesh position={[0, 0.115, -0.134]} rotation={[-0.28, 0, 0]}>
          <boxGeometry args={[0.38, 0.22, 0.001]} />
          <meshBasicMaterial color="#1e3a5f" />
        </mesh>
        {/* Apple-style logo on lid back (candidate side) */}
        <mesh position={[0, 0.115, -0.147]} rotation={[-0.28, 0, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.003]} />
          <meshBasicMaterial color="#4f46e5" />
        </mesh>
      </group>

      {/* Desk accessory — small notepad */}
      <mesh position={[-0.8, 0.57, -0.05]} rotation={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.008, 0.20]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Desk accessory — pen */}
      <mesh position={[-0.64, 0.576, -0.04]} rotation={[0, -0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.22, 8]} />
        <meshStandardMaterial color="#3b4a6b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── Office Chair ─────────────────────────────────────────────────────────────
function InterviewChair() {
  return (
    <group position={[0, -1, -0.55]}>
      {/* High backrest */}
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
      {/* Gas cylinder */}
      <mesh position={[0, 0.24, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.48, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function AIAvatar({ aiState: externalAiState }) {
  const [localAiState, setLocalAiState] = useState('Idle');
  const aiState = externalAiState || localAiState;

  const isSpeaking = aiState === 'Speaking';
  const isListening = aiState === 'Listening';
  const isStandalone = !externalAiState;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'transparent' }}>

      {/* Standalone debug buttons */}
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

      {/* State indicator dot */}
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
          camera={{ position: [0, 1.3, 6], fov: 30 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {/* ── Lighting ── */}

          {/* Ambient — keeps shadows soft */}
          <ambientLight intensity={isListening ? 0.3 : 0.55} color="#c8d4f0" />

          {/* Key light — soft warm from upper-left */}
          <directionalLight
            position={[2.5, 4.5, 3]}
            intensity={isSpeaking ? 1.7 : 1.4}
            castShadow
            color={isListening ? '#f3e8ff' : '#fdfcfb'}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
          />

          {/* Fill light — soft cool from right */}
          <directionalLight
            position={[-2.5, 3, 2]}
            intensity={0.4}
            color="#b4c8ff"
          />

          {/* Rim / hair light — behind avatar */}
          <directionalLight
            position={[0, 3.5, -4]}
            intensity={0.55}
            color="#7c3aed"
          />

          {/* Under-face fill (prevents too-dark shadows under jaw) */}
          <pointLight position={[0, 0.5, 2.8]} intensity={0.45} color="#ffffff" distance={5} />

          {/* State-reactive accent light */}
          {isSpeaking && (
            <pointLight position={[0, 0.6, 1.5]} intensity={1.2} color="#22c55e" distance={3.5} />
          )}
          {isListening && (
            <pointLight position={[0, 0.9, 1.5]} intensity={1.4} color="#a855f7" distance={3.5} />
          )}

          <Environment preset="studio" />

          {/* Orbit Controls for debugging — restricted to prevent wild angles */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 1.8}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
            target={[0, 0.5, 0]}
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
              url="/models/interviewer.glb"
              isSpeaking={isSpeaking}
              isListening={isListening}
            />
            <InterviewChair />
            <InterviewDesk />
          </Suspense>

          <ContactShadows
            position={[0, -1.01, 0]}
            opacity={0.55}
            scale={10}
            blur={2.5}
            far={4}
            color="#000000"
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

// Preload model
useGLTF.preload('/models/interviewer.glb');
