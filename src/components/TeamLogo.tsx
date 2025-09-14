import React from 'react';
import './TeamLogo.css';

interface TeamLogoProps {
  team: string;
  size?: 'small' | 'medium' | 'large';
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team, size = 'medium' }) => {
  // NHL team colors and styling
  const teamStyles: { [key: string]: { bg: string; color: string; border?: string } } = {
    // Atlantic Division
    'BOS': { bg: '#FFB81C', color: '#000' },
    'BUF': { bg: '#002654', color: '#FCB514' },
    'DET': { bg: '#CE1126', color: '#FFF' },
    'FLA': { bg: '#041E42', color: '#C8102E' },
    'MTL': { bg: '#AF1E2D', color: '#FFF' },
    'OTT': { bg: '#E31837', color: '#000' },
    'TBL': { bg: '#002868', color: '#FFF' },
    'TB': { bg: '#002868', color: '#FFF' },
    'TOR': { bg: '#00205B', color: '#FFF' },

    // Metropolitan Division
    'CAR': { bg: '#CC0000', color: '#FFF' },
    'CBJ': { bg: '#002654', color: '#CE1126' },
    'NJD': { bg: '#CE1126', color: '#FFF' },
    'NYI': { bg: '#00539B', color: '#F47D30' },
    'NYR': { bg: '#0038A8', color: '#CE1126' },
    'PHI': { bg: '#F74902', color: '#000' },
    'PIT': { bg: '#000000', color: '#FCB514' },
    'WSH': { bg: '#041E42', color: '#C8102E' },

    // Central Division
    'ARI': { bg: '#8C2633', color: '#E2D6B5' },
    'CHI': { bg: '#CF0A2C', color: '#FFF' },
    'COL': { bg: '#6F263D', color: '#236192' },
    'DAL': { bg: '#006847', color: '#FFF' },
    'MIN': { bg: '#A6192E', color: '#154734' },
    'NSH': { bg: '#FFB81C', color: '#041E42' },
    'STL': { bg: '#002F87', color: '#FCB514' },
    'WPG': { bg: '#041E42', color: '#FFF' },

    // Pacific Division
    'ANA': { bg: '#F47A38', color: '#000' },
    'CGY': { bg: '#C8102E', color: '#F1BE48' },
    'EDM': { bg: '#041E42', color: '#FF4C00' },
    'LAK': { bg: '#111111', color: '#A2AAAD' },
    'LA': { bg: '#111111', color: '#A2AAAD' },
    'SJS': { bg: '#006D75', color: '#FFF' },
    'SJ': { bg: '#006D75', color: '#FFF' },
    'SEA': { bg: '#001628', color: '#99D9D9' },
    'VAN': { bg: '#00205B', color: '#00843D' },
    'VGK': { bg: '#B4975A', color: '#333F42' },

    // Countries
    'CAN': { bg: '#FF0000', color: '#FFF' },
    'USA': { bg: '#002868', color: '#FFF' },
    'RUS': { bg: '#0039A6', color: '#FFF' },
    'FIN': { bg: '#003580', color: '#FFF' },
    'SWE': { bg: '#006AA7', color: '#FECC00' },
    'CZE': { bg: '#11457E', color: '#D7141A' },
    'SVK': { bg: '#0B4EA2', color: '#FFF' },
    'GER': { bg: '#000000', color: '#FFCC00' },
    'SUI': { bg: '#FF0000', color: '#FFF' },
    'LAT': { bg: '#9E1B34', color: '#FFF' },
    'DEN': { bg: '#C60C30', color: '#FFF' },
    'NOR': { bg: '#BA0C2F', color: '#FFF' },

    // Default
    'DEFAULT': { bg: '#333', color: '#FFF' }
  };

  const style = teamStyles[team] || teamStyles['DEFAULT'];

  // Country flags
  const countryFlags: { [key: string]: string } = {
    'CAN': '🇨🇦',
    'USA': '🇺🇸',
    'RUS': '🇷🇺',
    'FIN': '🇫🇮',
    'SWE': '🇸🇪',
    'CZE': '🇨🇿',
    'SVK': '🇸🇰',
    'GER': '🇩🇪',
    'SUI': '🇨🇭',
    'LAT': '🇱🇻',
    'DEN': '🇩🇰',
    'NOR': '🇳🇴'
  };

  const isCountry = countryFlags[team] !== undefined;

  return (
    <div
      className={`team-logo team-logo-${size}`}
      style={{
        background: isCountry ? 'transparent' : style.bg,
        color: style.color,
        borderColor: style.border || style.bg
      }}
    >
      {isCountry ? (
        <span className="country-flag">{countryFlags[team]}</span>
      ) : (
        <span className="team-abbr">{team}</span>
      )}
    </div>
  );
};

export default TeamLogo;