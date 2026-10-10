
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

const callBackend = async (action: string, payload: any) => {
    const res = await fetch('/api/gemini/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || data.error || 'Server error');
    }
    return data;
};

export const getTroubleshootingAdvice = async (
  issue: string, 
  context?: any, 
  telemetry?: any, 
  options: { thinking?: boolean, useSearch?: boolean, useMaps?: boolean, mediaData?: { data: string, mimeType: string }[] } = {}
) => {
    try {
        const data = await callBackend('getTroubleshootingAdvice', { issue, context, telemetry, options });
        return { text: data.text, grounding: data.grounding };
    } catch (error: any) {
        if (error.message?.includes("Advanced API Key required")) {
            return { error: "KEY_AUTH_FAILURE", text: "STIA_HALT: Advanced API Key required for this operation." };
        }
        return { error: "GENERAL_API_ERROR", text: `SYSTEM_HALT: INTEL_UPLINK_FAILURE. REASON: ${error.message || 'UNKNOWN_ERROR'}` };
    }
};

export const generateTacticalImage = async (prompt: string, aspectRatio: string = "16:9", size: string = "1K") => {
    try {
        const data = await callBackend('generateTacticalImage', { prompt, aspectRatio, size });
        return data.result;
    } catch (err: any) {
        if (err.message?.includes("KEY_AUTH_FAILURE") || err.message?.includes("Advanced API Key")) throw new Error("KEY_AUTH_FAILURE");
        return null;
    }
};

export const editTacticalImage = async (base64Image: string, prompt: string) => {
    try {
        const data = await callBackend('editTacticalImage', { base64Image, prompt });
        return data.result;
    } catch (err: any) {
        if (err.message?.includes("KEY_AUTH_FAILURE") || err.message?.includes("Advanced API Key")) throw new Error("KEY_AUTH_FAILURE");
        return null;
    }
};

export const generateTacticalVideo = async (prompt: string, orientation: '16:9' | '9:16' = '16:9', startImage?: string) => {
    try {
        const data = await callBackend('generateTacticalVideo', { prompt, orientation, startImage });
        return data.result;
    } catch (err: any) {
        if (err.message?.includes("KEY_AUTH_FAILURE") || err.message?.includes("Advanced API Key")) throw new Error("KEY_AUTH_FAILURE");
        return null;
    }
};

export const transcribeAudio = async (base64Audio: string) => {
    try {
        const data = await callBackend('transcribeAudio', { base64Audio });
        return data.result;
    } catch (err) {
        return "[COMM_INTERFERENCE]";
    }
};

export const getWarGamesTurn = async (history: any[], objective: string) => {
    try {
        const data = await callBackend('getWarGamesTurn', { history, objective });
        if (data && data.result) return data.result;
    } catch (err) {
        console.warn("Client fallback for getWarGamesTurn", err);
    }
    const turnIndex = Array.isArray(history) ? history.length : 0;
    const isFinal = turnIndex >= 8;
    return {
        redTeamAction: { 
            action: "Injected targeted subcarrier interference waveform onto primary downlink transponder.", 
            rationale: "Triggering demodulator cycle slips and forcing gateway failover." 
        },
        blueTeamAction: { 
            action: "Engaged adaptive low-density parity check (LDPC) forward error correction and increased carrier power.", 
            rationale: "Preserving bit-error-rate within nominal operational thresholds." 
        },
        systemStateChange: { 
            narrative: "Transponder lock maintained. BER margin stabilized with +2.1 dB headroom.", 
            link_integrity_delta: -6, 
            threat_level: isFinal ? "CRITICAL" : "HIGH" 
        },
        isObjectiveMet: isFinal
    };
};

export const generateWarGamesReport = async (history: any[], objective: string) => {
    try {
        const data = await callBackend('generateWarGamesReport', { history, objective });
        if (data && data.result) return data.result;
    } catch (err) {
        console.warn("Client fallback for generateWarGamesReport", err);
    }
    return `POST-ACTION REPORT (AAR) - STIA WAR GAMES CYBER ENGAGEMENT
================================================================
MISSION OBJECTIVE: ${objective}
CLASSIFICATION: TOP SECRET // STIA-SI-TK // NOFORN
ENGAGEMENT DURATION: ${Array.isArray(history) ? history.length : 0} Tactical Cycles

1. EXECUTIVE SUMMARY:
Simulated orbital warfare engagement executed against targeted VSAT telemetry link. Hostile electronic and cyber infiltration vectors were successfully contested by automated Blue Team defensive countermeasures.

2. TACTICAL SEQUENCE ANALYSIS:
- Signal Interception & BGP Manipulation: Detected and routed through secondary cryptographic enclave.
- Transponder Saturation / Jamming: Suppressed via adaptive spatial notch filters.

3. VULNERABILITIES IDENTIFIED:
- Ephemeral transponder side-channel leakage during legacy cipher negotation.
- Latency jitter during automated ground gateway failover.

4. REMEDIATION & HARDENING DIRECTIVES:
- Enforce hybrid post-quantum key exchange (ML-KEM-768) across all telemetry gateways.
- Restrict all remote configuration endpoints to mutual TLS (mTLS) with hardware security module root of trust.
================================================================
STIA_STATUS: AAR COMPILATION COMPLETE. ARCHIVED TO SECURE LEDGER.`;
};

export const generateSatelliteSitrep = async (satellite: any, defcon: number) => {
    try {
        const data = await callBackend('generateSatelliteSitrep', { satellite, defcon });
        return data.result;
    } catch (err) {
        return "INTEL_LINK_DEGRADED. MANUALLY_AUDIT_TELEMETRY.";
    }
};

export const generateWeatherImpactAssessment = async (weather: string, loc: any, satName: string) => {
    try {
        const data = await callBackend('generateWeatherImpactAssessment', { weather, loc, satName });
        return data.result;
    } catch (err) {
        return "MET_DATA_UNAVAILABLE. PROCEED_WITH_MANUAL_FADE_CALCULATION.";
    }
};

export const analyzeInterceptedSignal = async (params: any) => {
    try {
        const data = await callBackend('analyzeInterceptedSignal', { params });
        return data.result;
    } catch (err) {
        return null;
    }
};

export const generateDecryptedMessage = async (analysis: any) => {
    try {
        const data = await callBackend('generateDecryptedMessage', { analysis });
        return data.result;
    } catch (err) {
        return " // ...PACKET_LOSS_CRITICAL... //";
    }
};

export const analyzeIPRecon = async (ip: string) => {
    try {
        const data = await callBackend('analyzeIPRecon', { ip });
        return data.result;
    } catch (err) {
        return null;
    }
};

export const analyzePortScan = async (target: string, ports: any[]) => {
    try {
        const data = await callBackend('analyzePortScan', { target, ports });
        return data.result;
    } catch (err) {
        return null;
    }
};

export const analyzeSpoofingURL = async (url: string, content?: string) => {
    try {
        const data = await callBackend('analyzeSpoofingURL', { url, content });
        return data.result;
    } catch (err) {
        return null;
    }
};
