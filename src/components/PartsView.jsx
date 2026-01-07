import React from 'react';

function PartDrawing({ part, count, name }) {
    const { length, height, cuts } = part;
    const padding = 50;
    const scale = 0.5; // Scale for display if needed, but SVG viewBox handles it.

    // ViewBox: x y w h
    // We need enough height for the beam + dimensions below.
    const dimHeight = 100;
    const totalHeight = height + dimHeight + padding * 2;
    const totalWidth = length + padding * 2;

    return (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{name} (x{count})</h3>
            <div style={{ overflowX: 'auto' }}>
                <svg viewBox={`${-padding} ${-padding} ${totalWidth} ${totalHeight}`} style={{ minWidth: '100%', height: '200px' }}>
                    {/* Main Beam */}
                    <rect x={0} y={0} width={length} height={height} fill="#ecf0f1" stroke="#2d3436" strokeWidth="2" />

                    {/* Cuts */}
                    {cuts.map((cut, i) => (
                        <g key={i}>
                            <rect
                                x={cut.x}
                                y={0}
                                width={cut.width}
                                height={cut.depth}
                                fill="#dfe6e9"
                                stroke="#2d3436"
                                strokeWidth="1"
                                strokeDasharray="4 2"
                            />
                            {/* Hatching for cut area */}
                            <line x1={cut.x} y1={0} x2={cut.x + cut.width} y2={cut.depth} stroke="#b2bec3" strokeWidth="1" />
                            <line x1={cut.x + cut.width} y1={0} x2={cut.x} y2={cut.depth} stroke="#b2bec3" strokeWidth="1" />
                        </g>
                    ))}

                    {/* Dimensions */}
                    {/* Total Length */}
                    <line x1={0} y1={height + 40} x2={length} y2={height + 40} stroke="#2d3436" strokeWidth="1" />
                    <line x1={0} y1={height + 35} x2={0} y2={height + 45} stroke="#2d3436" strokeWidth="1" />
                    <line x1={length} y1={height + 35} x2={length} y2={height + 45} stroke="#2d3436" strokeWidth="1" />
                    <text x={length / 2} y={height + 60} textAnchor="middle" fontSize="14" fill="#2d3436">{length} mm</text>

                    {/* Cut Dimensions (Simplified: Start, Pitch, Width, Depth) */}
                    {cuts.length > 0 && (
                        <>
                            {/* First Cut Pos */}
                            <text x={cuts[0].x} y={-10} textAnchor="end" fontSize="12" fill="#636e72">{Math.round(cuts[0].x)}</text>

                            {/* Cut Width */}
                            <text x={cuts[0].x + cuts[0].width / 2} y={cuts[0].depth + 15} textAnchor="middle" fontSize="10" fill="#d63031">
                                {Math.round(cuts[0].width)}x{Math.round(cuts[0].depth)}
                            </text>

                            {/* Pitch (if > 1 cut) */}
                            {cuts.length > 1 && (
                                <>
                                    <line x1={cuts[0].x} y1={height + 10} x2={cuts[1].x} y2={height + 10} stroke="#636e72" strokeWidth="1" strokeDasharray="2 2" />
                                    <text x={(cuts[0].x + cuts[1].x) / 2} y={height + 25} textAnchor="middle" fontSize="12" fill="#636e72">
                                        Pitch: {Math.round(cuts[1].x - cuts[0].x)}
                                    </text>
                                </>
                            )}
                        </>
                    )}

                </svg>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
                <strong>Details:</strong> {length}mm x {part.height}mm x {part.width}mm.
                {cuts.length > 0 && ` Notches: ${cuts.length}x (${Math.round(cuts[0].width)}mm wide, ${Math.round(cuts[0].depth)}mm deep).`}
            </div>
        </div>
    );
}

export function PartsView({ parts }) {
    const { runners, slats } = parts;

    // Grouping logic (assuming all runners identical and all slats identical for now)
    // In this simple calculator, they are always identical sets.

    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: 'var(--spacing-md)' }}>
            <PartDrawing part={runners[0]} count={runners.length} name="Runner (Längsbalken)" />
            <PartDrawing part={slats[0]} count={slats.length} name="Slat (Querlatte)" />
        </div>
    );
}
