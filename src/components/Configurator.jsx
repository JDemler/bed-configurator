import React from 'react';
import { WOOD_TYPES } from '../logic/bedCalculator';
import { Save, Link as LinkIcon } from 'lucide-react';

export function Configurator({ config, onChange, onSave }) {
    const handleChange = (key, value) => {
        onChange({ ...config, [key]: parseFloat(value) || value });
    };

    const handleTextChange = (key, value) => {
        onChange({ ...config, [key]: value });
    };

    return (
        <div className="flex flex-col gap-lg">
            <section>
                <div className="flex justify-between items-center mb-2">
                    <h3 style={{ marginBottom: 0 }}>Configuration</h3>
                    <button className="btn btn-primary" onClick={onSave} title="Save Configuration">
                        <Save size={16} style={{ marginRight: '4px' }} /> Save
                    </button>
                </div>
                <div className="input-group">
                    <label>Configuration Name</label>
                    <input
                        type="text"
                        value={config.name || ''}
                        onChange={(e) => handleTextChange('name', e.target.value)}
                        placeholder="e.g. Guest Bed"
                    />
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Dimensions</h3>
                <div className="flex flex-col gap-md">
                    <div className="input-group">
                        <label>Bed Width (mm)</label>
                        <input
                            type="number"
                            value={config.bedWidth}
                            onChange={(e) => handleChange('bedWidth', e.target.value)}
                            step="10"
                        />
                    </div>
                    <div className="input-group">
                        <label>Bed Length (mm)</label>
                        <input
                            type="number"
                            value={config.bedLength}
                            onChange={(e) => handleChange('bedLength', e.target.value)}
                            step="10"
                        />
                    </div>
                    <div className="input-group">
                        <label>Bed Height (mm)</label>
                        <input
                            type="number"
                            value={config.bedHeight}
                            onChange={(e) => handleChange('bedHeight', e.target.value)}
                            step="10"
                        />
                    </div>
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Beams (Runners)</h3>
                <div className="flex flex-col gap-md">
                    <div className="input-group">
                        <label>Width (mm)</label>
                        <input
                            type="number"
                            value={config.runnerWidth}
                            onChange={(e) => handleChange('runnerWidth', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Height (mm)</label>
                        <input
                            type="number"
                            value={config.runnerHeight}
                            onChange={(e) => handleChange('runnerHeight', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Count</label>
                        <select
                            value={config.runnerCount}
                            onChange={(e) => handleChange('runnerCount', parseInt(e.target.value))}
                        >
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Margin (mm)</label>
                        <input
                            type="number"
                            value={config.runnerMargin || 0}
                            onChange={(e) => handleChange('runnerMargin', e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Slats</h3>
                <div className="flex flex-col gap-md">
                    <div className="input-group">
                        <label>Width (mm)</label>
                        <input
                            type="number"
                            value={config.slatWidth}
                            onChange={(e) => handleChange('slatWidth', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Height (mm)</label>
                        <input
                            type="number"
                            value={config.slatHeight}
                            onChange={(e) => handleChange('slatHeight', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Gap (mm)</label>
                        <input
                            type="number"
                            value={config.slatGap}
                            onChange={(e) => handleChange('slatGap', e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Material & Price</h3>
                <div className="flex flex-col gap-md">
                    <div className="input-group">
                        <label>Wood Type</label>
                        <select
                            value={config.materialId}
                            onChange={(e) => handleTextChange('materialId', e.target.value)}
                        >
                            {WOOD_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Runner Material Link</label>
                        <div className="flex items-center gap-xs">
                            <LinkIcon size={16} className="text-muted" />
                            <input
                                type="text"
                                value={config.runnerMaterialLink || ''}
                                onChange={(e) => handleTextChange('runnerMaterialLink', e.target.value)}
                                placeholder="https://..."
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Slat Material Link</label>
                        <div className="flex items-center gap-xs">
                            <LinkIcon size={16} className="text-muted" />
                            <input
                                type="text"
                                value={config.slatMaterialLink || ''}
                                onChange={(e) => handleTextChange('slatMaterialLink', e.target.value)}
                                placeholder="https://..."
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <label>Pricing Unit</label>
                    <select
                        value={config.pricingUnit || 'm'}
                        onChange={(e) => handleTextChange('pricingUnit', e.target.value)}
                    >
                        <option value="m">Per Meter (€/m)</option>
                        <option value="m3">Per Volume (€/m³)</option>
                        <option value="piece">Per Piece (€/ea)</option>
                    </select>
                </div>

                <div className="input-group">
                    <label>Runner Price {config.pricingUnit === 'm' ? '(€/m)' : config.pricingUnit === 'm3' ? '(€/m³)' : '(€/ea)'}</label>
                    <input
                        type="number"
                        value={config.pricePerUnitRunner}
                        onChange={(e) => handleChange('pricePerUnitRunner', e.target.value)}
                        step="0.50"
                    />
                </div>
                <div className="input-group">
                    <label>Slat Price {config.pricingUnit === 'm' ? '(€/m)' : config.pricingUnit === 'm3' ? '(€/m³)' : '(€/ea)'}</label>
                    <input
                        type="number"
                        value={config.pricePerUnitSlat}
                        onChange={(e) => handleChange('pricePerUnitSlat', e.target.value)}
                        step="0.50"
                    />
                </div>
            </section >
        </div >
    );
}
