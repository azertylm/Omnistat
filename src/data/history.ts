import { AdvancedStats, EntityType, SpecificSportId, SportRecord } from '../types/omnistats';
import { CORE_ENTITIES } from './entities';

type CompactEntry = [
  number, // year
  SpecificSportId,
  string, // competition
  1 | 2 | 3, // tier
  EntityType,
  string[], // podium entityIds [1st, 2nd, 3rd, 4th?]
];

type OlympicEntry = [
  number, // year
  string, // edition
  Array<[string, number, number, number]>, // [countryCode, gold, silver, bronze]
];

const HISTORY_COMPACTS: CompactEntry[] = [
  // ====== FOOTBALL : LIGUE DES CHAMPIONS (1956–2026) ======
  [1956, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'ac_milan']],
  [1957, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'ac_milan', 'man_utd']],
  [1958, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'ac_milan', 'man_utd']],
  [1959, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'ac_milan']],
  [1960, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'fc_barcelona']],
  [1963, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan']],
  [1964, 'football', 'Ligue des Champions', 1, 'club', ['inter', 'real_madrid']],
  [1965, 'football', 'Ligue des Champions', 1, 'club', ['inter', 'liverpool']],
  [1966, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'inter', 'man_utd']],
  [1968, 'football', 'Ligue des Champions', 1, 'club', ['man_utd', 'real_madrid']],
  [1969, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan', 'ajax', 'man_utd']],
  [1971, 'football', 'Ligue des Champions', 1, 'club', ['ajax']],
  [1972, 'football', 'Ligue des Champions', 1, 'club', ['ajax', 'inter']],
  [1973, 'football', 'Ligue des Champions', 1, 'club', ['ajax', 'juventus', 'real_madrid']],
  [1974, 'football', 'Ligue des Champions', 1, 'club', ['bayern']],
  [1975, 'football', 'Ligue des Champions', 1, 'club', ['bayern', 'fc_barcelona']],
  [1976, 'football', 'Ligue des Champions', 1, 'club', ['bayern', 'real_madrid']],
  [1977, 'football', 'Ligue des Champions', 1, 'club', ['liverpool']],
  [1978, 'football', 'Ligue des Champions', 1, 'club', ['liverpool']],
  [1981, 'football', 'Ligue des Champions', 1, 'club', ['liverpool', 'real_madrid', 'bayern']],
  [1982, 'football', 'Ligue des Champions', 1, 'club', ['bayern']],
  [1983, 'football', 'Ligue des Champions', 1, 'club', ['juventus']],
  [1984, 'football', 'Ligue des Champions', 1, 'club', ['liverpool']],
  [1985, 'football', 'Ligue des Champions', 1, 'club', ['juventus', 'liverpool']],
  [1986, 'football', 'Ligue des Champions', 1, 'club', ['fc_barcelona']],
  [1987, 'football', 'Ligue des Champions', 1, 'club', ['bayern', 'real_madrid']],
  [1989, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan', 'real_madrid']],
  [1990, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan', 'bayern']],
  [1992, 'football', 'Ligue des Champions', 1, 'club', ['fc_barcelona']],
  [1993, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan']],
  [1994, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan', 'fc_barcelona']],
  [1995, 'football', 'Ligue des Champions', 1, 'club', ['ajax', 'ac_milan', 'bayern', 'psg']],
  [1996, 'football', 'Ligue des Champions', 1, 'club', ['juventus', 'ajax']],
  [1997, 'football', 'Ligue des Champions', 1, 'club', ['juventus', 'man_utd', 'ajax']],
  [1998, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'juventus']],
  [1999, 'football', 'Ligue des Champions', 1, 'club', ['man_utd', 'bayern', 'juventus']],
  [2000, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'fc_barcelona', 'bayern']],
  [2001, 'football', 'Ligue des Champions', 1, 'club', ['bayern', 'real_madrid']],
  [2002, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'man_utd', 'fc_barcelona']],
  [2003, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan', 'juventus', 'inter', 'real_madrid']],
  [2004, 'football', 'Ligue des Champions', 1, 'club', ['chelsea', 'ac_milan']],
  [2005, 'football', 'Ligue des Champions', 1, 'club', ['liverpool', 'ac_milan', 'chelsea']],
  [2006, 'football', 'Ligue des Champions', 1, 'club', ['fc_barcelona', 'arsenal', 'ac_milan']],
  [2007, 'football', 'Ligue des Champions', 1, 'club', ['ac_milan', 'liverpool', 'man_utd', 'chelsea']],
  [2008, 'football', 'Ligue des Champions', 1, 'club', ['man_utd', 'chelsea', 'fc_barcelona', 'liverpool']],
  [2009, 'football', 'Ligue des Champions', 1, 'club', ['fc_barcelona', 'man_utd', 'chelsea', 'arsenal']],
  [2010, 'football', 'Ligue des Champions', 1, 'club', ['inter', 'bayern', 'fc_barcelona']],
  [2011, 'football', 'Ligue des Champions', 1, 'club', ['fc_barcelona', 'man_utd', 'real_madrid']],
  [2012, 'football', 'Ligue des Champions', 1, 'club', ['chelsea', 'bayern', 'real_madrid', 'fc_barcelona']],
  [2013, 'football', 'Ligue des Champions', 1, 'club', ['bayern', 'real_madrid', 'fc_barcelona']],
  [2014, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'bayern', 'chelsea']],
  [2015, 'football', 'Ligue des Champions', 1, 'club', ['fc_barcelona', 'juventus', 'bayern', 'real_madrid']],
  [2016, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'bayern', 'man_city']],
  [2017, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'juventus']],
  [2018, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'liverpool', 'bayern']],
  [2019, 'football', 'Ligue des Champions', 1, 'club', ['liverpool', 'fc_barcelona', 'ajax']],
  [2020, 'football', 'Ligue des Champions', 1, 'club', ['bayern', 'psg']],
  [2021, 'football', 'Ligue des Champions', 1, 'club', ['chelsea', 'man_city', 'psg', 'real_madrid']],
  [2022, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'liverpool', 'man_city']],
  [2023, 'football', 'Ligue des Champions', 1, 'club', ['man_city', 'inter', 'real_madrid', 'ac_milan']],
  [2024, 'football', 'Ligue des Champions', 1, 'club', ['real_madrid', 'bayern', 'psg']],
  [2025, 'football', 'Ligue des Champions', 1, 'club', ['psg', 'inter', 'fc_barcelona', 'arsenal']],
  [2026, 'football', 'Ligue des Champions', 1, 'club', ['psg', 'arsenal', 'bayern', 'real_madrid']],

  // ====== FOOTBALL : CHAMPIONNATS TOP 5 (TIER 2, 1995–2026) ======
  [1995, 'football', 'Championnats Top 5', 2, 'club', ['real_madrid', 'juventus', 'psg', 'bayern']],
  [1996, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'ac_milan', 'bayern']],
  [1997, 'football', 'Championnats Top 5', 2, 'club', ['real_madrid', 'man_utd', 'juventus', 'bayern']],
  [1998, 'football', 'Championnats Top 5', 2, 'club', ['arsenal', 'fc_barcelona', 'juventus']],
  [1999, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'fc_barcelona', 'ac_milan', 'bayern']],
  [2000, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'bayern']],
  [2001, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'real_madrid', 'bayern']],
  [2002, 'football', 'Championnats Top 5', 2, 'club', ['arsenal', 'juventus']],
  [2003, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'real_madrid', 'juventus', 'bayern']],
  [2004, 'football', 'Championnats Top 5', 2, 'club', ['arsenal', 'ac_milan']],
  [2005, 'football', 'Championnats Top 5', 2, 'club', ['chelsea', 'fc_barcelona', 'juventus', 'bayern']],
  [2006, 'football', 'Championnats Top 5', 2, 'club', ['chelsea', 'fc_barcelona', 'inter', 'bayern']],
  [2007, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'real_madrid', 'inter']],
  [2008, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'real_madrid', 'inter', 'bayern']],
  [2009, 'football', 'Championnats Top 5', 2, 'club', ['fc_barcelona', 'man_utd', 'inter']],
  [2010, 'football', 'Championnats Top 5', 2, 'club', ['chelsea', 'fc_barcelona', 'inter', 'bayern']],
  [2011, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'fc_barcelona', 'ac_milan']],
  [2012, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'real_madrid', 'juventus']],
  [2013, 'football', 'Championnats Top 5', 2, 'club', ['man_utd', 'fc_barcelona', 'juventus', 'bayern', 'psg']],
  [2014, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'juventus', 'bayern', 'psg']],
  [2015, 'football', 'Championnats Top 5', 2, 'club', ['chelsea', 'fc_barcelona', 'juventus', 'bayern', 'psg']],
  [2016, 'football', 'Championnats Top 5', 2, 'club', ['fc_barcelona', 'juventus', 'bayern', 'psg']],
  [2017, 'football', 'Championnats Top 5', 2, 'club', ['chelsea', 'real_madrid', 'juventus', 'bayern']],
  [2018, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'fc_barcelona', 'juventus', 'bayern', 'psg']],
  [2019, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'fc_barcelona', 'juventus', 'bayern', 'psg']],
  [2020, 'football', 'Championnats Top 5', 2, 'club', ['liverpool', 'real_madrid', 'juventus', 'bayern', 'psg']],
  [2021, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'inter', 'bayern']],
  [2022, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'real_madrid', 'ac_milan', 'bayern', 'psg']],
  [2023, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'fc_barcelona', 'bayern', 'psg']],
  [2024, 'football', 'Championnats Top 5', 2, 'club', ['man_city', 'real_madrid', 'inter', 'psg']],
  [2025, 'football', 'Championnats Top 5', 2, 'club', ['liverpool', 'fc_barcelona', 'bayern', 'psg']],
  [2026, 'football', 'Championnats Top 5', 2, 'club', ['arsenal', 'real_madrid', 'inter', 'bayern', 'psg']],

  // ====== FOOTBALL : COUPES NATIONALES (TIER 3) ======
  [2018, 'football', 'Coupes Nationales', 3, 'club', ['psg', 'chelsea', 'fc_barcelona']],
  [2019, 'football', 'Coupes Nationales', 3, 'club', ['man_city', 'bayern']],
  [2020, 'football', 'Coupes Nationales', 3, 'club', ['psg', 'arsenal', 'bayern']],
  [2021, 'football', 'Coupes Nationales', 3, 'club', ['psg', 'fc_barcelona', 'juventus']],
  [2022, 'football', 'Coupes Nationales', 3, 'club', ['liverpool', 'inter']],
  [2023, 'football', 'Coupes Nationales', 3, 'club', ['man_city', 'real_madrid', 'inter']],
  [2024, 'football', 'Coupes Nationales', 3, 'club', ['psg', 'man_utd', 'juventus']],
  [2025, 'football', 'Coupes Nationales', 3, 'club', ['psg', 'fc_barcelona']],

  // ====== FOOTBALL NATIONS (MONDIAL, EURO, COPA AMÉRICA 1950–2026) ======
  [1950, 'football', 'Coupe du Monde FIFA', 1, 'country', ['BR', 'ES']],
  [1954, 'football', 'Coupe du Monde FIFA', 1, 'country', ['DE']],
  [1958, 'football', 'Coupe du Monde FIFA', 1, 'country', ['BR', 'SE', 'FR', 'DE']],
  [1962, 'football', 'Coupe du Monde FIFA', 1, 'country', ['BR']],
  [1964, 'football', 'Euro UEFA', 2, 'country', ['ES']],
  [1966, 'football', 'Coupe du Monde FIFA', 1, 'country', ['GB', 'DE']],
  [1968, 'football', 'Euro UEFA', 2, 'country', ['IT', 'GB']],
  [1970, 'football', 'Coupe du Monde FIFA', 1, 'country', ['BR', 'IT', 'DE']],
  [1972, 'football', 'Euro UEFA', 2, 'country', ['DE']],
  [1974, 'football', 'Coupe du Monde FIFA', 1, 'country', ['DE', 'NL', 'BR']],
  [1976, 'football', 'Euro UEFA', 2, 'country', ['NL']],
  [1978, 'football', 'Coupe du Monde FIFA', 1, 'country', ['AR', 'NL', 'BR', 'IT']],
  [1980, 'football', 'Euro UEFA', 2, 'country', ['DE', 'BE', 'IT']],
  [1982, 'football', 'Coupe du Monde FIFA', 1, 'country', ['IT', 'DE', 'FR']],
  [1984, 'football', 'Euro UEFA', 2, 'country', ['FR', 'ES']],
  [1986, 'football', 'Coupe du Monde FIFA', 1, 'country', ['AR', 'DE', 'FR', 'BE']],
  [1988, 'football', 'Euro UEFA', 2, 'country', ['NL', 'DE', 'IT']],
  [1989, 'football', 'Copa América', 2, 'country', ['BR', 'AR']],
  [1990, 'football', 'Coupe du Monde FIFA', 1, 'country', ['DE', 'AR', 'IT', 'GB']],
  [1991, 'football', 'Copa América', 2, 'country', ['AR', 'BR']],
  [1992, 'football', 'Euro UEFA', 2, 'country', ['DK', 'DE', 'NL', 'FR']],
  [1993, 'football', 'Copa América', 2, 'country', ['AR']],
  [1994, 'football', 'Coupe du Monde FIFA', 1, 'country', ['BR', 'IT', 'SE']],
  [1996, 'football', 'Euro UEFA', 2, 'country', ['DE', 'GB', 'FR']],
  [1997, 'football', 'Copa América', 2, 'country', ['BR']],
  [1998, 'football', 'Coupe du Monde FIFA', 1, 'country', ['FR', 'BR', 'NL']],
  [1999, 'football', 'Copa América', 2, 'country', ['BR']],
  [2000, 'football', 'Euro UEFA', 2, 'country', ['FR', 'IT', 'NL']],
  [2002, 'football', 'Coupe du Monde FIFA', 1, 'country', ['BR', 'DE']],
  [2004, 'football', 'Copa América', 2, 'country', ['BR', 'AR']],
  [2006, 'football', 'Coupe du Monde FIFA', 1, 'country', ['IT', 'FR', 'DE']],
  [2007, 'football', 'Copa América', 2, 'country', ['BR', 'AR']],
  [2008, 'football', 'Euro UEFA', 2, 'country', ['ES', 'DE']],
  [2010, 'football', 'Coupe du Monde FIFA', 1, 'country', ['ES', 'NL', 'DE']],
  [2012, 'football', 'Euro UEFA', 2, 'country', ['ES', 'IT', 'DE']],
  [2014, 'football', 'Coupe du Monde FIFA', 1, 'country', ['DE', 'AR', 'NL', 'BR']],
  [2016, 'football', 'Euro UEFA', 2, 'country', ['FR', 'DE']],
  [2018, 'football', 'Coupe du Monde FIFA', 1, 'country', ['FR', 'BE', 'GB']],
  [2019, 'football', 'Copa América', 2, 'country', ['BR', 'AR']],
  [2021, 'football', 'Euro UEFA', 2, 'country', ['IT', 'GB', 'ES', 'DK']],
  [2021, 'football', 'Copa América', 2, 'country', ['AR', 'BR']],
  [2022, 'football', 'Coupe du Monde FIFA', 1, 'country', ['AR', 'FR']],
  [2024, 'football', 'Euro UEFA', 2, 'country', ['ES', 'GB', 'FR', 'NL']],
  [2024, 'football', 'Copa América', 2, 'country', ['AR']],
  [2026, 'football', 'Coupe du Monde FIFA', 1, 'country', ['ES', 'AR', 'GB', 'FR']],

  // ====== BASKETBALL : NBA & EUROLEAGUE (1950–2026) ======
  [1950, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [1952, 'basketball', 'NBA Finals', 1, 'club', ['lakers', 'knicks']],
  [1953, 'basketball', 'NBA Finals', 1, 'club', ['lakers', 'knicks']],
  [1954, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [1956, 'basketball', 'NBA Finals', 1, 'club', ['warriors']],
  [1957, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [1959, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1960, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [1961, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [1962, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1963, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1964, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'warriors']],
  [1965, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1966, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1968, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1969, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1970, 'basketball', 'NBA Finals', 1, 'club', ['knicks', 'lakers']],
  [1972, 'basketball', 'NBA Finals', 1, 'club', ['lakers', 'knicks']],
  [1973, 'basketball', 'NBA Finals', 1, 'club', ['knicks', 'lakers']],
  [1974, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [1975, 'basketball', 'NBA Finals', 1, 'club', ['warriors']],
  [1976, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [1980, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [1981, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [1982, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [1984, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [1985, 'basketball', 'NBA Finals', 1, 'club', ['lakers', 'celtics']],
  [1986, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [1987, 'basketball', 'NBA Finals', 1, 'club', ['lakers', 'celtics']],
  [1988, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [1991, 'basketball', 'NBA Finals', 1, 'club', ['bulls', 'lakers']],
  [1992, 'basketball', 'NBA Finals', 1, 'club', ['bulls']],
  [1993, 'basketball', 'NBA Finals', 1, 'club', ['bulls']],
  [1994, 'basketball', 'NBA Finals', 1, 'club', ['knicks']],
  [1995, 'basketball', 'EuroLeague', 2, 'club', ['real_basket', 'olympiacos', 'panathinaikos']],
  [1996, 'basketball', 'NBA Finals', 1, 'club', ['bulls']],
  [1997, 'basketball', 'NBA Finals', 1, 'club', ['bulls']],
  [1998, 'basketball', 'NBA Finals', 1, 'club', ['bulls']],
  [1999, 'basketball', 'NBA Finals', 1, 'club', ['spurs', 'knicks']],
  [2000, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [2001, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [2002, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [2003, 'basketball', 'NBA Finals', 1, 'club', ['spurs']],
  [2004, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [2005, 'basketball', 'NBA Finals', 1, 'club', ['spurs']],
  [2006, 'basketball', 'NBA Finals', 1, 'club', ['heat']],
  [2007, 'basketball', 'NBA Finals', 1, 'club', ['spurs']],
  [2008, 'basketball', 'NBA Finals', 1, 'club', ['celtics', 'lakers']],
  [2009, 'basketball', 'NBA Finals', 1, 'club', ['lakers']],
  [2010, 'basketball', 'NBA Finals', 1, 'club', ['lakers', 'celtics']],
  [2011, 'basketball', 'NBA Finals', 1, 'club', ['heat']],
  [2012, 'basketball', 'NBA Finals', 1, 'club', ['heat', 'thunder']],
  [2013, 'basketball', 'NBA Finals', 1, 'club', ['heat', 'spurs']],
  [2014, 'basketball', 'NBA Finals', 1, 'club', ['spurs', 'heat']],
  [2015, 'basketball', 'NBA Finals', 1, 'club', ['warriors']],
  [2015, 'basketball', 'EuroLeague', 2, 'club', ['real_basket', 'olympiacos']],
  [2016, 'basketball', 'NBA Finals', 1, 'club', ['warriors']],
  [2017, 'basketball', 'NBA Finals', 1, 'club', ['warriors']],
  [2018, 'basketball', 'NBA Finals', 1, 'club', ['warriors']],
  [2018, 'basketball', 'EuroLeague', 2, 'club', ['real_basket']],
  [2019, 'basketball', 'NBA Finals', 1, 'club', ['warriors']],
  [2020, 'basketball', 'NBA Finals', 1, 'club', ['lakers', 'heat']],
  [2021, 'basketball', 'EuroLeague', 2, 'club', ['real_basket']],
  [2022, 'basketball', 'NBA Finals', 1, 'club', ['warriors', 'celtics']],
  [2023, 'basketball', 'NBA Finals', 1, 'club', ['nuggets', 'heat']],
  [2023, 'basketball', 'EuroLeague', 2, 'club', ['real_basket', 'olympiacos']],
  [2024, 'basketball', 'NBA Finals', 1, 'club', ['celtics']],
  [2024, 'basketball', 'EuroLeague', 2, 'club', ['panathinaikos', 'real_basket', 'olympiacos']],
  [2025, 'basketball', 'NBA Finals', 1, 'club', ['thunder', 'knicks']],
  [2026, 'basketball', 'NBA Finals', 1, 'club', ['knicks', 'spurs']],
  [2026, 'basketball', 'EuroLeague', 2, 'club', ['olympiacos', 'real_basket', 'panathinaikos']],

  // BASKETBALL NATIONS (JO & FIBA)
  [1992, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US']],
  [1996, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US']],
  [2000, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US', 'FR', 'AU']],
  [2002, 'basketball', 'Coupe du Monde FIBA', 1, 'country', ['RS', 'AR', 'DE']],
  [2004, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['AR', 'IT', 'US']],
  [2006, 'basketball', 'Coupe du Monde FIBA', 1, 'country', ['ES', 'US', 'AR']],
  [2008, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US', 'ES', 'AR']],
  [2010, 'basketball', 'Coupe du Monde FIBA', 1, 'country', ['US', 'RS']],
  [2012, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US', 'ES']],
  [2014, 'basketball', 'Coupe du Monde FIBA', 1, 'country', ['US', 'RS', 'FR']],
  [2016, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US', 'RS', 'ES']],
  [2019, 'basketball', 'Coupe du Monde FIBA', 1, 'country', ['ES', 'AR', 'FR']],
  [2021, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US', 'FR', 'AU']],
  [2023, 'basketball', 'Coupe du Monde FIBA', 1, 'country', ['DE', 'RS', 'US']],
  [2024, 'basketball', 'Jeux Olympiques Basket', 1, 'country', ['US', 'FR', 'RS']],

  // ====== FORMULE 1 CONSTRUCTEURS (1950–2026) ======
  [1952, 'f1', 'Championnat F1', 1, 'club', ['ferrari']],
  [1953, 'f1', 'Championnat F1', 1, 'club', ['ferrari']],
  [1956, 'f1', 'Championnat F1', 1, 'club', ['ferrari']],
  [1958, 'f1', 'Championnat F1', 1, 'club', ['ferrari']],
  [1961, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'lotus']],
  [1963, 'f1', 'Championnat F1', 1, 'club', ['lotus', 'ferrari']],
  [1964, 'f1', 'Championnat F1', 1, 'club', ['ferrari']],
  [1965, 'f1', 'Championnat F1', 1, 'club', ['lotus', 'ferrari']],
  [1968, 'f1', 'Championnat F1', 1, 'club', ['lotus', 'mclaren']],
  [1970, 'f1', 'Championnat F1', 1, 'club', ['lotus', 'ferrari']],
  [1972, 'f1', 'Championnat F1', 1, 'club', ['lotus']],
  [1973, 'f1', 'Championnat F1', 1, 'club', ['lotus']],
  [1974, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'ferrari']],
  [1975, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'mclaren']],
  [1976, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'mclaren']],
  [1977, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'lotus', 'mclaren']],
  [1978, 'f1', 'Championnat F1', 1, 'club', ['lotus', 'ferrari']],
  [1979, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'williams', 'lotus']],
  [1980, 'f1', 'Championnat F1', 1, 'club', ['williams']],
  [1981, 'f1', 'Championnat F1', 1, 'club', ['williams']],
  [1982, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'mclaren', 'alpine_f1']],
  [1983, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'alpine_f1']],
  [1984, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'ferrari', 'lotus']],
  [1985, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'ferrari', 'williams']],
  [1986, 'f1', 'Championnat F1', 1, 'club', ['williams', 'mclaren', 'lotus']],
  [1987, 'f1', 'Championnat F1', 1, 'club', ['williams', 'mclaren', 'lotus']],
  [1988, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'ferrari']],
  [1989, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'williams', 'ferrari']],
  [1990, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'ferrari', 'williams']],
  [1991, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'williams', 'ferrari']],
  [1992, 'f1', 'Championnat F1', 1, 'club', ['williams', 'mclaren']],
  [1993, 'f1', 'Championnat F1', 1, 'club', ['williams', 'mclaren']],
  [1994, 'f1', 'Championnat F1', 1, 'club', ['williams', 'ferrari']],
  [1995, 'f1', 'Championnat F1', 1, 'club', ['williams', 'ferrari']],
  [1996, 'f1', 'Championnat F1', 1, 'club', ['williams', 'ferrari']],
  [1997, 'f1', 'Championnat F1', 1, 'club', ['williams', 'ferrari']],
  [1998, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'ferrari', 'williams']],
  [1999, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'mclaren']],
  [2000, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'mclaren', 'williams']],
  [2001, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'mclaren', 'williams']],
  [2002, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'williams', 'mclaren']],
  [2003, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'williams', 'mclaren']],
  [2004, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'alpine_f1']],
  [2005, 'f1', 'Championnat F1', 1, 'club', ['alpine_f1', 'mclaren', 'ferrari']],
  [2006, 'f1', 'Championnat F1', 1, 'club', ['alpine_f1', 'ferrari', 'mclaren']],
  [2007, 'f1', 'Championnat F1', 1, 'club', ['ferrari']],
  [2008, 'f1', 'Championnat F1', 1, 'club', ['ferrari', 'mclaren']],
  [2009, 'f1', 'Championnat F1', 1, 'club', ['red_bull', 'mclaren']],
  [2010, 'f1', 'Championnat F1', 1, 'club', ['red_bull', 'mclaren', 'ferrari']],
  [2011, 'f1', 'Championnat F1', 1, 'club', ['red_bull', 'mclaren', 'ferrari']],
  [2012, 'f1', 'Championnat F1', 1, 'club', ['red_bull', 'ferrari', 'mclaren']],
  [2013, 'f1', 'Championnat F1', 1, 'club', ['red_bull', 'mercedes', 'ferrari']],
  [2014, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'red_bull', 'williams']],
  [2015, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'ferrari', 'williams']],
  [2016, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'red_bull', 'ferrari']],
  [2017, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'ferrari', 'red_bull']],
  [2018, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'ferrari', 'red_bull']],
  [2019, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'ferrari', 'red_bull']],
  [2020, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'red_bull', 'mclaren']],
  [2021, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'red_bull', 'ferrari']],
  [2022, 'f1', 'Championnat F1', 1, 'club', ['red_bull', 'ferrari', 'mercedes']],
  [2023, 'f1', 'Championnat F1', 1, 'club', ['red_bull', 'mercedes', 'ferrari']],
  [2024, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'ferrari', 'red_bull']],
  [2025, 'f1', 'Championnat F1', 1, 'club', ['mclaren', 'mercedes', 'red_bull', 'ferrari']],
  [2026, 'f1', 'Championnat F1', 1, 'club', ['mercedes', 'ferrari', 'red_bull', 'mclaren']],

  // ====== F1 NATIONS ======
  [1995, 'f1', 'Mondial F1 Nations', 1, 'country', ['DE', 'GB', 'IT']],
  [2000, 'f1', 'Mondial F1 Nations', 1, 'country', ['DE', 'IT', 'GB']],
  [2004, 'f1', 'Mondial F1 Nations', 1, 'country', ['DE', 'IT', 'FR']],
  [2006, 'f1', 'Mondial F1 Nations', 1, 'country', ['ES', 'FR', 'DE']],
  [2008, 'f1', 'Mondial F1 Nations', 1, 'country', ['GB', 'IT']],
  [2012, 'f1', 'Mondial F1 Nations', 1, 'country', ['DE', 'ES']],
  [2016, 'f1', 'Mondial F1 Nations', 1, 'country', ['DE', 'GB']],
  [2020, 'f1', 'Mondial F1 Nations', 1, 'country', ['GB', 'DE', 'NL']],
  [2023, 'f1', 'Mondial F1 Nations', 1, 'country', ['NL', 'GB']],
  [2024, 'f1', 'Mondial F1 Nations', 1, 'country', ['NL', 'GB', 'ES']],
  [2025, 'f1', 'Mondial F1 Nations', 1, 'country', ['GB', 'NL']],
  [2026, 'f1', 'Mondial F1 Nations', 1, 'country', ['GB', 'IT', 'DE']],

  // ====== HOCKEY (NHL STANLEY CUP & MONDIAUX) ======
  [1956, 'hockey', 'NHL', 1, 'club', ['montreal_canadiens', 'detroit_red_wings']],
  [1960, 'hockey', 'NHL', 1, 'club', ['montreal_canadiens', 'boston_bruins']],
  [1977, 'hockey', 'NHL', 1, 'club', ['montreal_canadiens', 'boston_bruins']],
  [1984, 'hockey', 'NHL', 1, 'club', ['edmonton_oilers', 'montreal_canadiens']],
  [1987, 'hockey', 'NHL', 1, 'club', ['edmonton_oilers', 'boston_bruins']],
  [1990, 'hockey', 'NHL', 1, 'club', ['edmonton_oilers', 'boston_bruins']],
  [1993, 'hockey', 'NHL', 1, 'club', ['montreal_canadiens', 'pittsburgh_penguins']],
  [1996, 'hockey', 'NHL', 1, 'club', ['colorado_avalanche', 'florida_panthers', 'detroit_red_wings']],
  [1997, 'hockey', 'NHL', 1, 'club', ['detroit_red_wings', 'colorado_avalanche']],
  [1998, 'hockey', 'NHL', 1, 'club', ['detroit_red_wings', 'colorado_avalanche']],
  [2001, 'hockey', 'NHL', 1, 'club', ['colorado_avalanche', 'detroit_red_wings']],
  [2002, 'hockey', 'NHL', 1, 'club', ['detroit_red_wings', 'colorado_avalanche']],
  [2004, 'hockey', 'NHL', 1, 'club', ['tampa_bay_lightning', 'detroit_red_wings']],
  [2006, 'hockey', 'NHL', 1, 'club', ['edmonton_oilers', 'detroit_red_wings']],
  [2008, 'hockey', 'NHL', 1, 'club', ['detroit_red_wings', 'pittsburgh_penguins']],
  [2009, 'hockey', 'NHL', 1, 'club', ['pittsburgh_penguins', 'detroit_red_wings', 'chicago_blackhawks']],
  [2010, 'hockey', 'NHL', 1, 'club', ['chicago_blackhawks', 'montreal_canadiens', 'boston_bruins']],
  [2011, 'hockey', 'NHL', 1, 'club', ['boston_bruins', 'tampa_bay_lightning']],
  [2013, 'hockey', 'NHL', 1, 'club', ['chicago_blackhawks', 'boston_bruins', 'pittsburgh_penguins']],
  [2015, 'hockey', 'NHL', 1, 'club', ['chicago_blackhawks', 'tampa_bay_lightning']],
  [2016, 'hockey', 'NHL', 1, 'club', ['pittsburgh_penguins', 'tampa_bay_lightning']],
  [2017, 'hockey', 'NHL', 1, 'club', ['pittsburgh_penguins', 'edmonton_oilers']],
  [2018, 'hockey', 'NHL', 1, 'club', ['vegas_golden_knights', 'tampa_bay_lightning', 'boston_bruins']],
  [2019, 'hockey', 'NHL', 1, 'club', ['boston_bruins', 'tampa_bay_lightning']],
  [2020, 'hockey', 'NHL', 1, 'club', ['tampa_bay_lightning', 'vegas_golden_knights', 'boston_bruins']],
  [2021, 'hockey', 'NHL', 1, 'club', ['tampa_bay_lightning', 'montreal_canadiens', 'vegas_golden_knights']],
  [2022, 'hockey', 'NHL', 1, 'club', ['colorado_avalanche', 'tampa_bay_lightning', 'edmonton_oilers']],
  [2023, 'hockey', 'NHL', 1, 'club', ['vegas_golden_knights', 'florida_panthers', 'boston_bruins']],
  [2024, 'hockey', 'NHL', 1, 'club', ['florida_panthers', 'edmonton_oilers', 'colorado_avalanche']],
  [2025, 'hockey', 'NHL', 1, 'club', ['florida_panthers', 'edmonton_oilers', 'vegas_golden_knights']],
  [2026, 'hockey', 'NHL', 1, 'club', ['colorado_avalanche', 'florida_panthers', 'edmonton_oilers']],

  // HOCKEY NATIONS
  [2002, 'hockey', 'JO & Mondial Hockey', 1, 'country', ['CA', 'US', 'SE']],
  [2006, 'hockey', 'JO & Mondial Hockey', 1, 'country', ['SE', 'CA', 'US']],
  [2010, 'hockey', 'JO & Mondial Hockey', 1, 'country', ['CA', 'US', 'SE']],
  [2014, 'hockey', 'JO & Mondial Hockey', 1, 'country', ['CA', 'SE', 'US']],
  [2018, 'hockey', 'Mondial Hockey', 1, 'country', ['SE', 'CH', 'US', 'CA']],
  [2021, 'hockey', 'Mondial Hockey', 1, 'country', ['CA', 'US', 'DE']],
  [2023, 'hockey', 'Mondial Hockey', 1, 'country', ['CA', 'DE', 'US']],
  [2024, 'hockey', 'Mondial Hockey', 1, 'country', ['CH', 'SE', 'CA']],
  [2025, 'hockey', 'Tournoi des 4 Nations', 1, 'country', ['CA', 'US', 'SE']],
  [2026, 'hockey', 'JO Milan-Cortina Hockey', 1, 'country', ['CA', 'US', 'SE']],

  // ====== TENNIS NATIONS (GRANDS CHELEMS & COUPE DAVIS) ======
  [1955, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['AU', 'US']],
  [1962, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['AU', 'US']],
  [1970, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['US', 'AU', 'DE']],
  [1980, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['SE', 'US', 'AU']],
  [1988, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['DE', 'SE', 'US']],
  [1991, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['FR', 'US', 'DE']],
  [1995, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['US', 'DE', 'ES']],
  [1996, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['FR', 'US', 'SE']],
  [1999, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['AU', 'US', 'FR']],
  [2000, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'US', 'AU']],
  [2001, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['FR', 'AU', 'US']],
  [2003, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['AU', 'CH', 'US']],
  [2004, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'CH', 'US']],
  [2005, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['CH', 'ES', 'US']],
  [2006, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['CH', 'ES']],
  [2007, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['US', 'CH', 'ES']],
  [2008, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'CH', 'RS']],
  [2009, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'CH', 'US']],
  [2010, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['RS', 'ES', 'FR']],
  [2011, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'RS', 'AR']],
  [2012, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['CH', 'RS', 'GB', 'ES']],
  [2013, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'RS', 'GB']],
  [2014, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['CH', 'ES', 'RS']],
  [2015, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['GB', 'RS', 'CH']],
  [2016, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['AR', 'GB', 'RS']],
  [2017, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['FR', 'CH', 'ES']],
  [2018, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['RS', 'ES', 'FR']],
  [2019, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'RS']],
  [2020, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'RS']],
  [2021, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['RS', 'ES']],
  [2022, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'RS', 'AU']],
  [2023, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['IT', 'RS', 'ES', 'AU']],
  [2024, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['IT', 'ES', 'US', 'NL']],
  [2025, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['IT', 'ES', 'US']],
  [2026, 'tennis', 'Grand Chelem & Davis', 1, 'country', ['ES', 'IT', 'DE', 'RS']],

  // ====== RUGBY CLUBS ======
  [1996, 'rugby', 'Champions Cup', 1, 'club', ['toulouse']],
  [1997, 'rugby', 'Top 14 / Super Rugby', 2, 'club', ['toulouse']],
  [1998, 'rugby', 'Super Rugby', 2, 'club', ['crusaders']],
  [1999, 'rugby', 'Top 14 / Super Rugby', 2, 'club', ['toulouse', 'crusaders']],
  [2000, 'rugby', 'Super Rugby', 2, 'club', ['crusaders']],
  [2002, 'rugby', 'Super Rugby', 2, 'club', ['crusaders']],
  [2003, 'rugby', 'Champions Cup', 1, 'club', ['toulouse']],
  [2005, 'rugby', 'Champions Cup', 1, 'club', ['toulouse', 'crusaders']],
  [2006, 'rugby', 'Super Rugby', 2, 'club', ['crusaders']],
  [2008, 'rugby', 'Top 14 / Super Rugby', 2, 'club', ['toulouse', 'crusaders']],
  [2009, 'rugby', 'Champions Cup', 1, 'club', ['leinster']],
  [2010, 'rugby', 'Champions Cup', 1, 'club', ['toulouse']],
  [2011, 'rugby', 'Champions Cup', 1, 'club', ['leinster', 'toulouse']],
  [2012, 'rugby', 'Champions Cup', 1, 'club', ['leinster', 'toulouse']],
  [2017, 'rugby', 'Super Rugby', 2, 'club', ['crusaders']],
  [2018, 'rugby', 'Champions Cup', 1, 'club', ['leinster', 'crusaders']],
  [2019, 'rugby', 'Top 14 / Super Rugby', 2, 'club', ['toulouse', 'leinster', 'crusaders']],
  [2020, 'rugby', 'Super Rugby', 2, 'club', ['crusaders']],
  [2021, 'rugby', 'Champions Cup', 1, 'club', ['toulouse', 'larochelle']],
  [2022, 'rugby', 'Champions Cup', 1, 'club', ['larochelle', 'leinster', 'crusaders']],
  [2023, 'rugby', 'Champions Cup', 1, 'club', ['larochelle', 'leinster', 'toulouse']],
  [2024, 'rugby', 'Champions Cup', 1, 'club', ['toulouse', 'leinster']],
  [2025, 'rugby', 'Champions Cup', 1, 'club', ['ubb', 'toulouse', 'leinster']],
  [2026, 'rugby', 'Champions Cup', 1, 'club', ['ubb', 'leinster', 'toulouse']],

  // RUGBY NATIONS
  [1987, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['NZ', 'FR']],
  [1991, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['AU', 'GB', 'NZ']],
  [1995, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['ZA', 'NZ', 'FR']],
  [1997, 'rugby', 'Tournoi des 5 Nations', 2, 'country', ['FR', 'GB']],
  [1998, 'rugby', 'Tournoi des 5 Nations', 2, 'country', ['FR']],
  [1999, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['AU', 'FR', 'ZA']],
  [2002, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['FR']],
  [2003, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['GB', 'AU', 'NZ', 'FR']],
  [2004, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['FR', 'IE']],
  [2007, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['ZA', 'GB', 'AR', 'FR']],
  [2009, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['IE']],
  [2010, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['FR', 'IE']],
  [2011, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['NZ', 'FR', 'AU']],
  [2014, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['IE', 'GB']],
  [2015, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['NZ', 'AU', 'ZA', 'AR']],
  [2016, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['GB']],
  [2018, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['IE']],
  [2019, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['ZA', 'GB', 'NZ']],
  [2022, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['FR', 'IE']],
  [2023, 'rugby', 'Coupe du Monde Rugby', 1, 'country', ['ZA', 'NZ', 'GB', 'AR']],
  [2024, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['IE', 'FR']],
  [2025, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['FR', 'GB', 'IE']],
  [2026, 'rugby', 'Tournoi des 6 Nations', 2, 'country', ['FR', 'IE']],

  // ====== HANDBALL CLUBS & NATIONS ======
  [1996, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand']],
  [1998, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand']],
  [2000, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand', 'kiel']],
  [2002, 'handball', 'Ligue des Champions EHF', 1, 'club', ['magdeburg']],
  [2005, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand']],
  [2007, 'handball', 'Ligue des Champions EHF', 1, 'club', ['kiel']],
  [2010, 'handball', 'Ligue des Champions EHF', 1, 'club', ['kiel', 'barca_hand']],
  [2011, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand']],
  [2012, 'handball', 'Ligue des Champions EHF', 1, 'club', ['kiel']],
  [2015, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand']],
  [2017, 'handball', 'Ligue des Champions EHF', 1, 'club', ['psg_hand', 'barca_hand']],
  [2020, 'handball', 'Ligue des Champions EHF', 1, 'club', ['kiel', 'barca_hand', 'psg_hand']],
  [2021, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand', 'psg_hand']],
  [2022, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand', 'kiel']],
  [2023, 'handball', 'Ligue des Champions EHF', 1, 'club', ['magdeburg', 'barca_hand', 'psg_hand']],
  [2024, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand', 'kiel', 'magdeburg']],
  [2025, 'handball', 'Ligue des Champions EHF', 1, 'club', ['magdeburg', 'barca_hand']],
  [2026, 'handball', 'Ligue des Champions EHF', 1, 'club', ['barca_hand', 'kiel']],

  [1995, 'handball', 'Mondial Handball', 1, 'country', ['FR', 'SE', 'ES']],
  [1999, 'handball', 'Mondial Handball', 1, 'country', ['SE', 'ES']],
  [2001, 'handball', 'Mondial Handball', 1, 'country', ['FR', 'SE']],
  [2005, 'handball', 'Mondial Handball', 1, 'country', ['ES', 'FR']],
  [2008, 'handball', 'Jeux Olympiques Handball', 1, 'country', ['FR', 'DK', 'ES']],
  [2009, 'handball', 'Mondial Handball', 1, 'country', ['FR', 'DK']],
  [2011, 'handball', 'Mondial Handball', 1, 'country', ['FR', 'DK', 'ES']],
  [2012, 'handball', 'Jeux Olympiques Handball', 1, 'country', ['FR', 'SE', 'DK']],
  [2013, 'handball', 'Mondial Handball', 1, 'country', ['ES', 'DK']],
  [2014, 'handball', 'Euro Handball', 2, 'country', ['FR', 'DK', 'ES']],
  [2015, 'handball', 'Mondial Handball', 1, 'country', ['FR', 'ES']],
  [2016, 'handball', 'Jeux Olympiques Handball', 1, 'country', ['DK', 'FR', 'DE']],
  [2017, 'handball', 'Mondial Handball', 1, 'country', ['FR', 'NO']],
  [2018, 'handball', 'Euro Handball', 2, 'country', ['ES', 'SE', 'FR']],
  [2019, 'handball', 'Mondial Handball', 1, 'country', ['DK', 'NO', 'FR']],
  [2020, 'handball', 'Euro Handball', 2, 'country', ['ES', 'NO']],
  [2021, 'handball', 'Mondial & JO Handball', 1, 'country', ['DK', 'SE', 'FR', 'ES']],
  [2022, 'handball', 'Euro Handball', 2, 'country', ['SE', 'ES', 'DK']],
  [2023, 'handball', 'Mondial Handball', 1, 'country', ['DK', 'FR', 'ES']],
  [2024, 'handball', 'JO & Euro Handball', 1, 'country', ['DK', 'DE', 'FR', 'ES']],
  [2025, 'handball', 'Mondial Handball', 1, 'country', ['DK', 'FR']],
  [2026, 'handball', 'Euro Handball', 2, 'country', ['DK', 'DE']],

  // ====== CYCLISME CLUBS & NATIONS ======
  [1969, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['BE', 'FR', 'IT']],
  [1971, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['BE', 'NL', 'ES']],
  [1974, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['BE', 'FR']],
  [1978, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['FR', 'BE']],
  [1985, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['FR', 'NL', 'IE']],
  [1992, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['ES', 'IT', 'FR']],
  [1995, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['ES', 'FR', 'IT']],
  [2012, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['ineos', 'quickstep']],
  [2013, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['ineos', 'quickstep']],
  [2015, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['ineos', 'quickstep']],
  [2016, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['ineos', 'quickstep']],
  [2017, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['ineos', 'quickstep']],
  [2018, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['ineos', 'quickstep']],
  [2019, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['ineos', 'visma', 'quickstep']],
  [2020, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['uae_cycling', 'visma', 'ineos']],
  [2021, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['uae_cycling', 'visma', 'ineos', 'quickstep']],
  [2022, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['visma', 'uae_cycling', 'quickstep']],
  [2023, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['visma', 'uae_cycling', 'quickstep']],
  [2024, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['uae_cycling', 'visma', 'quickstep']],
  [2025, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['uae_cycling', 'visma', 'quickstep']],
  [2026, 'cycling', 'Grands Tours / WorldTour', 1, 'club', ['uae_cycling', 'visma', 'quickstep']],

  [2018, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['GB', 'FR', 'NL', 'ES']],
  [2020, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['SI', 'FR', 'BE']],
  [2021, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['SI', 'FR', 'IT', 'BE']],
  [2022, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['DK', 'BE', 'SI', 'NL']],
  [2023, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['DK', 'NL', 'SI', 'BE']],
  [2024, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['SI', 'BE', 'NL', 'DK']],
  [2025, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['SI', 'BE', 'NL', 'DK']],
  [2026, 'cycling', 'Grands Tours & Mondiaux', 1, 'country', ['SI', 'BE', 'NL', 'DK']],
];

const OLYMPIC_TABLES: OlympicEntry[] = [
  [1952, 'JO Helsinki', [['US', 40, 19, 17], ['IT', 8, 9, 4], ['FR', 6, 6, 6], ['AU', 6, 2, 3], ['SE', 12, 13, 10], ['JP', 1, 6, 2], ['GB', 1, 2, 8]]],
  [1960, 'JO Rome', [['US', 34, 21, 16], ['IT', 13, 10, 13], ['DE', 12, 19, 11], ['AU', 8, 8, 6], ['JP', 4, 7, 7], ['GB', 2, 6, 12], ['FR', 0, 2, 3]]],
  [1968, 'JO Mexico', [['US', 45, 28, 34], ['JP', 11, 7, 7], ['FR', 7, 3, 5], ['AU', 5, 7, 5], ['GB', 5, 5, 3], ['DE', 5, 11, 10], ['IT', 3, 4, 9]]],
  [1976, 'JO Montréal', [['US', 34, 35, 25], ['DE', 10, 12, 17], ['JP', 9, 6, 10], ['GB', 3, 5, 5], ['FR', 2, 3, 4], ['IT', 2, 7, 4]]],
  [1984, 'JO Los Angeles', [['US', 83, 61, 30], ['DE', 17, 19, 23], ['CN', 15, 8, 9], ['IT', 14, 6, 12], ['JP', 10, 8, 14], ['GB', 5, 11, 21], ['FR', 5, 7, 16], ['AU', 4, 8, 12]]],
  [1988, 'JO Séoul', [['US', 36, 31, 27], ['DE', 11, 14, 15], ['FR', 6, 4, 6], ['IT', 6, 4, 4], ['GB', 5, 10, 9], ['CN', 5, 11, 12], ['AU', 3, 6, 5], ['JP', 4, 3, 7]]],
  [1992, 'JO Barcelone', [['US', 37, 34, 37], ['DE', 33, 21, 28], ['CN', 16, 22, 16], ['ES', 13, 7, 2], ['FR', 8, 5, 16], ['AU', 7, 9, 11], ['IT', 6, 5, 8], ['GB', 5, 3, 12]]],
  [1996, 'JO Atlanta', [['US', 44, 32, 25], ['DE', 20, 18, 27], ['CN', 16, 22, 12], ['FR', 15, 7, 15], ['IT', 13, 10, 12], ['AU', 9, 9, 23], ['ES', 5, 6, 6]]],
  [2000, 'JO Sydney', [['US', 37, 24, 32], ['CN', 28, 16, 14], ['AU', 16, 25, 17], ['DE', 13, 17, 26], ['FR', 13, 14, 11], ['IT', 13, 8, 13], ['NL', 12, 9, 4], ['GB', 11, 10, 7]]],
  [2004, 'JO Athènes', [['US', 36, 39, 26], ['CN', 32, 17, 14], ['AU', 17, 16, 17], ['JP', 16, 9, 12], ['DE', 13, 16, 20], ['FR', 11, 9, 13], ['IT', 10, 11, 11], ['GB', 9, 9, 12]]],
  [2008, 'JO Pékin', [['CN', 48, 22, 30], ['US', 36, 39, 37], ['GB', 19, 13, 19], ['DE', 16, 11, 14], ['AU', 14, 15, 17], ['JP', 9, 8, 8], ['IT', 8, 9, 10], ['FR', 7, 16, 20]]],
  [2012, 'JO Londres', [['US', 48, 26, 30], ['CN', 39, 31, 22], ['GB', 29, 18, 18], ['DE', 11, 20, 13], ['FR', 11, 11, 13], ['AU', 8, 15, 12], ['IT', 8, 9, 11], ['JP', 7, 14, 17]]],
  [2016, 'JO Rio', [['US', 46, 37, 38], ['GB', 27, 23, 17], ['CN', 26, 18, 26], ['DE', 17, 10, 15], ['JP', 12, 8, 21], ['FR', 10, 18, 14], ['IT', 8, 12, 8], ['AU', 8, 11, 10]]],
  [2021, 'JO Tokyo 2020', [['US', 39, 41, 33], ['CN', 38, 32, 19], ['JP', 27, 14, 17], ['GB', 22, 20, 22], ['AU', 17, 7, 22], ['NL', 10, 12, 14], ['FR', 10, 12, 11], ['DE', 10, 11, 16], ['IT', 10, 10, 20]]],
  [2022, 'JO Hiver Pékin', [['NO', 16, 8, 13], ['DE', 12, 10, 5], ['US', 9, 9, 7], ['CN', 9, 4, 2], ['SE', 8, 5, 5], ['NL', 8, 5, 4], ['CH', 7, 2, 6], ['FR', 5, 7, 2]]],
  [2024, 'JO Paris', [['US', 40, 44, 42], ['CN', 40, 27, 24], ['JP', 20, 12, 13], ['AU', 18, 19, 16], ['FR', 16, 26, 22], ['NL', 15, 7, 12], ['GB', 14, 22, 29], ['IT', 12, 13, 15], ['DE', 12, 13, 8]]],
  [2026, 'JO Hiver Milano-Cortina', [['NO', 18, 12, 11], ['US', 12, 12, 9], ['NL', 10, 7, 3], ['IT', 10, 6, 14], ['DE', 8, 10, 8], ['FR', 8, 9, 6], ['CH', 6, 9, 8], ['JP', 5, 7, 12]]],
];

function seededNoise(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function buildCoreRecords(): SportRecord[] {
  const records: SportRecord[] = [];
  let seq = 1;

  for (const [year, sport, competition, tier, entityType, podiumIds] of HISTORY_COMPACTS) {
    podiumIds.forEach((entityId, idx) => {
      const rank = idx + 1;
      const ent = CORE_ENTITIES[entityId];
      if (!ent) return;
      const n = seededNoise(`${year}-${sport}-${competition}-${entityId}`);

      let wins = 0;
      let draws = 0;
      let losses = 0;
      let elo = 1750;
      let adv: AdvancedStats = {};

      if (sport === 'football') {
        const matches = tier === 1 && entityType === 'club' ? 13 : entityType === 'country' ? 7 : tier === 3 ? 6 : 38;
        const winRate = rank === 1 ? 0.72 + n * 0.14 : rank === 2 ? 0.62 + n * 0.12 : 0.54 + n * 0.12;
        wins = Math.round(matches * winRate);
        draws = Math.max(0, Math.round((matches - wins) * 0.52));
        losses = Math.max(0, matches - wins - draws);
        elo = Math.round((tier === 1 ? 1965 : tier === 2 ? 1895 : 1840) - (rank - 1) * 40 + n * 48);

        if (entityId === 'arsenal' && year === 2004 && tier === 2) {
          losses = 0;
          wins = 26;
          draws = 12;
          elo = 2020;
        }
        if (entityId === 'fc_barcelona' && (year === 2009 || year === 2011 || year === 2015)) {
          elo = 2085;
        }
        if (entityId === 'man_city' && year === 2023) {
          elo = 2075;
        }
        if (entityId === 'psg' && (year === 2025 || year === 2026) && tier === 1) {
          elo = 2060;
        }

        const gf = Math.round(wins * (2.15 + n * 0.55) + draws * 0.9);
        const ga = Math.round(losses * 1.45 + draws * 0.8 + wins * 0.35);
        const xgFor = +(gf * (0.93 + n * 0.14)).toFixed(1);
        const xgAgainst = +(ga * (0.95 + n * 0.14)).toFixed(1);
        adv = {
          goalsFor: gf,
          goalsAgainst: ga,
          xgFor,
          xgAgainst,
          xgDiff: +(xgFor - xgAgainst).toFixed(1),
          possessionPct: +(52 + Math.max(0, 4 - rank) * 3.1 + n * 7).toFixed(1),
          shotsOnTarget: Math.round(gf * 2.7 + matches * 2.1),
          cleanSheets: Math.round(matches * (0.34 + Math.max(0, 4 - rank) * 0.05 + n * 0.08)),
          unbeatenStreak:
            rank === 1
              ? Math.round(12 + n * 16 + (losses === 0 && matches >= 30 ? 20 : 0))
              : Math.round(6 + n * 8),
        };
      } else if (sport === 'basketball') {
        const games = entityType === 'club' ? (competition === 'NBA Finals' ? 82 : 34) : 8;
        const winRate = rank === 1 ? 0.72 + n * 0.14 : rank === 2 ? 0.64 + n * 0.1 : 0.58 + n * 0.09;
        wins = Math.round(games * winRate);
        losses = Math.max(0, games - wins);
        if (entityId === 'bulls' && year === 1996) {
          wins = 72;
          losses = 10;
        }
        if (entityId === 'warriors' && year === 2016) {
          wins = 73;
          losses = 9;
        }
        elo = Math.round(1865 - (rank - 1) * 38 + n * 52);
        const ppg = +(108 + n * 11 + (year > 2018 ? 7 : 0)).toFixed(1);
        const oppPpg = +(ppg - (rank === 1 ? 6.8 + n * 4 : 3.2 + n * 3)).toFixed(1);
        adv = {
          ptsPerGame: ppg,
          oppPtsPerGame: oppPpg,
          fgPct: +(46.2 + Math.max(0, 4 - rank) * 0.7 + n * 2.2).toFixed(1),
          threePtPct: +(35.8 + (year > 2014 ? 2.1 : 0) + n * 2.5).toFixed(1),
          netRating: +(ppg - oppPpg).toFixed(1),
          winPct: +((wins / games) * 100).toFixed(1),
        };
      } else if (sport === 'f1') {
        const races = year >= 2021 ? 23 : year >= 2010 ? 20 : 16;
        const raceWins =
          rank === 1
            ? Math.max(4, Math.round(races * (0.45 + n * 0.35)))
            : rank === 2
              ? Math.max(1, Math.round(races * (0.18 + n * 0.16)))
              : Math.max(0, Math.round(races * (0.05 + n * 0.1)));
        wins = entityId === 'red_bull' && year === 2023 ? 21 : raceWins;
        losses = Math.max(0, races - wins);
        elo = Math.round(1920 - (rank - 1) * 55 + n * 50);
        const poles = Math.max(wins - 2, Math.round(wins * (0.85 + n * 0.35)));
        const podiums = Math.min(races * 2, Math.round(wins * 2.1 + Math.max(0, 4 - rank) * 4 + n * 4));
        const ptsScale = year >= 2010 ? 1 : 0.38;
        const points = Math.round((wins * 28 + podiums * 14 + n * 65) * ptsScale);
        adv = {
          raceWins: wins,
          poles: Math.max(0, poles),
          fastestLaps: Math.max(1, Math.round(wins * 0.65 + n * 3)),
          podiums,
          points,
          dnfRate: +(4.5 + rank * 2.1 + n * 4).toFixed(1),
        };
      } else if (sport === 'tennis') {
        const matches = 65;
        const winRate = rank === 1 ? 0.81 + n * 0.08 : rank === 2 ? 0.74 + n * 0.08 : 0.68 + n * 0.08;
        wins = Math.round(matches * winRate);
        losses = matches - wins;
        elo = Math.round(1905 - (rank - 1) * 45 + n * 55);
        adv = {
          grandSlams: rank === 1 ? Math.round(1 + n * 2.2) : rank === 2 ? Math.round(n * 1.4) : 0,
          masters1000: rank === 1 ? Math.round(3 + n * 4) : Math.round(1 + n * 2.5),
          winPct: +((wins / matches) * 100).toFixed(1),
          acesPerMatch: +(7.5 + n * 5.2).toFixed(1),
          breakPointsConvertedPct: +(39.5 + Math.max(0, 4 - rank) * 1.6 + n * 4).toFixed(1),
        };
      } else if (sport === 'rugby') {
        const matches = entityType === 'club' ? 28 : 9;
        const winRate = rank === 1 ? 0.78 + n * 0.12 : rank === 2 ? 0.66 + n * 0.12 : 0.58 + n * 0.1;
        wins = Math.round(matches * winRate);
        losses = Math.max(0, matches - wins);
        elo = Math.round(1875 - (rank - 1) * 40 + n * 45);
        adv = {
          triesScored: Math.round(matches * (3.1 + Math.max(0, 4 - rank) * 0.4 + n * 0.8)),
          pointsDiff: Math.round(matches * (9 + Math.max(0, 4 - rank) * 4 + n * 5)),
          winPct: +((wins / matches) * 100).toFixed(1),
          tackleSuccessPct: +(86.5 + Math.max(0, 4 - rank) * 1.2 + n * 3.5).toFixed(1),
        };
      } else if (sport === 'handball') {
        const matches = entityType === 'club' ? 20 : 9;
        const winRate = rank === 1 ? 0.82 + n * 0.12 : rank === 2 ? 0.7 + n * 0.1 : 0.62 + n * 0.1;
        wins = Math.round(matches * winRate);
        draws = rank <= 2 ? 1 : 0;
        losses = Math.max(0, matches - wins - draws);
        elo = Math.round(1870 - (rank - 1) * 42 + n * 45);
        adv = {
          goalsFor: Math.round(matches * (31.5 + n * 3.5)),
          efficiencyPct: +(62.5 + Math.max(0, 4 - rank) * 1.8 + n * 4.5).toFixed(1),
          winPct: +((wins / matches) * 100).toFixed(1),
        };
      } else if (sport === 'hockey') {
        const played = entityType === 'club' ? 82 : 8;
        const winRate = rank === 1 ? 0.65 + n * 0.1 : rank === 2 ? 0.58 + n * 0.09 : 0.52 + n * 0.08;
        wins = Math.round(played * winRate);
        draws = entityType === 'club' ? Math.round(6 + n * 6) : 0; // OT losses
        losses = Math.max(0, played - wins - draws);
        const points = wins * 2 + draws;
        const goalsFor = Math.round(played * (3.2 + Math.max(0, 4 - rank) * 0.25 + n * 0.45));
        const goalsAgainst = Math.round(played * (2.5 + rank * 0.15 + n * 0.35));
        elo = Math.round(1885 - (rank - 1) * 40 + n * 48);
        adv = {
          played,
          points,
          goalsFor,
          goalsAgainst,
          goalDiff: goalsFor - goalsAgainst,
          winPct: +((wins / played) * 100).toFixed(1),
        };
      } else if (sport === 'cycling') {
        const races = 45;
        wins = rank === 1 ? Math.round(16 + n * 14) : rank === 2 ? Math.round(10 + n * 8) : Math.round(6 + n * 6);
        losses = Math.max(0, races - wins);
        elo = Math.round(1890 - (rank - 1) * 45 + n * 55);
        adv = {
          stageWins: wins,
          uciPoints: Math.round((rank === 1 ? 18500 : rank === 2 ? 13800 : 10200) + n * 4200),
          grandTours: rank === 1 ? Math.round(1 + n * 1.6) : 0,
        };
      }

      records.push({
        id: `core_${seq++}`,
        year,
        date: `${year}-06-15`,
        sport,
        competition,
        tier,
        entityId,
        entityType,
        countryCode: ent.countryCode,
        rank,
        wins,
        draws,
        losses,
        titles: rank === 1 ? 1 : 0,
        finals: rank <= 2 ? 1 : 0,
        podiums: rank <= 3 ? 1 : 0,
        eloRating: elo,
        advancedStats: adv,
        source: 'core',
      });
    });
  }

  for (const [year, edition, rows] of OLYMPIC_TABLES) {
    rows.forEach(([countryCode, gold, silver, bronze], idx) => {
      const ent = CORE_ENTITIES[countryCode];
      if (!ent) return;
      const totalMedals = gold + silver + bronze;
      const pop = ent.pop || 50;
      const rank = idx + 1;
      records.push({
        id: `core_${seq++}`,
        year,
        date: `${year}-08-10`,
        sport: 'olympics',
        competition: edition,
        tier: 1,
        entityId: countryCode,
        entityType: 'country',
        countryCode,
        rank,
        wins: gold,
        draws: silver,
        losses: Math.max(0, 120 - totalMedals),
        titles: rank === 1 ? 1 : 0,
        finals: rank <= 2 ? 1 : 0,
        podiums: rank <= 3 ? 1 : 0,
        eloRating: Math.round(1960 - idx * 32 + gold * 1.4),
        advancedStats: {
          gold,
          silver,
          bronze,
          totalMedals,
          medalsPerMillionPop: +(totalMedals / pop).toFixed(2),
        },
        source: 'core',
      });
    });
  }

  return records;
}
