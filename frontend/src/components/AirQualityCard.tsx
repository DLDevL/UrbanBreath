import type { AirQualityData } from '../types';
import { aqiGuidance } from '../lib/aqi';
import { Wind } from 'lucide-react';

interface Props {
  data:    AirQualityData | null;
  loading?: boolean;
}

/* Max reference values for the horizontal bars (visual scale, not absolute ceiling) */
const BAR_REFS = { pm25: 75, pm10: 150, no2: 200, o3: 180, co: 15000 };

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 3,
        background: `linear-gradient(90deg, ${color}bb, ${color})`,
        transition: 'width 0.6s ease',
        boxShadow: `0 0 6px ${color}66`,
      }} />
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const W = 200, H = 44;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - 4 - ((v / max) * (H - 8));
    return [x, y] as [number, number];
  });
  const linePts = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const fillPts = [
    ...pts.map(([x, y]) => `${x},${y}`),
    `${W},${H}`, `0,${H}`,
  ].join(' ');

  /* current-hour marker */
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#sg)" />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* current dot */}
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="5" fill={color} fillOpacity="0.25" />
    </svg>
  );
}

export default function AirQualityCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="glass slide-up" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-elevated)' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 14, width: '35%', borderRadius: 6, background: 'var(--bg-elevated)' }} />
            <div style={{ height: 9, width: '55%', borderRadius: 6, background: 'var(--bg-elevated)' }} />
          </div>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const history = data.aqiHistory ?? [];

  const pollutants = [
    { key: 'pm25', label: 'PM2.5',  value: data.pm25, unit: 'µg/m³', color: '#f97316', max: BAR_REFS.pm25,  big: true  },
    { key: 'pm10', label: 'PM10',   value: data.pm10, unit: 'µg/m³', color: '#eab308', max: BAR_REFS.pm10,  big: true  },
    { key: 'no2',  label: 'NO₂',    value: data.no2,  unit: 'µg/m³', color: '#a78bfa', max: BAR_REFS.no2,   big: false },
    { key: 'o3',   label: 'O₃',     value: data.o3,   unit: 'µg/m³', color: '#22d3ee', max: BAR_REFS.o3,    big: false },
    { key: 'co',   label: 'CO',     value: data.co,   unit: 'µg/m³', color: '#64748b', max: BAR_REFS.co,    big: false },
  ];

  const bigPollutants   = pollutants.filter(p => p.big);
  const smallPollutants = pollutants.filter(p => !p.big);

  return (
    <div className="glass-teal slide-up" style={{ padding: '18px 20px', overflow: 'hidden', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 150, height: 150, borderRadius: '50%',
        background: `radial-gradient(circle, ${data.color}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Header row: AQI + badges ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
            Air Quality Index
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="mono" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: data.color }}>
              {Math.round(data.aqi)}
            </span>
            <span style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 20,
              background: `${data.color}20`, border: `1px solid ${data.color}44`,
              color: data.color, fontWeight: 600, letterSpacing: '0.01em',
            }}>
              {data.qualityLabel}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginTop: 4 }}>
          {data.isFallback && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)',
              color: '#eab308',
            }}>Demo</span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-3)', fontSize: 10 }}>
            <Wind size={11} />
            {data.source === 'open-meteo' ? 'Open-Meteo' : 'Estimated'}
          </div>
        </div>
      </div>

      {/* Guidance text */}
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.5 }}>
        {aqiGuidance(data.aqi)}
      </p>

      {/* ── Big pollutant rows: PM2.5 + PM10 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {bigPollutants.map(({ key, label, value, unit, color, max }) => (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
                <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span className="mono" style={{ fontSize: 18, fontWeight: 700, color }}>{value?.toFixed(1) ?? '—'}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{unit}</span>
              </div>
            </div>
            <ProgressBar value={value ?? 0} max={max} color={color} />
          </div>
        ))}
      </div>

      {/* ── Small pollutants row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
        {smallPollutants.map(({ key, label, value, unit, color }) => (
          <div key={key} style={{
            background: 'rgba(4,15,30,0.55)', borderRadius: 10, padding: '7px 8px',
            textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2 }}>{label}</p>
            <p className="mono" style={{ fontSize: 13, fontWeight: 600, color, lineHeight: 1 }}>
              {value?.toFixed(1) ?? '—'}
            </p>
            <p style={{ fontSize: 8, color: 'var(--text-3)', marginTop: 2 }}>{unit}</p>
          </div>
        ))}
      </div>

      {/* ── 24h AQI Trend chart ── */}
      {history.length >= 4 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              AQI Trend · Last {history.length}h
            </p>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
              {Math.round(Math.min(...history))} – {Math.round(Math.max(...history))}
            </span>
          </div>
          <Sparkline values={history} color={data.color} />
        </div>
      )}
    </div>
  );
}
