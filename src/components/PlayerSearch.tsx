import React, { useState, useEffect, useMemo } from 'react';
import PlayerModal from './PlayerModal';
import { heightToCm, weightToKg } from '../utils/conversions';
import './PlayerSearch.css';

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

interface PlayerSearchProps {
  players: PlayerStats[];
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({ players }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedCard, setSelectedCard] = useState('all');
  const [minOverall, setMinOverall] = useState('');
  const [maxOverall, setMaxOverall] = useState('');
  const [sortBy, setSortBy] = useState('overall');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 50;

  // Extract unique values for filters
  const positions = useMemo(() => {
    const uniquePositions = Array.from(new Set(players.map(p => p.position))).sort();
    return uniquePositions;
  }, [players]);

  const teams = useMemo(() => {
    const uniqueTeams = Array.from(new Set(players.map(p => p.team))).sort();
    return uniqueTeams;
  }, [players]);

  const cardTypes = useMemo(() => {
    const uniqueCards = Array.from(new Set(players.map(p => p.card))).sort();
    return uniqueCards;
  }, [players]);

  // Helper function to parse height and weight
  const parseHeight = (height: string): number => {
    // Format: "6' 0""
    const match = height.match(/(\d+)'\s*(\d+)"/);
    if (match) {
      return parseInt(match[1]) * 12 + parseInt(match[2]);
    }
    return 0;
  };

  const parseWeight = (weight: string): number => {
    // Format: "191 lb"
    const match = weight.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Calculate group stats
  const calculateGroupStats = (player: PlayerStats) => {
    // For goalies, calculate group averages as requested
    if (player.position === 'G') {
      // High group: average of glove_high and stick_high
      const high = Math.round(
        (parseInt(player.glove_high || '0') + parseInt(player.stick_high || '0')) / 2
      );

      // Low group: average of glove_low and stick_low
      const low = Math.round(
        (parseInt(player.glove_low || '0') + parseInt(player.stick_low || '0')) / 2
      );

      // Quick group: average of quickness and shot_recovery
      const quick = Math.round(
        (parseInt(player.quickness || '0') + parseInt(player.shot_recovery || '0')) / 2
      );

      // Positioning group: average of positioning, five_hole, and breakaway
      const positioning = Math.round(
        (parseInt(player.positioning || '0') +
         parseInt(player.five_hole || '0') +
         parseInt(player.breakaway || '0')) / 3
      );

      // Rebound group: average of rebound_control and poke_check
      const rebound = Math.round(
        (parseInt(player.rebound_control || '0') + parseInt(player.poke_check || '0')) / 2
      );

      return { high, low, quick, positioning, rebound };
    }

    // For skaters
    // Skating: movement stats
    const skating = Math.round(
      (parseInt(player.acceleration || '0') +
       parseInt(player.agility || '0') +
       parseInt(player.balance || '0') +
       parseInt(player.speed || '0') +
       parseInt(player.endurance || '0')) / 5
    );

    // Shooting: shooting stats
    const shooting = Math.round(
      (parseInt(player.slap_shot_accuracy || '0') +
       parseInt(player.slap_shot_power || '0') +
       parseInt(player.wrist_shot_accuracy || '0') +
       parseInt(player.wrist_shot_power || '0')) / 4
    );

    // Handling: puck skills (deking, hand-eye, passing, puck control)
    const handling = Math.round(
      (parseInt(player.deking || '0') +
       parseInt(player.hand_eye || '0') +
       parseInt(player.passing || '0') +
       parseInt(player.puck_control || '0')) / 4
    );

    // Checking: physical checking stats
    const checking = Math.round(
      (parseInt(player.body_checking || '0') +
       parseInt(player.strength || '0') +
       parseInt(player.aggression || '0') +
       parseInt(player.fighting_skill || '0')) / 4
    );

    // Defence: defensive stats
    const defence = Math.round(
      (parseInt(player.def_awareness || '0') +
       parseInt(player.shot_blocking || '0') +
       parseInt(player.stick_checking || '0') +
       parseInt(player.discipline || '0')) / 4
    );

    return { skating, shooting, handling, checking, defence };
  };

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    let filtered = players.filter(player => {
      const matchesSearch = !searchTerm ||
                           player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.team.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
      const matchesTeam = selectedTeam === 'all' || player.team === selectedTeam;
      const matchesCard = selectedCard === 'all' || player.card === selectedCard;
      const matchesMinOverall = !minOverall || parseInt(player.overall) >= parseInt(minOverall);
      const matchesMaxOverall = !maxOverall || parseInt(player.overall) <= parseInt(maxOverall);

      return matchesSearch && matchesPosition && matchesTeam && matchesCard &&
             matchesMinOverall && matchesMaxOverall;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Special handling for height and weight
      if (sortBy === 'height') {
        aValue = parseHeight(a.height);
        bValue = parseHeight(b.height);
      } else if (sortBy === 'weight') {
        aValue = parseWeight(a.weight);
        bValue = parseWeight(b.weight);
      } else if (sortBy === 'skating') {
        aValue = calculateGroupStats(a).skating;
        bValue = calculateGroupStats(b).skating;
      } else if (sortBy === 'shooting') {
        aValue = calculateGroupStats(a).shooting;
        bValue = calculateGroupStats(b).shooting;
      } else if (sortBy === 'handling') {
        aValue = calculateGroupStats(a).handling;
        bValue = calculateGroupStats(b).handling;
      } else if (sortBy === 'checking') {
        aValue = calculateGroupStats(a).checking;
        bValue = calculateGroupStats(b).checking;
      } else if (sortBy === 'defence') {
        aValue = calculateGroupStats(a).defence;
        bValue = calculateGroupStats(b).defence;
      } else if (sortBy === 'high') {
        aValue = calculateGroupStats(a).high || 0;
        bValue = calculateGroupStats(b).high || 0;
      } else if (sortBy === 'low') {
        aValue = calculateGroupStats(a).low || 0;
        bValue = calculateGroupStats(b).low || 0;
      } else if (sortBy === 'quick') {
        aValue = calculateGroupStats(a).quick || 0;
        bValue = calculateGroupStats(b).quick || 0;
      } else if (sortBy === 'positioning') {
        aValue = calculateGroupStats(a).positioning || 0;
        bValue = calculateGroupStats(b).positioning || 0;
      } else if (sortBy === 'rebound') {
        aValue = calculateGroupStats(a).rebound || 0;
        bValue = calculateGroupStats(b).rebound || 0;
      } else {
        aValue = a[sortBy as keyof PlayerStats];
        bValue = b[sortBy as keyof PlayerStats];

        // Convert to numbers if numeric field
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [players, searchTerm, selectedPosition, selectedTeam, selectedCard, minOverall, maxOverall, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPosition, selectedTeam, selectedCard, minOverall, maxOverall]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPosition('all');
    setSelectedTeam('all');
    setSelectedCard('all');
    setMinOverall('');
    setMaxOverall('');
    setSortBy('overall');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="player-search">
      <div className="search-header">
        <h2>Player Search & Filter</h2>
        <p className="result-count">Found {filteredPlayers.length} players</p>
      </div>

      <div className="filters-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Search Name/Team</label>
            <input
              type="text"
              placeholder="Enter player name or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Position</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Card Type</label>
            <select
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Cards</option>
              {cardTypes.map(card => (
                <option key={card} value={card}>{card}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Min Overall</label>
            <input
              type="number"
              placeholder="Min"
              value={minOverall}
              onChange={(e) => setMinOverall(e.target.value)}
              className="overall-input"
              min="0"
              max="99"
            />
          </div>

          <div className="filter-group">
            <label>Max Overall</label>
            <input
              type="number"
              placeholder="Max"
              value={maxOverall}
              onChange={(e) => setMaxOverall(e.target.value)}
              className="overall-input"
              min="0"
              max="99"
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="overall">Overall</option>
              <option value="full_name">Name</option>
              <option value="team">Team</option>
              <option value="position">Position</option>
              <option value="height">Height</option>
              <option value="weight">Weight</option>
              <option value="skating">Skating</option>
              <option value="shooting">Shooting</option>
              <option value="handling">Handling</option>
              <option value="checking">Checking</option>
              <option value="defence">Defence</option>
            </select>
          </div>

          <button onClick={resetFilters} className="reset-button">
            Reset Filters
          </button>
        </div>
      </div>

      <div className="players-table-container">
        <table className="players-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('full_name')} className="sortable">
                Name {sortBy === 'full_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('position')} className="sortable">
                Pos {sortBy === 'position' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('team')} className="sortable">
                Team {sortBy === 'team' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('overall')} className="sortable">
                OVR {sortBy === 'overall' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('card')} className="sortable">
                Card {sortBy === 'card' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('height')} className="sortable">
                Height {sortBy === 'height' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('weight')} className="sortable">
                Weight {sortBy === 'weight' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              {selectedPosition === 'G' ? (
                <>
                  <th onClick={() => handleSort('high')} className="sortable">
                    HIGH {sortBy === 'high' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('low')} className="sortable">
                    LOW {sortBy === 'low' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('quick')} className="sortable">
                    QCK {sortBy === 'quick' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('positioning')} className="sortable">
                    POS {sortBy === 'positioning' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('rebound')} className="sortable">
                    REB {sortBy === 'rebound' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </>
              ) : (
                <>
                  <th onClick={() => handleSort('skating')} className="sortable">
                    SKT {sortBy === 'skating' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('shooting')} className="sortable">
                    SHT {sortBy === 'shooting' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('handling')} className="sortable">
                    HND {sortBy === 'handling' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('checking')} className="sortable">
                    CHK {sortBy === 'checking' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('defence')} className="sortable">
                    DEF {sortBy === 'defence' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedPlayers.map(player => {
              const stats = calculateGroupStats(player);
              return (
                <tr
                  key={`${player.id}-${player.full_name}-${player.position}`}
                  onClick={() => setSelectedPlayer(player)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="player-name">{player.full_name}</td>
                  <td className="position-cell">{player.position}</td>
                  <td>{player.team}</td>
                  <td className="overall-cell">{player.overall}</td>
                  <td className="card-cell">{player.card}</td>
                  <td title={`${heightToCm(player.height)} cm`}>{player.height}</td>
                  <td title={`${weightToKg(player.weight)} kg`}>{player.weight}</td>
                  {selectedPosition === 'G' ? (
                    // When viewing only goalies, show goalie stats
                    <>
                      <td className="stat-cell">{stats.high}</td>
                      <td className="stat-cell">{stats.low}</td>
                      <td className="stat-cell">{stats.quick}</td>
                      <td className="stat-cell">{stats.positioning}</td>
                      <td className="stat-cell">{stats.rebound}</td>
                    </>
                  ) : (
                    // When viewing all or skaters, show skater stats (dashes for goalies)
                    player.position === 'G' ? (
                      <>
                        <td className="stat-cell">-</td>
                        <td className="stat-cell">-</td>
                        <td className="stat-cell">-</td>
                        <td className="stat-cell">-</td>
                        <td className="stat-cell">-</td>
                      </>
                    ) : (
                      <>
                        <td className="stat-cell">{stats.skating}</td>
                        <td className="stat-cell">{stats.shooting}</td>
                        <td className="stat-cell">{stats.handling}</td>
                        <td className="stat-cell">{stats.checking}</td>
                        <td className="stat-cell">{stats.defence}</td>
                      </>
                    )
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="page-button"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-button"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Last
          </button>
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};

export default PlayerSearch;