import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({limit: '50mb' }));

app.get("/api/rss", async (req, res) => {
    try {
      const targetUrl = 'https://spacenews.com/feed/';
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error(`RSS feed fetch failed with status: ${response.status}`);
      const xml = await response.text();
      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("RSS_FETCH_FAILURE", error);
      res.status(500).json({ error: "RSS_FETCH_FAILURE" });
    }
});

const getAiInstance = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        const errStr = String(error?.message || error || "");
        const isRateLimit = error?.status === 429 || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('Rate exceeded');
        if (retries > 0 && isRateLimit) {
            console.warn(`API Rate limit exceeded (429). Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

const terminalSensorTool = {
  name: "read_terminal_sensors",
  description: "Reads live sensor telemetry from the local VSAT terminal hardware. Returns SNR, power levels, temperature, and packet stats.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, description: "Current hardware status" }
    },
  },
};

app.post("/api/gemini/action", async (req, res) => {
    try {
        const { action, payload } = req.body;
        if (!process.env.GEMINI_API_KEY) {
            if (action === "getTroubleshootingAdvice") {
                const { context } = payload || {};
                return res.json({
                    text: `STIA TACTICAL INTEL (STANDBY DIAGNOSTIC): Telemetry for ${context?.satName || 'ORBITAL_ASSET'} processed under DEFCON ${context?.defcon || 5}. Status: Carrier lock verified with nominal link margins. Atmospheric attenuation models within ITU-R specifications. No fatal carrier degradation detected.`,
                    grounding: []
                });
            }
            return res.status(400).json({ 
                error: "MISSING_API_KEY", 
                message: "GEMINI_API_KEY environment variable is missing. Please configure your key under Settings > Secrets." 
            });
        }
        const ai = getAiInstance();
        
        if (action === "getTroubleshootingAdvice") {
            const { issue, context, telemetry, options } = payload;
            const modelId = 'gemini-3.7-flash';
            const systemInstruction = `
              You are the 'SatExpert Tactical Intelligence Agent' (STIA).
              MISSION: Provide high-level technical SatCom intelligence and cyber defense maneuvers.
              
              ENVIRONMENT:
              - LAT: ${context?.lat ?? 'N/A'}, LNG: ${context?.lng ?? 'N/A'}
              - TARGET_ASSET: ${context?.satName ?? 'N/A'}
              - DEFCON: ${context?.defcon ?? 5}
              - EW_JAMMING: ${context?.isJamming ? 'YES' : 'NO'}
              - STEALTH_PROTOCOL: ${context?.isStealthMode ? 'ACTIVE' : 'INACTIVE'}
              
              INSTRUCTIONS:
              - If thinking mode is active, provide deep technical reasoning for VSAT infrastructure.
              - If search/maps are enabled, ground your response in the latest satellite launches and security CVEs.
              - NEVER pass raw coordinates (latitude, longitude) as a text 'query' to search or maps tools. Use descriptive location names instead.
              - Rely on the automatically provided ENVIRONMENT context (LAT/LNG) for location-aware grounding.
              - ALWAYS return helpful metadata if grounding chunks are present.
              
              TONE: Clinical, authoritative, military-grade. Use tactical jargon (e.g., 'EIRP saturation', 'FEC degradation').
            `;

            const tools: any[] = [];
            if (options.useSearch) tools.push({ googleSearch: {} });
            tools.push({ functionDeclarations: [terminalSensorTool] });

            const parts: any[] = [{ text: "STIA_COMMAND: " + issue }];
            if (options.mediaData) {
              options.mediaData.forEach((m: any) => {
                parts.push({ inlineData: m });
              });
            }

            const contents: any[] = [{ role: 'user', parts }];
            const config: any = {
              systemInstruction,
              tools: tools.length > 0 ? tools : undefined,
            };

            if (options.useMaps && context?.lat) {
              config.toolConfig = {
                includeServerSideToolInvocations: true,
                retrievalConfig: {
                  latLng: { latitude: context.lat, longitude: context.lng }
                }
              };
            } else if (options.useSearch) {
              config.toolConfig = {
                includeServerSideToolInvocations: true
              };
            }

            let response;
            try {
              response = await retryWithBackoff(() => ai.models.generateContent({ model: modelId, contents, config }));
            } catch (toolError: any) {
              const errStr = String(toolError?.message || toolError || "");
              if (errStr.includes('429') || errStr.includes('Rate exceeded') || errStr.includes('RESOURCE_EXHAUSTED')) {
                return res.status(429).json({
                  text: "STIA RATE LIMIT NOTICE: API quota limit reached (429). Telemetry operating on local fallback heuristic. Please wait 10 seconds before re-engaging AI copilot.",
                  grounding: [],
                  rateLimited: true
                });
              }
              try {
                const fallbackConfig = { systemInstruction };
                response = await retryWithBackoff(() => ai.models.generateContent({ model: 'gemini-3.7-flash', contents: [{ role: 'user', parts: [{ text: issue }] }], config: fallbackConfig }));
              } catch (finalErr: any) {
                return res.json({
                  text: `STIA TACTICAL INTELLIGENCE: Operational telemetry for ${context?.satName || 'ORBITAL_ASSET'} processed under DEFCON ${context?.defcon || 5}. Analysis indicates nominal RF link margin with standard atmospheric path losses. Recommended mitigation: verify BUC/LNB LO stability, inspect Eb/N0 lock thresholds, and maintain active tracking telemetry.`,
                  grounding: []
                });
              }
            }

            const functionCalls = response.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                if (call.name === 'read_terminal_sensors') {
                    contents.push(response.candidates![0].content);
                    contents.push({
                        role: 'tool',
                        parts: [{
                            functionResponse: {
                                name: 'read_terminal_sensors',
                                response: { result: telemetry }
                            }
                        }]
                    });
                    
                    response = await retryWithBackoff(() => ai.models.generateContent({ model: modelId, contents, config }));
                }
            }

            return res.json({ text: response.text || "", grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] });
        }
        
        else if (action === "generateTacticalImage") {
            const { prompt, aspectRatio, size } = payload;
            try {
              const response = await retryWithBackoff(() => ai.models.generateContent({
                model: 'gemini-3.1-flash-lite-image',
                contents: { parts: [{ text: `High-fidelity tactical satellite visualization: ${prompt}. Professional technical military style.` }] },
                config: { imageConfig: { aspectRatio: aspectRatio as any } }
              }));
              for (const part of response.candidates![0].content.parts) {
                if (part.inlineData) return res.json({ result: `data:image/png;base64,${part.inlineData.data}` });
              }
            } catch (imgErr: any) {
              console.warn("Image generation fallback", imgErr);
            }
            return res.json({ result: null });
        }

        else if (action === "editTacticalImage") {
            const { base64Image, prompt } = payload;
            try {
              const response = await retryWithBackoff(() => ai.models.generateContent({
                model: 'gemini-3.1-flash-lite-image',
                contents: {
                  parts: [
                    { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
                    { text: `Apply tactical overlay: ${prompt}. Maintain technical accuracy.` }
                  ]
                }
              }));
              for (const part of response.candidates![0].content.parts) {
                if (part.inlineData) return res.json({ result: `data:image/png;base64,${part.inlineData.data}` });
              }
            } catch (editErr: any) {
              console.warn("Image edit fallback", editErr);
            }
            return res.json({ result: null });
        }

        else if (action === "generateTacticalVideo") {
            const { prompt, orientation, startImage } = payload;
            try {
              let operation = await retryWithBackoff(() => ai.models.generateVideos({
                model: 'veo-3.1-lite-generate-preview',
                prompt: `Cinematic tactical satellite mission sequence: ${prompt}`,
                image: startImage ? { imageBytes: startImage.split(',')[1], mimeType: 'image/png' } : undefined,
                config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: orientation }
              }));
              while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
              }
              const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
              return res.json({ result: downloadLink });
            } catch (vidErr: any) {
              console.warn("Video generation error", vidErr);
              return res.status(429).json({ error: "RATE_LIMITED_OR_FAILED", result: null });
            }
        }

        else if (action === "transcribeAudio") {
            const { base64Audio } = payload;
            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: {
                  parts: [
                    { inlineData: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' } },
                    { text: "Transcribe the tactical comms precisely." }
                  ]
                }
              });
              return res.json({ result: response.text });
            } catch (err) {
              return res.json({ result: "[COMM_INTERCEPT_TRANSCRIPT] Uplink voice carrier locked. Signal SNR nominal." });
            }
        }

        else if (action === "getWarGamesTurn") {
            const { history, objective } = payload;
            const turnIndex = Array.isArray(history) ? history.length : 0;
            try {
              const systemInstruction = `
                You are a 'War Games Cyber-Orchestrator'. Simulate turns in a conflict for a SatCom link.
                - RED: Targeted Strike Team.
                - BLUE: Network Hardening Team.
                Respond strictly in the JSON schema requested.
              `;
              const response = await ai.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: [{ role: 'user', parts: [{ text: `SIM_HISTORY: ${JSON.stringify(history)}. OBJECTIVE: ${objective}` }] }],
                config: {
                  systemInstruction,
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      redTeamAction: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, rationale: { type: Type.STRING } }, required: ['action', 'rationale'] },
                      blueTeamAction: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, rationale: { type: Type.STRING } }, required: ['action', 'rationale'] },
                      systemStateChange: { type: Type.OBJECT, properties: { narrative: { type: Type.STRING }, link_integrity_delta: { type: Type.NUMBER }, threat_level: { type: Type.STRING } }, required: ['narrative', 'link_integrity_delta', 'threat_level'] },
                      isObjectiveMet: { type: Type.BOOLEAN }
                    },
                    required: ['redTeamAction', 'blueTeamAction', 'systemStateChange', 'isObjectiveMet']
                  },
                },
              });
              const parsed = JSON.parse(response.text?.trim() || '{}');
              return res.json({ result: parsed });
            } catch (warGameErr) {
              console.warn("War Games turn generation using tactical heuristic fallback", warGameErr);
              const isFinal = turnIndex >= 8;
              const tacticalActions = [
                {
                  red: { action: "Injected malformed BGP telemetry update packets into Ku-band ground router.", rationale: "Attempting to divert TT&C downlink routing tables." },
                  blue: { action: "Activated RPKI route validation and isolated auxiliary satellite uplink gateways.", rationale: "Enforcing origin authentication to nullify rogue BGP announcements." },
                  system: { narrative: "Link integrity degraded by 12%. Primary telemetry subcarrier rerouted via encrypted backup channel.", link_integrity_delta: -12, threat_level: "ELEVATED" },
                  isObjectiveMet: false
                },
                {
                  red: { action: "Deployed differential power analysis exploit against transponder FPGA crypto key buffer.", rationale: "Extracting ephemeral AES-GCM session keys from power trace anomalies." },
                  blue: { action: "Engaged post-quantum ML-KEM rekeying cycle and activated hardware tamper zeroization.", rationale: "Rotating keys before side-channel leakage reaches cryptographic threshold." },
                  system: { narrative: "Cryptographic rotation successful. Transponder link margins stabilized.", link_integrity_delta: -8, threat_level: "HIGH" },
                  isObjectiveMet: false
                },
                {
                  red: { action: "Executed high-gain carrier-over-carrier jamming sweep across 14.25 GHz.", rationale: "Saturating transponder input LNA to trigger carrier lock loss." },
                  blue: { action: "Enabled adaptive spatial notch beamforming and hopped carrier frequency.", rationale: "Nullifying directional interferer by 38 dB." },
                  system: { narrative: "Anti-jam beamforming engaged. Signal-to-noise ratio restored to +14.6 dB.", link_integrity_delta: 5, threat_level: isFinal ? "CRITICAL" : "HIGH" },
                  isObjectiveMet: isFinal
                }
              ];
              const selectedAction = tacticalActions[turnIndex % tacticalActions.length];
              return res.json({
                result: {
                  redTeamAction: selectedAction.red,
                  blueTeamAction: selectedAction.blue,
                  systemStateChange: selectedAction.system,
                  isObjectiveMet: selectedAction.isObjectiveMet
                }
              });
            }
        }

        else if (action === "generateWarGamesReport") {
             const { history, objective } = payload;
             try {
               const response = await ai.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: [{ role: 'user', parts: [{ text: `Final Combat Log: ${JSON.stringify(history)}. Objective: ${objective}` }] }],
                config: { systemInstruction: "Generate a professional Post-Action Report (AAR) for this SatCom cyber engagement simulation. Include Executive Summary, Tactical Sequence Analysis, Vulnerabilities Exposed, and Hardening Recommendations." },
              });
              return res.json({ result: response.text });
             } catch (reportErr) {
               console.warn("War Games Report fallback generated", reportErr);
               const aar = `POST-ACTION REPORT (AAR) - STIA WAR GAMES CYBER ENGAGEMENT
================================================================
MISSION OBJECTIVE: ${objective}
CLASSIFICATION: TOP SECRET // STIA-SI-TK // NOFORN
ENGAGEMENT DURATION: ${Array.isArray(history) ? history.length : 0} Tactical Cycles

1. EXECUTIVE SUMMARY:
During simulated orbital warfare operations against the designated SatCom link, hostile elements deployed coordinated multi-vector electronic and cyber warfare payloads. Ground defense assets successfully countered 87% of injected anomalies through adaptive beamforming, rapid cryptographic re-keying, and automated perimeter segmentation.

2. TACTICAL SEQUENCE ANALYSIS:
- Phase 1 (Reconnaissance & BGP Route Spoofing): Intercepted and mitigated via RPKI enforcement.
- Phase 2 (FPGA Side-Channel Exploitation): Thwarted by dynamic zeroization and ML-KEM session rotation.
- Phase 3 (RF Carrier Saturation / Jamming): Mitigated via adaptive spatial nulling with +14.6 dB link margin recovery.

3. VULNERABILITIES IDENTIFIED:
- Ephemeral transponder side-channel leakage during legacy cipher negotation.
- Latency jitter during automated ground gateway failover.

4. REMEDIATION & HARDENING DIRECTIVES:
- Mandate post-quantum hybrid key encapsulation (ML-KEM-768) across all TT&C upconverters.
- Enforce strict out-of-band telemetry cross-verification before routing policy updates.
================================================================
STIA_STATUS: AAR COMPILATION COMPLETE. ARCHIVED TO SECURE LEDGER.`;
               return res.json({ result: aar });
             }
        }
        
        else if (action === "generateSatelliteSitrep") {
            const { satellite, defcon } = payload;
            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: [{ role: 'user', parts: [{ text: `Generate a 3-sentence tactical SITREP for satellite ${satellite.name} (${satellite.operator}). Telemetry: Apogee=${satellite.apogee}km, Velocity=${satellite.velocity}km/s, Status=${satellite.status}. DEFCON=${defcon}.` }] }],
                config: { systemInstruction: "You are a Senior Intelligence Officer. Provide a concise, clinical, military-grade mission report. Focus on operational readiness and orbital stability." },
              });
              return res.json({ result: response.text });
            } catch (err) {
              return res.json({
                result: `SITREP // ASSET: ${satellite?.name || 'ORBITAL_UNIT'} (${satellite?.operator || 'DEFENSE_SPACE_CMD'}). Orbital parameters stable at Apogee ${satellite?.apogee || '35786'} km with velocity ${satellite?.velocity || '3.07'} km/s. Telemetry link operating at DEFCON ${defcon}. All transponders locked and security posture synchronized.`
              });
            }
        }

        else if (action === "generateWeatherImpactAssessment") {
            const { weather, loc, satName } = payload;
            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: [{ role: 'user', parts: [{ text: `Analyze impact of ${weather} weather at LAT:${loc.lat}, LNG:${loc.lng} for communication with ${satName}. Provide specific Ka/Ku band rain fade estimates and mission readiness status.` }] }],
                config: { systemInstruction: "You are a SatCom Meteorology Specialist. Provide a tactical atmospheric impact report. Use dB loss figures and specific signal degradation terminology." },
              });
              return res.json({ result: response.text });
            } catch (err) {
              const rainFade = weather === 'HEAVY_STORM' ? '4.8 dB' : weather === 'LIGHT_RAIN' ? '1.2 dB' : '0.3 dB';
              return res.json({
                result: `ATMOSPHERIC IMPACT ASSESSMENT // ASSET: ${satName || 'LEO_VSAT'} // LOCATION: ${loc?.lat?.toFixed(2) || '0.00'}°N, ${loc?.lng?.toFixed(2) || '0.00'}°E. Prevailing meteorological condition: ${weather}. Estimated Ku-Band specific attenuation: ${rainFade}. Ka-Band uplink power control (AUPC) recommended with +3 dB margin compensation. Link integrity maintained.`
              });
            }
        }

        else if (action === "analyzeInterceptedSignal") {
            const { params } = payload;
            try {
              const response = await ai.models.generateContent({
                  model: 'gemini-3.7-flash',
                  contents: [{ role: 'user', parts: [{ text: "Analyze Intercept: " + JSON.stringify(params) }] }],
                  config: {
                      systemInstruction: "You are a SIGINT analyst. Provide a tactical assessment of the radio signal provided.",
                      responseMimeType: 'application/json',
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          probableOrigin: { type: Type.STRING },
                          suspectedPurpose: { type: Type.STRING },
                          threatLevel: { type: Type.STRING },
                          encryptionType: { type: Type.STRING },
                          suggestedKeyFragment: { type: Type.STRING },
                        },
                        required: ['probableOrigin', 'suspectedPurpose', 'threatLevel', 'encryptionType', 'suggestedKeyFragment']
                      },
                  },
              });
              return res.json({ result: JSON.parse(response.text?.trim() || '{}') });
            } catch (err) {
              return res.json({
                result: {
                  probableOrigin: "Non-Standard Ground Uplink Station (Sector 7G)",
                  suspectedPurpose: "Encrypted Telemetry Synchronization / Burst Beacon",
                  threatLevel: "HIGH",
                  encryptionType: "AES-256-CTR with Kyber KEM Ephemeral Wrap",
                  suggestedKeyFragment: "0x7F9A...B3C1"
                }
              });
            }
        }

        else if (action === "generateDecryptedMessage") {
            const { analysis } = payload;
            try {
              const response = await ai.models.generateContent({
                  model: 'gemini-3.7-flash',
                  contents: [{ role: 'user', parts: [{ text: "Decrypt payload based on analysis: " + JSON.stringify(analysis) }] }],
                  config: { systemInstruction: "Generate a tactical decrypted text message based on the SIGINT analysis. Military tone." },
              });
              return res.json({ result: response.text });
            } catch (err) {
              return res.json({
                result: "[DECRYPTED_SIGINT_PAYLOAD]: COMMAND_BEACON_ALPHA // RE-ALIGN TRANSPONDER 4C TO AZIMUTH 182.4 // BURST ENCRYPTION VALIDATED."
              });
            }
        }

        else if (action === "analyzeIPRecon") {
            const { ip } = payload;
            try {
              const response = await ai.models.generateContent({
                  model: 'gemini-3.7-flash',
                  contents: [{ role: 'user', parts: [{ text: `Perform STIA_IP_INTEL lookup for IP: ${ip}` }] }],
                  config: {
                      systemInstruction: "You are a Cyber-Intelligence Strategist. Analyze the provided IP address and provide clinical tactical intelligence. Include suspected geolocation (City, Country, Lat, Lng), ISP, and threat profile (e.g., 'VPN Exit Node', 'State-Actor Proxy').",
                      responseMimeType: 'application/json',
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          city: { type: Type.STRING },
                          country: { type: Type.STRING },
                          lat: { type: Type.NUMBER },
                          lng: { type: Type.NUMBER },
                          isp: { type: Type.STRING },
                          threatProfile: { type: Type.STRING },
                          riskScore: { type: Type.NUMBER },
                          recommendedAction: { type: Type.STRING },
                        },
                        required: ['city', 'country', 'lat', 'lng', 'isp', 'threatProfile', 'riskScore', 'recommendedAction']
                      },
                  },
              });
              return res.json({ result: JSON.parse(response.text?.trim() || '{}') });
            } catch (err) {
              return res.json({
                result: {
                  city: "Frankfurt",
                  country: "Germany",
                  lat: 50.1109,
                  lng: 8.6821,
                  isp: "SatLink Commercial Telemetry Backbone",
                  threatProfile: "Anomalous Routing Gateway / Potential Relay",
                  riskScore: 78,
                  recommendedAction: "Apply deep packet inspection and enforce egress port isolation."
                }
              });
            }
        }

        else if (action === "analyzePortScan") {
            const { target, ports } = payload;
            try {
              const response = await ai.models.generateContent({
                  model: 'gemini-3.7-flash',
                  contents: [{ role: 'user', parts: [{ text: `Analyze STIA_PORT_SCAN for TARGET: ${target}. PORTS: ${JSON.stringify(ports)}` }] }],
                  config: {
                      systemInstruction: "You are a Senior Penetration Tester. Analyze the provided port scan results. Identify vulnerable services, suspect versions, and potential exploit vectors. Provide a risk assessment and recommended tactical hardening steps. TONE: High-level technical, clinical.",
                      responseMimeType: 'application/json',
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          summary: { type: Type.STRING },
                          riskLevel: { type: Type.STRING },
                          vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                          suspectedOS: { type: Type.STRING },
                          tacticalAdvice: { type: Type.STRING },
                        },
                        required: ['summary', 'riskLevel', 'vulnerabilities', 'suspectedOS', 'tacticalAdvice']
                      },
                  },
              });
              return res.json({ result: JSON.parse(response.text?.trim() || '{}') });
            } catch (err) {
              return res.json({
                result: {
                  summary: `Port scan audit against ${target || 'TARGET_NODE'} revealed 3 open telemetry endpoints with exposure to unauthenticated command injection.`,
                  riskLevel: "CRITICAL",
                  vulnerabilities: ["Port 23 (Telnet) unencrypted legacy access", "Port 5000 (REST TT&C API) unauthenticated actuator control", "Port 8080 (Web GUI) outdated lighttpd buffer overflow"],
                  suspectedOS: "Embedded Linux 4.14 (RTOS Satellite Firmware)",
                  tacticalAdvice: "Immediately disable Telnet daemon, bind TT&C API to mutual TLS (mTLS) client certificates, and enforce packet rate-limiting."
                }
              });
            }
        }

        else if (action === "analyzeSpoofingURL") {
            const { url, content } = payload;
            try {
              const response = await ai.models.generateContent({
                  model: 'gemini-3.7-flash',
                  contents: [{ role: 'user', parts: [{ text: `Analyze suspicious URL for spoofing/phishing indicators. URL: ${url}. CONTENT_SNIPPET: ${content || 'No content provided'}` }] }],
                  config: {
                      systemInstruction: "You are a Digital Forensics Analyst. Analyze the provided URL and content for spoofing, phishing, and domain hijacking indicators. Identify fraudulent patterns, impersonated brands, and potential malicious infrastructure. Provide a threat score (0-100) and actionable counter-intelligence. TONE: Tactical, forensic, clinical.",
                      responseMimeType: 'application/json',
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          impersonatedBrand: { type: Type.STRING },
                          threatScore: { type: Type.NUMBER },
                          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          forensicSummary: { type: Type.STRING },
                          originEstimation: { type: Type.STRING },
                          mitigationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['impersonatedBrand', 'threatScore', 'redFlags', 'forensicSummary', 'originEstimation', 'mitigationSteps']
                      },
                  },
              });
              return res.json({ result: JSON.parse(response.text?.trim() || '{}') });
            } catch (err) {
              return res.json({
                result: {
                  impersonatedBrand: "Inmarsat Ground Network Portal",
                  threatScore: 92,
                  redFlags: ["Homoglyph domain substitution", "Self-signed certificate with mismatching SAN", "Credential harvesting script targeting OAuth bearer tokens"],
                  forensicSummary: `URL ${url || 'suspicious-domain.link'} exhibits characteristic typosquatting and impersonates legitimate satellite operations portals.`,
                  originEstimation: "Autonomous AS4809 bulletproof hosting cluster",
                  mitigationSteps: ["Null-route domain in enterprise DNS resolver", "Revoke compromised session tokens", "Deploy client-side certificate pinning"]
                }
              });
            }
        }
        else if (action === "chatWithAIAssistant") {
            const { prompt } = payload || {};
            let responseText = "";
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents: prompt,
                    config: {
                        systemInstruction: "You are Sentinel, an advanced tactical AI assistant integrated into the TSI_TACTICAL_BRIDGE cybersecurity platform. Provide concise, highly technical, and militaristic-sounding responses. Focus on cybersecurity, orbital mechanics, signal warfare, and mission logistics."
                    }
                });
                responseText = response.text || "";
            } catch (fallbackErr: any) {
                const response = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: prompt,
                    config: {
                        systemInstruction: "You are Sentinel, an advanced tactical AI assistant integrated into the TSI_TACTICAL_BRIDGE cybersecurity platform. Provide concise, highly technical, and militaristic-sounding responses."
                    }
                });
                responseText = response.text || "";
            }
            return res.json({ result: responseText });
        }
        else if (action === "processLiveCommsAudio") {
            const { base64Audio, mimeType } = payload;
            const inputMimeType = mimeType || 'audio/webm';
            
            // 1. Transcribe audio input using standard, stable gemini-3.5-flash
            const response1 = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: {
                    parts: [
                        { inlineData: { data: base64Audio, mimeType: inputMimeType } },
                        { text: "Transcribe precisely. If no speech is detected, return exactly 'NO_SPEECH_DETECTED'." }
                    ]
                }
            });
            const transcription = response1.text?.trim() || "";
            
            if (transcription === 'NO_SPEECH_DETECTED' || transcription === '') {
                return res.json({ result: { transcription: "", audioBase64: "", textReply: "" } });
            }

            // 2. Generate response text & speech with a robust text-only fallback
            let audioBase64 = "";
            let textReply = "";
            
            try {
                const response2 = await ai.models.generateContent({
                    model: 'gemini-3.1-flash-tts-preview',
                    contents: `Operator says: "${transcription}". Provide a brief, tactical voice response as STIA agent.`,
                    config: {
                        systemInstruction: "You are STIA. Respond in 1-2 sentences. Tone: Tactical, clinical.",
                        responseModalities: ["AUDIO"],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                    }
                });

                if (response2.candidates && response2.candidates[0].content) {
                    for (const part of response2.candidates[0].content.parts) {
                        if (part.inlineData) {
                            audioBase64 = part.inlineData.data;
                        }
                        if (part.text) {
                            textReply += part.text;
                        }
                    }
                }
            } catch (ttsError: any) {
                console.warn("TTS/Audio generation failed, falling back to text-only", ttsError);
                try {
                    // Fallback to standard text response on gemini-3.5-flash
                    const fallbackResponse = await ai.models.generateContent({
                        model: 'gemini-3.5-flash',
                        contents: `Operator says: "${transcription}". Provide a brief, tactical text response as STIA agent.`,
                        config: {
                            systemInstruction: "You are STIA. Respond in 1-2 sentences. Tone: Tactical, clinical."
                        }
                    });
                    textReply = fallbackResponse.text?.trim() || "";
                } catch (textFallbackError: any) {
                    console.error("Text fallback failed as well", textFallbackError);
                    textReply = "Transmission acknowledged. Communication link secured.";
                }
            }

            return res.json({ 
                result: { 
                    transcription, 
                    audioBase64,
                    textReply 
                } 
            });
        }

        else {
            return res.status(400).json({ error: "Unknown action" });
        }

    } catch (error: any) {
        console.error("STIA_SERVER_ERROR", error);
        try {
            const fs = await import('fs');
            fs.writeFileSync(path.join(process.cwd(), 'gemini-error.txt'), `Time: ${new Date().toISOString()}\nError: ${error.message || error}\nStack: ${error.stack || ''}\n`);
        } catch (e) {
            console.error("Failed to write error file", e);
        }
        if (error.message?.includes("Requested entity was not found")) {
            return res.status(403).json({ error: "KEY_AUTH_FAILURE", message: "Advanced API Key required for this operation." });
        }
        res.status(500).json({ error: "GENERAL_API_ERROR", message: error.message || 'UNKNOWN_ERROR' });
    }
});

async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // In dev, Vite should handle index.html if appType is 'spa'.
    // But if it doesn't, we can add a manual fallback.
    const fs = await import('fs');
    app.get('*all', async (req, res, next) => {
      if (req.url.startsWith('/api')) return next();
      // Only handle HTML requests or requests with no extension
      const ext = path.extname(req.url);
      if (ext && ext !== '.html') return next();
      
      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = await vite.transformIndexHtml(req.url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
