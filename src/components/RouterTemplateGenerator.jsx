import React, { useState, useMemo } from 'react';
import { RouterTemplateCalculator } from '../logic/routerTemplateCalculator';
import { Download, Settings } from 'lucide-react';

export function RouterTemplateGenerator() {
    const [params, setParams] = useState({
        routerBitDiameter: 8,
        copyRingDiameter: 17,
        materialThickness: 5,
        runnerWidth: 40,
        runnerCount: 3,
        targetSlotWidth: 20,
        slotCount: 3,
        slotPitch: 100,
        padding: 20,
        sidePlateHeight: 60
    });

    const svg = useMemo(() => {
        const calculator = new RouterTemplateCalculator(params);
        return calculator.generateSVG();
    }, [params]);

    const handleChange = (key, value) => {
        setParams(prev => ({
            ...prev,
            [key]: parseFloat(value) || 0
        }));
    };

    const handleDownload = () => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'router-template.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 'var(--spacing-lg)', height: '100%' }}>
            <aside className="card" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <section>
                    <div className="flex justify-between items-center mb-2">
                        <h3 style={{ marginBottom: 0 }}>Template Settings</h3>
                    </div>

                    <div className="flex flex-col gap-md">
                        <div className="input-group">
                            <label>Router Bit Diameter (mm)</label>
                            <input
                                type="number"
                                value={params.routerBitDiameter}
                                onChange={(e) => handleChange('routerBitDiameter', e.target.value)}
                                step="0.5"
                            />
                        </div>
                        <div className="input-group">
                            <label>Copy Ring Diameter (mm)</label>
                            <input
                                type="number"
                                value={params.copyRingDiameter}
                                onChange={(e) => handleChange('copyRingDiameter', e.target.value)}
                                step="0.5"
                            />
                        </div>
                        <div className="input-group">
                            <label>Template Material Thickness (mm)</label>
                            <input
                                type="number"
                                value={params.materialThickness}
                                onChange={(e) => handleChange('materialThickness', e.target.value)}
                                step="0.5"
                            />
                        </div>
                        <div className="input-group">
                            <label>Side Plate Height (mm)</label>
                            <input
                                type="number"
                                value={params.sidePlateHeight}
                                onChange={(e) => handleChange('sidePlateHeight', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Runner Configuration</h3>
                    <div className="flex flex-col gap-md">
                        <div className="input-group">
                            <label>Runner Width (mm)</label>
                            <input
                                type="number"
                                value={params.runnerWidth}
                                onChange={(e) => handleChange('runnerWidth', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Runners in Vice</label>
                            <input
                                type="number"
                                value={params.runnerCount}
                                onChange={(e) => handleChange('runnerCount', e.target.value)}
                                min="1"
                            />
                        </div>
                        <div className="input-group">
                            <label>Target Slot Width (mm)</label>
                            <small className="text-muted">Thickness of the slat</small>
                            <input
                                type="number"
                                value={params.targetSlotWidth}
                                onChange={(e) => handleChange('targetSlotWidth', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Layout</h3>
                    <div className="flex flex-col gap-md">
                        <div className="input-group">
                            <label>Slot Count</label>
                            <input
                                type="number"
                                value={params.slotCount}
                                onChange={(e) => handleChange('slotCount', e.target.value)}
                                min="1"
                            />
                        </div>
                        <div className="input-group">
                            <label>Slot Pitch (mm)</label>
                            <small className="text-muted">Center-to-center distance</small>
                            <input
                                type="number"
                                value={params.slotPitch}
                                onChange={(e) => handleChange('slotPitch', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Edge Padding (mm)</label>
                            <input
                                type="number"
                                value={params.padding}
                                onChange={(e) => handleChange('padding', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <button className="btn btn-primary" onClick={handleDownload} style={{ marginTop: 'auto' }}>
                    <Download size={18} style={{ marginRight: '8px' }} /> Download SVG
                </button>
            </aside>

            <section className="card flex flex-col" style={{ minHeight: 0, overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <h3 style={{ margin: 0 }}>Preview</h3>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: 'var(--spacing-lg)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0' }}>
                    <div dangerouslySetInnerHTML={{ __html: svg }} style={{ background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                </div>
            </section>
        </div>
    );
}
