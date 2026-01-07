import React from 'react';
import { AlertTriangle, CheckCircle, Euro, Ruler, Layers } from 'lucide-react';

export function StatsPanel({ metrics }) {
    const {
        totalPrice,
        totalRunnerLengthM,
        totalSlatLengthM,
        slatCount,
        runnerCount,
        deflectionMm,
        sturdinessScore,
        isSturdy
    } = metrics;

    return (
        <div className="grid grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="card flex flex-col gap-sm">
                <div className="flex items-center gap-sm text-muted">
                    <Euro size={18} />
                    <span style={{ fontSize: '0.875rem' }}>Total Price</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    €{totalPrice.toFixed(2)}
                </div>
            </div>

            <div className="card flex flex-col gap-sm">
                <div className="flex items-center gap-sm text-muted">
                    {isSturdy ? <CheckCircle size={18} color="green" /> : <AlertTriangle size={18} color="orange" />}
                    <span style={{ fontSize: '0.875rem' }}>Sturdiness</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isSturdy ? 'inherit' : 'orange' }}>
                    {sturdinessScore}/100
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Deflection: {deflectionMm.toFixed(2)}mm
                </div>
            </div>

            <div className="card flex flex-col gap-sm">
                <div className="flex items-center gap-sm text-muted">
                    <Layers size={18} />
                    <span style={{ fontSize: '0.875rem' }}>Parts</span>
                </div>
                <div style={{ fontSize: '1rem' }}>
                    <div>{runnerCount} Runners ({totalRunnerLengthM.toFixed(1)}m)</div>
                    <div>{slatCount} Slats ({totalSlatLengthM.toFixed(1)}m)</div>
                </div>
            </div>

            <div className="card flex flex-col gap-sm">
                <div className="flex items-center gap-sm text-muted">
                    <Ruler size={18} />
                    <span style={{ fontSize: '0.875rem' }}>Wood Volume</span>
                </div>
                <div style={{ fontSize: '1rem' }}>
                    {/* Approximate volume */}
                    {((totalRunnerLengthM * 0.01) + (totalSlatLengthM * 0.005)).toFixed(3)} m³
                </div>
            </div>
        </div>
    );
}
