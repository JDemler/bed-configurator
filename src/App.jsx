import { useState, useEffect, useMemo } from 'react'
import './index.css'
import { BedCalculator, DEFAULT_CONFIG } from './logic/bedCalculator'
import { Configurator } from './components/Configurator'
import { Visualizer } from './components/Visualizer'
import { StatsPanel } from './components/StatsPanel'
import { ComparisonView } from './components/ComparisonView'
import { Layout, List } from 'lucide-react'

function App() {
  // Current active config
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('bedConfig');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Saved configurations list
  const [savedConfigs, setSavedConfigs] = useState(() => {
    const saved = localStorage.getItem('savedBedConfigs');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'comparison'

  // Persist current config
  useEffect(() => {
    localStorage.setItem('bedConfig', JSON.stringify(config));
  }, [config]);

  // Persist saved configs
  useEffect(() => {
    localStorage.setItem('savedBedConfigs', JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  // Calculate results for current config
  const results = useMemo(() => {
    const calculator = new BedCalculator(config);
    return calculator.calculate();
  }, [config]);

  const handleSave = () => {
    const newConfig = { ...config, savedAt: new Date().toISOString() };
    // Check if name exists, if so update, else add? 
    // For simplicity, let's just add new entry or update if name matches exactly?
    // Let's just add to list for now, user can delete old ones.
    setSavedConfigs(prev => [...prev, newConfig]);
    alert('Configuration saved!');
  };

  const handleLoad = (loadedConfig) => {
    setConfig(loadedConfig);
    setViewMode('editor');
  };

  const handleDelete = (index) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      setSavedConfigs(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 'var(--spacing-lg) 0', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bed Configurator</h1>
        <div className="flex gap-sm">
          <button
            className={`btn ${viewMode === 'editor' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('editor')}
          >
            <Layout size={18} style={{ marginRight: '8px' }} /> Editor
          </button>
          <button
            className={`btn ${viewMode === 'comparison' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('comparison')}
          >
            <List size={18} style={{ marginRight: '8px' }} /> Compare ({savedConfigs.length})
          </button>
        </div>
      </header>

      <main style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {viewMode === 'editor' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 'var(--spacing-lg)', height: '100%' }}>
            <aside className="card" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <Configurator config={config} onChange={setConfig} onSave={handleSave} />
            </aside>

            <section className="flex flex-col gap-lg" style={{ minHeight: 0, overflowY: 'auto' }}>
              <div style={{ flex: 1, minHeight: '400px' }}>
                <Visualizer parts={results.parts} />
              </div>
              <StatsPanel metrics={results.metrics} />
            </section>
          </div>
        ) : (
          <ComparisonView
            savedConfigs={savedConfigs}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}

export default App
