// All Indian Tier-1, Tier-2, and Metro cities with zone data

export const CITIES = [
  // ── Tier-1 / Metro ────────────────────────────────────────────────────────
  { id: 'delhi_ncr',  name: 'Delhi NCR',     lat: 28.565, lon: 77.190, zoom: 11, tier: 1, state: 'Delhi' },
  { id: 'mumbai',     name: 'Mumbai',         lat: 19.076, lon: 72.877, zoom: 11, tier: 1, state: 'Maharashtra' },
  { id: 'bengaluru',  name: 'Bengaluru',      lat: 12.972, lon: 77.595, zoom: 11, tier: 1, state: 'Karnataka' },
  { id: 'chennai',    name: 'Chennai',         lat: 13.083, lon: 80.270, zoom: 11, tier: 1, state: 'Tamil Nadu' },
  { id: 'kolkata',    name: 'Kolkata',         lat: 22.573, lon: 88.364, zoom: 11, tier: 1, state: 'West Bengal' },
  { id: 'hyderabad',  name: 'Hyderabad',       lat: 17.385, lon: 78.487, zoom: 11, tier: 1, state: 'Telangana' },
  { id: 'pune',       name: 'Pune',            lat: 18.521, lon: 73.856, zoom: 11, tier: 1, state: 'Maharashtra' },
  { id: 'ahmedabad',  name: 'Ahmedabad',       lat: 23.023, lon: 72.572, zoom: 11, tier: 1, state: 'Gujarat' },
  // ── Tier-2 ────────────────────────────────────────────────────────────────
  { id: 'jaipur',     name: 'Jaipur',          lat: 26.913, lon: 75.787, zoom: 12, tier: 2, state: 'Rajasthan' },
  { id: 'lucknow',    name: 'Lucknow',         lat: 26.847, lon: 80.947, zoom: 12, tier: 2, state: 'UP' },
  { id: 'surat',      name: 'Surat',           lat: 21.170, lon: 72.831, zoom: 12, tier: 2, state: 'Gujarat' },
  { id: 'kanpur',     name: 'Kanpur',          lat: 26.449, lon: 80.332, zoom: 12, tier: 2, state: 'UP' },
  { id: 'nagpur',     name: 'Nagpur',          lat: 21.146, lon: 79.089, zoom: 12, tier: 2, state: 'Maharashtra' },
  { id: 'indore',     name: 'Indore',          lat: 22.719, lon: 75.858, zoom: 12, tier: 2, state: 'MP' },
  { id: 'bhopal',     name: 'Bhopal',          lat: 23.259, lon: 77.413, zoom: 12, tier: 2, state: 'MP' },
  { id: 'patna',      name: 'Patna',           lat: 25.594, lon: 85.138, zoom: 12, tier: 2, state: 'Bihar' },
  { id: 'vadodara',   name: 'Vadodara',        lat: 22.308, lon: 73.181, zoom: 12, tier: 2, state: 'Gujarat' },
  { id: 'coimbatore', name: 'Coimbatore',      lat: 11.017, lon: 76.955, zoom: 12, tier: 2, state: 'Tamil Nadu' },
  { id: 'kochi',      name: 'Kochi',           lat: 9.966,  lon: 76.281, zoom: 12, tier: 2, state: 'Kerala' },
  { id: 'chandigarh', name: 'Chandigarh',      lat: 30.734, lon: 76.779, zoom: 12, tier: 2, state: 'Punjab' },
  { id: 'visakhapatnam', name: 'Visakhapatnam',lat: 17.687, lon: 83.218, zoom: 12, tier: 2, state: 'AP' },
  { id: 'bhubaneswar',name: 'Bhubaneswar',     lat: 20.296, lon: 85.824, zoom: 12, tier: 2, state: 'Odisha' },
]

// ── Delhi NCR zones (detailed) ──────────────────────────────────────────────
export const DELHI_ZONES = [
  { id:'connaught_place', name:'Connaught Place', lat:28.6315, lon:77.2167, reg:'Central', type:'CBD',         base:110, peak:1.85 },
  { id:'karol_bagh',       name:'Karol Bagh',      lat:28.6510, lon:77.1900, reg:'Central', type:'Commercial',  base:75,  peak:1.55 },
  { id:'paharganj',        name:'Paharganj',        lat:28.6444, lon:77.2100, reg:'Central', type:'Mixed',       base:55,  peak:1.30 },
  { id:'lajpat_nagar',     name:'Lajpat Nagar',     lat:28.5680, lon:77.2440, reg:'South',   type:'Commercial',  base:65,  peak:1.40 },
  { id:'saket',            name:'Saket',            lat:28.5270, lon:77.2190, reg:'South',   type:'Mixed',       base:80,  peak:1.45 },
  { id:'hauz_khas',        name:'Hauz Khas',        lat:28.5494, lon:77.2001, reg:'South',   type:'Mixed',       base:58,  peak:1.20 },
  { id:'nehru_place',      name:'Nehru Place',      lat:28.5491, lon:77.2516, reg:'South',   type:'CBD',         base:70,  peak:1.50 },
  { id:'south_ex',         name:'South Extension',  lat:28.5680, lon:77.2290, reg:'South',   type:'Commercial',  base:62,  peak:1.35 },
  { id:'dwarka',           name:'Dwarka',           lat:28.5921, lon:77.0595, reg:'West',    type:'Residential', base:68,  peak:1.10 },
  { id:'janakpuri',        name:'Janakpuri',        lat:28.6270, lon:77.0830, reg:'West',    type:'Residential', base:52,  peak:1.05 },
  { id:'rajouri_garden',   name:'Rajouri Garden',   lat:28.6476, lon:77.1202, reg:'West',    type:'Commercial',  base:60,  peak:1.25 },
  { id:'igi_airport',      name:'IGI Airport',      lat:28.5562, lon:77.1000, reg:'West',    type:'Transit',     base:95,  peak:1.80 },
  { id:'rohini',           name:'Rohini',           lat:28.7490, lon:77.0670, reg:'North',   type:'Residential', base:55,  peak:0.95 },
  { id:'pitampura',        name:'Pitampura',        lat:28.7021, lon:77.1310, reg:'North',   type:'Residential', base:48,  peak:1.00 },
  { id:'azadpur',          name:'Azadpur',          lat:28.7060, lon:77.1790, reg:'North',   type:'Mixed',       base:42,  peak:1.05 },
  { id:'laxmi_nagar',      name:'Laxmi Nagar',      lat:28.6330, lon:77.2790, reg:'East',    type:'Residential', base:50,  peak:1.10 },
  { id:'preet_vihar',      name:'Preet Vihar',      lat:28.6440, lon:77.2960, reg:'East',    type:'Mixed',       base:45,  peak:1.05 },
  { id:'cyber_city',       name:'Cyber City',       lat:28.4950, lon:77.0880, reg:'Gurgaon', type:'CBD',         base:120, peak:2.00 },
  { id:'mg_road_gurugram', name:'MG Road Gurugram', lat:28.4759, lon:77.0767, reg:'Gurgaon', type:'Mixed',       base:85,  peak:1.65 },
  { id:'sohna_road',       name:'Sohna Road',       lat:28.4280, lon:77.0500, reg:'Gurgaon', type:'Residential', base:55,  peak:1.10 },
  { id:'golf_course_road', name:'Golf Course Rd',   lat:28.4578, lon:77.1022, reg:'Gurgaon', type:'Mixed',       base:72,  peak:1.40 },
  { id:'udyog_vihar',      name:'Udyog Vihar',      lat:28.5040, lon:77.0680, reg:'Gurgaon', type:'Industrial',  base:65,  peak:1.55 },
  { id:'noida_sector18',   name:'Noida Sec 18',     lat:28.5700, lon:77.3200, reg:'Noida',   type:'Mixed',       base:90,  peak:1.60 },
  { id:'noida_sector62',   name:'Noida Sec 62',     lat:28.6270, lon:77.3660, reg:'Noida',   type:'CBD',         base:75,  peak:1.45 },
  { id:'noida_expressway', name:'Noida Expressway', lat:28.5034, lon:77.3994, reg:'Noida',   type:'Mixed',       base:60,  peak:1.20 },
  { id:'greater_noida',    name:'Greater Noida',    lat:28.4744, lon:77.5040, reg:'Noida',   type:'Mixed',       base:45,  peak:0.90 },
  { id:'faridabad_nhpc',   name:'Faridabad',        lat:28.4100, lon:77.3100, reg:'Faridabad',type:'Industrial', base:50,  peak:1.00 },
  { id:'vaishali',         name:'Vaishali',         lat:28.6450, lon:77.3400, reg:'Ghaziabad',type:'Residential',base:62, peak:1.15 },
  { id:'indirapuram',      name:'Indirapuram',      lat:28.6700, lon:77.3640, reg:'Ghaziabad',type:'Residential',base:58, peak:1.10 },
  { id:'raj_nagar_ext',    name:'Raj Nagar Ext',    lat:28.6924, lon:77.4440, reg:'Ghaziabad',type:'Residential',base:38, peak:0.90 },
]

// Generic zone generator for other cities
export function generateCityZones(cityId, centerLat, centerLon) {
  const templates = [
    { suffix: 'cbd',       name: 'Central Business District', type: 'CBD',         base: 100, peak: 1.8 },
    { suffix: 'airport',   name: 'Airport Area',              type: 'Transit',     base: 90,  peak: 1.7 },
    { suffix: 'it_hub',    name: 'IT Hub',                    type: 'CBD',         base: 110, peak: 1.9 },
    { suffix: 'mall_zone', name: 'Mall Zone',                 type: 'Commercial',  base: 80,  peak: 1.5 },
    { suffix: 'station',   name: 'Railway Station',           type: 'Transit',     base: 95,  peak: 2.0 },
    { suffix: 'north_res', name: 'North Residential',         type: 'Residential', base: 50,  peak: 1.0 },
    { suffix: 'south_res', name: 'South Residential',         type: 'Residential', base: 48,  peak: 0.95 },
    { suffix: 'old_city',  name: 'Old City',                  type: 'Mixed',       base: 70,  peak: 1.4 },
    { suffix: 'suburb_e',  name: 'East Suburbs',              type: 'Residential', base: 40,  peak: 0.85 },
    { suffix: 'suburb_w',  name: 'West Suburbs',              type: 'Residential', base: 42,  peak: 0.88 },
    { suffix: 'uni_zone',  name: 'University Zone',           type: 'Mixed',       base: 55,  peak: 1.1 },
    { suffix: 'industrial',name: 'Industrial Area',           type: 'Industrial',  base: 60,  peak: 1.3 },
  ]
  const offsets = [
    [0,0], [-.06,-.04], [.05,.06], [-.04,.07], [.07,-.05],
    [-.09,.0], [.08,.0], [.0,.10], [.0,-.10], [-.08,-.08],
    [.09,.09], [-.05,.09]
  ]
  return templates.map((t, i) => ({
    id:   `${cityId}_${t.suffix}`,
    name: t.name,
    lat:  centerLat + offsets[i][0],
    lon:  centerLon + offsets[i][1],
    reg:  cityId.charAt(0).toUpperCase() + cityId.slice(1),
    type: t.type,
    base: t.base,
    peak: t.peak,
  }))
}

// Demand profiles — 24-hour hourly factors
export const DEMAND_PROFILES = {
  CBD:         [.18,.12,.09,.08,.12,.25,.55,.88,.98,.84,.72,.76,.80,.74,.70,.72,.84,.95,.90,.76,.64,.52,.40,.26],
  Commercial:  [.16,.10,.08,.07,.10,.20,.40,.68,.76,.70,.74,.84,.92,.88,.80,.78,.84,.88,.82,.74,.66,.56,.44,.26],
  Mixed:       [.17,.11,.08,.07,.11,.22,.45,.75,.85,.74,.70,.76,.84,.78,.72,.74,.82,.90,.84,.72,.62,.50,.38,.24],
  Residential: [.22,.16,.12,.10,.15,.28,.52,.74,.72,.58,.52,.55,.60,.55,.50,.54,.68,.78,.82,.78,.72,.65,.55,.36],
  Transit:     [.60,.55,.50,.52,.58,.65,.72,.82,.85,.82,.78,.80,.82,.80,.78,.80,.84,.88,.90,.86,.80,.74,.70,.65],
  Industrial:  [.10,.07,.05,.04,.08,.20,.65,.92,.98,.88,.72,.62,.70,.68,.65,.68,.90,.95,.82,.52,.36,.26,.18,.12],
}

export const REG_COLORS = {
  Central: '#c4beff', South: '#4af0c4', West: '#ffa06e', North: '#4db8ff',
  East: '#f0cc44', Gurgaon: '#ff6e9c', Noida: '#36d68a', Ghaziabad: '#a0c4ff',
  Faridabad: '#ffb340',
}
