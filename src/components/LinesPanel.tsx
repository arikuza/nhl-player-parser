import React, { useState } from 'react';
import { lineCombinations } from '../data/lineCombinations';
import TeamLogo from './TeamLogo';
import './LinesPanel.css';

interface LinesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const LinesPanel: React.FC<LinesPanelProps> = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = useState<'forward' | 'defense'>('forward');
  const [filterType, setFilterType] = useState<'all' | 'salary' | 'ovr' | 'ap'>('all');

  const forwardLines = lineCombinations.filter(line => line.type === 'forward');
  const defenseLines = lineCombinations.filter(line => line.type === 'defense');

  const getFilteredLines = () => {
    const lines = selectedTab === 'forward' ? forwardLines : defenseLines;

    switch (filterType) {
      case 'salary':
        return lines.filter(line => line.boost.includes('SAL'));
      case 'ovr':
        return lines.filter(line => line.boost.includes('OVR') && !line.boost.includes('AP'));
      case 'ap':
        return lines.filter(line => line.boost.includes('AP'));
      default:
        return lines;
    }
  };

  const filteredLines = getFilteredLines();


  const getBoostColor = (boost: string) => {
    if (boost.includes('SAL')) return '#4CAF50';
    if (boost.includes('OVR')) return '#2196F3';
    if (boost.includes('AP')) return '#FF9800';
    return '#666';
  };

  return (
    <>
      <div className={`lines-panel-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`lines-panel ${isOpen ? 'open' : ''}`}>
        <div className="lines-panel-header">
          <h2>Line Combinations</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="lines-panel-tabs">
          <button
            className={`tab-btn ${selectedTab === 'forward' ? 'active' : ''}`}
            onClick={() => setSelectedTab('forward')}
          >
            Forwards ({forwardLines.length})
          </button>
          <button
            className={`tab-btn ${selectedTab === 'defense' ? 'active' : ''}`}
            onClick={() => setSelectedTab('defense')}
          >
            Defense ({defenseLines.length})
          </button>
        </div>

        <div className="lines-panel-filters">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterType === 'salary' ? 'active' : ''}`}
            onClick={() => setFilterType('salary')}
          >
            Salary
          </button>
          <button
            className={`filter-btn ${filterType === 'ovr' ? 'active' : ''}`}
            onClick={() => setFilterType('ovr')}
          >
            Overall
          </button>
          <button
            className={`filter-btn ${filterType === 'ap' ? 'active' : ''}`}
            onClick={() => setFilterType('ap')}
          >
            AP
          </button>
        </div>

        <div className="lines-panel-content">
          <div className="lines-header-row">
            <span className="header-boost">Boost Type</span>
            <span className="header-line">{selectedTab === 'forward' ? 'Forward Line' : 'Defense Line'}</span>
          </div>

          {filteredLines.map(line => (
            <div key={line.id} className="line-item">
              <div className="line-boost" style={{ color: getBoostColor(line.boost) }}>
                {line.boost}
              </div>

              <div className="line-teams">
                {line.teams.map((team, index) => (
                  <TeamLogo key={index} team={team} size="small" />
                ))}
              </div>
            </div>
          ))}

          {filteredLines.length === 0 && (
            <div className="no-lines">
              No line combinations found for the selected filter.
            </div>
          )}
        </div>

        <div className="lines-panel-footer">
          <p className="lines-info">
            💡 Line combinations provide bonus synergy effects when players from the same teams or countries play together.
          </p>
        </div>
      </div>
    </>
  );
};

export default LinesPanel;