import { Info, BookOpen, Globe } from 'lucide-react';
import type { Settings } from '../types';

interface Props { settings: Settings; onChange: (s: Settings) => void; }

const AQI_BANDS = [
  { range: '0 – 50',    label: 'Good',                    sub: 'Air quality is satisfactory.', color: '#22c55e' },
  { range: '51 – 100',  label: 'Moderate',                sub: 'Sensitive groups may be affected.', color: '#eab308' },
  { range: '101 – 150', label: 'Unhealthy (Sensitive)',    sub: 'Asthma / heart patients reduce outdoor time.', color: '#f97316' },
  { range: '151 – 200', label: 'Unhealthy',               sub: 'Everyone may experience effects.', color: '#ef4444' },
  { range: '201 – 300', label: 'Very Unhealthy',          sub: 'Avoid prolonged outdoor activity.', color: '#a855f7' },
  { range: '300+',      label: 'Hazardous',               sub: 'Health emergency. Stay indoors.', color: '#7f1d1d' },
];

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>Settings</h2>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Display preferences and reference.</p>
      </div>

      {/* AQI unit */}
      <div className="glass" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', marginBottom: 12, fontSize: 13, fontWeight: 500 }}>
          <Globe size={14} color="var(--teal)" />
          AQI Scale
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['us', 'eu'] as const).map(unit => {
            const sel = settings.aqiUnit === unit;
            return (
              <button key={unit} onClick={() => onChange({ ...settings, aqiUnit: unit })}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.18s',
                  background: sel ? 'rgba(20,184,166,0.15)' : 'rgba(4,15,30,0.6)',
                  border: `1px solid ${sel ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.06)'}`,
                  color: sel ? 'var(--teal-bright)' : 'var(--text-3)',
                  boxShadow: sel ? '0 0 16px rgba(20,184,166,0.1)' : 'none',
                }}>
                {unit === 'us' ? '🇺🇸 US EPA' : '🇪🇺 EU AQI'}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
          Both calculated from PM2.5 via Open-Meteo model data.
        </p>
      </div>

      {/* AQI legend */}
      <div className="glass" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', marginBottom: 14, fontSize: 13, fontWeight: 500 }}>
          <BookOpen size={14} color="var(--teal)" />
          AQI Reference Guide
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AQI_BANDS.map(({ range, label, sub, color }) => (
            <div key={range} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 3, boxShadow: `0 0 6px ${color}66` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>{range}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="glass" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', marginBottom: 10, fontSize: 13, fontWeight: 500 }}>
          <Info size={14} color="var(--teal)" />
          About UrbanBreath
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Real-time air quality from <strong style={{ color: 'var(--teal)' }}>Open-Meteo</strong>. Breath Load uses
          your activity's breathing rate × average PM2.5 along your walk. Activity is selected in the Walk screen.
        </p>
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 12,
          background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.14)',
          fontSize: 11, color: 'var(--teal)', lineHeight: 1.5,
        }}>
          Not a medical device. For informational use only.
        </div>
      </div>
    </div>
  );
}
