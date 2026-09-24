// Meteorological & Tactical Visibility Surveillance Service (Simulated API)
// Provides real-time environmental telemetry for prison security patrols, yard exercise & court escorts

export type WeatherScenarioId = 
  | 'dense_fog' 
  | 'severe_storm' 
  | 'clear_optimal' 
  | 'freezing_rain' 
  | 'extreme_heat' 
  | 'overcast_drizzle';

export interface HourlyWeatherPoint {
  hourOffset: number;
  time: string;
  tempC: number;
  tempF: number;
  visibilityKm: number;
  condition: string;
  conditionLabel: { en: string; fr: string };
  precipitationProb: number;
  yardAdvisory: 'approved' | 'restricted' | 'suspended';
}

export interface WeatherData {
  facilityId: string;
  facilityName: string;
  stationId: string;
  scenarioId: WeatherScenarioId;
  scenarioLabel: { en: string; fr: string };
  timestamp: string;
  condition: string;
  conditionLabel: { en: string; fr: string };
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  visibilityKm: number;
  visibilityMiles: number;
  visibilityStatus: 'optimal' | 'moderate' | 'degraded' | 'critical';
  visibilityLabel: { en: string; fr: string };
  windSpeedKph: number;
  windSpeedMph: number;
  windDirection: string;
  windGustKph: number;
  humidityPercent: number;
  barometricHpa: number;
  precipitationProb: number;
  precipitationType: 'none' | 'rain' | 'snow' | 'freezing_rain' | 'hail';
  uvIndex: number;
  airQualityIndex: number;
  sunrise: string;
  sunset: string;
  hourlyForecast: HourlyWeatherPoint[];
  patrolDirectives: {
    status: 'green' | 'amber' | 'red';
    statusLabel: { en: string; fr: string };
    perimeterPatrolMode: string;
    towerSearchlightsActive: boolean;
    k9PerimeterDeployed: boolean;
    thermalImagingRequired: boolean;
    droneDefenseRisk: 'low' | 'moderate' | 'elevated';
    instructions: { en: string[]; fr: string[] };
  };
  yardDirectives: {
    status: 'approved' | 'restricted' | 'suspended';
    statusLabel: { en: string; fr: string };
    maxInmatesPerYard: number;
    durationMinutes: number;
    locationType: 'outdoor' | 'covered_gym' | 'cell_lockdown';
    rationale: { en: string; fr: string };
  };
  courtTransitDirectives: {
    status: 'normal' | 'heightened' | 'suspended';
    statusLabel: { en: string; fr: string };
    escortRatio: string;
    transitMode: string;
    restraintProtocol: string;
    instructions: { en: string[]; fr: string[] };
  };
}

export interface WeatherPresetInfo {
  id: WeatherScenarioId;
  labelEn: string;
  labelFr: string;
  descriptionEn: string;
  descriptionFr: string;
  badgeColor: string;
}

export const WEATHER_PRESETS: WeatherPresetInfo[] = [
  {
    id: 'dense_fog',
    labelEn: 'Dense Autumn Fog (Low Visibility)',
    labelFr: 'Brouillard Épais d\'Automne (Visibilité Nulle/Critique)',
    descriptionEn: '0.8 km line-of-sight. Yard exercise suspended. Floodlights and thermal imaging required on towers.',
    descriptionFr: 'Visibilité à 0,8 km. Promenade cour suspendue. Projecteurs et caméras thermiques requis aux miradors.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'severe_storm',
    labelEn: 'Severe Thunderstorm & High Winds',
    labelFr: 'Violent Orage & Rafales de Vent',
    descriptionEn: 'Heavy squalls, wind gusts 68 km/h. Perimeter fence alarm triggers likely. Outdoor transits halted.',
    descriptionFr: 'Grosses bourrasques, rafales à 68 km/h. Risque de fausses alertes clôture. Transits extérieurs stoppés.',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  {
    id: 'clear_optimal',
    labelEn: 'Clear Sky & Optimal Surveillance',
    labelFr: 'Ciel Dégagé & Surveillance Optimale',
    descriptionEn: '15 km full visibility. Standard patrol frequency. Normal courtyard yard and court transfers authorized.',
    descriptionFr: 'Visibilité 15 km sans obstacle. Patrouilles normales. Promenade cour et extractions judiciaires autorisées.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'freezing_rain',
    labelEn: 'Freezing Rain & Black Ice Warning',
    labelFr: 'Pluie Verglacante & Alerte Verglas',
    descriptionEn: 'Catwalks and courtyard pavement iced over. Slip hazard during escorts. Indoor gym substitution only.',
    descriptionFr: 'Passerelles et dalles de cour verglacées. Risque de chute en escorte. Substitution gymnase couvert.',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'extreme_heat',
    labelEn: 'Extreme Heat Wave Advisory',
    labelFr: 'Alerte Canicule Extrême',
    descriptionEn: '37°C (feels like 42°C). High risk of agitation. Yard restricted to 30 min with hydration stations.',
    descriptionFr: '37°C (ressenti 42°C). Risque d\'irritabilité en détention. Promenade restreinte à 30 min avec points d\'eau.',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  {
    id: 'overcast_drizzle',
    labelEn: 'Overcast & Intermittent Drizzle',
    labelFr: 'Couvert & Bruine Intermittente',
    descriptionEn: 'Moderate 4.5 km visibility. Rain slick surfaces. Standard yard schedule with rain ponchos authorized.',
    descriptionFr: 'Visibilité modérée 4,5 km. Sols glissants. Programme de cour maintenu avec vestes imperméables.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  }
];

const BASE_WEATHER_DATA: Record<WeatherScenarioId, (facilityId: string) => WeatherData> = {
  dense_fog: (facilityId: string) => ({
    facilityId,
    facilityName: 'Kalyan Central Maximum Security Penitentiary',
    stationId: 'K-PEN-MET-SENSOR-01',
    scenarioId: 'dense_fog',
    scenarioLabel: {
      en: 'Dense Autumn Fog (Low Visibility Alert)',
      fr: 'Brouillard Épais d\'Automne (Alerte Visibilité Réduite)',
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    condition: 'dense_fog',
    conditionLabel: {
      en: 'Dense Radiation Fog & Mist',
      fr: 'Brouillard Épais de Rayonnement & Brume',
    },
    tempC: 8.5,
    tempF: 47.3,
    feelsLikeC: 6.8,
    feelsLikeF: 44.2,
    visibilityKm: 0.8,
    visibilityMiles: 0.5,
    visibilityStatus: 'critical',
    visibilityLabel: {
      en: 'CRITICAL HAZARD (< 1.0 km line-of-sight)',
      fr: 'DANGER CRITIQUE (< 1,0 km ligne de mire)',
    },
    windSpeedKph: 5.2,
    windSpeedMph: 3.2,
    windDirection: 'NE 45° (Calm)',
    windGustKph: 8.0,
    humidityPercent: 96,
    barometricHpa: 1018,
    precipitationProb: 20,
    precipitationType: 'none',
    uvIndex: 1,
    airQualityIndex: 42,
    sunrise: '06:48',
    sunset: '18:52',
    hourlyForecast: [
      {
        hourOffset: 1,
        time: '14:00',
        tempC: 9.2,
        tempF: 48.6,
        visibilityKm: 0.9,
        condition: 'dense_fog',
        conditionLabel: { en: 'Dense Fog', fr: 'Brouillard Épais' },
        precipitationProb: 20,
        yardAdvisory: 'suspended',
      },
      {
        hourOffset: 2,
        time: '15:00',
        tempC: 10.1,
        tempF: 50.2,
        visibilityKm: 1.4,
        condition: 'mist',
        conditionLabel: { en: 'Thinning Mist', fr: 'Brume Légère' },
        precipitationProb: 15,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 3,
        time: '16:00',
        tempC: 10.8,
        tempF: 51.4,
        visibilityKm: 2.8,
        condition: 'overcast',
        conditionLabel: { en: 'Overcast Cloud', fr: 'Couvert' },
        precipitationProb: 10,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 4,
        time: '17:00',
        tempC: 10.2,
        tempF: 50.4,
        visibilityKm: 3.5,
        condition: 'partly_cloudy',
        conditionLabel: { en: 'Partial Clearing', fr: 'Éclaircies' },
        precipitationProb: 10,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 5,
        time: '18:00',
        tempC: 9.0,
        tempF: 48.2,
        visibilityKm: 2.2,
        condition: 'mist_returning',
        conditionLabel: { en: 'Dusk Mist Rebuilding', fr: 'Retour Brume Crépusculaire' },
        precipitationProb: 25,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 6,
        time: '19:00',
        tempC: 7.9,
        tempF: 46.2,
        visibilityKm: 1.1,
        condition: 'dense_fog',
        conditionLabel: { en: 'Night Fog Settlement', fr: 'Brouillard Nocturne' },
        precipitationProb: 30,
        yardAdvisory: 'suspended',
      },
    ],
    patrolDirectives: {
      status: 'red',
      statusLabel: {
        en: 'LEVEL 3 PATROL DIRECTIVE: HIGH BLINDSPOT RISK',
        fr: 'DIRECTIVE PATROUILLE NIVEAU 3 : RISQUE ANGLE MORT ÉLEVÉ',
      },
      perimeterPatrolMode: 'Double-Armed Foot & Mobile Patrol (20-min cycle)',
      towerSearchlightsActive: true,
      k9PerimeterDeployed: true,
      thermalImagingRequired: true,
      droneDefenseRisk: 'low',
      instructions: {
        en: [
          'Guard Towers 1, 2, 3, and 4 must activate high-intensity spotlight sweep sectors continuously.',
          'Guard Tower 2 & 4 thermal FLIR cameras must be locked onto the North perimeter drainage culvert.',
          'Perimeter patrol vehicle must complete circuit with high-beams and amber strobe lights every 15 minutes.',
          'K-9 Handler Officer unit dispatched to Perimeter Sally Port for sensory acoustic tracking.',
          'Anti-climb microwave sensors sensitivity threshold adjusted by +15% due to optical blind spots.'
        ],
        fr: [
          'Les miradors 1, 2, 3 et 4 doivent activer en continu le balayage par projecteurs haute intensité.',
          'Les caméras thermiques FLIR des miradors 2 et 4 doivent être verrouillées sur le canal de drainage Nord.',
          'Le véhicule de ronde périmétrique doit effectuer un circuit avec feux de route et gyrophares toutes les 15 minutes.',
          'L\'équipe cynophile (K-9) est déployée au sas périmétrique pour détection acoustique et olfactive.',
          'Sensibilité des barrières hyperfréquences rehaussée de +15% en raison de l\'absence de visibilité optique.'
        ]
      }
    },
    yardDirectives: {
      status: 'suspended',
      statusLabel: {
        en: 'OUTDOOR EXERCISE SUSPENDED (CUSTODIAL SAFETY CODE 44-B)',
        fr: 'PROMENADE COUR EXTÉRIEURE SUSPENDUE (CODE SÉCURITÉ 44-B)',
      },
      maxInmatesPerYard: 0,
      durationMinutes: 0,
      locationType: 'covered_gym',
      rationale: {
        en: 'Visibility is below 1.0 km mandatory line-of-sight threshold. Guards in towers cannot clearly sight inmates across the main courtyard, creating severe contraband drop & assault vulnerability. Inmates redirected to Indoor Covered Gymnasium in cohorts of 35.',
        fr: 'La visibilité est inférieure au seuil réglementaire de 1,0 km. Les sentinelles en mirador ne peuvent pas surveiller l\'ensemble de la cour, créant un risque critique d\'agression et de parachutage de colis. Incarcérés réorientés vers le gymnase couvert par groupes de 35.'
      }
    },
    courtTransitDirectives: {
      status: 'heightened',
      statusLabel: {
        en: 'HEIGHTENED COURT ESCORT PROTOCOL ACTIVE',
        fr: 'PROTOCOLE EXTRACTION TRIBUNAL RENFORCÉ',
      },
      escortRatio: '2 Officers per 1 Inmate (Armed Chase Car Mandatory)',
      transitMode: 'Enclosed Armored Transport Van with Amber Hazard Beacons (No walking transits)',
      restraintProtocol: 'Full Handcuffs + Leg Irons + Belly Chain with Security Box',
      instructions: {
        en: [
          'No outdoor walking movement between Court Intake Dock and Main Cell Blocks. Secure van shuttles only.',
          'Judicial court departures must wait for perimeter sally port visual clearance from Central Control.',
          'Radio check-in frequency increased from 15 min to every 5 min during highway transport.',
          'Rear escort cruiser with dashboard high-definition optical radar required behind inmate van.'
        ],
        fr: [
          'Aucun déplacement pédestre entre le quai du tribunal et les blocs cellulaires. Navette fourgon blindé obligatoire.',
          'Les départs d\'extractions judiciaires doivent attendre le feu vert visuel du poste de commandement.',
          'Fréquence des vacations radio renforcée : toutes les 5 minutes au lieu de 15 minutes sur trajet.',
          'Véhicule d\'escorte arrière avec radar optique obligatoire derrière le fourgon cellulaire.'
        ]
      }
    }
  }),

  severe_storm: (facilityId: string) => ({
    facilityId,
    facilityName: 'Kalyan Central Maximum Security Penitentiary',
    stationId: 'K-PEN-MET-SENSOR-01',
    scenarioId: 'severe_storm',
    scenarioLabel: {
      en: 'Severe Thunderstorm & High Wind Warning',
      fr: 'Violent Orage & Alerte Bourrasques de Vent',
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    condition: 'thunderstorm',
    conditionLabel: {
      en: 'Heavy Squalls, Lightning & High Winds',
      fr: 'Gros Orages, Foudre & Rafales Violentes',
    },
    tempC: 13.4,
    tempF: 56.1,
    feelsLikeC: 11.0,
    feelsLikeF: 51.8,
    visibilityKm: 1.8,
    visibilityMiles: 1.1,
    visibilityStatus: 'degraded',
    visibilityLabel: {
      en: 'DEGRADED (1.8 km during rain curtains)',
      fr: 'DÉGRADÉE (1,8 km sous les rideaux de pluie)',
    },
    windSpeedKph: 48.0,
    windSpeedMph: 29.8,
    windDirection: 'WNW 295° (Gale Force)',
    windGustKph: 68.5,
    humidityPercent: 92,
    barometricHpa: 994,
    precipitationProb: 95,
    precipitationType: 'rain',
    uvIndex: 0,
    airQualityIndex: 18,
    sunrise: '06:48',
    sunset: '18:52',
    hourlyForecast: [
      {
        hourOffset: 1,
        time: '14:00',
        tempC: 12.8,
        tempF: 55.0,
        visibilityKm: 1.5,
        condition: 'thunderstorm',
        conditionLabel: { en: 'Peak Storm Burst', fr: 'Pic d\'Orage Violent' },
        precipitationProb: 95,
        yardAdvisory: 'suspended',
      },
      {
        hourOffset: 2,
        time: '15:00',
        tempC: 12.0,
        tempF: 53.6,
        visibilityKm: 2.2,
        condition: 'heavy_rain',
        conditionLabel: { en: 'Heavy Downpour', fr: 'Fortes Averses' },
        precipitationProb: 80,
        yardAdvisory: 'suspended',
      },
      {
        hourOffset: 3,
        time: '16:00',
        tempC: 12.5,
        tempF: 54.5,
        visibilityKm: 3.8,
        condition: 'light_rain',
        conditionLabel: { en: 'Scattered Showers', fr: 'Averses Éparses' },
        precipitationProb: 50,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 4,
        time: '17:00',
        tempC: 13.0,
        tempF: 55.4,
        visibilityKm: 5.5,
        condition: 'overcast',
        conditionLabel: { en: 'Winds Subsiding', fr: 'Atténuation du Vent' },
        precipitationProb: 30,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 5,
        time: '18:00',
        tempC: 11.8,
        tempF: 53.2,
        visibilityKm: 6.0,
        condition: 'overcast',
        conditionLabel: { en: 'Overcast Cloud', fr: 'Ciel Couvert' },
        precipitationProb: 20,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 6,
        time: '19:00',
        tempC: 10.9,
        tempF: 51.6,
        visibilityKm: 6.5,
        condition: 'partly_cloudy',
        conditionLabel: { en: 'Night Calm', fr: 'Calme Nocturne' },
        precipitationProb: 15,
        yardAdvisory: 'approved',
      },
    ],
    patrolDirectives: {
      status: 'amber',
      statusLabel: {
        en: 'LEVEL 2 PATROL DIRECTIVE: HIGH WIND FENCE SENSOR ALERT',
        fr: 'DIRECTIVE PATROUILLE NIVEAU 2 : RISQUE FAUSSES ALERTES CLÔTURES',
      },
      perimeterPatrolMode: 'Vehicular Armor-Enclosed Perimeter Sweep (Continuous)',
      towerSearchlightsActive: true,
      k9PerimeterDeployed: false,
      thermalImagingRequired: false,
      droneDefenseRisk: 'low', // High wind prevents drone flights
      instructions: {
        en: [
          'High wind gusts (68 km/h) are expected to cause intermittent vibration false alarms on Zone 3 & 4 razor wire fences. All trips must be physically validated via CCTV or mobile patrol.',
          'Guard Tower walkway access restricted due to slip and lightning hazard. Sentinels must remain inside armored glass cab.',
          'Drone intrusion risk is LOW due to severe crosswinds exceeding rotary wing operating limits.',
          'Courtyard loose equipment (trash receptacles, sports gear) must be tethered or locked inside armory sheds.'
        ],
        fr: [
          'Rafales à 68 km/h susceptibles de provoquer des fausses alarmes vibratoires sur les clôtures barbelées zones 3 et 4. Toute alarme doit être levée visuellement.',
          'Accès aux coursives extérieures des miradors interdit en raison du risque de chute et de foudre. Sentinelles à l\'abri en cabine blindée.',
          'Risque de survol de drone FAIBLE en raison des vents violents dépassant les limites de vol.',
          'Tous les équipements mobiles de la cour (bacs, bancs, poteaux) doivent être sécurisés ou arrimés.'
        ]
      }
    },
    yardDirectives: {
      status: 'suspended',
      statusLabel: {
        en: 'YARD CANCELLED (LIGHTNING & WIND SQUALLS)',
        fr: 'PROMENADE ANNULÉE (FOUDRE & BOURRASQUES)',
      },
      maxInmatesPerYard: 0,
      durationMinutes: 0,
      locationType: 'cell_lockdown',
      rationale: {
        en: 'Active lightning strikes detected within 5 km radius. Extreme wind gusts create projectile hazard and make outdoor tear gas deployment ineffective if a disturbance occurs. All cell tiers remain on lock-in until storm passes.',
        fr: 'Impacts de foudre détectés dans un rayon de 5 km. Les rafales de vent rendent inefficace tout déploiement de gaz lacrymogène en cas d\'émeute. Confinement en cellule maintenu jusqu\'à la fin de l\'alerte.'
      }
    },
    courtTransitDirectives: {
      status: 'suspended',
      statusLabel: {
        en: 'EXTERNAL COURT TRANSITS TEMPORARILY POSTPONED',
        fr: 'EXTRACTIONS JUDICIAIRES TEMPORAIREMENT SUSPENDUES',
      },
      escortRatio: '3:1 Guard Escort with Lead & Chase Cruiser',
      transitMode: 'All departures delayed until lightning squall subsides',
      restraintProtocol: 'Level 4 Mechanical Restraints with Transport Box',
      instructions: {
        en: [
          'All non-urgent court departures delayed by minimum 45 minutes as advised by Highway Patrol.',
          'Emergency medical hospital runs require armed police escort vehicle with sirens and hazard strobe.',
          'Inmates awaiting transfer held in secure Intake Holding Cell 2 with dedicated guard watch.'
        ],
        fr: [
          'Toutes les extractions judiciaires non urgentes sont différées de 45 minutes sur avis de la gendarmerie/police routière.',
          'Les transferts médicaux d\'urgence vers l\'hôpital nécessitent une escorte armée prioritaire.',
          'Détenus en attente retenus en cellule d\'attente sécurisée n°2 avec surveillance directe.'
        ]
      }
    }
  }),

  clear_optimal: (facilityId: string) => ({
    facilityId,
    facilityName: 'Kalyan Central Maximum Security Penitentiary',
    stationId: 'K-PEN-MET-SENSOR-01',
    scenarioId: 'clear_optimal',
    scenarioLabel: {
      en: 'Clear Sky & Optimal Surveillance Conditions',
      fr: 'Ciel Dégagé & Conditions de Surveillance Optimales',
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    condition: 'clear_day',
    conditionLabel: {
      en: 'Clear Skies & Unobstructed Visibility',
      fr: 'Ciel Dégagé & Visibilité Maximale Dégagée',
    },
    tempC: 19.5,
    tempF: 67.1,
    feelsLikeC: 19.5,
    feelsLikeF: 67.1,
    visibilityKm: 16.0,
    visibilityMiles: 10.0,
    visibilityStatus: 'optimal',
    visibilityLabel: {
      en: 'OPTIMAL (> 15 km unobstructed line-of-sight)',
      fr: 'OPTIMALE (> 15 km sans obstacle visuel)',
    },
    windSpeedKph: 12.0,
    windSpeedMph: 7.5,
    windDirection: 'S 180° (Gentle Breeze)',
    windGustKph: 16.0,
    humidityPercent: 48,
    barometricHpa: 1022,
    precipitationProb: 0,
    precipitationType: 'none',
    uvIndex: 4,
    airQualityIndex: 25,
    sunrise: '06:48',
    sunset: '18:52',
    hourlyForecast: [
      {
        hourOffset: 1,
        time: '14:00',
        tempC: 20.2,
        tempF: 68.4,
        visibilityKm: 16.0,
        condition: 'clear',
        conditionLabel: { en: 'Sunny & Clear', fr: 'Ensoleillé' },
        precipitationProb: 0,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 2,
        time: '15:00',
        tempC: 21.0,
        tempF: 69.8,
        visibilityKm: 16.0,
        condition: 'clear',
        conditionLabel: { en: 'Sunny & Clear', fr: 'Ensoleillé' },
        precipitationProb: 0,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 3,
        time: '16:00',
        tempC: 20.8,
        tempF: 69.4,
        visibilityKm: 16.0,
        condition: 'clear',
        conditionLabel: { en: 'Sunny & Clear', fr: 'Ensoleillé' },
        precipitationProb: 0,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 4,
        time: '17:00',
        tempC: 19.5,
        tempF: 67.1,
        visibilityKm: 15.0,
        condition: 'clear',
        conditionLabel: { en: 'Clear Evening', fr: 'Soirée Dégagée' },
        precipitationProb: 0,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 5,
        time: '18:00',
        tempC: 17.8,
        tempF: 64.0,
        visibilityKm: 15.0,
        condition: 'clear',
        conditionLabel: { en: 'Golden Hour Dusk', fr: 'Crépuscule Dégagé' },
        precipitationProb: 0,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 6,
        time: '19:00',
        tempC: 16.2,
        tempF: 61.2,
        visibilityKm: 14.0,
        condition: 'clear_night',
        conditionLabel: { en: 'Starlit Clear Night', fr: 'Nuit Étoilée Dégagée' },
        precipitationProb: 0,
        yardAdvisory: 'suspended', // Night lockdown
      },
    ],
    patrolDirectives: {
      status: 'green',
      statusLabel: {
        en: 'LEVEL 1 PATROL DIRECTIVE: STANDARD OPERATIONAL ROSTER',
        fr: 'DIRECTIVE PATROUILLE NIVEAU 1 : SERVICE ORDINAIRE STANDARD',
      },
      perimeterPatrolMode: 'Routine Perimeter Inspection (Hourly cycle)',
      towerSearchlightsActive: false,
      k9PerimeterDeployed: false,
      thermalImagingRequired: false,
      droneDefenseRisk: 'elevated', // Calm clear skies elevate drone contraband drop attempts!
      instructions: {
        en: [
          'Line of sight is pristine across all 4 watchtowers and exterior perimeter fencing.',
          'ELEVATED DRONE INTRUSION THREAT: Clear calm conditions are favored by external contraband smuggling drones. Towers 1 & 3 must monitor acoustic and RF anti-drone jammers.',
          'Standard sentry coverage with optical 40x telephoto cameras on courtyard perimeter.',
          'Scheduled yard rotations permitted at standard 100% capacity.'
        ],
        fr: [
          'Visibilité parfaite sur l\'ensemble des 4 miradors et des clôtures extérieures.',
          'RISQUE DRONE ÉLEVÉ : Les conditions calmes et ensoleillées favorisent les tentatives de livraison par drone. Miradors 1 et 3 doivent activer la veille anti-drone RF.',
          'Couverture ordinaire avec caméras téléobjectifs 40x sur le périmètre de la cour.',
          'Rotations de promenade autorisées à pleine capacité (100%).'
        ]
      }
    },
    yardDirectives: {
      status: 'approved',
      statusLabel: {
        en: 'STANDARD OUTDOOR RECREATION FULLY AUTHORIZED',
        fr: 'PROMENADE EXTÉRIEURE STANDARD PLEINEMENT AUTORISÉE',
      },
      maxInmatesPerYard: 120,
      durationMinutes: 90,
      locationType: 'outdoor',
      rationale: {
        en: 'Surveillance visibility is optimal at 16 km. Thermal and optical tracking functional. Full yard cohort allowed under standard guard ratio (1 guard per 15 inmates with 2 tower snipers).',
        fr: 'Visibilité optimale à 16 km. Systèmes optiques pleinement opérationnels. Effectif complet de promenade autorisé selon le ratio réglementaire (1 surveillant pour 15 détenus + 2 sentinelles miradors).'
      }
    },
    courtTransitDirectives: {
      status: 'normal',
      statusLabel: {
        en: 'NORMAL JUDICIAL CONVOYS & INTER-BLOCK TRANSFERS',
        fr: 'CONVOIS JUDICIAIRES & MOUVEMENTS INTER-BLOCS STANDARDS',
      },
      escortRatio: '1:1 Standard Escort Ratio with Restraint Belt',
      transitMode: 'Standard Van Transfer or Escorted Courtyard Transit Walkway',
      restraintProtocol: 'Standard Double-Lock Handcuffs with Transport Box',
      instructions: {
        en: [
          'All scheduled court appearances on schedule without meteorological delay.',
          'Inter-block escorted pedestrian foot movements authorized along primary corridor walkways.',
          'Intake sally port operating under routine security protocol.'
        ],
        fr: [
          'Toutes les comparutions au tribunal sont maintenues sans aucun retard météo.',
          'Mouvements pédestres inter-blocs autorisés le long des galeries de circulation centrales.',
          'Sas d\'entrée des véhicules fonctionnant sous protocole standard.'
        ]
      }
    }
  }),

  freezing_rain: (facilityId: string) => ({
    facilityId,
    facilityName: 'Kalyan Central Maximum Security Penitentiary',
    stationId: 'K-PEN-MET-SENSOR-01',
    scenarioId: 'freezing_rain',
    scenarioLabel: {
      en: 'Freezing Rain & Black Ice Hazard Advisory',
      fr: 'Pluie Verglacante & Alerte Verglas Catwalks',
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    condition: 'freezing_rain',
    conditionLabel: {
      en: 'Freezing Drizzle & Glazed Black Ice',
      fr: 'Bruine Glaçante & Verglas sur Passages Extérieurs',
    },
    tempC: -1.2,
    tempF: 29.8,
    feelsLikeC: -5.4,
    feelsLikeF: 22.3,
    visibilityKm: 3.2,
    visibilityMiles: 2.0,
    visibilityStatus: 'moderate',
    visibilityLabel: {
      en: 'MODERATE (3.2 km, heavy surface ice hazard)',
      fr: 'MODÉRÉE (3,2 km, danger sévère de verglas au sol)',
    },
    windSpeedKph: 24.0,
    windSpeedMph: 14.9,
    windDirection: 'N 05° (Freezing North)',
    windGustKph: 36.0,
    humidityPercent: 88,
    barometricHpa: 1012,
    precipitationProb: 75,
    precipitationType: 'freezing_rain',
    uvIndex: 1,
    airQualityIndex: 20,
    sunrise: '07:12',
    sunset: '17:40',
    hourlyForecast: [
      {
        hourOffset: 1,
        time: '14:00',
        tempC: -1.0,
        tempF: 30.2,
        visibilityKm: 3.0,
        condition: 'freezing_rain',
        conditionLabel: { en: 'Active Freezing Rain', fr: 'Pluie Glaçante' },
        precipitationProb: 75,
        yardAdvisory: 'suspended',
      },
      {
        hourOffset: 2,
        time: '15:00',
        tempC: -0.8,
        tempF: 30.5,
        visibilityKm: 3.5,
        condition: 'sleet',
        conditionLabel: { en: 'Sleet / Ice Pellets', fr: 'Grésil' },
        precipitationProb: 65,
        yardAdvisory: 'suspended',
      },
      {
        hourOffset: 3,
        time: '16:00',
        tempC: -0.5,
        tempF: 31.1,
        visibilityKm: 4.0,
        condition: 'overcast',
        conditionLabel: { en: 'Icy Catwalks', fr: 'Passerelles Gelées' },
        precipitationProb: 40,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 4,
        time: '17:00',
        tempC: -1.5,
        tempF: 29.3,
        visibilityKm: 3.8,
        condition: 'freezing_fog',
        conditionLabel: { en: 'Freezing Fog', fr: 'Brouillard Givrant' },
        precipitationProb: 30,
        yardAdvisory: 'suspended',
      },
      {
        hourOffset: 5,
        time: '18:00',
        tempC: -2.4,
        tempF: 27.7,
        visibilityKm: 3.0,
        condition: 'freezing_fog',
        conditionLabel: { en: 'Night Hard Freeze', fr: 'Gelée Sévère' },
        precipitationProb: 20,
        yardAdvisory: 'suspended',
      },
      {
        hourOffset: 6,
        time: '19:00',
        tempC: -3.2,
        tempF: 26.2,
        visibilityKm: 2.8,
        condition: 'freezing_fog',
        conditionLabel: { en: 'Sub-Zero Freeze', fr: 'Gel Profond' },
        precipitationProb: 15,
        yardAdvisory: 'suspended',
      },
    ],
    patrolDirectives: {
      status: 'amber',
      statusLabel: {
        en: 'LEVEL 2 PATROL DIRECTIVE: SURFACE SLIP & ICE HAZARDS',
        fr: 'DIRECTIVE PATROUILLE NIVEAU 2 : RISQUE CHUTES & VERGLAS',
      },
      perimeterPatrolMode: 'Vehicular 4x4 with Tire Chains Only (No solo foot patrols)',
      towerSearchlightsActive: true,
      k9PerimeterDeployed: false,
      thermalImagingRequired: false,
      droneDefenseRisk: 'low',
      instructions: {
        en: [
          'Guard tower metal staircases and catwalks are heavily glazed with ice. Handrails and non-slip cleat footwear required.',
          'Facility Engineering team dispatched to salt exterior perimeter gate rails and inmate transfer corridors.',
          'Perimeter fence motion wires may flag ice accumulation weight warnings (automatic false-alarm bypass protocol approved for zone 2).'
        ],
        fr: [
          'Les escaliers métalliques et passerelles des miradors sont verglacés. Crampons et maintien des rampes obligatoires.',
          'L\'équipe technique pénitentiaire doit épandre du sel sur les rails de portails et les couloirs de circulation.',
          'Les câbles de détection périmétriques peuvent signaler des surcharges de givre (procédure de filtrage zone 2 activée).'
        ]
      }
    },
    yardDirectives: {
      status: 'suspended',
      statusLabel: {
        en: 'YARD SUSPENDED (BLACK ICE SLIP & FALL LIABILITY)',
        fr: 'PROMENADE EXTÉRIEURE SUSPENDUE (RISQUE DE CHUTE VERGLAS)',
      },
      maxInmatesPerYard: 0,
      durationMinutes: 0,
      locationType: 'covered_gym',
      rationale: {
        en: 'Courtyard asphalt is completely covered in black ice. Multiple slip injuries likely and physical restraint intervention on ice creates unacceptable guard safety risk. Shifted to indoor gymnasium recreation only.',
        fr: 'Le bitume de la cour est recouvert de verglas vif. Risque élevé de fractures et impossibilité d\'effectuer des maîtrises physiques au sol en sécurité. Délocalisation vers le gymnase fermé.'
      }
    },
    courtTransitDirectives: {
      status: 'heightened',
      statusLabel: {
        en: 'HEIGHTENED ESCORT SAFETY (SLIP & ICE RESTRAINTS)',
        fr: 'SÉCURITÉ D\'ESCORTE RENFORCÉE (RISQUE SOL GLISSANT)',
      },
      escortRatio: '2:1 Escort Ratio with Two Supporting Officers on Flanks',
      transitMode: 'Direct Covered Sally Port Vehicle Boarding Only (No courtyard walks)',
      restraintProtocol: 'Handcuffs with Extended Chain Spacing to Allow Inmate Balance',
      instructions: {
        en: [
          'No outdoor foot transits between hospital/court and main cell house.',
          'Escort vehicles must maintain 3x stopping distance on icy roads.',
          'Officers must physically hold inmate elbows during boarding to prevent intentional falls or feigned slips.'
        ],
        fr: [
          'Aucun mouvement à pied à découvert entre les cellules et le tribunal.',
          'Véhicules d\'escorte : distance de sécurité triplée sur routes verglacées.',
          'Les agents doivent maintenir fermement les bras du détenu à la montée du fourgon pour parer à toute simulation de chute.'
        ]
      }
    }
  }),

  extreme_heat: (facilityId: string) => ({
    facilityId,
    facilityName: 'Kalyan Central Maximum Security Penitentiary',
    stationId: 'K-PEN-MET-SENSOR-01',
    scenarioId: 'extreme_heat',
    scenarioLabel: {
      en: 'Extreme Heat Wave Advisory (Heat Index 41°C)',
      fr: 'Alerte Canicule Sévère (Indice Chaleur 41°C)',
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    condition: 'heat_wave',
    conditionLabel: {
      en: 'Excessive Heat & Oppressive Humidity',
      fr: 'Chaleur Accablante & Humidité Élevée',
    },
    tempC: 37.8,
    tempF: 100.0,
    feelsLikeC: 42.5,
    feelsLikeF: 108.5,
    visibilityKm: 9.0,
    visibilityMiles: 5.6,
    visibilityStatus: 'optimal',
    visibilityLabel: {
      en: 'OPTIMAL (9.0 km, heat shimmer across asphalt)',
      fr: 'OPTIMALE (9,0 km, mirage thermique sur le bitume)',
    },
    windSpeedKph: 8.0,
    windSpeedMph: 5.0,
    windDirection: 'SSE 160° (Stifling)',
    windGustKph: 12.0,
    humidityPercent: 62,
    barometricHpa: 1009,
    precipitationProb: 5,
    precipitationType: 'none',
    uvIndex: 10,
    airQualityIndex: 78,
    sunrise: '05:54',
    sunset: '20:18',
    hourlyForecast: [
      {
        hourOffset: 1,
        time: '14:00',
        tempC: 38.2,
        tempF: 100.8,
        visibilityKm: 9.0,
        condition: 'heat_wave',
        conditionLabel: { en: 'Peak Heat Index', fr: 'Pic de Chaleur' },
        precipitationProb: 5,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 2,
        time: '15:00',
        tempC: 38.5,
        tempF: 101.3,
        visibilityKm: 8.5,
        condition: 'heat_wave',
        conditionLabel: { en: 'Oppressive Heat', fr: 'Chaleur Suffocante' },
        precipitationProb: 5,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 3,
        time: '16:00',
        tempC: 37.9,
        tempF: 100.2,
        visibilityKm: 9.0,
        condition: 'heat_wave',
        conditionLabel: { en: 'High Temperature', fr: 'Forte Température' },
        precipitationProb: 10,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 4,
        time: '17:00',
        tempC: 36.4,
        tempF: 97.5,
        visibilityKm: 9.5,
        condition: 'sunny',
        conditionLabel: { en: 'Slow Cooling', fr: 'Baisse Lente' },
        precipitationProb: 10,
        yardAdvisory: 'restricted',
      },
      {
        hourOffset: 5,
        time: '18:00',
        tempC: 34.2,
        tempF: 93.6,
        visibilityKm: 10.0,
        condition: 'sunny',
        conditionLabel: { en: 'Dusk Heat Retained', fr: 'Chaleur Résiduelle' },
        precipitationProb: 10,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 6,
        time: '19:00',
        tempC: 32.0,
        tempF: 89.6,
        visibilityKm: 10.0,
        condition: 'warm_night',
        conditionLabel: { en: 'Warm Night', fr: 'Nuit Chaude' },
        precipitationProb: 5,
        yardAdvisory: 'approved',
      },
    ],
    patrolDirectives: {
      status: 'amber',
      statusLabel: {
        en: 'LEVEL 2 PATROL DIRECTIVE: HEAT STRESS & AGITATION RISK',
        fr: 'DIRECTIVE PATROUILLE NIVEAU 2 : STRESS THERMIQUE & AGITATION',
      },
      perimeterPatrolMode: 'Air-Conditioned Cruiser Patrol (30-min officer rotation)',
      towerSearchlightsActive: false,
      k9PerimeterDeployed: false, // K-9 paws vulnerable to hot tarmac
      thermalImagingRequired: false,
      droneDefenseRisk: 'elevated',
      instructions: {
        en: [
          'Guard tower sentinels must rotate every 60 minutes due to heat exhaustion in enclosed glass structures.',
          'K-9 patrols restricted from asphalt surfaces during peak sun to prevent canine paw burns.',
          'Cell block temperatures elevated: monitor tiers for temperature-induced aggressive behavior and medical heat distress.'
        ],
        fr: [
          'Relève des sentinelles en mirador toutes les 60 minutes en raison de la surchauffe des cabines vitrées.',
          'Interdiction d\'engager les chiens (K-9) sur le bitume brûlant pour éviter les brûlures de coussinets.',
          'Surveiller l\'irritabilité et les altercations en détention causées par la chaleur étouffante des coursives.'
        ]
      }
    },
    yardDirectives: {
      status: 'restricted',
      statusLabel: {
        en: 'YARD RESTRICTED (30-MIN MAX WITH HYDRATION STATIONS)',
        fr: 'PROMENADE RESTREINTE (30 MIN MAX AVEC POINTS D\'HYDRATATION)',
      },
      maxInmatesPerYard: 50,
      durationMinutes: 30,
      locationType: 'outdoor',
      rationale: {
        en: 'Ambient temperature exceeds 37°C. Direct sun exposure risks severe heat stroke. Yard periods halved from 60 min to 30 min. Shaded water barrels and medical infirmary nurse on standby.',
        fr: 'Température supérieure à 37°C. Risque de coup de chaleur en plein soleil. Durée de cour réduite de moitié (30 min). Ravitaillement continu en eau fraîche et présence infirmière requise.'
      }
    },
    courtTransitDirectives: {
      status: 'normal',
      statusLabel: {
        en: 'NORMAL TRANSIT (AIR-CONDITIONED VANS REQUIRED)',
        fr: 'TRANSIT NORMAL (FOURGONS CLIMATISÉS EXIGÉS)',
      },
      escortRatio: '1:1 Standard Escort Ratio',
      transitMode: 'High-Capacity Air-Conditioned Prisoner Transport Vans Only',
      restraintProtocol: 'Standard Mechanical Restraints (Check for metal overheating)',
      instructions: {
        en: [
          'Prisoner transport vans must pre-cool cabins with A/C running 10 minutes prior to boarding.',
          'Bottled water distribution required for any court transits exceeding 30 minutes duration.'
        ],
        fr: [
          'Climatisation des fourgons cellulaires activée 10 minutes avant l\'embarquement des détenus.',
          'Distribution d\'eau obligatoire pour tout convoi judiciaire dépassant 30 minutes de trajet.'
        ]
      }
    }
  }),

  overcast_drizzle: (facilityId: string) => ({
    facilityId,
    facilityName: 'Kalyan Central Maximum Security Penitentiary',
    stationId: 'K-PEN-MET-SENSOR-01',
    scenarioId: 'overcast_drizzle',
    scenarioLabel: {
      en: 'Overcast & Intermittent Drizzle',
      fr: 'Couvert & Bruine Intermittente',
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    condition: 'overcast_drizzle',
    conditionLabel: {
      en: 'Low Stratus Cloud & Light Mist Drizzle',
      fr: 'Nuages Bas & Bruine Humide',
    },
    tempC: 14.1,
    tempF: 57.4,
    feelsLikeC: 13.0,
    feelsLikeF: 55.4,
    visibilityKm: 4.8,
    visibilityMiles: 3.0,
    visibilityStatus: 'moderate',
    visibilityLabel: {
      en: 'MODERATE (4.8 km, clear perimeter camera views)',
      fr: 'MODÉRÉE (4,8 km, visibilité caméras dégagée)',
    },
    windSpeedKph: 15.0,
    windSpeedMph: 9.3,
    windDirection: 'SW 220°',
    windGustKph: 20.0,
    humidityPercent: 82,
    barometricHpa: 1015,
    precipitationProb: 45,
    precipitationType: 'rain',
    uvIndex: 2,
    airQualityIndex: 30,
    sunrise: '06:48',
    sunset: '18:52',
    hourlyForecast: [
      {
        hourOffset: 1,
        time: '14:00',
        tempC: 14.5,
        tempF: 58.1,
        visibilityKm: 4.5,
        condition: 'drizzle',
        conditionLabel: { en: 'Light Drizzle', fr: 'Bruine Légère' },
        precipitationProb: 45,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 2,
        time: '15:00',
        tempC: 15.0,
        tempF: 59.0,
        visibilityKm: 5.0,
        condition: 'overcast',
        conditionLabel: { en: 'Overcast', fr: 'Couvert' },
        precipitationProb: 30,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 3,
        time: '16:00',
        tempC: 14.8,
        tempF: 58.6,
        visibilityKm: 5.5,
        condition: 'overcast',
        conditionLabel: { en: 'Overcast', fr: 'Couvert' },
        precipitationProb: 25,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 4,
        time: '17:00',
        tempC: 14.0,
        tempF: 57.2,
        visibilityKm: 5.2,
        condition: 'overcast',
        conditionLabel: { en: 'Cloudy Evening', fr: 'Soirée Nuageuse' },
        precipitationProb: 20,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 5,
        time: '18:00',
        tempC: 13.2,
        tempF: 55.8,
        visibilityKm: 4.8,
        condition: 'mist',
        conditionLabel: { en: 'Dusk Mist', fr: 'Brume Crépusculaire' },
        precipitationProb: 25,
        yardAdvisory: 'approved',
      },
      {
        hourOffset: 6,
        time: '19:00',
        tempC: 12.5,
        tempF: 54.5,
        visibilityKm: 4.2,
        condition: 'overcast',
        conditionLabel: { en: 'Overcast Night', fr: 'Nuit Couverte' },
        precipitationProb: 30,
        yardAdvisory: 'suspended',
      },
    ],
    patrolDirectives: {
      status: 'green',
      statusLabel: {
        en: 'LEVEL 1 PATROL DIRECTIVE: STANDARD WET-WEATHER PROCEDURES',
        fr: 'DIRECTIVE PATROUILLE NIVEAU 1 : PROCÉDURE PLUIE STANDARD',
      },
      perimeterPatrolMode: 'Routine Perimeter Inspection with Wet Gear',
      towerSearchlightsActive: false,
      k9PerimeterDeployed: false,
      thermalImagingRequired: false,
      droneDefenseRisk: 'moderate',
      instructions: {
        en: [
          'Optical perimeter sightlines are acceptable at 4.8 km.',
          'Officers on yard duty authorized waterproof security high-visibility parkas.',
          'Perimeter infrared motion beams functioning at 100% nominal threshold.'
        ],
        fr: [
          'Visibilité périmétrique satisfaisante à 4,8 km.',
          'Surveillants de cour autorisés à porter les parkas haute visibilité imperméables.',
          'Faisceaux infrarouges de détection fonctionnant au seuil nominal (100%).'
        ]
      }
    },
    yardDirectives: {
      status: 'approved',
      statusLabel: {
        en: 'OUTDOOR EXERCISE AUTHORIZED WITH RAIN PONCHOS',
        fr: 'PROMENADE EXTÉRIEURE MAINTENUE AVEC VESTES DE PLUIE',
      },
      maxInmatesPerYard: 90,
      durationMinutes: 60,
      locationType: 'outdoor',
      rationale: {
        en: 'Light drizzle does not obstruct watchtower lines of sight. Courtyard pavement is wet but not icy. Inmates permitted outdoor recreation with issued rain jackets.',
        fr: 'La bruine légère n\'entrave pas la vue depuis les miradors. Le bitume est humide mais non glissant. Détenus autorisés à sortir avec leurs imperméables de dotation.'
      }
    },
    courtTransitDirectives: {
      status: 'normal',
      statusLabel: {
        en: 'STANDARD COURT CONVOYS',
        fr: 'CONVOIS JUDICIAIRES STANDARDS',
      },
      escortRatio: '1:1 Standard Guard Escort',
      transitMode: 'Standard Armed Transport Van',
      restraintProtocol: 'Standard Mechanical Restraints',
      instructions: {
        en: [
          'Routine vehicle maintenance check (windshield wipers & tires) before court departure.',
          'Standard radio protocol and GPS tracking active.'
        ],
        fr: [
          'Vérification ordinaire des essuie-glaces et pneumatiques avant départ tribunal.',
          'Protocole radio et balise GPS actifs.'
        ]
      }
    }
  })
};

// Simulated Telemetry API with realistic network delay
export async function fetchCurrentWeather(
  facilityId = 'fac-01', 
  scenarioId: WeatherScenarioId = 'dense_fog'
): Promise<WeatherData> {
  // Simulate API network latency (400ms)
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const generator = BASE_WEATHER_DATA[scenarioId] || BASE_WEATHER_DATA.dense_fog;
  const data = generator(facilityId);
  
  // Inject micro-variations to make telemetry feel organic
  const jitter = (Math.random() - 0.5) * 0.4;
  data.tempC = Math.round((data.tempC + jitter) * 10) / 10;
  data.tempF = Math.round(((data.tempC * 9 / 5) + 32) * 10) / 10;
  data.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  return data;
}
