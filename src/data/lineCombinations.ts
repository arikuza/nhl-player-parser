export interface LineCombination {
  id: string;
  type: 'forward' | 'defense';
  boost: string;
  teams: string[];
  overallBonus?: string;
  status?: string;
}

export const lineCombinations: LineCombination[] = [
  // FORWARD COMBINATIONS - SALARY BOOST
  {
    id: 'f1',
    type: 'forward',
    boost: '+2.0M SAL',
    teams: ['CZE', 'LAK', 'SWE']
  },
  {
    id: 'f2',
    type: 'forward',
    boost: '+1.0M SAL',
    teams: ['BOS', 'VGK', 'TOR']
  },
  {
    id: 'f3',
    type: 'forward',
    boost: '+1.0M SAL',
    teams: ['MTL', 'COL', 'TB']
  },
  {
    id: 'f4',
    type: 'forward',
    boost: '+1.0M SAL',
    teams: ['RUS', 'PIT', 'CAR']
  },
  {
    id: 'f5',
    type: 'forward',
    boost: '+1.0M SAL',
    teams: ['SWE', 'SWE', 'SWE']
  },
  {
    id: 'f6',
    type: 'forward',
    boost: '+1.0M SAL',
    teams: ['FIN', 'FIN', 'FIN']
  },

  // FORWARD COMBINATIONS - OVR BOOST
  {
    id: 'f7',
    type: 'forward',
    boost: '2 OVR',
    teams: ['ANA', 'ANA', 'ANA']
  },
  {
    id: 'f8',
    type: 'forward',
    boost: '2 OVR',
    teams: ['FIN', 'FIN', 'FIN']
  },
  {
    id: 'f9',
    type: 'forward',
    boost: '1 OVR',
    teams: ['SJS', 'PHI', 'TB']
  },
  {
    id: 'f10',
    type: 'forward',
    boost: '1 OVR',
    teams: ['NYR', 'USA', 'NYR']
  },
  {
    id: 'f11',
    type: 'forward',
    boost: '1 OVR',
    teams: ['CAN', 'GER', 'EDM']
  },
  {
    id: 'f12',
    type: 'forward',
    boost: '1 OVR',
    teams: ['CAN', 'SWE', 'WSH']
  },

  // FORWARD COMBINATIONS - AP BOOST
  {
    id: 'f13',
    type: 'forward',
    boost: '5 AP',
    teams: ['NYR', 'MTL', 'TOR']
  },
  {
    id: 'f14',
    type: 'forward',
    boost: '5 AP',
    teams: ['PIT', 'PIT', 'ANA']
  },
  {
    id: 'f15',
    type: 'forward',
    boost: '5 AP',
    teams: ['SJS', 'VAN', 'SEA']
  },
  {
    id: 'f16',
    type: 'forward',
    boost: '5 AP',
    teams: ['COL', 'NJD', 'NYI']
  },
  {
    id: 'f17',
    type: 'forward',
    boost: '3 AP',
    teams: ['CAN', 'CAN', 'CAN']
  },
  {
    id: 'f18',
    type: 'forward',
    boost: '3 AP',
    teams: ['USA', 'USA', 'USA']
  },

  // DEFENSE COMBINATIONS - SALARY BOOST
  {
    id: 'd1',
    type: 'defense',
    boost: '+3.0M SAL',
    teams: ['DAL', 'STL']
  },
  {
    id: 'd2',
    type: 'defense',
    boost: '+2.0M SAL',
    teams: ['EDM', 'USA']
  },
  {
    id: 'd3',
    type: 'defense',
    boost: '+1.0M SAL',
    teams: ['USA', 'TB']
  },
  {
    id: 'd4',
    type: 'defense',
    boost: '+1.0M SAL',
    teams: ['ANA', 'CAR']
  },
  {
    id: 'd5',
    type: 'defense',
    boost: '+1.0M SAL',
    teams: ['PHI', 'WSH']
  },

  // DEFENSE COMBINATIONS - OVR BOOST
  {
    id: 'd6',
    type: 'defense',
    boost: '2 OVR',
    teams: ['BOS', 'BOS']
  },
  {
    id: 'd7',
    type: 'defense',
    boost: '2 OVR',
    teams: ['CAN', 'MIN'],
    status: '+2'
  },
  {
    id: 'd8',
    type: 'defense',
    boost: '2 OVR',
    teams: ['SWE', 'DET'],
    status: '+2'
  },
  {
    id: 'd9',
    type: 'defense',
    boost: '1 OVR',
    teams: ['VAN', 'NJD']
  },
  {
    id: 'd10',
    type: 'defense',
    boost: '1 OVR',
    teams: ['USA', 'FLA'],
    status: '+2'
  },
  {
    id: 'd11',
    type: 'defense',
    boost: '1 OVR',
    teams: ['FIN', 'CAR']
  },

  // DEFENSE COMBINATIONS - AP BOOST
  {
    id: 'd12',
    type: 'defense',
    boost: '5 AP',
    teams: ['CGY', 'STL'],
    status: '+2'
  },
  {
    id: 'd13',
    type: 'defense',
    boost: '5 AP',
    teams: ['LAK', 'PIT']
  },
  {
    id: 'd14',
    type: 'defense',
    boost: '5 AP',
    teams: ['RUS', 'NYR']
  }
];