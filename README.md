# SAKHI — Intelligent Personal Safety & Transit Companion

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Protection when you need it. Privacy when you don't.**  
> SAKHI is an autonomous, privacy-first women's safety and transit monitoring progressive web application (PWA) equipped with real-time GPS telemetry, contextual anomaly detection, instant SOS escalation, safe corridor routing, and biometric telemetry safeguards.

---

## 🌟 Key Features

### 1. 🛡️ Autonomous Journey Safety Monitoring
- **Real-Time GPS Tracking**: High-accuracy coordinate monitoring with live status indicators and battery/network health checks.
- **Contextual Anomaly Detection**: Proactive alerts when deviating from planned safe corridors or when staying idle in unexpected zones.
- **Interactive 10-Minute Safety Checks**: Automated check-in prompts with emergency escalation countdowns.

### 2. 🚨 Emergency Dispatch & SOS Broadcast
- **1-Tap Emergency Trigger**: Instant visual and audio countdown with immediate dispatch to primary emergency guardians.
- **Pre-Shutdown 0% Battery Guard**: Autonomous SMS dispatch broadcast with last known coordinates before device power cut.
- **Emergency Calling Modal**: Quick-dial emergency services (112, 1091, 100, 108) and custom emergency contacts.

### 3. 👥 Dynamic User Profiles & Emergency Contacts
- **User Authentication**: Secure sign-in and registration with full user profile support.
- **Emergency Contact CRUD**: Add, edit, remove, and assign primary guardians with personalized relationships and cellular phone numbers.
- **Personalized Safety Dashboard**: Customized greeting, safety readiness scores, and device security metrics.

### 4. 🗺️ Safe Corridor Navigation & Google Maps Integration
- **Interactive Google Maps**: Real-time map view with police outposts, hospitals, 24/7 pharmacies, transit hubs, and safe havens.
- **Safe Route Planning**: Evaluates street lighting, CCTV density, and police patrol coverage to recommend the safest transit paths.
- **Place Search & Autocomplete**: Search any destination across cities with safety ratings and corridor metrics.

### 5. 📈 Safety Score Trends & Intelligence Analytics
- **Interactive SVG Vector Graph**: Multi-metric curve tracking **Safety Score %**, **Biometric Pulse (BPM)**, and **Street Lighting %** across 7-day, 30-day, and 90-day intervals.
- **24-Hour Corridor Transit Risk Heatmap**: Hourly breakdown comparing daytime and nighttime transit security ratings.
- **Hardware Telemetry Diagnostics**: Accelerometer fall detection and connectivity health monitoring.

### 6. ☀️🌙 High-Contrast Adaptive Light & Dark Theme
- **Theme Modes**: Seamlessly toggle between **Dark Cyber Mode**, **Clean Light Mode**, and **Auto System Match**.
- **Accessible & High-Contrast**: WCAG AAA compliant contrast, crisp typography, and persistent theme preferences.
- **Multi-Point Controls**: Accessible right from the dashboard, top header bar, and profile settings.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer-motion.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Mapping**: [Google Maps JavaScript API](https://developers.google.com/maps) (`@googlemaps/js-api-loader`)
- **Backend / Realtime**: [Supabase Realtime](https://supabase.com/) & WebSockets
- **Analytics**: [@vercel/analytics](https://vercel.com/analytics)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.17.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)

### 1. Clone the Repository
```bash
git clone https://github.com/prachisaud04-cyber/sakhi.git
cd sakhi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Google Maps Platform API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# (Optional) Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using SAKHI.

---

## 📁 Project Structure

```text
sakhi/
├── app/
│   ├── api/                  # API routes (dispatch, places, sessions, reports)
│   ├── globals.css           # Global CSS and Light/Dark theme design system
│   ├── layout.tsx            # Root layout, ThemeProvider, AuthProvider
│   └── page.tsx              # Dynamic screen routing & application shell
├── components/
│   ├── screens/              # Core application screens
│   │   ├── HomeScreen.tsx        # Safety dashboard, quick tools, theme switch
│   │   ├── StartScreen.tsx       # Journey initiation & safe route selection
│   │   ├── ActiveScreen.tsx      # Active journey tracking & 10-min safety checks
│   │   ├── AnalyticsScreen.tsx   # Interactive SVG Safety Trend graphs & heatmap
│   │   ├── AreaSafetyScreen.tsx  # 24-hour area risk telemetry & radar
│   │   ├── MapScreen.tsx         # Google Maps interactive safe zone finder
│   │   ├── EmergencyScreen.tsx   # High-priority SOS dispatch & siren
│   │   ├── ContactScreen.tsx     # Emergency contact manager
│   │   ├── ProfileScreen.tsx     # User account & appearance preferences
│   │   └── AuthScreen.tsx        # Login & registration portal
│   └── ui/                   # Modular UI components (Cards, Modals, Header, Nav)
├── contexts/
│   ├── AuthContext.tsx       # User state, sessions & contact persistence
│   └── ThemeContext.tsx      # Light/Dark/System theme context
├── hooks/                    # Custom hooks (Telemetry, LiveSession, BatteryAlert)
├── lib/                      # Helper libraries & safety engine utilities
└── types/                    # TypeScript interfaces and shared type definitions
```

---

## 🔒 Safety & Privacy Principles

1. **Client-Side Telemetry Control**: Location tracking is strictly activated on user demand and can be instantly paused or terminated at any time.
2. **Encrypted Emergency Capsules**: Guardian contacts and coordinates are securely processed and protected.
3. **Offline-Resilient Architecture**: Fallback SMS encoding ensures emergency alerts broadcast even in low-bandwidth or disconnected zones.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
