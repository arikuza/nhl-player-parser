import React, { useState, useEffect } from 'react';
import PlayerSearch from './components/PlayerSearch';
import LinesPanel from './components/LinesPanel';
import { StatsProvider } from './contexts/StatsContext';
import './App.css';

interface PlayerStats {
  id: string;
  full_name: string;
  position: string;
  team: string;
  nationality: string;
  league: string;
  hand: string;
  height: string;
  weight: string;
  card: string;
  overall: string;
  aOVR: string;
  acceleration: string;
  agility: string;
  balance: string;
  endurance: string;
  speed: string;
  slap_shot_accuracy: string;
  slap_shot_power: string;
  wrist_shot_accuracy: string;
  wrist_shot_power: string;
  deking: string;
  off_awareness: string;
  hand_eye: string;
  passing: string;
  puck_control: string;
  body_checking: string;
  strength: string;
  aggression: string;
  durability: string;
  fighting_skill: string;
  def_awareness: string;
  shot_blocking: string;
  stick_checking: string;
  faceoffs: string;
  discipline: string;
  date_added: string;
  date_updated: string;
}

interface DataState {
  isLoading: boolean;
  players: PlayerStats[];
  forwards: PlayerStats[];
  defensemen: PlayerStats[];
  goalies: PlayerStats[];
  summary: {
    total: number;
    forwards: number;
    defensemen: number;
    goalies: number;
    lastUpdated: string;
  } | null;
  error: string | null;
}

function App() {
  const [dataState, setDataState] = useState<DataState>({
    isLoading: true,
    players: [],
    forwards: [],
    defensemen: [],
    goalies: [],
    summary: null,
    error: null
  });
  const [isLinesPanelOpen, setIsLinesPanelOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setDataState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load summary first to check if data exists
      const summaryResponse = await fetch(`${process.env.PUBLIC_URL}/data/summary.json`);
      if (!summaryResponse.ok) {
        throw new Error('No parsed data found. Please run the parser first: node parser.js');
      }
      const summary = await summaryResponse.json();

      // Load all player data
      const [allPlayersRes, forwardsRes, defensemenRes, goaliesRes] = await Promise.all([
        fetch(`${process.env.PUBLIC_URL}/data/all_players.json`),
        fetch(`${process.env.PUBLIC_URL}/data/forwards.json`),
        fetch(`${process.env.PUBLIC_URL}/data/defensemen.json`),
        fetch(`${process.env.PUBLIC_URL}/data/goalies.json`)
      ]);

      const [players, forwards, defensemen, goalies] = await Promise.all([
        allPlayersRes.json(),
        forwardsRes.json(),
        defensemenRes.json(),
        goaliesRes.json()
      ]);

      setDataState({
        isLoading: false,
        players,
        forwards,
        defensemen,
        goalies,
        summary,
        error: null
      });
    } catch (error) {
      setDataState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  };

  const exportToJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSON(dataState.players, `nhl-players-all-${timestamp}.json`);
  };

  const handleExportForwards = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSON(dataState.forwards, `nhl-players-forwards-${timestamp}.json`);
  };

  const handleExportDefensemen = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSON(dataState.defensemen, `nhl-players-defensemen-${timestamp}.json`);
  };

  const handleExportGoalies = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSON(dataState.goalies, `nhl-players-goalies-${timestamp}.json`);
  };

  return (
    <StatsProvider>
      <div className="App">
        <button
        className="lines-btn-fixed"
        onClick={() => setIsLinesPanelOpen(true)}
        title="Line Combinations"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <span>Lines</span>
      </button>

      <main className="App-main">
        {dataState.isLoading && (
          <div className="loading">
            <p>Loading parsed data...</p>
          </div>
        )}

        {dataState.error && (
          <div className="error">
            <h3>Error:</h3>
            <p>{dataState.error}</p>
            <p>To parse new data, run: <code>node parser.js</code></p>
          </div>
        )}

        {dataState.summary && !dataState.isLoading && !dataState.error && (
          <>
            <PlayerSearch players={dataState.players} />

            <div className="results">
              <div className="info-box">
                <p>Last updated: {new Date(dataState.summary.lastUpdated).toLocaleString()}</p>
              </div>

              <div className="stats">
                <div className="stat-item">
                  <h3>Total Players</h3>
                  <span className="count">{dataState.summary.total}</span>
                </div>
                <div className="stat-item">
                  <h3>Forwards</h3>
                  <span className="count">{dataState.summary.forwards}</span>
                </div>
                <div className="stat-item">
                  <h3>Defensemen</h3>
                  <span className="count">{dataState.summary.defensemen}</span>
                </div>
                <div className="stat-item">
                  <h3>Goalies</h3>
                  <span className="count">{dataState.summary.goalies}</span>
                </div>
              </div>

              <div className="export-buttons">
                <button onClick={handleExportAll} className="export-button all">
                  Export All Players ({dataState.players.length})
                </button>
                <button onClick={handleExportForwards} className="export-button forwards">
                  Export Forwards ({dataState.forwards.length})
                </button>
                <button onClick={handleExportDefensemen} className="export-button defensemen">
                  Export Defensemen ({dataState.defensemen.length})
                </button>
                <button onClick={handleExportGoalies} className="export-button goalies">
                  Export Goalies ({dataState.goalies.length})
                </button>
              </div>
            </div>
          </>
        )}

        {!dataState.isLoading && !dataState.error && !dataState.summary && (
          <div className="no-data">
            <h2>No Data Available</h2>
            <p>Please run the parser script first to fetch the data:</p>
            <code className="command">node parser.js</code>
          </div>
        )}
      </main>

      <LinesPanel
        isOpen={isLinesPanelOpen}
        onClose={() => setIsLinesPanelOpen(false)}
      />
    </div>
    </StatsProvider>
  );
}

export default App;