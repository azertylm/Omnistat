import { Entity } from '../types/omnistats';

export const CORE_ENTITIES: Record<string, Entity> = {
  // === CLUBS FOOTBALL ===
  real_madrid: { id: 'real_madrid', name: 'Real Madrid', short: 'RMA', type: 'club', countryCode: 'ES', flag: '🇪🇸', c1: '#E2E8F0', c2: '#F59E0B', sport: 'football' },
  fc_barcelona: { id: 'fc_barcelona', name: 'FC Barcelone', short: 'FCB', type: 'club', countryCode: 'ES', flag: '🇪🇸', c1: '#004D98', c2: '#A50044', sport: 'football' },
  bayern: { id: 'bayern', name: 'Bayern Munich', short: 'BAY', type: 'club', countryCode: 'DE', flag: '🇩🇪', c1: '#DC052D', c2: '#0066B2', sport: 'football' },
  man_city: { id: 'man_city', name: 'Manchester City', short: 'MCI', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#6CABDD', c2: '#1C2C5B', sport: 'football' },
  liverpool: { id: 'liverpool', name: 'Liverpool FC', short: 'LIV', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#C8102E', c2: '#00B2A9', sport: 'football' },
  ac_milan: { id: 'ac_milan', name: 'AC Milan', short: 'MIL', type: 'club', countryCode: 'IT', flag: '🇮🇹', c1: '#FB090B', c2: '#111827', sport: 'football' },
  psg: { id: 'psg', name: 'Paris Saint-Germain', short: 'PSG', type: 'club', countryCode: 'FR', flag: '🇫🇷', c1: '#004170', c2: '#DA291C', sport: 'football' },
  inter: { id: 'inter', name: 'Inter Milan', short: 'INT', type: 'club', countryCode: 'IT', flag: '🇮🇹', c1: '#010E80', c2: '#111827', sport: 'football' },
  chelsea: { id: 'chelsea', name: 'Chelsea FC', short: 'CHE', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#034694', c2: '#3B82F6', sport: 'football' },
  arsenal: { id: 'arsenal', name: 'Arsenal FC', short: 'ARS', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#EF0107', c2: '#9C824A', sport: 'football' },
  man_utd: { id: 'man_utd', name: 'Manchester United', short: 'MUN', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#DA291C', c2: '#FBE122', sport: 'football' },
  juventus: { id: 'juventus', name: 'Juventus', short: 'JUV', type: 'club', countryCode: 'IT', flag: '🇮🇹', c1: '#1E293B', c2: '#94A3B8', sport: 'football' },
  ajax: { id: 'ajax', name: 'Ajax Amsterdam', short: 'AJA', type: 'club', countryCode: 'NL', flag: '🇳🇱', c1: '#D2122E', c2: '#F8FAFC', sport: 'football' },

  // === CLUBS BASKETBALL ===
  celtics: { id: 'celtics', name: 'Boston Celtics', short: 'BOS', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#007A33', c2: '#BA9653', sport: 'basketball' },
  lakers: { id: 'lakers', name: 'LA Lakers', short: 'LAL', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#552583', c2: '#FDB927', sport: 'basketball' },
  warriors: { id: 'warriors', name: 'Golden State Warriors', short: 'GSW', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#1D428A', c2: '#FFC72C', sport: 'basketball' },
  bulls: { id: 'bulls', name: 'Chicago Bulls', short: 'CHI', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#CE1141', c2: '#111827', sport: 'basketball' },
  spurs: { id: 'spurs', name: 'San Antonio Spurs', short: 'SAS', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#475569', c2: '#CBD5E1', sport: 'basketball' },
  heat: { id: 'heat', name: 'Miami Heat', short: 'MIA', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#98002E', c2: '#F9A01B', sport: 'basketball' },
  nuggets: { id: 'nuggets', name: 'Denver Nuggets', short: 'DEN', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#0E2240', c2: '#FEC524', sport: 'basketball' },
  knicks: { id: 'knicks', name: 'New York Knicks', short: 'NYK', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#006BB6', c2: '#F58426', sport: 'basketball' },
  thunder: { id: 'thunder', name: 'OKC Thunder', short: 'OKC', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#007AC1', c2: '#EF3B24', sport: 'basketball' },
  real_basket: { id: 'real_basket', name: 'Real Madrid Basket', short: 'RMB', type: 'club', countryCode: 'ES', flag: '🇪🇸', c1: '#3B82F6', c2: '#F59E0B', sport: 'basketball' },
  olympiacos: { id: 'olympiacos', name: 'Olympiakos BC', short: 'OLY', type: 'club', countryCode: 'GR', flag: '🇬🇷', c1: '#DC2626', c2: '#991B1B', sport: 'basketball' },
  panathinaikos: { id: 'panathinaikos', name: 'Panathinaikos BC', short: 'PAO', type: 'club', countryCode: 'GR', flag: '🇬🇷', c1: '#15803D', c2: '#166534', sport: 'basketball' },

  // === ÉCURIES FORMULE 1 ===
  ferrari: { id: 'ferrari', name: 'Scuderia Ferrari', short: 'FER', type: 'club', countryCode: 'IT', flag: '🇮🇹', c1: '#DC0000', c2: '#FACC15', sport: 'f1' },
  mercedes: { id: 'mercedes', name: 'Mercedes-AMG F1', short: 'MER', type: 'club', countryCode: 'DE', flag: '🇩🇪', c1: '#00D2BE', c2: '#1E293B', sport: 'f1' },
  red_bull: { id: 'red_bull', name: 'Red Bull Racing', short: 'RBR', type: 'club', countryCode: 'AT', flag: '🇦🇹', c1: '#1E41FF', c2: '#FCD700', sport: 'f1' },
  mclaren: { id: 'mclaren', name: 'McLaren F1', short: 'MCL', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#FF8000', c2: '#111827', sport: 'f1' },
  williams: { id: 'williams', name: 'Williams Racing', short: 'WIL', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#005AFF', c2: '#0284C7', sport: 'f1' },
  alpine_f1: { id: 'alpine_f1', name: 'Renault / Alpine F1', short: 'ALP', type: 'club', countryCode: 'FR', flag: '🇫🇷', c1: '#0090FF', c2: '#FCD34D', sport: 'f1' },
  lotus: { id: 'lotus', name: 'Team Lotus', short: 'LOT', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#065F46', c2: '#F59E0B', sport: 'f1' },

  // === CLUBS RUGBY ===
  toulouse: { id: 'toulouse', name: 'Stade Toulousain', short: 'ST', type: 'club', countryCode: 'FR', flag: '🇫🇷', c1: '#D90429', c2: '#111827', sport: 'rugby' },
  leinster: { id: 'leinster', name: 'Leinster Rugby', short: 'LEI', type: 'club', countryCode: 'IE', flag: '🇮🇪', c1: '#00338D', c2: '#F59E0B', sport: 'rugby' },
  larochelle: { id: 'larochelle', name: 'Stade Rochelais', short: 'SR', type: 'club', countryCode: 'FR', flag: '🇫🇷', c1: '#EAB308', c2: '#111827', sport: 'rugby' },
  ubb: { id: 'ubb', name: 'Union Bordeaux Bègles', short: 'UBB', type: 'club', countryCode: 'FR', flag: '🇫🇷', c1: '#7F1D1D', c2: '#9F1239', sport: 'rugby' },
  crusaders: { id: 'crusaders', name: 'Crusaders', short: 'CRU', type: 'club', countryCode: 'NZ', flag: '🇳🇿', c1: '#CC0000', c2: '#111827', sport: 'rugby' },

  // === CLUBS HANDBALL ===
  barca_hand: { id: 'barca_hand', name: 'FC Barcelone Handball', short: 'BHB', type: 'club', countryCode: 'ES', flag: '🇪🇸', c1: '#004D98', c2: '#A50044', sport: 'handball' },
  psg_hand: { id: 'psg_hand', name: 'PSG Handball', short: 'PHB', type: 'club', countryCode: 'FR', flag: '🇫🇷', c1: '#004170', c2: '#DA291C', sport: 'handball' },
  kiel: { id: 'kiel', name: 'THW Kiel', short: 'THW', type: 'club', countryCode: 'DE', flag: '🇩🇪', c1: '#334155', c2: '#94A3B8', sport: 'handball' },
  magdeburg: { id: 'magdeburg', name: 'SC Magdebourg', short: 'SCM', type: 'club', countryCode: 'DE', flag: '🇩🇪', c1: '#15803D', c2: '#EF4444', sport: 'handball' },

  // === ÉQUIPES CYCLISME ===
  uae_cycling: { id: 'uae_cycling', name: 'UAE Team Emirates', short: 'UAE', type: 'club', countryCode: 'AE', flag: '🇦🇪', c1: '#DC2626', c2: '#111827', sport: 'cycling' },
  visma: { id: 'visma', name: 'Visma-Lease a Bike', short: 'TVL', type: 'club', countryCode: 'NL', flag: '🇳🇱', c1: '#EAB308', c2: '#1E293B', sport: 'cycling' },
  ineos: { id: 'ineos', name: 'Ineos Grenadiers', short: 'IGD', type: 'club', countryCode: 'GB', flag: '🇬🇧', c1: '#E11D48', c2: '#1E293B', sport: 'cycling' },
  quickstep: { id: 'quickstep', name: 'Soudal Quick-Step', short: 'SOQ', type: 'club', countryCode: 'BE', flag: '🇧🇪', c1: '#2563EB', c2: '#1E40AF', sport: 'cycling' },

  // === FRANCHISES HOCKEY (NHL) ===
  montreal_canadiens: { id: 'montreal_canadiens', name: 'Canadiens de Montréal', short: 'MTL', type: 'club', countryCode: 'CA', flag: '🇨🇦', c1: '#AF1E2D', c2: '#192168', sport: 'hockey' },
  edmonton_oilers: { id: 'edmonton_oilers', name: 'Edmonton Oilers', short: 'EDM', type: 'club', countryCode: 'CA', flag: '🇨🇦', c1: '#041E42', c2: '#FF4C00', sport: 'hockey' },
  detroit_red_wings: { id: 'detroit_red_wings', name: 'Detroit Red Wings', short: 'DET', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#CE1126', c2: '#FFFFFF', sport: 'hockey' },
  pittsburgh_penguins: { id: 'pittsburgh_penguins', name: 'Pittsburgh Penguins', short: 'PIT', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#111827', c2: '#FCB514', sport: 'hockey' },
  chicago_blackhawks: { id: 'chicago_blackhawks', name: 'Chicago Blackhawks', short: 'CHI', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#CF0A2C', c2: '#111827', sport: 'hockey' },
  tampa_bay_lightning: { id: 'tampa_bay_lightning', name: 'Tampa Bay Lightning', short: 'TBL', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#002868', c2: '#38BDF8', sport: 'hockey' },
  colorado_avalanche: { id: 'colorado_avalanche', name: 'Colorado Avalanche', short: 'COL', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#6F263D', c2: '#236192', sport: 'hockey' },
  florida_panthers: { id: 'florida_panthers', name: 'Florida Panthers', short: 'FLA', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#C8102E', c2: '#041E42', sport: 'hockey' },
  vegas_golden_knights: { id: 'vegas_golden_knights', name: 'Vegas Golden Knights', short: 'VGK', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#B4975A', c2: '#333F42', sport: 'hockey' },
  boston_bruins: { id: 'boston_bruins', name: 'Boston Bruins', short: 'BOS', type: 'club', countryCode: 'US', flag: '🇺🇸', c1: '#111827', c2: '#FFB81C', sport: 'hockey' },

  // === PAYS & NATIONS (OMNISPORTS) ===
  US: { id: 'US', name: 'États-Unis', short: 'USA', type: 'country', countryCode: 'US', flag: '🇺🇸', c1: '#1D4ED8', c2: '#DC2626', pop: 336 },
  FR: { id: 'FR', name: 'France', short: 'FRA', type: 'country', countryCode: 'FR', flag: '🇫🇷', c1: '#0055A4', c2: '#EF4135', pop: 68.4 },
  ES: { id: 'ES', name: 'Espagne', short: 'ESP', type: 'country', countryCode: 'ES', flag: '🇪🇸', c1: '#AA151B', c2: '#F1BF00', pop: 48.6 },
  GB: { id: 'GB', name: 'Grande-Bretagne', short: 'GBR', type: 'country', countryCode: 'GB', flag: '🇬🇧', c1: '#012169', c2: '#C8102E', pop: 67.9 },
  DE: { id: 'DE', name: 'Allemagne', short: 'GER', type: 'country', countryCode: 'DE', flag: '🇩🇪', c1: '#1E293B', c2: '#F59E0B', pop: 84.4 },
  IT: { id: 'IT', name: 'Italie', short: 'ITA', type: 'country', countryCode: 'IT', flag: '🇮🇹', c1: '#0066CC', c2: '#009246', pop: 58.9 },
  CN: { id: 'CN', name: 'Chine', short: 'CHN', type: 'country', countryCode: 'CN', flag: '🇨🇳', c1: '#DE2910', c2: '#FACC15', pop: 1410 },
  AR: { id: 'AR', name: 'Argentine', short: 'ARG', type: 'country', countryCode: 'AR', flag: '🇦🇷', c1: '#38BDF8', c2: '#0284C7', pop: 46.2 },
  BR: { id: 'BR', name: 'Brésil', short: 'BRA', type: 'country', countryCode: 'BR', flag: '🇧🇷', c1: '#009C3B', c2: '#FACC15', pop: 216 },
  AU: { id: 'AU', name: 'Australie', short: 'AUS', type: 'country', countryCode: 'AU', flag: '🇦🇺', c1: '#00843D', c2: '#FACC15', pop: 26.8 },
  JP: { id: 'JP', name: 'Japon', short: 'JPN', type: 'country', countryCode: 'JP', flag: '🇯🇵', c1: '#BC002D', c2: '#991B1B', pop: 124 },
  NL: { id: 'NL', name: 'Pays-Bas', short: 'NED', type: 'country', countryCode: 'NL', flag: '🇳🇱', c1: '#F97316', c2: '#2563EB', pop: 17.9 },
  NZ: { id: 'NZ', name: 'Nouvelle-Zélande', short: 'NZL', type: 'country', countryCode: 'NZ', flag: '🇳🇿', c1: '#1E293B', c2: '#64748B', pop: 5.2 },
  ZA: { id: 'ZA', name: 'Afrique du Sud', short: 'RSA', type: 'country', countryCode: 'ZA', flag: '🇿🇦', c1: '#007A4D', c2: '#F59E0B', pop: 60.4 },
  DK: { id: 'DK', name: 'Danemark', short: 'DEN', type: 'country', countryCode: 'DK', flag: '🇩🇰', c1: '#C8102E', c2: '#991B1B', pop: 5.95 },
  SI: { id: 'SI', name: 'Slovénie', short: 'SLO', type: 'country', countryCode: 'SI', flag: '🇸🇮', c1: '#005DA4', c2: '#10B981', pop: 2.12 },
  RS: { id: 'RS', name: 'Serbie', short: 'SRB', type: 'country', countryCode: 'RS', flag: '🇷🇸', c1: '#C6363C', c2: '#0C4076', pop: 6.65 },
  CH: { id: 'CH', name: 'Suisse', short: 'SUI', type: 'country', countryCode: 'CH', flag: '🇨🇭', c1: '#DC2626', c2: '#991B1B', pop: 8.9 },
  NO: { id: 'NO', name: 'Norvège', short: 'NOR', type: 'country', countryCode: 'NO', flag: '🇳🇴', c1: '#BA0C2F', c2: '#00205B', pop: 5.55 },
  BE: { id: 'BE', name: 'Belgique', short: 'BEL', type: 'country', countryCode: 'BE', flag: '🇧🇪', c1: '#1E293B', c2: '#EAB308', pop: 11.8 },
  IE: { id: 'IE', name: 'Irlande', short: 'IRL', type: 'country', countryCode: 'IE', flag: '🇮🇪', c1: '#169B62', c2: '#F97316', pop: 5.3 },
  SE: { id: 'SE', name: 'Suède', short: 'SWE', type: 'country', countryCode: 'SE', flag: '🇸🇪', c1: '#006AA7', c2: '#FECC00', pop: 10.5 },
  CA: { id: 'CA', name: 'Canada', short: 'CAN', type: 'country', countryCode: 'CA', flag: '🇨🇦', c1: '#D80621', c2: '#1E293B', pop: 40.1 },
};
