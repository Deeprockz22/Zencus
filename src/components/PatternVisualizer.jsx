import React from 'react';
import { Activity } from 'lucide-react';

const PatternVisualizer = ({ stats }) => {
  // A simple cute visualizer for the patterns
  const maxVal = Math.max(...stats.map(s => s.value), 10);
  
  return (
    <div className="pattern-visualizer glass-panel">
      <h3 className="section-title flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
        <Activity size={18} color="var(--accent-pink)" />
        Your Patterns
      </h3>
      
      <div className="chart-container">
        {stats.map((stat, i) => (
          <div key={i} className="chart-bar-group">
            <div className="chart-bar-bg">
              <div 
                className="chart-bar-fill"
                style={{ 
                  height: `${(stat.value / maxVal) * 100}%`
                }}
              ></div>
            </div>
            <span className="chart-label">{stat.label}</span>
          </div>
        ))}
      </div>
      
      <div className="pattern-insight">
        <p>You stayed focused mostly after drawing. Keep it up! ✨</p>
      </div>
    </div>
  );
};

export default PatternVisualizer;
