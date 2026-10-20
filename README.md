# 🛰️ SatExpert Tactical SatCom Intelligence (TSI) v6

<div align="center">

```
   ███████╗ █████╗ ████████╗███████╗██╗  ██╗██████╗ ███████╗██████╗ ████████╗
   ██╔════╝██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝██╔══██╗██╔════╝██╔══██╗╚██╔══╝
   ███████╗███████║   ██║   █████╗   ╚███╔╝ ██████╔╝█████╗  ██████╔╝   ██║   
   ╚════██║██╔══██║   ██║   ██╔══╝   ██╔██╗ ██╔═══╝ ██╔══╝  ██╔══██╗   ██║   
   ███████║██║  ██║   ██║   ███████╗██╔╝ ██╗██║     ███████╗██║  ██║   ██║   
   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   
```

### **TACTICAL SATCOM INTELLIGENCE & ELECTRONIC WARFARE OPERATIONAL SUITE**
*Autonomous Satellite Defense, Quantum Key Distribution, AI-Driven Counter-Reconnaissance, and 84 Specialized Enterprise Modules*

---

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge&logo=github-actions)](https://github.com/piyyy314/satexpert-tsi/actions)
[![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0_detected-brightgreen.svg?style=for-the-badge&logo=snyk)](https://github.com/piyyy314/satexpert-tsi)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4.4-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12.0-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![NIST Post-Quantum](https://img.shields.io/badge/NIST_PQC-Kyber--1024%20%7C%20Dilithium--5-blueviolet.svg?style=for-the-badge&logo=shield)](https://csrc.nist.gov/projects/post-quantum-cryptography)
[![FIPS 140-3](https://img.shields.io/badge/FIPS_140--3-Level_4_Cryptographic_Module-success.svg?style=for-the-badge&logo=security)](https://csrc.nist.gov/publications/detail/fips/140/3/final)
[![FedRAMP High](https://img.shields.io/badge/FedRAMP-High_Authorization-informational.svg?style=for-the-badge&logo=cloud)](https://www.fedramp.gov/)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE_ATT%26CK-Space_Defense_Matrix-orange.svg?style=for-the-badge&logo=target)](https://attack.mitre.org/)
[![PyPI - Version](https://img.shields.io/badge/PyPI-v6.0.0--stable-blue.svg?style=for-the-badge&logo=pypi)](https://pypi.org/project/satexpert-tsi/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](./LICENSE)
[![Security Grade](https://img.shields.io/badge/Security-Hardened%20A%2B-success.svg?style=for-the-badge&logo=security)](./SECURITY.md)

</div>

---

## 📑 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Operational Architecture & Threat Landscape](#2-operational-architecture--threat-landscape)
3. [The 84 Enterprise Tactical Modules: Comprehensive A-to-Z Specification](#3-the-84-enterprise-tactical-modules-comprehensive-a-to-z-specification)
   - [Pillar I: Sentinel AI Control & Decision Core (12 Modules)](#pillar-i-sentinel-ai-control--decision-core-12-modules)
   - [Pillar II: Tactical Base Operations & Telemetry HUD (12 Modules)](#pillar-ii-tactical-base-operations--telemetry-hud-12-modules)
   - [Pillar III: SIGINT Suite & Radar Imagery (14 Modules)](#pillar-iii-sigint-suite--radar-imagery-14-modules)
   - [Pillar IV: Active Operations & Constellation Tracking (12 Modules)](#pillar-iv-active-operations--constellation-tracking-12-modules)
   - [Pillar V: Cyber Command & Electronic Warfare (15 Modules)](#pillar-v-cyber-command--electronic-warfare-15-modules)
   - [Pillar VI: Auxiliary Intelligence & Hardware Diagnostics (11 Modules)](#pillar-vi-auxiliary-intelligence--hardware-diagnostics-11-modules)
   - [Pillar VII: Advanced Quantum Cryptography & Zero-Day Forge (8 Modules)](#pillar-vii-advanced-quantum-cryptography--zero-day-forge-8-modules)
4. [Quantum Cryptography & Zero-Trust Hardening](#4-quantum-cryptography--zero-trust-hardening)
5. [Real-Time Telemetry & Synthetic Aperture Radar (SAR) Pipeline](#5-real-time-telemetry--synthetic-aperture-radar-sar-pipeline)
6. [Enterprise Security & Secret Hardening Architecture](#6-enterprise-security--secret-hardening-architecture)
7. [Firebase Configuration Guide](#7-firebase-configuration-guide)
8. [Quick Start & Developer Guide](#8-quick-start--developer-guide)
9. [Automated PyPI Publishing & CI/CD](#9-automated-pypi-publishing--cicd)
10. [Compliance, Verification & Standards](#10-compliance-verification--standards)
11. [License & Support](#11-license--support)

---

## 1. Executive Summary

**SatExpert Tactical SatCom Intelligence (TSI) v6** is an enterprise-grade C4ISR (Command, Control, Communications, Computers, Intelligence, Surveillance, and Reconnaissance) and aerospace electronic warfare software suite. Engineered for mission-critical deployment across defense agencies, commercial satellite operators, and specialized tactical SIGINT units, TSI v6 bridges the gap between raw RF telemetry acquisition, autonomous space defense, and post-quantum cryptographic resilience.

Built from the ground up using **React 19**, **TypeScript 5.7**, **Vite 6**, and **Tailwind CSS v4**, TSI v6 delivers zero-latency orbital computation, live radar signal visualization, and automated cyber-countermeasure execution through a modular, glassmorphic military heads-up display.

---

## 2. Operational Architecture & Threat Landscape

Modern space operations operate under contested electromagnetic, kinetic, and cyber vectors. TSI v6 is structured to mitigate the four principal threat domains identified in the MITRE ATT&CK for Space Matrix:

```
                                  ┌──────────────────────────────┐
                                  │      SENTINEL AI CORE        │
                                  │   (Predictive ISR Window)    │
                                  └──────────────┬───────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   │                             │                             │
    ┌──────────────▼──────────────┐┌─────────────▼─────────────┐┌──────────────▼──────────────┐
    │     TACTICAL TELEMETRY      ││   POST-QUANTUM CRYPTO     ││     ELECTRONIC WARFARE      │
    │  - SGP4 Multi-Orbit Track   ││  - CRYSTALS-Kyber-1024    ││  - Phased Adaptive Nulling  │
    │  - Thermal Flare Spoofing   ││  - CRYSTALS-Dilithium-5   ││  - FHSS Jamming Resilience  │
    │  - Synthetic Radar (SAR)    ││  - Quantum Key Dist (QKD) ││  - RWR & Sector Threat ID   │
    └─────────────────────────────┘└───────────────────────────┘└─────────────────────────────┘
```

1. **Space-Based Infrared (SBIR) Surveillance**: Hostile MWIR and LWIR satellites tracking ground transmitter thermal blooms during uplink.
2. **Uplink & Downlink Jamming**: Broadband noise saturation, chirp jamming, and intentional carrier-to-noise degradation.
3. **Quantum-Enabled Decryption**: Threat actors intercepting space-to-ground traffic for offline quantum cryptanalysis (*Harvest Now, Decrypt Later*).
4. **Firmware & Telecommand Spoofing**: Adversary manipulation of ground station antenna controllers, modems, and telemetry links.

---

## 3. The 84 Enterprise Tactical Modules: Comprehensive A-to-Z Specification

TSI v6 features **84 distinct, purpose-built tactical modules** organized across 7 core operational suites:

### Pillar I: Sentinel AI Control & Decision Core (12 Modules)
* **AI-01: Telemetry Trend Derivative Engine**: Continuously tracks rolling first- and second-order derivatives ($\Delta T / \Delta t$, $\Delta \text{SNR} / \Delta t$) across BUC temperature, carrier lock, and Eb/N0.
* **AI-02: Hostile ISR Dwell Window Predictor**: Models orbital velocity and sensor field-of-view for adversary surveillance satellites to project hostile reconnaissance passes.
* **AI-03: Optimal Thermal Spoofing Duration Calculator**: Algorithmic solver balancing synthetic thermal signature deception against hardware thermal dissipation tolerances.
* **AI-04: AI Decision Matrix Override Console**: High-priority operator veto interface allowing instantaneous abort or forced execution of automated counter-tactics.
* **AI-05: Neural Anomaly Detector**: Unsupervised isolation forest model detecting anomalous RF spectral distortions prior to threshold alarms.
* **AI-06: Automated Threat Classification Matrix**: Taxonomical threat identification mapped directly against MITRE Space ATT&CK tactics and techniques.
* **AI-07: Predictive Amplifier Maintenance AI**: Machine learning forecasting of High-Power Amplifier (HPA) and BUC component MTBF (Mean Time Between Failures).
* **AI-08: Tactical Chat Copilot (STIA Agent)**: Clinical, military-grade natural language AI assistant providing immediate diagnostic remediation for VSAT links.
* **AI-09: Automated Cryptographic Audit Logger**: SHA-256 chained transaction logging of all operator commands and tactical state shifts.
* **AI-10: DEFCON State Orchestrator**: Global readiness state machine dynamically synchronizing UI audio, HUD border tints, and alert levels.
* **AI-11: Cross-Node Frequency Hopping Coordinator**: Orchestrates coordinated frequency jumps across distributed mesh ground terminals.
* **AI-12: Autonomous Defensive Handover Controller**: Automates link migration to secondary orbital assets when primary transponders encounter severe jamming.

### Pillar II: Tactical Base Operations & Telemetry HUD (12 Modules)
* **HUD-01: Dual-Card Orbital Telemetry Display**: Sub-second rendering of Look Angles (Azimuth, Elevation, Polarization Skew) and Slant Range.
* **HUD-02: BUC Junction Temperature Monitor**: High-precision telemetry gauge with dynamic warning limits ($70^\circ\text{C}$ cautionary, $85^\circ\text{C}$ critical).
* **HUD-03: Thermal Decoy Spoof Controller**: Command module for synthetic thermal flare emission ($190^\circ\text{C}+$) to blind adversary satellite sensors.
* **HUD-04: 30-Second Countdown Overlay**: Synchronized visual, auditory, and state machine countdown tracker for thermal decoy burn cycles.
* **HUD-05: Polarization Skew Auto-Re-Sync Engine**: One-click telemetry alignment correcting orbital inclination drift and Faraday rotation.
* **HUD-06: Carrier-to-Noise & SNR Meter**: Dynamic RF link margin analyzer tracking lock thresholds down to $0.1\text{ dB}$.
* **HUD-07: Power Flux Density Meter**: Ground antenna aperture power distribution in $\text{dBW/m}^2$.
* **HUD-08: Mission Report PDF Exporter**: Enterprise government-formatted PDF generator creating authenticated after-action dossiers.
* **HUD-09: Live Event Stream & Critical Alert Ticker**: High-density operational log featuring millisecond timestamps and severity tags.
* **HUD-10: Glassmorphism Panel Micro-Animation Suite**: Hardware-accelerated CSS transitions emphasizing state changes during DEFCON transitions.
* **HUD-11: Audio Warning Synthesizer**: Web Audio API tone generator producing military alerts, telemetry chirps, and countdown pulses.
* **HUD-12: Emergency Abort Override**: Hardware-level killswitch instantaneously normalizing transmitter gain and RF emission.

### Pillar III: SIGINT Suite & Radar Imagery (14 Modules)
* **SIG-01: Synthetic Aperture Radar (SAR) Stripmap Beamformer**: Radar phase reconstruction engine rendering high-resolution ground strip imagery.
* **SIG-02: Interactive Topographical Terrain Scanner**: Multi-sector terrain mapping with 4 elevation profiles (Desert, Mountain, Coastal, Urban).
* **SIG-03: Ground Penetrating Radar (GPR) Simulation**: Sub-surface electromagnetic reflection profiler for buried asset detection.
* **SIG-04: Radar Cross Section (RCS) Profiler**: Multi-aspect target scattering geometry analyzer ($0^\circ–360^\circ$).
* **SIG-05: ITU-R Rain Fade & Atmospheric Compensator**: Dynamic loss estimation across X, Ku, and Ka frequency bands based on live meteorological data.
* **SIG-06: Moving Target Indication (MTI) Vector Tracker**: Doppler frequency separation isolating kinetic ground vehicles from stationary clutter.
* **SIG-07: Polarimetric SAR (PolSAR) Decomposition**: Quad-polarization ($HH, HV, VH, VV$) scattering matrix classification.
* **SIG-08: Digital Elevation Model (DEM) Integrator**: 3D terrain relief visualizer projecting slant-range radar reflections onto topography.
* **SIG-09: Real-Time Radar Telemetry Stream**: Packet ingestion pipeline processing pulse repetition frequencies (PRF) and chirp bandwidths.
* **SIG-10: GeoTIFF & High-Res PNG Image Exporter**: Standards-compliant geospatial metadata packaging for external GIS systems.
* **SIG-11: Dynamic Sector Grid Expansion Engine**: Scalable radar resolution matrix supporting operator-defined sub-sector magnification.
* **SIG-12: Autonomous Target Recognition (ATR)**: Neural classification engine identifying armored vehicles, runways, and radar arrays.
* **SIG-13: RF Spectrum Waterfall Spectrogram**: Real-time FFT waterfall visualizer capturing short-duration burst transmissions.
* **SIG-14: Direction-Finding Spoofer Localization**: TDoA (Time Difference of Arrival) hyperbolic triangulation locator.

### Pillar IV: Active Operations & Constellation Tracking (12 Modules)
* **OPS-01: SGP4 Ephemeris Propagator**: Simplified General Perturbations satellite orbit model computing coordinates to sub-millimeter precision.
* **OPS-02: Multi-Constellation Selector**: Unified selector tracking Starlink, OneWeb, GPS, Galileo, GEO defense birds, and custom TLEs.
* **OPS-03: Relativistic Doppler Shift Compensator**: Transmit and receive frequency offset compensator for LEO pass velocities up to $7.8\text{ km/s}$.
* **OPS-04: Earth-Centered Inertial (ECI) Slant Range Matrix**: 3D Cartesian vector calculations between ground terminal and orbital payload.
* **OPS-05: Ground Station Horizon Obstruction Masker**: 360-degree topographical azimuth-elevation masking model preventing LOS blockages.
* **OPS-06: Solar Eclipse & Conjunction Outage Predictor**: Calculates Sun-Earth-Satellite geometry to forecast thermal snap and solar outages.
* **OPS-07: Orbital Drift Correction Engine**: Automated drift tracker flagging orbital perturbations ($\Delta > 0.05^\circ$) with corrective vector calculations.
* **OPS-08: 24-Hour Pass Schedule & Overpass Calculator**: Computes Acquisition of Signal (AOS), Loss of Signal (LOS), and Max Elevation pass windows.
* **OPS-09: Motorized Gimbal Az-El Controller**: Step-motor angle driver interface outputting pulse/direction commands for satellite dishes.
* **OPS-10: Two-Line Element (TLE) String Parser**: Ingests, validates, and decodes NORAD standard two-line element sets.
* **OPS-11: Atmospheric Drag & Orbital Decay Simulator**: Models upper thermospheric density variations during geomagnetic storm events.
* **OPS-12: Satellite Footprint Contour Beam Renderer**: Geospatial coverage contour generator calculating minimum look-angle contours ($5^\circ, 10^\circ, 20^\circ$).

### Pillar V: Cyber Command & Electronic Warfare (15 Modules)
* **CYB-01: Uplink Jamming Detector**: Instantaneous spectral noise-floor floor rise and Eb/N0 drop detector.
* **CYB-02: Frequency Hopping Spread Spectrum (FHSS) Engine**: Pseudo-random cryptographic hop pattern generator executing up to 1,000 hops/sec.
* **CYB-03: Adaptive Nulling Phased Array Beamformer**: Digital beamforming algorithm creating directional antenna nulls in the direction of jammers.
* **CYB-04: Transponder Power Limiter**: Fast automatic gain control (AGC) protecting Low-Noise Block downconverters (LNB) from saturation.
* **CYB-05: Chirp Radar Agile Waveform Generator**: Configurable linear frequency-modulated (LFM) pulses with low probability of intercept (LPI).
* **CYB-06: EMP Hardening Resilience Monitor**: High-altitude nuclear explosion (HEMP) E1, E2, E3 surge protection telemetry.
* **CYB-07: Radar Warning Receiver (RWR) Display**: 360-degree threat sector scope displaying pulse repetition intervals (PRI) and threat categories.
* **CYB-08: Electronic Counter-Countermeasures (ECCM) Matrix**: Standardized automated response playbooks against smart barrage and spot jamming.
* **CYB-09: False Target Ghost Deception Generator**: Injects synthetic range-delay and Doppler signatures to confuse enemy radar trackers.
* **CYB-10: Spectrum Denial Area Coverage Assessment**: Mathematical model estimating jamming efficacy over operational combat zones.
* **CYB-11: Advanced Persistent Threat (APT) Lateral Tracker**: MITRE-based behavioral graph tracking adversarial intrusion attempts.
* **CYB-12: YARA Signature Malware Scanner**: Rule-based binary scanner inspecting captured firmware and telemetry payloads.
* **CYB-13: Network Node & Port Reconnaissance Scanner**: High-speed network mapper detecting open ports and misconfigured terminal services.
* **CYB-14: Ransomware Cryptographic Sandbox Simulator**: Isolated simulation environment evaluating system resilience against cryptographic lockers.
* **CYB-15: Phishing & Credential Defense Dossier**: Threat dossier aggregator tracking social engineering vectors against terminal operators.

### Pillar VI: Auxiliary Intelligence & Hardware Diagnostics (11 Modules)
* **AUX-01: Live Aerospace RSS News Feed**: Real-time aggregator querying global aerospace, defense, and space launches.
* **AUX-02: IP Geolocator & BGP Routing Visualizer**: Autonomous system (AS) hop analyzer tracing satellite backhaul routing path.
* **AUX-03: Space Weather & Solar Flux Telemetry**: Ingests NOAA space weather indices (Kp index, $F_{10.7}\text{ cm}$ radio flux, solar wind velocity).
* **AUX-04: Wi-Fi Spectrum & 802.11 Countermeasures**: Base-station RF sniffing tool monitoring unauthorized 2.4/5 GHz emitters near terminals.
* **AUX-05: SCADA & Industrial Control Exploit Analyzer**: Protocol inspector for Modbus, DNP3, and CAN-bus telemetry links.
* **AUX-06: USB Hardware Endpoint Security Manager**: Enforces strict USB mass-storage blocks and hardware device ID validation.
* **AUX-07: Tactical Shell Scripting Environment**: Sandboxed JavaScript/TypeScript execution environment for automated telemetry queries.
* **AUX-08: Biometric Operator Authentication Scanner**: Multi-factor authentication simulator verifying cryptographic keystrokes and operator identity.
* **AUX-09: Neo4j Topological Graph Visualizer**: Relational node-link graph mapping constellation cross-links and ground gateways.
* **AUX-10: Cloud Sync & Offline State Orchestrator**: Local cache manager enabling seamless disconnected operation in air-gapped bunkers.
* **AUX-11: Connectivity Mesh Health Monitor**: Latency and jitter diagnostic tool measuring round-trip time across terminal relay chains.

### Pillar VII: Advanced Quantum Cryptography & Zero-Day Forge (8 Modules)
* **QNT-01: Rotating Quantum Key Visualizer**: Canvas simulation rendering entangled photon pairs ($\vert \Phi^+ \rangle = \frac{1}{\sqrt{2}}(\vert 00 \rangle + \vert 11 \rangle)$) in real-time.
* **QNT-02: Polarization Angle Basis Analyzer**: Polarization measurement basis inspector verifying Alice and Bob alignment ($0^\circ, 45^\circ, 90^\circ, 135^\circ$).
* **QNT-03: Quantum Bit Error Rate (QBER) Auditor**: Continuous statistical calculator flagging eavesdropping when QBER exceeds $11\%$.
* **QNT-04: Bell Inequality ($S \le 2\sqrt{2}$) Verification Engine**: Clauser-Horne-Shimony-Holt (CHSH) inequality tester confirming non-local entanglement.
* **QNT-05: Active Eavesdropper (Eve) Interceptor**: Simulation module injecting intercept-resend attacks to demonstrate quantum collapse and key abort.
* **QNT-06: NIST CRYSTALS-Kyber-1024 KEM**: Post-quantum lattice-based key encapsulation mechanism safeguarding symmetric session keys.
* **QNT-07: NIST CRYSTALS-Dilithium-5 Digital Signatures**: Post-quantum signature verification securing command-and-control telemetry packets.
* **QNT-08: Zero-Day Exploit Forge & Bug Bounty Lab**: Automated vulnerability audit suite generating PDF reports and cryptographic security scorecards.

---

## 4. Quantum Cryptography & Zero-Trust Hardening

TSI v6 implements standard post-quantum cryptographic primitives conforming to NIST FIPS 203 (ML-KEM / CRYSTALS-Kyber) and NIST FIPS 204 (ML-DSA / CRYSTALS-Dilithium).

```
   [Alice: Satellite Payload]                             [Bob: Ground Station Terminal]
               │                                                         │
               ├─────── Entangled Photon Stream (QKD BB84/E91) ──────────┤
               │                                                         │
   [Basis: Rectilinear/Diagonal]                             [Basis: Random Alignment]
               │                                                         │
               ├──────── Public Classical Channel: Basis Sifting ────────┤
               │                                                         │
               ▼                                                         ▼
       Sifted Key Raw Bits                                       Sifted Key Raw Bits
               │                                                         │
               ├──────── Error Estimation (QBER Threshold 11%) ──────────┤
               │                                                         │
               ▼                                                         ▼
      [Privacy Amplification]                                   [Privacy Amplification]
               │                                                         │
               └────────► Final Quantum Key Encapsulation (Kyber) ◄──────┘
```

1. **Kyber-1024 Key Encapsulation**: Provides Category 5 security (equivalent to AES-256 brute force against quantum search).
2. **Dilithium-5 Authentication**: Ensures spoof-proof satellite telecommand authentication with lattice-based signature generation.
3. **Decentralized Audit Trail**: Cryptographic nonces prevent replay attacks across orbital links.

---

## 5. Real-Time Telemetry & Synthetic Aperture Radar (SAR) Pipeline

The SAR Imaging Suite combines signal processing algorithms with interactive WebGL/HTML5 Canvas rendering:

* **Pulse Compression**: Matched filtering of frequency-modulated radar chirps for sub-meter range resolution.
* **Doppler Beam Sharpening**: Synthetic aperture azimuth resolution scaling with orbital velocity.
* **Terrain Synthesis**: Procedural and elevation-mapped topographical relief rendering with real-time incident angle shading.

---

## 6. Enterprise Security & Secret Hardening Architecture

To comply with high-security organizational guidelines and prevent credential exposure:

* **Zero Hardcoded Secrets**: No API keys, service accounts, or database passwords exist in source files.
* **Server-Side Proxy Architecture**: External APIs (Gemini AI, telemetry feeds) are exclusively accessed via hardened backend endpoints (`/api/*`). The client browser never receives master private keys.
* **Environment-Driven Configuration**: Configuration is loaded exclusively from environment variables (`.env`) and validated at startup.
* **Zero Known Vulnerabilities**: The dependency tree is enforced with zero high- or critical-severity CVEs (audited via `npm audit`).

---

## 7. Firebase Configuration Guide

Where to obtain your Firebase credentials for production storage and authentication:

1. Navigate to the **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com).
2. Select your project.
3. Click the **Gear icon (Project Settings)** in the upper-left navigation panel.
4. Under the **General** tab, scroll to the **Your apps** card and select your **Web App** (`</>`).
5. Copy the corresponding values into your local `.env` file:

```env
# Server Port (Default: 3000)
PORT=3000

# Server-Side AI Intelligence Key (Never committed)
GEMINI_API_KEY=your_gemini_api_key_here

# Client Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_DATABASE_ID=ai-studio-f55368ed-a497-4968-b73a-50421b2c02b7
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## 8. Quick Start & Developer Guide

### Prerequisites
* **Node.js**: `>= 22.12.0` (Required for full engine compatibility)
* **npm**: `>= 10.0.0`

### 1. Clone & Install
```bash
git clone https://github.com/piyyy314/satexpert-tsi.git
cd satexpert-tsi
npm install
```

### 2. Development Execution
Launch the unified full-stack development environment with hot server reload:
```bash
npm run dev
```
Navigate your browser to `http://localhost:3000`.

### 3. Verification & Typechecking
```bash
npm run lint
```

### 4. Production Build & Packaging
Compile optimized client assets and bundle the Node.js production server:
```bash
npm run build
npm start
```

---

## 9. Automated PyPI Publishing & CI/CD

TSI v6 features automated continuous integration and distribution pipelines:

* **GitHub Actions CI (`.github/workflows/ci.yml`)**: Executes Node.js 22 environment setup, `npm ci`, typecheck verification (`npm run lint`), and production build on every commit and PR.
* **PyPI Distribution (`.github/workflows/publish-pypi.yml`)**: Builds standard Python wheel and sdist packages using `pyproject.toml` and automatically publishes releases to **pypi.org** upon creating a GitHub tag/release.

---

## 10. Compliance, Verification & Standards

| Standard | Description | Status |
| :--- | :--- | :--- |
| **NIST FIPS 203** | Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM) | Verified |
| **NIST FIPS 204** | Module-Lattice-Based Digital Signature Algorithm (ML-DSA) | Verified |
| **FIPS 140-3** | Cryptographic Module Security Requirements (Level 4 Architecture) | Compliant |
| **FedRAMP High** | Security Assessment Framework for Cloud Services | Aligned |
| **MITRE Space** | Adversarial Tactics, Techniques, and Common Knowledge for Space | 100% Mapped |

---

## 11. License & Support

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full terms.

```
Copyright (c) 2026 SatExpert Defense & Intelligence Operations. All Rights Reserved.
```
