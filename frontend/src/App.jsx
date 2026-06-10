import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [bins, setBins] = useState([]);

  const fetchBins = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/bins');
      setBins(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchBins();
    const interval = setInterval(fetchBins, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Summary Statistics
  const totalBins = bins.length;
  const criticalBins = bins.filter(b => b.fill_percentage > 80).length;
  const healthyBins = totalBins - criticalBins;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px' }}>
      
      {/* 1. Dashboard Header */}
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>
          🌍 Smart Waste Operations Center
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '14px' }}>
          Real-time IoT telemetry and route optimization dashboard.
        </p>
      </header>

      {/* 2. Top Level Summary Stats */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Total Active Bins" value={totalBins} color="#3b82f6" />
        <StatCard title="Critical Alerts (>80%)" value={criticalBins} color="#ef4444" isAlert={criticalBins > 0} />
        <StatCard title="Healthy Network" value={healthyBins} color="#22c55e" />
      </div>

      {/* 3. Responsive Grid for Bin Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
        flex: 1, // Allows grid to take up remaining height
        alignContent: 'start'
      }}>
        {bins.map((bin) => (
          <BinCard key={bin.bin_id} bin={bin} />
        ))}
      </div>
    </div>
  );
}

// Sub-component: Summary Statistic Card
function StatCard({ title, value, color, isAlert }) {
  return (
    <div style={{
      flex: 1,
      backgroundColor: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      borderLeft: `4px solid ${color}`,
      boxShadow: isAlert ? '0 0 15px rgba(239, 68, 68, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#f8fafc', marginTop: '8px' }}>
        {value}
      </p>
    </div>
  );
}

// Sub-component: Individual Bin Telemetry Card
function BinCard({ bin }) {
  const isCritical = bin.fill_percentage > 80;
  const isWarning = bin.fill_percentage > 50 && bin.fill_percentage <= 80;
  
  // Determine color based on status
  let statusColor = '#22c55e'; // Green
  if (isWarning) statusColor = '#eab308'; // Yellow
  if (isCritical) statusColor = '#ef4444'; // Red

  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      border: `1px solid ${isCritical ? '#ef4444' : '#334155'}`,
      boxShadow: isCritical ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>
          ID: {bin.bin_id.toUpperCase()}
        </h2>
        <span style={{
          backgroundColor: `${statusColor}20`, // 20% opacity background
          color: statusColor,
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {bin.status}
        </span>
      </div>

      {/* Telemetry Data */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Fill Level</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>{bin.fill_percentage}%</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Sensor Distance</p>
          <p style={{ fontSize: '20px', fontWeight: '500', color: '#cbd5e1' }}>{bin.distance_cm} cm</p>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div style={{ width: '100%', backgroundColor: '#0f172a', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{
          width: `${bin.fill_percentage}%`,
          backgroundColor: statusColor,
          height: '100%',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}></div>
      </div>

      {/* Timestamp */}
      <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        Last Sync: {bin.last_updated || 'Awaiting connection...'}
      </div>
    </div>
  );
}

export default App;