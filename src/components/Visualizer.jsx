import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Box, Eye, Grid, Scissors } from 'lucide-react';
import { PartsView } from './PartsView';

function Beam({ position, args, color = '#e67e22' }) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
    );
}

function TechnicalDrawing({ parts }) {
    const { runners, slats } = parts;

    // Calculate bounds
    const width = Math.max(...slats.map(s => s.length)) || 2000;
    const length = Math.max(...runners.map(r => r.length)) || 2000;

    const padding = 200;
    const viewBox = `${-padding} ${-padding} ${width + padding * 2} ${length + padding * 2}`;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
            <svg viewBox={viewBox} style={{ width: '100%', height: '100%', maxHeight: '100%' }}>
                <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#f1f3f5" strokeWidth="2" />
                    </pattern>
                </defs>
                <rect x={-padding} y={-padding} width={width + padding * 2} height={length + padding * 2} fill="url(#grid)" />

                {/* Runners (Vertical in 2D view usually, but here length is Z, width is X) */}
                {/* Let's map: X -> X, Z -> Y */}
                {runners.map(runner => (
                    <g key={runner.id}>
                        <rect
                            x={runner.x}
                            y={runner.z}
                            width={runner.width}
                            height={runner.length}
                            fill="#ecf0f1"
                            stroke="#2d3436"
                            strokeWidth="2"
                        />
                        {/* Dimensions */}
                        <text x={runner.x + runner.width / 2} y={runner.z + runner.length + 50} textAnchor="middle" fontSize="40" fill="#636e72">
                            {runner.width}
                        </text>
                    </g>
                ))}

                {/* Slats */}
                {slats.map((slat, i) => (
                    <g key={slat.id}>
                        <rect
                            x={slat.x}
                            y={slat.z}
                            width={slat.length}
                            height={slat.width}
                            fill="rgba(230, 126, 34, 0.5)"
                            stroke="#d35400"
                            strokeWidth="2"
                        />
                        {i === 0 && (
                            <text x={slat.x + slat.length + 50} y={slat.z + slat.width / 2} dominantBaseline="middle" fontSize="40" fill="#636e72">
                                {slat.width}
                            </text>
                        )}
                    </g>
                ))}

                {/* Overall Dimensions */}
                <line x1={0} y1={-50} x2={width} y2={-50} stroke="#2d3436" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                <text x={width / 2} y={-70} textAnchor="middle" fontSize="50" fontWeight="bold">{width} mm</text>

                <line x1={-50} y1={0} x2={-50} y2={length} stroke="#2d3436" strokeWidth="2" />
                <text x={-70} y={length / 2} textAnchor="end" dominantBaseline="middle" fontSize="50" fontWeight="bold">{length} mm</text>

            </svg>
        </div>
    );
}

export function Visualizer({ parts }) {
    const { runners, slats } = parts;
    const [viewMode, setViewMode] = useState('3d');
    const scale = 0.001;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', background: '#f1f3f5', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>

            <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', zIndex: 10, display: 'flex', gap: 'var(--spacing-xs)', background: 'white', padding: '4px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <button
                    className={`btn ${viewMode === '3d' ? 'btn-primary' : ''}`}
                    onClick={() => setViewMode('3d')}
                    title="3D View"
                >
                    <Box size={18} />
                </button>
                <button
                    className={`btn ${viewMode === '2d' ? 'btn-primary' : ''}`}
                    onClick={() => setViewMode('2d')}
                    title="2D Drawing"
                >
                    <Grid size={18} />
                </button>
                <button
                    className={`btn ${viewMode === 'parts' ? 'btn-primary' : ''}`}
                    onClick={() => setViewMode('parts')}
                    title="Parts & Cuts"
                >
                    <Scissors size={18} />
                </button>
            </div>

            {viewMode === '3d' ? (
                <Canvas shadows camera={{ position: [2, 2, 2], fov: 50 }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
                        <Environment preset="city" />

                        <group scale={[scale, scale, scale]}>
                            {runners.map((runner) => (
                                <Beam
                                    key={runner.id}
                                    position={[
                                        runner.x + runner.width / 2,
                                        runner.y + runner.height / 2,
                                        runner.z + runner.length / 2
                                    ]}
                                    args={[runner.width, runner.height, runner.length]}
                                    color="#d35400"
                                />
                            ))}

                            {slats.map((slat) => (
                                <Beam
                                    key={slat.id}
                                    position={[
                                        slat.x + slat.length / 2,
                                        slat.y + slat.height / 2,
                                        slat.z + slat.width / 2
                                    ]}
                                    args={[slat.length, slat.height, slat.width]}
                                    color="#e67e22"
                                />
                            ))}
                        </group>

                        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
                    </Suspense>
                </Canvas>
            ) : viewMode === '2d' ? (
                <TechnicalDrawing parts={parts} />
            ) : (
                <PartsView parts={parts} />
            )}
        </div>
    );
}
