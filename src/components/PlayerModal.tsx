import React from 'react';
import { useStatsContext } from '../contexts/StatsContext';
import { formatHeight, formatWeight } from '../utils/conversions';
import './PlayerModal.css';

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
  cardImage?: string;
  overall: string;
  aOVR?: string;
  // Skater stats
  acceleration?: string;
  agility?: string;
  balance?: string;
  endurance?: string;
  speed?: string;
  slap_shot_accuracy?: string;
  slap_shot_power?: string;
  wrist_shot_accuracy?: string;
  wrist_shot_power?: string;
  deking?: string;
  hand_eye?: string;
  passing?: string;
  puck_control?: string;
  off_awareness?: string;
  def_awareness?: string;
  body_checking?: string;
  strength?: string;
  aggression?: string;
  durability?: string;
  fighting_skill?: string;
  shot_blocking?: string;
  stick_checking?: string;
  faceoffs?: string;
  discipline?: string;
  // Goalie stats
  glove_high?: string;
  glove_low?: string;
  stick_high?: string;
  stick_low?: string;
  five_hole?: string;
  breakaway?: string;
  quickness?: string;
  positioning?: string;
  poke_check?: string;
  shot_recovery?: string;
  rebound_control?: string;
  vision?: string;
  date_added: string;
  date_updated: string;
}

interface PlayerModalProps {
  player: PlayerStats;
  onClose: () => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ player, onClose }) => {
  const { calculator } = useStatsContext();

  const getStatColor = (statName: string, value: number) => {
    if (!calculator) {
      // Fallback to simple thresholds if calculator not available
      if (value >= 85) return '#4CAF50';
      if (value >= 70) return '#FFC107';
      return '#FF5722';
    }

    // Map display names to actual stat properties
    const statMap: { [key: string]: string } = {
      'Acceleration': 'acceleration',
      'Agility': 'agility',
      'Balance': 'balance',
      'Endurance': 'endurance',
      'Speed': 'speed',
      'Slap Shot Accuracy': 'slap_shot_accuracy',
      'Slap Shot Power': 'slap_shot_power',
      'Wrist Shot Accuracy': 'wrist_shot_accuracy',
      'Wrist Shot Power': 'wrist_shot_power',
      'Deking': 'deking',
      'Hand Eye': 'hand_eye',
      'Passing': 'passing',
      'Puck Control': 'puck_control',
      'Offensive Awareness': 'off_awareness',
      'Defensive Awareness': 'def_awareness',
      'Body Checking': 'body_checking',
      'Strength': 'strength',
      'Aggression': 'aggression',
      'Durability': 'durability',
      'Fighting Skill': 'fighting_skill',
      'Shot Blocking': 'shot_blocking',
      'Stick Checking': 'stick_checking',
      'Faceoffs': 'faceoffs',
      'Discipline': 'discipline',
      // Goalie stats
      'Glove High': 'glove_high',
      'Glove Low': 'glove_low',
      'Stick High': 'stick_high',
      'Stick Low': 'stick_low',
      'Five Hole': 'five_hole',
      'Breakaway': 'breakaway',
      'Quickness': 'quickness',
      'Positioning': 'positioning',
      'Poke Check': 'poke_check',
      'Shot Recovery': 'shot_recovery',
      'Rebound Control': 'rebound_control',
      'Vision': 'vision'
    };

    const actualStatName = statMap[statName];
    if (!actualStatName) return '#FFC107'; // Default to average if stat not found

    return calculator.getStatColor(player.position, actualStatName, value);
  };

  const StatBar = ({ label, value }: { label: string; value: string }) => {
    const numValue = parseInt(value) || 0;
    const color = getStatColor(label, numValue);

    return (
      <div className="stat-bar">
        <div className="stat-label">{label}</div>
        <div className="stat-value-container">
          <div className="stat-bar-bg">
            <div
              className="stat-bar-fill"
              style={{
                width: `${numValue}%`,
                '--stat-color': color,
                background: color
              } as React.CSSProperties}
            />
          </div>
          <div className="stat-value">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-body">
          <div className="modal-left-side">
            <div className="player-header">
              <h2>{player.full_name}</h2>
              <div className="player-badges">
                <span className="badge overall">{player.overall} OVR</span>
                <span className="badge position">{player.position}</span>
                <span className="badge card-type">{player.card}</span>
              </div>
            </div>

            {player.cardImage && (
              <div className="card-image-large">
                <img
                  src={player.cardImage}
                  alt={`${player.full_name} card`}
                  className="player-card-image-large"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="player-details">
              <div className="detail-item">
                <span className="detail-label">Team</span>
                <span className="detail-value">{player.team}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">League</span>
                <span className="detail-value">{player.league}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nationality</span>
                <span className="detail-value">{player.nationality}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Height</span>
                <span className="detail-value">{formatHeight(player.height)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Weight</span>
                <span className="detail-value">{formatWeight(player.weight)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Handedness</span>
                <span className="detail-value">{player.hand}</span>
              </div>
            </div>
          </div>

          <div className="modal-right-side">
            <div className="stats-sections">
          {player.position === 'G' ? (
            <>
              <div className="stats-section">
                <h3>Glove</h3>
                <StatBar label="Glove High" value={player.glove_high || '0'} />
                <StatBar label="Glove Low" value={player.glove_low || '0'} />
              </div>

              <div className="stats-section">
                <h3>Stick</h3>
                <StatBar label="Stick High" value={player.stick_high || '0'} />
                <StatBar label="Stick Low" value={player.stick_low || '0'} />
              </div>

              <div className="stats-section">
                <h3>Positioning</h3>
                <StatBar label="Five Hole" value={player.five_hole || '0'} />
                <StatBar label="Breakaway" value={player.breakaway || '0'} />
                <StatBar label="Positioning" value={player.positioning || '0'} />
                <StatBar label="Quickness" value={player.quickness || '0'} />
              </div>

              <div className="stats-section">
                <h3>Recovery</h3>
                <StatBar label="Shot Recovery" value={player.shot_recovery || '0'} />
                <StatBar label="Rebound Control" value={player.rebound_control || '0'} />
                <StatBar label="Puck Control" value={player.puck_control || '0'} />
                <StatBar label="Passing" value={player.passing || '0'} />
              </div>

              <div className="stats-section">
                <h3>Athleticism</h3>
                <StatBar label="Agility" value={player.agility || '0'} />
                <StatBar label="Speed" value={player.speed || '0'} />
                <StatBar label="Endurance" value={player.endurance || '0'} />
                <StatBar label="Balance" value={player.balance || '0'} />
              </div>

              <div className="stats-section">
                <h3>Other</h3>
                <StatBar label="Vision" value={player.vision || '0'} />
                <StatBar label="Hand Eye" value={player.hand_eye || '0'} />
                <StatBar label="Poke Check" value={player.poke_check || '0'} />
                <StatBar label="Aggression" value={player.aggression || '0'} />
              </div>
            </>
          ) : (
            <>
              <div className="stats-section">
                <h3>Skating</h3>
                <StatBar label="Acceleration" value={player.acceleration || '0'} />
                <StatBar label="Agility" value={player.agility || '0'} />
                <StatBar label="Balance" value={player.balance || '0'} />
                <StatBar label="Endurance" value={player.endurance || '0'} />
                <StatBar label="Speed" value={player.speed || '0'} />
              </div>

              <div className="stats-section">
                <h3>Shooting</h3>
                <StatBar label="Slap Shot Accuracy" value={player.slap_shot_accuracy || '0'} />
                <StatBar label="Slap Shot Power" value={player.slap_shot_power || '0'} />
                <StatBar label="Wrist Shot Accuracy" value={player.wrist_shot_accuracy || '0'} />
                <StatBar label="Wrist Shot Power" value={player.wrist_shot_power || '0'} />
              </div>

              <div className="stats-section">
                <h3>Hands</h3>
                <StatBar label="Deking" value={player.deking || '0'} />
                <StatBar label="Hand Eye" value={player.hand_eye || '0'} />
                <StatBar label="Passing" value={player.passing || '0'} />
                <StatBar label="Puck Control" value={player.puck_control || '0'} />
                <StatBar label="Offensive Awareness" value={player.off_awareness || '0'} />
              </div>

              <div className="stats-section">
                <h3>Defense</h3>
                <StatBar label="Defensive Awareness" value={player.def_awareness || '0'} />
                <StatBar label="Shot Blocking" value={player.shot_blocking || '0'} />
                <StatBar label="Stick Checking" value={player.stick_checking || '0'} />
                {player.faceoffs && player.faceoffs !== '0' && <StatBar label="Faceoffs" value={player.faceoffs} />}
              </div>

              <div className="stats-section">
                <h3>Physical</h3>
                <StatBar label="Body Checking" value={player.body_checking || '0'} />
                <StatBar label="Strength" value={player.strength || '0'} />
                <StatBar label="Aggression" value={player.aggression || '0'} />
                <StatBar label="Durability" value={player.durability || '0'} />
                <StatBar label="Fighting Skill" value={player.fighting_skill || '0'} />
                <StatBar label="Discipline" value={player.discipline || '0'} />
              </div>
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;