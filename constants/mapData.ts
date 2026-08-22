export type POIType = 'police' | 'hospital' | 'women_safety' | 'transit_shelter'

export interface SafetyPOI {
  id: string
  name: string
  type: POIType
  lat: number
  lng: number
  phone: string
  address: string
  openHours: string
  verified: boolean
  emergencyServices: string[]
}

export interface RouteCoordinate {
  lat: number
  lng: number
}

export interface SafeRouteData {
  id: string
  title: string
  score: number
  time: string
  distance: string
  desc: string
  tone: 'safe' | 'warn' | 'danger'
  lightingScore: number
  cctvDensity: string
  incidentDensity: string
  safePointsCount: number
  coordinates: RouteCoordinate[]
}

// Comprehensive Guwahati & Assam Safety POIs (Hospitals, Police, Women Helplines, Safe Shelters)
export const SAFETY_POIS: SafetyPOI[] = [
  // -------------------------------------------------------------
  // 🚓 POLICE STATIONS & WOMEN SAFETY DESKS
  // -------------------------------------------------------------
  {
    id: 'poi-p-maligaon',
    name: 'Maligaon Police Station / Outpost',
    type: 'police',
    lat: 26.1595,
    lng: 91.7015,
    phone: '112 / +91 361 2570144',
    address: 'Maligaon Chariali, Near Railway HQ, Guwahati 781011',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Railway Transit Patrol', '24/7 Emergency Response', 'Women Safety Desk'],
  },
  {
    id: 'poi-p-gorchuk',
    name: 'Gorchuk (Garchuk) Police Station',
    type: 'police',
    lat: 26.119,
    lng: 91.729,
    phone: '112 / +91 361 2270100',
    address: 'Garchuk, NH-37, Near ISBT Betkuchi, Guwahati 781035',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Highway Emergency Patrol', 'Quick Response Team', '24/7 Control Room'],
  },
  {
    id: 'poi-p-bharalu',
    name: 'Bharalumukh Police Station',
    type: 'police',
    lat: 26.176,
    lng: 91.734,
    phone: '112 / +91 361 2540263',
    address: 'Bharalumukh, MG Road, Guwahati 781009',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Riverfront Patrol', 'Night Mobile Van', 'First Responder Unit'],
  },
  {
    id: 'poi-p-fatasil',
    name: 'Fatasil Ambari Police Station',
    type: 'police',
    lat: 26.158,
    lng: 91.738,
    phone: '112 / +91 361 2471412',
    address: 'Fatasil Ambari, AK Azad Road, Guwahati 781025',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Community Patrol Unit', 'Emergency SOS Response'],
  },
  {
    id: 'poi-p1',
    name: 'All Women Police Station Panbazar',
    type: 'women_safety',
    lat: 26.188,
    lng: 91.746,
    phone: '1091 / +91 361 2540108',
    address: 'Panbazar, Guwahati, Assam 781001',
    openHours: '24/7 Dedicated Women Helpline & Safety Hub',
    verified: true,
    emergencyServices: ['Women Helpdesk', 'Immediate Patrol Response', 'Legal & Counseling Assistance'],
  },
  {
    id: 'poi-p2',
    name: 'Dispur Police Station',
    type: 'police',
    lat: 26.142,
    lng: 91.7915,
    phone: '112 / +91 361 2261510',
    address: 'Ganeshguri, Dispur, Guwahati 781006',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Quick Response Team', 'Highway Patrol', 'Emergency SOS Cell'],
  },
  {
    id: 'poi-p3',
    name: 'Jalukbari Police Station',
    type: 'police',
    lat: 26.155,
    lng: 91.666,
    phone: '112 / +91 361 2570522',
    address: 'Near Gauhati University, Jalukbari, Guwahati 781014',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Campus Patrol', 'Night Mobile Van', 'First Responder Unit'],
  },
  {
    id: 'poi-p4',
    name: 'Noonmati Police Station (Near Narengi)',
    type: 'police',
    lat: 26.195,
    lng: 91.802,
    phone: '112 / +91 361 2550281',
    address: 'Noonmati, Guwahati, Assam 781020',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Sector Patrol', 'Emergency Response Vehicle'],
  },
  {
    id: 'poi-p5',
    name: 'Chandmari Police Station',
    type: 'police',
    lat: 26.182,
    lng: 91.776,
    phone: '112 / +91 361 2660238',
    address: 'Chandmari, Guwahati, Assam 781003',
    openHours: '24/7 Active Police Station',
    verified: true,
    emergencyServices: ['Urban Patrol', '24x7 Control Room'],
  },

  // -------------------------------------------------------------
  // 🏥 HOSPITALS & 24/7 EMERGENCY HEALTHCARE
  // -------------------------------------------------------------
  {
    id: 'poi-h-ayurvedic',
    name: 'Government Ayurvedic College & Hospital',
    type: 'hospital',
    lat: 26.1485,
    lng: 91.6675,
    phone: '+91 361 2570448 / 108',
    address: 'Jalukbari, Near Gauhati University, Guwahati 781014',
    openHours: '24/7 Emergency OPD & Patient Care',
    verified: true,
    emergencyServices: ['Emergency OPD', '24/7 Medical Care', 'Ambulance 108 Support'],
  },
  {
    id: 'poi-h-sanjeevani',
    name: 'Sanjeevani Hospital',
    type: 'hospital',
    lat: 26.1605,
    lng: 91.698,
    phone: '+91 361 2571177',
    address: 'Maligaon Chariali, AT Road, Guwahati 781011',
    openHours: '24/7 Emergency & ICU Care',
    verified: true,
    emergencyServices: ['24/7 Emergency & Trauma', 'Critical Care ICU', 'Emergency Ambulance'],
  },
  {
    id: 'poi-h-swagat',
    name: 'Swagat Super Speciality Surgical Hospital',
    type: 'hospital',
    lat: 26.1645,
    lng: 91.7065,
    phone: '+91 361 2573355',
    address: 'AT Road, Maligaon / Bharalumukh, Guwahati 781011',
    openHours: '24/7 Surgical Emergency & Trauma',
    verified: true,
    emergencyServices: ['24/7 Advanced Trauma Care', 'Emergency ICU', 'Specialist Surgical Emergency'],
  },
  {
    id: 'poi-h-excelcare',
    name: 'Excelcare Hospitals',
    type: 'hospital',
    lat: 26.1315,
    lng: 91.689,
    phone: '+91 361 3505555 / 1800 345 5555',
    address: 'NH-37, Paschim Boragaon, Guwahati, Assam 781033',
    openHours: '24/7 Level-1 Trauma & Critical Care',
    verified: true,
    emergencyServices: ['Level-1 Emergency & Trauma', '24/7 Stroke & Cardiac Unit', 'Advanced Life Support Ambulance'],
  },
  {
    id: 'poi-h-ayursundra',
    name: 'Ayursundra Super Specialty Hospital',
    type: 'hospital',
    lat: 26.115,
    lng: 91.718,
    phone: '+91 361 7111000',
    address: 'Ahom Gaon, Garchuk, NH-37, Guwahati 781035',
    openHours: '24/7 Multi-Specialty Emergency Care',
    verified: true,
    emergencyServices: ['24/7 Emergency & Trauma Centre', 'Critical ICU Response', 'Emergency Pharmacy'],
  },
  {
    id: 'poi-h1',
    name: 'Gauhati Medical College & Hospital (GMCH)',
    type: 'hospital',
    lat: 26.1585,
    lng: 91.7725,
    phone: '+91 361 2529457 / 108',
    address: 'Narakasur Hilltop, Bhangagarh, Guwahati 781032',
    openHours: '24/7 Level-1 Emergency & Trauma Centre',
    verified: true,
    emergencyServices: ['Level-1 Trauma Center', 'Emergency ICU', 'Ambulance 108 Hub'],
  },
  {
    id: 'poi-h2',
    name: 'Nemcare Hospital',
    type: 'hospital',
    lat: 26.162,
    lng: 91.765,
    phone: '+91 361 2455906',
    address: 'Bhangagarh, GS Road, Guwahati 781005',
    openHours: '24/7 Emergency Care',
    verified: true,
    emergencyServices: ['24/7 Emergency Room', 'Cardiac Care', 'Critical Response Ambulance'],
  },
  {
    id: 'poi-h3',
    name: 'Down Town Hospital',
    type: 'hospital',
    lat: 26.136,
    lng: 91.798,
    phone: '+91 361 2331003',
    address: 'GS Road, Dispur, Guwahati 781006',
    openHours: '24/7 Emergency & Critical Care',
    verified: true,
    emergencyServices: ['24/7 Trauma Unit', 'Blood Bank', 'Emergency Pharmacy'],
  },
  {
    id: 'poi-h4',
    name: 'GNRC Medical (Dispur)',
    type: 'hospital',
    lat: 26.141,
    lng: 91.795,
    phone: '+91 361 2227700',
    address: 'Dispur, Guwahati, Assam 781006',
    openHours: '24/7 Emergency Care',
    verified: true,
    emergencyServices: ['Neurology & Trauma Emergency', 'Instant Ambulance Dispatch'],
  },

  // -------------------------------------------------------------
  // 🏢 24/7 SAFE SHELTERS & TRANSIT HUBS
  // -------------------------------------------------------------
  {
    id: 'poi-t1',
    name: 'Guwahati Central Railway Station (Safe Transit Hub)',
    type: 'transit_shelter',
    lat: 26.183,
    lng: 91.751,
    phone: '139 / 182 (Railway RPF Security)',
    address: 'Paltan Bazaar, Guwahati 781001',
    openHours: '24/7 CCTV Monitored Public Shelter',
    verified: true,
    emergencyServices: ['RPF Women Helpdesk', 'CCTV Security Lounge', '24/7 Taxi Stand'],
  },
  {
    id: 'poi-t2',
    name: 'ISBT Betkuchi Transit Safety Point',
    type: 'transit_shelter',
    lat: 26.118,
    lng: 91.738,
    phone: '+91 361 2270014',
    address: 'NH-37, Betkuchi, Guwahati 781035',
    openHours: '24/7 Monitored Transit Station',
    verified: true,
    emergencyServices: ['ASTC Security Outpost', 'Well-Lit Passenger Waiting Area'],
  },
  {
    id: 'poi-t3',
    name: 'Paltan Bazaar 24/7 Safe Zone',
    type: 'transit_shelter',
    lat: 26.181,
    lng: 91.753,
    phone: '112',
    address: 'Paltan Bazaar, Guwahati 781008',
    openHours: '24/7 High Activity Commercial Corridor',
    verified: true,
    emergencyServices: ['Continuous Police Patrol', '24/7 Well-Lit Area'],
  },
]

// Pre-computed Safe Route Polylines (Gauhati University to Narengi)
export const SAFE_ROUTES: SafeRouteData[] = [
  {
    id: 'route-recommended',
    title: 'Recommended Route (GS Road / VIP Corridor)',
    score: 92,
    time: '26 min',
    distance: '16.4 km',
    desc: 'High street lighting · Continuous police patrol presence · 6 Hospitals & Police Outposts along route',
    tone: 'safe',
    lightingScore: 96,
    cctvDensity: 'High (88%)',
    incidentDensity: 'Very Low (< 0.2/mo)',
    safePointsCount: 8,
    coordinates: [
      { lat: 26.152, lng: 91.664 }, // Gauhati University
      { lat: 26.1485, lng: 91.6675 }, // Ayurvedic College
      { lat: 26.155, lng: 91.682 }, // Jalukbari Flyover
      { lat: 26.1595, lng: 91.7015 }, // Maligaon PS & Sanjeevani
      { lat: 26.1645, lng: 91.7065 }, // Swagat Hospital
      { lat: 26.176, lng: 91.734 }, // Bharalumukh PS
      { lat: 26.188, lng: 91.746 }, // Panbazar (All Women PS)
      { lat: 26.182, lng: 91.776 }, // Chandmari PS
      { lat: 26.1585, lng: 91.7725 }, // GMCH / Bhangagarh
      { lat: 26.195, lng: 91.802 }, // Noonmati PS
      { lat: 26.202, lng: 91.825 }, // Narengi Destination
    ],
  },
  {
    id: 'route-fastest',
    title: 'Fastest Route (NH-37 / Garchuk Bypass Corridor)',
    score: 61,
    time: '22 min',
    distance: '14.8 km',
    desc: 'Bypass via Boragaon (Excelcare) & Garchuk (Ayursundra / Gorchuk PS) · Faster highway transit',
    tone: 'warn',
    lightingScore: 68,
    cctvDensity: 'Moderate (55%)',
    incidentDensity: 'Moderate (0.8/mo)',
    safePointsCount: 4,
    coordinates: [
      { lat: 26.152, lng: 91.664 }, // Gauhati University
      { lat: 26.1315, lng: 91.689 }, // Excelcare Hospital / Boragaon
      { lat: 26.119, lng: 91.729 }, // Gorchuk Police Station
      { lat: 26.115, lng: 91.718 }, // Ayursundra Hospital
      { lat: 26.118, lng: 91.738 }, // ISBT Betkuchi
      { lat: 26.142, lng: 91.7915 }, // Dispur
      { lat: 26.202, lng: 91.825 }, // Narengi Destination
    ],
  },
  {
    id: 'route-quiet',
    title: 'Quiet Streets Route (Residential Transit Corridor)',
    score: 78,
    time: '31 min',
    distance: '17.1 km',
    desc: 'Moderate lighting · Residential street corridor via Maligaon, Arya Nagar & Hengerabari',
    tone: 'safe',
    lightingScore: 82,
    cctvDensity: 'Moderate-High (68%)',
    incidentDensity: 'Low (0.4/mo)',
    safePointsCount: 5,
    coordinates: [
      { lat: 26.152, lng: 91.664 }, // Gauhati University
      { lat: 26.1605, lng: 91.698 }, // Sanjeevani Maligaon
      { lat: 26.158, lng: 91.738 }, // Fatasil Ambari PS
      { lat: 26.148, lng: 91.765 }, // Ulubari / GS Road
      { lat: 26.142, lng: 91.7915 }, // Dispur PS corridor
      { lat: 26.168, lng: 91.808 }, // Hengerabari
      { lat: 26.195, lng: 91.815 }, // VIP Road
      { lat: 26.202, lng: 91.825 }, // Narengi Destination
    ],
  },
]

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
