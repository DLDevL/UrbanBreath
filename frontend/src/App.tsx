import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppScreen, AirQualityData, WalkSession, Settings, AqiGridPoint } from './types';
import { fetchAirQuality } from './lib/api';
import AirQualityCard from './components/AirQualityCard';
import LiveMap from './components/LiveMap';
import WalkTracker from './components/WalkTracker';
import WalkSummary from './components/WalkSummary';
import SettingsPanel from './components/SettingsPanel';
import BottomNav from './components/BottomNav';
import './index.css';

const DEFAULT_SETTINGS: Settings = { aqiUnit: 'us' };

export default function App() {
  const [screen, setScreen]               = useState<AppScreen>('map');
  const [userLat, setUserLat]             = useState(0);
  const [userLon, setUserLon]             = useState(0);
  const [locationError, setLocationError] = useState(() => (
    navigator.geolocation ? '' : 'Geolocation not supported.'
  ));
  const [airQuality, setAirQuality]       = useState<AirQualityData | null>(null);
  const [aqLoading, setAqLoading]         = useState(false);
  const [aqiGrid, setAqiGrid]             = useState<AqiGridPoint[]>([]);
  const [activeSession, setActiveSession] = useState<WalkSession | null>(null);
  const [completedSession, setCompletedSession] = useState<WalkSession | null>(null);
  const [settings, setSettings]           = useState<Settings>(() => {
    const s = localStorage.getItem('urbanbreath_settings');
    if (!s) return DEFAULT_SETTINGS;
    try {
      return JSON.parse(s);
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const aqPollRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  function saveSettings(s: Settings) {
    setSettings(s);
    localStorage.setItem('urbanbreath_settings', JSON.stringify(s));
  }

  // GPS watch
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => { setUserLat(pos.coords.latitude); setUserLon(pos.coords.longitude); setLocationError(''); },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // AQI at user position (map screen, every 2 min)
  const fetchAq = useCallback(async () => {
    if (!userLat || !userLon) return;
    setAqLoading(true);
    try {
      const data = await fetchAirQuality(userLat, userLon);
      setAirQuality(data);
    } finally {
      setAqLoading(false);
    }
  }, [userLat, userLon]);

  useEffect(() => {
    let firstFetch: ReturnType<typeof setTimeout> | null = null;
    if (screen === 'map' && userLat && userLon) {
      firstFetch = setTimeout(fetchAq, 0);
      aqPollRef.current = setInterval(fetchAq, 120000);
    }
    return () => {
      if (firstFetch) clearTimeout(firstFetch);
      if (aqPollRef.current) clearInterval(aqPollRef.current);
    };
  }, [screen, userLat, userLon, fetchAq]);

  function handleWalkEnd(session: WalkSession) {
    setCompletedSession(session);
    setScreen('summary');
  }

  const isWalking = !!activeSession;
  const showMap   = screen === 'map' || screen === 'walk';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', position: 'relative', background: 'var(--bg-void)' }}>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', flexShrink: 0, zIndex: 1000,
        background: 'rgba(2,12,27,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(20,184,166,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo mark */}
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(20,184,166,0.35)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#020c1b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              UrbanBreath
            </div>
            <div style={{ fontSize: 9, color: 'var(--teal)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Air Quality Tracker
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {locationError && (
            <span style={{ fontSize: 11, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '3px 8px', borderRadius: 8 }}>
              GPS unavailable
            </span>
          )}
          {isWalking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 10px', borderRadius: 10 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              Tracking
            </div>
          )}
          {airQuality && !airQuality.isFallback && (
            <div style={{ fontSize: 11, color: 'var(--teal)', background: 'var(--teal-dim)', border: '1px solid rgba(20,184,166,0.2)', padding: '4px 10px', borderRadius: 10 }}>
              Live
            </div>
          )}
          {airQuality?.isFallback && (
            <div style={{ fontSize: 11, color: '#eab308', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', padding: '4px 10px', borderRadius: 10 }}>
              Demo
            </div>
          )}
        </div>
      </header>

      {/* ── Map layer ── */}
      <div
        className={`relative overflow-hidden ${showMap ? 'flex flex-col' : 'hidden'}`}
        style={{ flex: 1, minHeight: 0 }}
      >
        <LiveMap
          userLat={userLat}
          userLon={userLon}
          airQuality={airQuality}
          walkPoints={activeSession?.points ?? []}
          aqiGrid={aqiGrid}
          onAqiGridChange={setAqiGrid}
        />

        {/* AQI card float — map screen, above floating nav */}
        {screen === 'map' && (
          <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, padding: '0 14px', zIndex: 900 }}>
            <AirQualityCard data={airQuality} loading={aqLoading && !airQuality} />
          </div>
        )}

        {/* Walk overlay — sits on top of the map (zIndex 1010 > Leaflet controls at 1000) */}
        {screen === 'walk' && (
          <div className="walk-overlay">
            <WalkTracker
              userLat={userLat}
              userLon={userLon}
              onSessionUpdate={setActiveSession}
              onWalkEnd={handleWalkEnd}
            />
          </div>
        )}
      </div>

      {/* ── Walk summary ── */}
      {screen === 'summary' && (
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {completedSession ? (
            <WalkSummary
              session={completedSession}
              onClose={() => { setCompletedSession(null); setScreen('map'); }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <p className="text-4xl">📋</p>
              <p>No walk completed yet.</p>
              <button onClick={() => setScreen('walk')} className="text-green-400 text-sm underline">
                Start a walk
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Settings ── */}
      {screen === 'settings' && (
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <SettingsPanel settings={settings} onChange={saveSettings} />
        </div>
      )}

      <BottomNav current={screen} onChange={setScreen} isWalking={isWalking} />
    </div>
  );
}
