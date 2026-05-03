
import { GoogleGenAI, Type, FunctionDeclaration, Content, Modality, GenerateContentResponse } from "@google/genai";

// Tool Definition
const terminalSensorTool: FunctionDeclaration = {
  name: "read_terminal_sensors",
  description: "Reads live sensor telemetry from the local VSAT terminal hardware. Returns SNR, power levels, temperature, and packet stats.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, description: "Current hardware status" }
    },
  },
};

const getAiInstance = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getTroubleshootingAdvice = async (
  issue: string, 
  context?: any, 
  telemetry?: any, 
  options: { thinking?: boolean, useSearch?: boolean, useMaps?: boolean, mediaData?: { data: string, mimeType: string }[] } = {}
) => {
  const ai = getAiInstance();
  const modelId = options.thinking ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
  
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

  try {
    const tools: any[] = [];
    if (options.useSearch) tools.push({ googleSearch: {} });
    tools.push({ functionDeclarations: [terminalSensorTool] });

    const parts: any[] = [{ text: "STIA_COMMAND: " + issue }];
    if (options.mediaData) {
      options.mediaData.forEach(m => {
        parts.push({ inlineData: m });
      });
    }

    const contents: Content[] = [{ role: 'user', parts }];
    const config: any = {
      systemInstruction,
      tools: tools.length > 0 ? tools : undefined,
    };

    if (options.thinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

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
      response = await ai.models.generateContent({
        model: modelId,
        contents,
        config,
      });
    } catch (toolError: any) {
      // Fallback: If tools (like googleSearch) cause 403, retry without tools
      if (toolError.message?.includes("PERMISSION_DENIED") && (options.useSearch || options.useMaps)) {
        console.warn("RETRYING_WITHOUT_TOOLS: Tool permission denied.");
        const fallbackConfig = { ...config, tools: undefined, toolConfig: undefined };
        response = await ai.models.generateContent({
          model: modelId,
          contents,
          config: fallbackConfig,
        });
      } else {
        throw toolError;
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
            
            response = await ai.models.generateContent({
                model: modelId,
                contents,
                config
            });
        }
    }

    let output = response.text || "";
    return {
      text: output,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error: any) {
    console.error("STIA_CRITICAL_ERROR", error);
    if (error.message?.includes("Requested entity was not found")) {
      return { error: "KEY_AUTH_FAILURE", text: "STIA_HALT: Advanced API Key required for this operation." };
    }
    // Return the actual error message for better debugging
    return { 
      error: "GENERAL_API_ERROR", 
      text: `SYSTEM_HALT: INTEL_UPLINK_FAILURE. REASON: ${error.message || 'UNKNOWN_ERROR'}` 
    };
  }
};

export const generateTacticalImage = async (prompt: string, aspectRatio: string = "16:9", size: string = "1K") => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-fidelity tactical satellite visualization: ${prompt}. Professional technical military style.` }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates![0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err: any) {
    console.error("IMAGE_GEN_ERROR", err);
    if (err.message?.includes("PERMISSION_DENIED") || err.message?.includes("Requested entity was not found")) {
      throw new Error("KEY_AUTH_FAILURE");
    }
    return null;
  }
};

export const editTacticalImage = async (base64Image: string, prompt: string) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: `Apply tactical overlay: ${prompt}. Maintain technical accuracy.` }
        ]
      }
    });

    for (const part of response.candidates![0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err: any) {
    console.error("IMAGE_EDIT_ERROR", err);
    if (err.message?.includes("PERMISSION_DENIED") || err.message?.includes("Requested entity was not found")) {
      throw new Error("KEY_AUTH_FAILURE");
    }
    return null;
  }
};

export const generateTacticalVideo = async (prompt: string, orientation: '16:9' | '9:16' = '16:9', startImage?: string) => {
  const ai = getAiInstance();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: `Cinematic tactical satellite mission sequence: ${prompt}`,
      image: startImage ? {
        imageBytes: startImage.split(',')[1],
        mimeType: 'image/png'
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: orientation
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.GEMINI_API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err: any) {
    console.error("VIDEO_GEN_ERROR", err);
    if (err.message?.includes("PERMISSION_DENIED") || err.message?.includes("Requested entity was not found")) {
      throw new Error("KEY_AUTH_FAILURE");
    }
    return null;
  }
};

export const transcribeAudio = async (base64Audio: string) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' } },
          { text: "Transcribe the tactical comms precisely." }
        ]
      }
    });
    return response.text;
  } catch (err) {
    console.error("TRANSCRIPTION_ERROR", err);
    return "[COMM_INTERFERENCE]";
  }
};

export const getWarGamesTurn = async (history: any[], objective: string) => {
  const ai = getAiInstance();
  const systemInstruction = `
    You are a 'War Games Cyber-Orchestrator'. Simulate turns in a conflict for a SatCom link.
    - RED: Targeted Strike Team.
    - BLUE: Network Hardening Team.
    Respond strictly in the provided JSON schema.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    return JSON.parse(response.text.trim());
  } catch (error) { return null; }
};

export const generateWarGamesReport = async (history: any[], objective: string) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [{ role: 'user', parts: [{ text: `Final Combat Log: ${JSON.stringify(history)}` }] }],
      config: {
        systemInstruction: "Generate a professional Post-Action Report (AAR) for this SatCom cyber engagement simulation.",
      },
    });
    return response.text;
  } catch (error) { return "ERROR: REPORT_COMPILATION_FAILED."; }
};

export const generateSatelliteSitrep = async (satellite: any, defcon: number) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Generate a 3-sentence tactical SITREP for satellite ${satellite.name} (${satellite.operator}). Telemetry: Apogee=${satellite.apogee}km, Velocity=${satellite.velocity}km/s, Status=${satellite.status}. DEFCON=${defcon}.` }] 
      }],
      config: {
        systemInstruction: "You are a Senior Intelligence Officer. Provide a concise, clinical, military-grade mission report. Focus on operational readiness and orbital stability.",
      },
    });
    return response.text;
  } catch (error) {
    return "INTEL_LINK_DEGRADED. MANUALLY_AUDIT_TELEMETRY.";
  }
};

export const generateWeatherImpactAssessment = async (weather: string, loc: any, satName: string) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Analyze impact of ${weather} weather at LAT:${loc.lat}, LNG:${loc.lng} for communication with ${satName}. Provide specific Ka/Ku band rain fade estimates and mission readiness status.` }] 
      }],
      config: {
        systemInstruction: "You are a SatCom Meteorology Specialist. Provide a tactical atmospheric impact report. Use dB loss figures and specific signal degradation terminology.",
      },
    });
    return response.text;
  } catch (error) {
    return "MET_DATA_UNAVAILABLE. PROCEED_WITH_MANUAL_FADE_CALCULATION.";
  }
};

export const analyzeInterceptedSignal = async (params: any) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
    return JSON.parse(response.text.trim());
  } catch(error) { return null; }
};

export const generateDecryptedMessage = async (analysis: any) => {
    const ai = getAiInstance();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: "Decrypt payload based on analysis." }] }],
            config: { systemInstruction: "Generate a tactical decrypted text message based on the SIGINT analysis. Military tone." },
        });
        return response.text;
    } catch(error) { return " // ...PACKET_LOSS_CRITICAL... //"; }
};

export const analyzeIPRecon = async (ip: string) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
    return JSON.parse(response.text.trim());
  } catch(error) { return null; }
};

export const analyzePortScan = async (target: string, ports: any[]) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
    return JSON.parse(response.text.trim());
  } catch(error) { return null; }
};

export const analyzeSpoofingURL = async (url: string, content?: string) => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
    return JSON.parse(response.text.trim());
  } catch(error) { return null; }
};
