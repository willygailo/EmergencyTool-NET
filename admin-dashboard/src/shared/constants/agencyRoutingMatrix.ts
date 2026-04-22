export const AGENCY_ROUTING_MATRIX = {
  fire: ['BFP', 'PNP', 'MDRRMO'],
  medical: ['RHU', 'PNP', 'MDRRMO'],
  crime: ['PNP', 'MDRRMO'],
  disaster: ['MDRRMO', 'BFP', 'PNP', 'RHU'],
  other: ['PNP', 'MDRRMO'],
} as const;

export const AGENCIES = [
  { id: 'BFP', name: 'Bureau of Fire Protection', phone: '911' },
  { id: 'PNP', name: 'Philippine National Police', phone: '911' },
  { id: 'MDRRMO', name: 'Municipal Disaster Risk Reduction Management Office', phone: '911' },
  { id: 'RHU', name: 'Rural Health Unit', phone: '911' },
] as const;