'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 1. القبة البانورامية العلوية للحرم المكي الشريف
function KaabaPanoramicDome() {
  const domeRef = useRef<THREE.Mesh>(null);

  // لقطة جوية واسعة للحرم وصحن المطاف من زاوية علوية
  const texture = useTexture(
    'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop'
  );
  texture.mapping = THREE.EquirectangularReflectionMapping;

  useFrame((_, delta) => {
    // دوران بطيء جداً يعطي انطباع حركة الوقت والحياة
    if (domeRef.current) {
      domeRef.current.rotation.y += delta * 0.012;
    }
  });

  return (
    <mesh ref={domeRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[450, 64, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// 2. محاكاة الطواف: سحابة من جزيئات النور تدور في حلقات متحدة المركز حول الكعبة
function TawafParticleField({ count = 2400 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, initialAngles, radii, speeds, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const angles = new Float32Array(count);
    const rad = new Float32Array(count);
    const spd = new Float32Array(count);
    const col = new Float32Array(count * 3);

    const whiteColor = new THREE.Color('#ffffff');
    const goldColor = new THREE.Color('#facc15');
    const emeraldColor = new THREE.Color('#34d399');

    for (let i = 0; i < count; i++) {
      // توزيع الجزيئات في حلقات مدارية تحاكي صفوف الطائفين
      const ringRadius = 8 + Math.pow(Math.random(), 1.6) * 45;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2.5;

      angles[i] = angle;
      rad[i] = ringRadius;
      // كلما اقترب الطائف من المركز كانت السرعة الزاوية أعلى
      spd[i] = (0.25 / Math.sqrt(ringRadius)) * (0.8 + Math.random() * 0.4);

      pos[i * 3] = Math.cos(angle) * ringRadius;
      pos[i * 3 + 1] = height - 12; // مستوى صحن المطاف بالنسبة لزاوية الكاميرا
      pos[i * 3 + 2] = Math.sin(angle) * ringRadius;

      // ألوان متنوعة بين بياض الإحرام والنور الذهبي
      const rand = Math.random();
      let pickedColor = whiteColor;
      if (rand > 0.75) pickedColor = goldColor;
      else if (rand > 0.92) pickedColor = emeraldColor;

      col[i * 3] = pickedColor.r;
      col[i * 3 + 1] = pickedColor.g;
      col[i * 3 + 2] = pickedColor.b;
    }

    return [pos, angles, rad, spd, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // الدوران عكس عقارب الساعة محاكياً اتجاه الطواف الشرعي
      initialAngles[i] += speeds[i] * delta * 1.4;
      const currentAngle = initialAngles[i];
      const r = radii[i];

      posArray[i * 3] = Math.cos(currentAngle) * r;
      posArray[i * 3 + 2] = Math.sin(currentAngle) * r;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.45}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 3. عمود نور روحاني صاعد من مركز الكعبة المشرفة
function CelestialLightBeam() {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (beamRef.current) {
      const t = state.clock.getElapsedTime();
      beamRef.current.rotation.y = t * 0.05;
      const pulse = 1 + Math.sin(t * 1.8) * 0.08;
      beamRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group position={[0, 8, 0]}>
      {/* الأسطوانة المركزية للشعاع */}
      <mesh ref={beamRef}>
        <cylinderGeometry args={[1.5, 4.5, 55, 32, 1, true]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* حلقة التوهج حول قاعدة الكعبة */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]}>
        <ringGeometry args={[2, 12, 48]} />
        <meshBasicMaterial
          color="#facc15"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// 4. تحكم الكاميرا التفاعلي وحركتها المتجاوبة مع مؤشر الفأرة
function CameraInteractiveRig() {
  useFrame((state) => {
    // حركة انزياح ناعمة وسلسة تتبع حركة الفأرة
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      state.mouse.x * 12,
      0.03
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      45 + state.mouse.y * 8,
      0.03
    );
  });
  return null;
}

export default function IslamicHeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none">
      <Canvas
        camera={{ position: [0, 32, 45], fov: 60 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <Suspense fallback={null}>
          {/* خلفية القبة البانورامية العلوية 360 */}
          <KaabaPanoramicDome />

          {/* محاكاة الطواف النوراني وجزيئات الطائفين */}
          <TawafParticleField count={2200} />

          {/* عمود النور السماوي */}
          <CelestialLightBeam />

          {/* التحكم التفاعلي بالماوس واللمس بزوايا علوية */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={-0.35}
            maxPolarAngle={Math.PI / 2.2} // يمنع النزول تحت خط الأفق
            minPolarAngle={Math.PI / 6}   // يحافظ على الزاوية العلوية الجوية
            dampingFactor={0.05}
            enableDamping
          />
          <CameraInteractiveRig />
        </Suspense>
      </Canvas>

      {/* تدرجات دمج سينمائية لضمان قراءة نصوص الموقع والآيات بكل وضوح */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/40 pointer-events-none" />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] bg-background/30 pointer-events-none" />
    </div>
  );
}