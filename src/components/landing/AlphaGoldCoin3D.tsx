import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Text3D, Center, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CoinMeshProps {
  isHovered: boolean;
  isClicked: boolean;
}

function CoinMesh({ isHovered, isClicked }: CoinMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationVelocity, setRotationVelocity] = useState(0);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Base slow rotation
    meshRef.current.rotation.y += delta * 0.3;
    
    // Hover tilt effect
    const targetTiltX = isHovered ? 0.15 : 0;
    const targetTiltZ = isHovered ? 0.1 : 0;
    meshRef.current.rotation.x += (targetTiltX - meshRef.current.rotation.x) * 0.1;
    meshRef.current.rotation.z += (targetTiltZ - meshRef.current.rotation.z) * 0.1;
    
    // Click spin effect
    if (isClicked) {
      setRotationVelocity(prev => Math.min(prev + 0.5, 2));
    }
    if (rotationVelocity > 0) {
      meshRef.current.rotation.y += rotationVelocity * delta * 10;
      setRotationVelocity(prev => Math.max(prev - delta * 3, 0));
    }
    
    // Subtle floating animation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* Main coin body */}
        <cylinderGeometry args={[0.5, 0.5, 0.08, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.95}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Outer rim - polished edge */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#FFA500"
          metalness={1}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Alpha symbol embossing - front */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.35, 32]} />
        <meshStandardMaterial
          color="#B8860B"
          metalness={0.9}
          roughness={0.3}
          envMapIntensity={1.2}
        />
      </mesh>
      
      {/* Center Alpha detail */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.95}
          roughness={0.2}
          envMapIntensity={1.8}
        />
      </mesh>
      
      {/* Back side detail */}
      <mesh position={[0, -0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.4, 32]} />
        <meshStandardMaterial
          color="#B8860B"
          metalness={0.9}
          roughness={0.3}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  );
}

function CoinScene({ isHovered, isClicked }: CoinMeshProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.5} 
        castShadow 
        color="#FFFFFF"
      />
      <directionalLight 
        position={[-3, 2, -2]} 
        intensity={0.8} 
        color="#FFD700"
      />
      <pointLight 
        position={[0, 2, 3]} 
        intensity={isHovered ? 2 : 1} 
        color="#FFD700"
      />
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={isHovered ? 1.5 : 0.5}
        color="#FFFFFF"
      />
      
      <CoinMesh isHovered={isHovered} isClicked={isClicked} />
      
      <Environment preset="studio" />
    </>
  );
}

interface AlphaGoldCoin3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 60, height: 60 },
  lg: { width: 80, height: 80 },
  xl: { width: 120, height: 120 },
};

export function AlphaGoldCoin3D({ 
  size = 'md', 
  className = '',
  showTooltip = true 
}: AlphaGoldCoin3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const dimensions = sizeMap[size];

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  const coinElement = (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.3 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 51% / 0.4) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Sparkle effect on click */}
      <AnimatePresence>
        {isClicked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-300 rounded-full pointer-events-none"
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: dimensions.width / 2,
                  y: dimensions.height / 2,
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 2,
                  x: dimensions.width / 2 + Math.cos((i * Math.PI * 2) / 6) * 30,
                  y: dimensions.height / 2 + Math.sin((i * Math.PI * 2) / 6) * 30,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <Canvas
        camera={{ position: [0, 0, 2], fov: 45 }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent',
        }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <CoinScene isHovered={isHovered} isClicked={isClicked} />
        </Suspense>
      </Canvas>
    </motion.div>
  );

  if (!showTooltip) {
    return coinElement;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {coinElement}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-[#0a0a0a]/95 backdrop-blur-xl border-amber-500/30 text-amber-100 px-4 py-2 max-w-xs"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">₳</span>
            <span className="text-sm">
              This Alpha Coin can be redeemed through{' '}
              <span className="text-amber-400 font-semibold">ALPHA EXCHANGER</span>
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Inline coin for use within text
export function InlineAlphaCoin({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center align-middle ${className}`}>
      <AlphaGoldCoin3D size="sm" showTooltip={true} />
    </span>
  );
}
