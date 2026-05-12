import { ArrowLeft, Flame, Wind, Gauge, MapPin, Leaf } from 'lucide-react';
import type { WalkSession } from '../types';
import { aqiColor, aqiGuidance } from '../lib/aqi';

interface Props { session: WalkSession; onClose: () => void; }

export default function WalkSummary({ session, onClose }: Props) {
  const bl = session.breathLoad;
  if (!bl) return null;

  const totalMin = bl.durationMin;
  const dur = `${Math.floor(totalMin)}m ${Math.round((totalMin % 1) * 60)}s`;
  const aqi = Math.round(bl.avgAqi);
  const aColor = aqiColor(aqi);

  return (
    <div className="fade-in" style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Walk Summary</h2>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
        }}>
          <ArrowLeft size={13} /> Clear
        </button>
      </div>

      {/* Hero — PM2.5 Breath Load */}
      <div className="glass-teal" style={{ padding: '24px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#f97316', marginBottom: 8 }}>
          <Flame size={16} />
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Estimated PM2.5 Breath Load</span>
        </div>
        <p className="mono" style={{ fontSize: 64, fontWeight: 700, color: '#f97316', lineHeight: 1 }}>
          {bl.pm25InhaledUg.toFixed(2)}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>micrograms of PM2.5 inhaled</p>
        <p style={{ fontSize: 11, color: 'rgba(249,115,22,0.5)', marginTop: 6 }}>
          {bl.activity.icon} {bl.activity.label} · {bl.activity.breathingRateLPerMin} L/min
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Duration',    value: dur,                          color: 'var(--text-1)' },
          { label: 'Distance',    value: `${bl.distanceKm.toFixed(2)} km`, color: 'var(--text-1)' },
          { label: 'Avg AQI',     value: aqi.toString(),               color: aColor },
          { label: 'Avg PM2.5',   value: `${bl.avgPm25.toFixed(1)}`,  color: '#f97316', unit: 'µg/m³' },
          { label: 'Air Inhaled', value: `${bl.airInhaledM3.toFixed(3)}`, color: 'var(--text-2)', unit: 'm³' },
          { label: 'Clean Bonus', value: `${bl.cleanSavingsPct.toFixed(0)}%`, color: '#34d399', note: 'vs worst zone' },
        ].map(({ label, value, color, unit, note }) => (
          <div key={label} className="glass" style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            <p className="mono" style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
              {value}
              {unit && <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 4 }}>{unit}</span>}
            </p>
            {note && <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{note}</p>}
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="glass" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Gauge size={14} color="var(--teal)" /> Health Insights
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Insight icon={<Wind size={13} />} text={<>Walked <strong style={{color:'var(--text-1)'}}>{bl.distanceKm.toFixed(2)} km</strong> in {dur}.</>} />
          <Insight icon={<Gauge size={13} />} text={<>Average AQI <strong style={{color:aColor}}>{aqi}</strong> — {aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for sensitive groups' : 'Unhealthy'}.</>} />
          <Insight icon={<Flame size={13} color="#f97316" />} text={<>PM2.5 Breath Load: <strong style={{color:'#f97316'}}>{bl.pm25InhaledUg.toFixed(2)} µg</strong> from {bl.airInhaledM3.toFixed(3)} m³ at {bl.avgPm25.toFixed(1)} µg/m³ avg.</>} />
          {bl.worstPoint && (
            <Insight icon={<MapPin size={13} color="#f87171" />} text={<>Worst zone: AQI <strong style={{color:aqiColor(bl.worstPoint.aqi)}}>{Math.round(bl.worstPoint.aqi)}</strong> near [{bl.worstPoint.lat.toFixed(4)}, {bl.worstPoint.lon.toFixed(4)}].</>} />
          )}
          {bl.cleanSavingsPct > 5 && (
            <Insight icon={<Leaf size={13} color="#34d399" />} text={<>Cleaner sections cut exposure by <strong style={{color:'#34d399'}}>{bl.cleanSavingsPct.toFixed(0)}%</strong> vs the worst zone.</>} />
          )}
        </div>
      </div>

      {/* Guidance banner */}
      <div style={{
        padding: '14px 16px', borderRadius: 16,
        background: `${aColor}12`, border: `1px solid ${aColor}28`,
      }}>
        <p style={{ fontSize: 13, color: aColor, fontWeight: 500 }}>{aqiGuidance(aqi)}</p>
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', padding: '0 16px', lineHeight: 1.6 }}>
        Estimates based on public/modelled air-quality data and typical breathing rates. Not a medical diagnosis.
      </p>
    </div>
  );
}

function Insight({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--text-3)', marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  );
}
