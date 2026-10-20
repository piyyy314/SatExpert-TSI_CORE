# 🏛️ SatExpert Tactical SatCom Intelligence (TSI) v6 — Architecture & System Specification

## 1. Executive Architecture Overview

SatExpert Tactical SatCom Intelligence (TSI) v6 is an enterprise-grade C4ISR platform engineered for sovereign satellite defense, RF telemetry monitoring, electronic warfare (EW), and post-quantum cryptographic security. 

The software system is built on a modern, reactive TypeScript stack:
* **Frontend Runtime**: React 19 SPA running on Vite 6 with Tailwind CSS v4.
* **Backend Gateway**: Node.js/Express proxy architecture isolating external APIs, credentials, and telemetry sockets.
* **Cryptography Engine**: Hybrid post-quantum cryptographic suite implementing NIST FIPS 203 (CRYSTALS-Kyber-1024) and NIST FIPS 204 (CRYSTALS-Dilithium-5) alongside simulation of entanglement-based Quantum Key Distribution (QKD).
* **Telemetry & Ephemeris Engine**: Real-time SGP4 orbital propagator calculating sub-millimeter look angles, Doppler compensation, and slant range vectors.

---

## 2. Module Architecture (64+ Unique Tactical Tools)

The operational suite is divided into six specialized operational divisions, totaling **64 itemized, unique tools**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TSI v6 OPERATIONAL SUITE                        │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│  SIGINT (15)    │ ACTIVE OPS (24)  │ SENTINEL AI (4) │  CYBER CMD (6)  │
├─────────────────┼──────────────────┼─────────────────┼─────────────────┤
│                  TACTICAL BASE (8) │ AUX DATA (7)                      │
└────────────────────────────────────┴───────────────────────────────────┘
```

### 1. SIGINT — Signals Intelligence Suite (15 Tools)
1. **SAR Stripmap Beamformer (`SARImagingSuite.tsx`)**: Synthetic Aperture Radar beamforming engine producing high-resolution radar imagery.
2. **Interactive Topographical Terrain Scanner**: Multi-sector radar contour scanning with elevation rendering (Desert, Mountain, Coastal, Urban).
3. **Radio Intercept Suite (`RadioInterceptSuite.tsx`)**: Broad-spectrum RF monitoring module capturing raw carrier frequencies.
4. **Signal Interceptor (`SignalInterceptor.tsx`)**: Demodulation and detection engine identifying uncataloged signal emitters.
5. **Signal Jammer (`SignalJammer.tsx`)**: Configurable active jamming emitter supporting barrage, spot, and swept-frequency noise.
6. **Signal Visualizer (`SignalVisualizer.tsx`)**: Real-time I/Q constellation diagram and time-domain waveform oscilloscope.
7. **Spectrum Analyzer (`SpectrumAnalyzer.tsx`)**: Dynamic FFT waterfall spectrogram capturing transient RF bursts and sidebands.
8. **Spectral Canary (`SpectralCanary.tsx`)**: Autonomous tripwire detector triggering instant DEFCON escalations upon unauthorized RF energy detection.
9. **Traffic Sniffer (`TrafficSniffer.tsx`)**: Deep packet inspection engine for VSAT DVB-S2/S2X and IP encapsulation streams.
10. **Spoof Tracer (`SpoofTracer.tsx`)**: Ephemeris divergence and Doppler deviation analyzer isolating rogue transmitters.
11. **Link Budget Calculator (`LinkBudgetCalculator.tsx`)**: Complete RF budget solver calculating EIRP, $G/T$, free-space loss, and carrier-to-noise ($C/N$).
12. **Terrain Obstruction Engine (`TerrainObstruction.tsx`)**: Topographical azimuth-elevation horizon model evaluating line-of-sight blockage.
13. **Direction-Finding Triangulator**: TDoA (Time Difference of Arrival) multi-receiver hyperbolic emitter locator.
14. **Ground Penetrating Radar (GPR) Simulator**: Sub-surface reflection simulator profiling buried cables and hidden bunker assets.
15. **Polarimetric SAR (PolSAR) Decomposition Engine**: Quad-polarization ($HH, HV, VH, VV$) scattering matrix surface classifier.

### 2. Active Operations & Constellation Tracking (24 Tools)
1. **Constellation 3D Tracker (`ConstellationView.tsx`)**: Multi-orbit tracker visualizing LEO, MEO, and GEO constellations.
2. **Orbital 3D Engine (`Orbital3D.tsx`)**: WebGL Three.js interactive globe rendering orbital paths and ground footprints.
3. **Satellite Detail Inspector (`SatelliteDetail.tsx`)**: Transponder configuration, EIRP footprint, and uplink/downlink frequency detail viewer.
4. **Look Angle Calculator (`LookAngleCard.tsx`)**: Calculates Azimuth, Elevation, and Polarization Skew to $0.01^\circ$ precision.
5. **SGP4 Ephemeris Propagator (`satelliteService.ts`)**: Mathematical orbit propagation engine projecting high-accuracy Cartesian coordinates.
6. **Relativistic Doppler Shift Compensator**: Transmit and receive frequency compensator for high-velocity LEO spacecraft ($7.8\text{ km/s}$).
7. **Earth-Centered Inertial (ECI) Slant Range Matrix**: Real-time 3D range vector calculation between ground antenna and payload.
8. **Solar Eclipse & Outage Predictor**: Umbra and penumbra geometry calculator forecasting solar battery discharge and thermal shock.
9. **Satellite Footprint Contour Renderer**: Iso-contour coverage mapper displaying signal beam boundaries across minimum elevation masks.
10. **Orbital Drift Correction Engine**: Continuous drift tracking alerting operators when orbital perturbations exceed $\Delta > 0.05^\circ$.
11. **24-Hour Pass Schedule Calculator**: Complete overpass schedule generator predicting AOS, LOS, duration, and maximum elevation.
12. **Two-Line Element (TLE) Ingestor**: Dynamic parser validating, cataloging, and rendering NORAD orbital element sets.
13. **Atmospheric Drag & Decay Simulator**: Upper-thermosphere density model forecasting orbital lifetime degradation.
14. **Aegis Command & Control (`AegisC2.tsx`)**: Enterprise ground gateway orchestrator managing multiple steerable antenna dishes.
15. **Orbital Striker (`OrbitalStriker.tsx`)**: Space domain engagement simulator modeling kinetic and non-kinetic interdiction scenarios.
16. **Drone Swarm Command (`DroneSwarmCommand.tsx`)**: Autonomous UAV airborne communication relay mesh controller.
17. **Swarm Intelligence Dashboard (`SwarmIntelligenceDashboard.tsx`)**: Distributed consensus monitor for satellite constellation clusters.
18. **Mission Planner (`MissionPlanner.tsx`)**: Timeline and pass allocation scheduler for intelligence taskings.
19. **War Games Simulator (`WarGamesSimulator.tsx`)**: Adversarial Red vs. Blue space conflict scenario emulator.
20. **VSAT Hardware Configurator (`VSATConfig.tsx`)**: Modem LO frequencies, Symbol Rates, Rolloff factors, and FEC code rates manager.
21. **Live Comms Hub (`LiveComms.tsx`)**: Authenticated peer-to-peer tactical communications link between ground stations.
22. **Remote Access Terminal (`RemoteAccessTerminal.tsx`)**: Secure terminal console providing direct serial/SSH command interface to antenna modems.
23. **Dark Link Protocol (`DarkLinkProtocol.tsx`)**: Low-probability-of-detection (LPD) spread-spectrum transmission protocol.
24. **Deepfake Comms Defender (`DeepfakeComms.tsx`)**: Neural acoustic and facial verification scanner guarding tactical comms from spoofing.

### 3. Sentinel AI — Autonomous Command Core (4 Tools)
1. **Sentinel AI Core Controller (`SentinelAIControl.tsx`)**: Central threat correlation engine continuously monitoring satellite telemetry.
2. **AI Decision Matrix & Spoof Window Solver**: Calculates optimal spoof duration ($10\text{s}–60\text{s}$) balancing thermal decoy bloom against BUC damage limits.
3. **AI Automated Exploit Defense (`AIAutomatedExploit.tsx`)**: Autonomous neural countermeasure generator responding in milliseconds to electronic attacks.
4. **AI Technician Copilot (`AITechnician.tsx` / `AIAssistantWidget.tsx`)**: Gemini-powered clinical diagnostic assistant troubleshooting VSAT link anomalies.

### 4. Cyber Command & Electronic Warfare (6 Tools)
1. **Cyber Threat Map (`CyberThreatMap.tsx`)**: Global geospatial projection of cyber attacks targeting satellite downlinks.
2. **Cyber Kill Chain Analyzer (`CyberKillChain.tsx`)**: Phase-by-phase intrusion tracker correlating reconnaissance, exploitation, and data exfiltration.
3. **Cyber Attack Suite (`CyberAttackSuite.tsx`)**: Interactive penetration testing framework testing modem vulnerabilities and transponder security.
4. **Botnet Command Center (`BotnetCommand.tsx`)**: Multi-node telemetry manager coordinating distributed terminal defenses.
5. **APT Lateral Movement Tracker (`AptLateralTracker.tsx`)**: Advanced persistent threat tracker detecting unauthorized pivoting inside SATCOM ground LANs.
6. **Purple Team Arsenal (`PurpleTeamArsenal.tsx`)**: Coordinated offensive and defensive verification suite verifying terminal compliance.

### 5. Tactical Base Operations (8 Tools)
1. **Tactical HUD (`TacticalHUD.tsx`)**: Primary operational dashboard displaying Azimuth, Elevation, Range, SNR, and RX power.
2. **Telemetry Pulse Monitor (`TelemetryPulse.tsx`)**: High-frequency streaming telemetry health monitor with visual pulse indicators.
3. **BUC Temperature Thermal Sensor**: Real-time junction thermal sensor monitoring Block Upconverter heat dissipation.
4. **Thermal Decoy Spoof Controller**: Transmitter thermal flare generator creating $190^\circ\text{C}+$ synthetic signatures to blind hostile space sensors.
5. **30-Second Countdown Overlay**: Visual and auditory countdown timer synchronizing decoy flare deployment.
6. **Polarization Skew Auto-Corrector**: Automated motorized skew correction compensating for atmospheric Faraday rotation.
7. **Mission After-Action Report Exporter (`AfterActionReport.tsx`)**: Generates authenticated, unalterable PDF mission reports for chain-of-custody documentation.
8. **DEFCON Status Orchestrator**: System-wide defense readiness coordinator adapting interface colors, audio cues, and automated alert policies.

### 6. Auxiliary Data & Intelligence (7 Tools)
1. **Aerospace RSS Intelligence Reader (`RSSReader.tsx`)**: Live feed aggregator pulling space launch schedules and security advisories.
2. **Space Weather Dashboard (`WeatherDashboard.tsx`)**: Solar flux, geomagnetic storm indices, and atmospheric rain attenuation monitor.
3. **IP Geolocator & BGP Visualizer (`IPGeolocator.tsx`)**: Geospatial tracker resolving satellite IP gateways and backhaul routing paths.
4. **Connectivity Mesh Network (`ConnectivityMesh.tsx`)**: Peer-to-peer telemetry relay mesh ensuring continuity across disconnected nodes.
5. **Cloud Sync Portal (`CloudSyncPortal.tsx`)**: Real-time database synchronizer connecting terminals to Firebase Firestore.
6. **Media Forge (`MediaForge.tsx`)**: Synthetic tactical asset generator producing satellite schematics and briefing visuals.
7. **Threat Dossier Manager (`ThreatDossier.tsx`)**: Adversary satellite dossiers documenting sensors, orbits, and counter-surveillance vulnerabilities.

---

## 3. Data Flow & Secret Isolation Architecture

```
                  ┌─────────────────────────────────────┐
                  │          CLIENT BROWSER             │
                  │   (React 19 / TypeScript 5.7)       │
                  └──────────────┬──────────────────────┘
                                 │
                   Direct VITE_FIREBASE_* Env Vars
                   (Zero Hardcoded Config Files)
                                 │
                  ┌──────────────▼──────────────────────┐
                  │    SERVICES / FIREBASE SERVICE      │
                  │ - Directly reads import.meta.env    │
                  │ - initializeApp(firebaseConfig)     │
                  │ - No breaking json file imports     │
                  └──────────────┬──────────────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
┌────────────▼────────────┐             ┌────────────▼────────────┐
│   FIRESTORE DATABASE    │             │   EXPRESS API PROXY     │
│  - Audit logs           │             │  - Gemini AI endpoints  │
│  - User telemetry       │             │  - RSS XML parsers      │
│  - Mission state        │             │  - Private API keys     │
└─────────────────────────┘             └─────────────────────────┘
```

### Environment-Driven Configuration
All Firebase configuration keys are sourced directly from standard Vite environment variables (`import.meta.env`) matching `.env.example`:
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_DATABASE_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`
* `VITE_FIREBASE_MEASUREMENT_ID`

This architecture guarantees that clean checkouts on GitHub Actions runners, CI/CD pipelines, and air-gapped workstations compile with zero missing module errors (`TS2307`).
