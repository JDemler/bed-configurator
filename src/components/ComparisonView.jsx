import React from 'react';
import { Trash2, Edit, ExternalLink } from 'lucide-react';
import { BedCalculator } from '../logic/bedCalculator';

export function ComparisonView({ savedConfigs, onLoad, onDelete }) {
    if (!savedConfigs || savedConfigs.length === 0) {
        return (
            <div className="card flex items-center justify-center" style={{ height: '100%', color: 'var(--color-text-muted)' }}>
                No saved configurations yet. Save a design to compare!
            </div>
        );
    }

    // Calculate metrics for all configs on the fly
    const data = savedConfigs.map(config => {
        const calculator = new BedCalculator(config);
        const { metrics } = calculator.calculate();
        return { config, metrics };
    });

    return (
        <div className="card" style={{ height: '100%', overflow: 'auto' }}>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Saved Configurations</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                        <th style={{ padding: 'var(--spacing-sm)' }}>Name</th>
                        <th style={{ padding: 'var(--spacing-sm)' }}>Dimensions</th>
                        <th style={{ padding: 'var(--spacing-sm)' }}>Material</th>
                        <th style={{ padding: 'var(--spacing-sm)' }}>Price</th>
                        <th style={{ padding: 'var(--spacing-sm)' }}>Sturdiness</th>
                        <th style={{ padding: 'var(--spacing-sm)' }}>Volume</th>
                        <th style={{ padding: 'var(--spacing-sm)' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(({ config, metrics }, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', fontWeight: 500 }}>
                                {config.name || 'Untitled'}
                            </td>
                            <td style={{ padding: 'var(--spacing-sm)' }}>
                                {config.bedWidth} x {config.bedLength} mm
                            </td>
                            <td style={{ padding: 'var(--spacing-sm)' }}>
                                <div className="flex flex-col">
                                    <span>{config.materialId}</span>
                                    {config.runnerMaterialLink && (
                                        <a href={config.runnerMaterialLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-xs text-muted" style={{ fontSize: '0.8rem' }}>
                                            <ExternalLink size={12} /> Runner
                                        </a>
                                    )}
                                    {config.slatMaterialLink && (
                                        <a href={config.slatMaterialLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-xs text-muted" style={{ fontSize: '0.8rem' }}>
                                            <ExternalLink size={12} /> Slat
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td style={{ padding: 'var(--spacing-sm)', fontWeight: 700 }}>
                                €{metrics.totalPrice.toFixed(2)}
                            </td>
                            <td style={{ padding: 'var(--spacing-sm)' }}>
                                <span style={{ color: metrics.isSturdy ? 'green' : 'orange' }}>
                                    {metrics.sturdinessScore}/100
                                </span>
                            </td>
                            <td style={{ padding: 'var(--spacing-sm)' }}>
                                {metrics.totalVolume.toFixed(3)} m³
                            </td>
                            <td style={{ padding: 'var(--spacing-sm)' }}>
                                <div className="flex gap-sm">
                                    <button
                                        className="btn"
                                        onClick={() => onLoad(config)}
                                        title="Load Configuration"
                                        style={{ background: '#e3f2fd', color: '#0984e3' }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => onDelete(index)}
                                        title="Delete Configuration"
                                        style={{ background: '#ffeaa7', color: '#d63031' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
