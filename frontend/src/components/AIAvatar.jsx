import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, ContactShadows, PresentationControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// Procedural animations for idle breathing and slight head movement
function InterviewerAvatar({ currentAnimation, url, isSpeaking, isListening }) {
  const group = useRef();
  // We use useGLTF with the url. If it fails to fetch (e.g., file not moved yet), Suspense boundary/error handling would usually catch it.
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);
  
  // Find head bone if it exists for procedural movement
  const headBone = useRef(null);
  
  useEffect(() => {
    // Traverse the scene to find the head bone (standard Mixamo/RPM bone names)
    scene.traverse((child) => {
      if (child.isBone && (child.name.includes('Head') || child.name.includes('Neck'))) {
        if (!headBone.current) headBone.current = child;
      }
    });
  }, [scene]);

  useEffect(() => {
    // Try to play existing animations from the GLB
    if (actions && actions[currentAnimation]) {
      const action = actions[currentAnimation];
      action.reset().fadeIn(0.5).play();
      return () => action.fadeOut(0.5);
    } else if (actions && Object.keys(actions).length > 0) {
      const firstAnim = Object.keys(actions)[0];
      const action = actions[firstAnim];
      if (action) {
        action.reset().fadeIn(0.5).play();
        return () => action.fadeOut(0.5);
      }
    }
  }, [currentAnimation, actions]);

  // Procedural Idle / Speaking Animations
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (group.current) {
      // 1. Procedural Breathing (gentle scale/position shift on the torso/group)
      // We gently move the entire group up and down to simulate breathing
      group.current.position.y = Math.sin(time * 1.5) * 0.005 - 1.2; // Base offset is -1.2 (behind desk)
    }
    
    // 2. Small Head Movements
    if (headBone.current) {
      if (isSpeaking) {
        // More active head movement when speaking
        headBone.current.rotation.x = Math.sin(time * 3) * 0.02;
        headBone.current.rotation.y = Math.cos(time * 2) * 0.02;
      } else if (isListening) {
        // Attentive tilt when listening
        headBone.current.rotation.x = THREE.MathUtils.lerp(headBone.current.rotation.x, 0.05, 0.1);
        headBone.current.rotation.y = Math.sin(time * 0.5) * 0.01; // Very slow look around
      } else {
        // Standard idle head movement
        headBone.current.rotation.x = Math.sin(time * 1) * 0.01;
        headBone.current.rotation.y = Math.cos(time * 0.5) * 0.01;
      }
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -1.2, 0]}>
      <primitive object={scene} scale={1.8} />
    </group>
  );
}

// Desk component
function InterviewDesk() {
  return (
    <group position={[0, -1.2, 1.2]}>
      {/* Desk Top */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.05, 1.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Desk Front Panel */}
      <mesh position={[0, 0.5, 0.7]} castShadow receiveShadow>
        <boxGeometry args={[5, 1, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function AIAvatar() {
  const [aiState, setAiState] = useState('Idle');
  
  // Use the local interviewer model
  // NOTE: If interviewer.glb is not found, fallback to CesiumMan.glb
  const [avatarUrl, setAvatarUrl] = useState("/models/interviewer.glb");
  
  const isSpeaking = aiState === 'Speaking';
  const isListening = aiState === 'Listening';

  return (
    <div className="w-full h-full bg-navy-900 relative">
      
      {/* State Controls Overlay */}
      <div className="absolute top-24 right-8 z-10 flex flex-col gap-3">
        <button className={`px-4 py-2 rounded-lg font-bold transition-all border ${aiState === 'Idle' ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-navy-800/50 text-slate-300 border-navy-600 hover:bg-navy-700'}`} onClick={() => setAiState('Idle')}>Idle</button>
        <button className={`px-4 py-2 rounded-lg font-bold transition-all border ${aiState === 'Speaking' ? 'bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-navy-800/50 text-slate-300 border-navy-600 hover:bg-navy-700'}`} onClick={() => setAiState('Speaking')}>Speaking</button>
        <button className={`px-4 py-2 rounded-lg font-bold transition-all border ${aiState === 'Listening' ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)]' : 'bg-navy-800/50 text-slate-300 border-navy-600 hover:bg-navy-700'}`} onClick={() => setAiState('Listening')}>Listening</button>
      </div>

      {/* Subtitles Overlay (When Speaking) */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-full max-w-3xl transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-navy-900/80 backdrop-blur-md border border-navy-600/50 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Waveform visual effect */}
          <div className="absolute top-0 left-0 w-full h-1 flex gap-1 justify-center opacity-70">
             {[...Array(40)].map((_, i) => (
                <div key={i} className="h-full w-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: `${Math.random() * 0.5}s`, height: `${Math.random() * 100}%` }} />
             ))}
          </div>
          <p className="text-xl text-center text-white font-medium mt-2">
            "Hello! I am your AI Interview Coach. Let's start by discussing your recent project experience..."
          </p>
        </div>
      </div>

      {/* Listening Indicator */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 ${isListening ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3 bg-purple-900/40 border border-purple-500/50 px-6 py-4 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-purple-100 font-medium text-lg">Listening to your response...</span>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
        {/* Dynamic Lighting based on state */}
        <ambientLight intensity={isListening ? 0.3 : 0.6} />
        
        {/* Main Key Light */}
        <directionalLight position={[2, 5, 2]} intensity={isSpeaking ? 1.5 : 1.2} castShadow color={isListening ? "#e0f2fe" : "#ffffff"} />
        
        {/* Fill Light */}
        <spotLight position={[-2, 5, 2]} intensity={0.5} angle={0.3} penumbra={1} color="#ffffff" />
        
        {/* State Glow Effects */}
        {isListening && <pointLight position={[0, 1, 2]} intensity={1.5} color="#a855f7" distance={4} />}
        {isSpeaking && <pointLight position={[0, 0.5, 2]} intensity={1.0} color="#22c55e" distance={4} />}

        <Environment preset="city" />

        <Suspense fallback={<Html center><div className="text-white text-lg font-bold bg-navy-800/80 px-6 py-3 rounded-xl backdrop-blur border border-navy-600">Loading Interviewer...</div></Html>}>
          <PresentationControls 
            global 
            rotation={[0, 0, 0]} 
            polar={[-0.05, 0.05]} 
            azimuth={[-0.1, 0.1]} 
            config={{ mass: 2, tension: 400 }}
          >
            <InterviewerAvatar 
              currentAnimation={aiState} 
              url={avatarUrl} 
              isSpeaking={isSpeaking}
              isListening={isListening}
            />
            <InterviewDesk />
          </PresentationControls>
        </Suspense>

        <ContactShadows position={[0, -1.2, 0]} opacity={0.6} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
}

// We attempt to preload the interviewer, if it 404s, standard suspense handles it
useGLTF.preload("/models/interviewer.glb");
