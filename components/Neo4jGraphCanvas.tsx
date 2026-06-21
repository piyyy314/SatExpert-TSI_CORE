import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Network,
  Database,
  Search,
  Terminal as TerminalIcon,
  Activity,
  Lock,
  Cpu,
  Zap,
  Download,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Server,
  Laptop,
  Globe,
  Settings,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface ElasticLog {
  id: string;
  time: string;
  source: string;
  destination: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  msg: string;
  payload: string;
}

interface GraphNode {
  id: string;
  ip: string;
  name: string;
  type: 'gateway' | 'workstation' | 'server' | 'dc' | 'database';
  ring: 0 | 1 | 2 | 3; // 0 is innermost, 3 is outermost
  angle: number; // angle in degrees
  compromised: boolean;
  alert: boolean;
  threatActor?: string;
  os: string;
}

interface KeyValue {
  [key: string]: any;
}

// Fixed nodes to ensure pristine relative layout on Canvas orbits
const INITIAL_NODES: GraphNode[] = [
  { id: 'gw-1', ip: '10.0.100.1', name: 'VPN-GATEWAY-01', type: 'gateway', ring: 3, angle: 90, compromised: true, alert: false, os: 'Alpine Linux (Router v3.8)', threatActor: 'APT29 (COZY_CARRIER)' },
  { id: 'fw-1', ip: '10.0.100.2', name: 'EXT-FIREWALL-02', type: 'gateway', ring: 3, angle: 270, compromised: false, alert: true, os: 'FortiOS v7.2.1', threatActor: undefined },
  { id: 'wk-1', ip: '10.0.4.15', name: 'HR-LAPTOP-01', type: 'workstation', ring: 2, angle: 30, compromised: true, alert: false, os: 'Windows 11 Pro (Enrolled)', threatActor: 'APT29 (Lateral Hash-Pass)' },
  { id: 'wk-2', ip: '10.0.5.22', name: 'DEV-WKST-04', type: 'workstation', ring: 2, angle: 150, compromised: false, alert: true, os: 'Ubuntu 22.04 LTS (Docker Envoy)', threatActor: undefined },
  { id: 'srv-1', ip: '10.0.10.5', name: 'WEB-SRV-01', type: 'server', ring: 1, angle: 330, compromised: false, alert: true, os: 'Apache httpd v2.4 (RHEL 9)', threatActor: undefined },
  { id: 'srv-2', ip: '10.0.10.12', name: 'FILE-SRV-02', type: 'server', ring: 1, angle: 210, compromised: false, alert: false, os: 'Windows Server 2022 (Active Directory Link)', threatActor: undefined },
  { id: 'dc-1', ip: '10.0.20.2', name: 'DC-PRIMARY', type: 'dc', ring: 0, angle: 0, compromised: false, alert: false, os: 'Windows Server 2022 Core (DC-Sync)', threatActor: undefined },
  { id: 'db-1', ip: '10.0.30.50', name: 'SQL-CUSTOMER-DB', type: 'database', ring: 0, angle: 180, compromised: false, alert: false, os: 'PostgreSQL v16.1 (Cosmos Sync Target)', threatActor: undefined },
];

const GRAPH_LINKS = [
  { source: 'gw-1', target: 'wk-1', label: 'EXPLOITED_ROUTE' },
  { source: 'fw-1', target: 'wk-2', label: 'BLOCKED_PING' },
  { source: 'wk-1', target: 'srv-1', label: 'CREDENTIAL_PASS_HASH' },
  { source: 'wk-1', target: 'srv-2', label: 'SMB_LATERAL_LOOKUP' },
  { source: 'srv-1', target: 'db-1', label: 'SQL_PORT_TUNNEL' },
  { source: 'srv-2', target: 'dc-1', label: 'DCSYNC_ATTEMPT_STAGED' },
  { source: 'dc-1', target: 'db-1', label: 'DB_CROWN_JEWELS_SYNC' }
];

const INITIAL_LOGS: ElasticLog[] = [
  { id: 'LOG-001', time: '13:21:05.182', source: '10.0.100.1', destination: '10.0.4.15', action: 'PORT_SCAN_RECON', severity: 'WARNING', msg: 'Rapid connection attempts detected on SMB target ports from VPN perimeter node.', payload: '{"protocol":"TCP","ports":[139,445],"syn_count":128}' },
  { id: 'LOG-002', time: '13:22:14.391', source: '10.0.4.15', destination: '10.0.10.5', action: 'LSASS_CRED_EXFIL', severity: 'CRITICAL', msg: 'Mimikatz Pass-The-Hash activity detected over remote RPC interface. Local credentials copied.', payload: '{"hash_type":"NTLM","account_id":"STIA_ADMIN_SECURE","session_id":"S-1-5-21-9321"}' },
  { id: 'LOG-003', time: '13:23:02.049', source: '10.0.100.2', destination: '10.0.5.22', action: 'FIREWALL_ALERT', severity: 'WARNING', msg: 'Zero-Day spoofing envelope dropped at outer subnet firewall boundary.', payload: '{"drop_reason":"INVALID_CHECKSUM","packet_len":1440,"spoofed_origin":"8.8.8.8"}' },
  { id: 'LOG-004', time: '13:24:45.912', source: '10.0.10.5', destination: '10.0.30.50', action: 'SQL_MAL_CONNECTION', severity: 'CRITICAL', msg: 'Heuristic backdoor handshake payload sent over PostgreSQL network link.', payload: '{"query_pattern":"SELECT pg_read_file(\'/etc/passwd\')","rows_affected":0}' },
  { id: 'LOG-005', time: '13:25:01.320', source: '10.0.20.2', destination: '10.0.30.50', action: 'DC_SYN_FLOW', severity: 'INFO', msg: 'Standard directory trust synchronization verification completed successfully.', payload: '{"replication_token":"0x403F_B29A","directory_entries":18}' },
  { id: 'LOG-006', time: '13:25:32.115', source: '10.0.10.12', destination: '10.0.20.2', action: 'SMB_BRUTE_FORCE', severity: 'WARNING', msg: 'Repeated administrative SMB session setup retries detected with common credentials.', payload: '{"retries":15,"targeted_user":"Administrator"}' },
  { id: 'LOG-007', time: '13:26:10.590', source: '10.0.4.15', destination: '10.0.10.12', action: 'LAT_MOUNT_ADMIN', severity: 'CRITICAL', msg: 'WMI Shell execution trigger detected targeting backend file cluster storage pools.', payload: '{"cmd":"powershell.exe -Enc QmFja2Rvb3JfVlNBVF9BY3RpdmF0ZWQ="}' }
];

export const Neo4jGraphCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[0]);
  const [activeEngine, setActiveEngine] = useState<'neo4j' | 'influx' | 'pinecone' | 'elastic'>('neo4j');
  
  // Neo4j Interactive State
  const [cypherQuery, setCypherQuery] = useState('MATCH (n:Host {compromised: true}) RETURN n');
  const [cypherResults, setCypherResults] = useState<any[]>([]);
  const [neoLogs, setNeoLogs] = useState<string[]>([
    '[INIT] Neo4j Bolt Driver connected to localhost:7687',
    '[OK] Graph Database schema loaded: (Host)-[:LATERAL_MOVE]->(Host)',
    '[DB] Total nodes matching: 8. Total relations matching: 7.'
  ]);

  // InfluxDB Interactive State
  const [timeSeriesLogs, setTimeSeriesLogs] = useState<any[]>([]);
  const [signalDegradation, setSignalDegradation] = useState(1.4); // manual parameter
  const [sensorValues, setSensorValues] = useState({ snr: 12.4, bucTemp: 308.2, loss: 0.1 });
  const [telemetryHistory, setTelemetryHistory] = useState<{ time: string, snr: number, temp: number }[]>([]);

  // Pinecone Interactive State
  const [vectorQuery, setVectorQuery] = useState('DCSync PrintNightmare credential extraction');
  const [vectorMatches, setVectorMatches] = useState<any[]>([]);
  const [isVectorSearching, setIsVectorSearching] = useState(false);

  // Elasticsearch Interactive State
  const [elasticSearchTerm, setElasticSearchTerm] = useState('');
  const [liveElasticLogs, setLiveElasticLogs] = useState<ElasticLog[]>(INITIAL_LOGS);
  const [elasticLogs, setElasticLogs] = useState<ElasticLog[]>(INITIAL_LOGS);

  // General Simulation
  const [simulationActive, setSimulationActive] = useState(true);
  const [compromisePathRun, setCompromisePathRun] = useState(false);

  // Keep a reference to current nodes to avoid restarting interval on every node update
  const nodesRef = useRef<GraphNode[]>(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // SVG dimensions
  const width = 640;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;

  // Center orbits radii
  const ringRadii = {
    0: 60,   // Sensitive Core (Ring 0)
    1: 130,  // DMZ Orbit (Ring 1)
    2: 200,  // Intranet (Ring 2)
    3: 270   // Perimeter Orbit (Ring 3)
  };

  // Run Real-time InfluxDB & general continuous simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (simulationActive) {
      interval = setInterval(() => {
        // Fluctuating telemetry
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const randomFactor = Math.random() - 0.5;
        
        const newSnr = Math.max(1.2, parseFloat((15.4 - (signalDegradation * 2.8) + randomFactor * 0.4).toFixed(2)));
        const newTemp = parseFloat((305.5 + (signalDegradation * 4.2) + randomFactor * 1.5).toFixed(1));
        const newLoss = Math.min(100, Math.max(0, parseFloat(((signalDegradation > 2 ? (signalDegradation - 1.5) * 8.5 : 0.1) + Math.random() * 0.5).toFixed(2))));

        setSensorValues({ snr: newSnr, bucTemp: newTemp, loss: newLoss });

        setTelemetryHistory(prev => {
          const next = [...prev, { time: timeStr, snr: newSnr, temp: newTemp }];
          if (next.length > 15) next.shift();
          return next;
        });

        // Add a line in InfluxDB sub-second metrics stream
        setTimeSeriesLogs(prev => {
          const line = `metric_stream,node=STIA_ORBITAL_V6,transponder=KU_BAND snr_db=${newSnr},buc_temp_k=${newTemp},packet_loss_pct=${newLoss}`;
          const next = [line, ...prev];
          if (next.length > 10) next.pop();
          return next;
        });

        // 35% probability of generating a fresh live log mimicking realistic operations matching actual node security statuses
        if (Math.random() < 0.35 && nodesRef.current.length > 0) {
          setLiveElasticLogs(prev => {
            const currentNodes = nodesRef.current;
            const randomNode = currentNodes[Math.floor(Math.random() * currentNodes.length)];
            const targetNode = currentNodes[Math.floor(Math.random() * currentNodes.length)];
            
            let severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO';
            let action = 'SYS_PING';
            let msg = `Normal state ping verification completed for ${randomNode.name}.`;
            let payload = `{"rtt_ms": ${Math.floor(Math.random() * 45) + 5}, "status": "UP"}`;

            if (randomNode.compromised) {
              severity = 'CRITICAL';
              const attackActions = ['APT_COMMAND_EXEC', 'EXFILTRATION_BEACON', 'HASH_COLLECTION', 'SQL_DUMP_INJECT', 'BACKDOOR_HEARTBEAT'];
              action = attackActions[Math.floor(Math.random() * attackActions.length)];
              msg = `Unsanctioned telemetry broadcast payload captured from compromised node ${randomNode.name} (${randomNode.ip}).`;
              payload = `{"threat_source": "${randomNode.threatActor || 'COZY_CARRIER'}", "dest_ip": "${targetNode.ip}", "bytes_transferred": ${Math.floor(Math.random() * 20000) + 1000}}`;
            } else if (randomNode.alert) {
              severity = 'WARNING';
              const warningActions = ['PORT_SCAN_RECON', 'AUTH_FAIL_RETRY', 'INTEGRITY_ALERT', 'CERTIFICATE_WARN'];
              action = warningActions[Math.floor(Math.random() * warningActions.length)];
              msg = `Abnormal system behavior heuristic flagged at node ${randomNode.name}. Subnet threshold exceeded.`;
              payload = `{"flagged_attribute": "socket_open", "frequency_sec": ${Math.floor(Math.random() * 20) + 5}, "ip_origin": "${randomNode.ip}"}`;
            } else {
              // Occasional warnings for normal logs
              if (Math.random() < 0.2) {
                severity = 'WARNING';
                action = 'SUBNET_RECON_REJECT';
                msg = `Outer firewall blocked stateful traffic segment routing to ${randomNode.name}.`;
                payload = `{"blocked_protocol": "ICMP", "ip_origin": "198.51.100.24"}`;
              }
            }

            const newLogId = `LOG-${Math.floor(Math.random() * 900000) + 100000}`;
            const newLog: ElasticLog = {
              id: newLogId,
              time: `${new Date().toLocaleTimeString([], { hour12: false })}.${Math.floor(Math.random() * 90) + 10}`,
              source: randomNode.ip,
              destination: targetNode.ip,
              action,
              severity,
              msg,
              payload
            };

            const next = [newLog, ...prev];
            if (next.length > 50) next.pop(); // keep log limit
            return next;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationActive, signalDegradation]);

  // Handle Cypher Query executing inside Simulated Neo4j Instance
  const handleRunCypher = (customQuery?: string) => {
    const queryToRun = customQuery || cypherQuery;
    setNeoLogs(prev => [...prev, `neo4j-cypher > ${queryToRun}`]);
    
    // Simulate query parsing
    setTimeout(() => {
      let results: any[] = [];
      const lower = queryToRun.toLowerCase();

      if (lower.includes('compromised: true') || lower.includes('compromised=true')) {
        results = nodes.filter(n => n.compromised).map(n => ({
          'n.name': n.name,
          'n.ip': n.ip,
          'n.ring': `RING_${n.ring}`,
          'n.compromised': 'TRUE',
          'threat_actor': n.threatActor || 'APT29 (COZY_CARRIER)'
        }));
        setNeoLogs(prev => [...prev, `[SUCCESS] Graph Query matched ${results.length} nodes in 4.12 ms.`]);
      } else if (lower.includes('match (a)-') || lower.includes('return a,b')) {
        results = GRAPH_LINKS.map(l => {
          const sourceNode = nodes.find(n => n.id === l.source);
          const targetNode = nodes.find(n => n.id === l.target);
          return {
            'relationship_type': l.label,
            'source_node': sourceNode?.name || l.source,
            'source_compromised': sourceNode?.compromised ? 'TRUE' : 'FALSE',
            'target_node': targetNode?.name || l.target,
            'target_compromised': targetNode?.compromised ? 'TRUE' : 'FALSE'
          };
        });
        setNeoLogs(prev => [...prev, `[SUCCESS] Relation query matching paths. Matched ${results.length} connections in 8.56 ms.`]);
      } else if (lower.includes(':database') || lower.includes('db-1') || lower.includes('sql-customer')) {
        const dbNode = nodes.find(n => n.type === 'database');
        results = [{
          'node_classification': 'CROWN_JEWELS',
          'node_label': dbNode?.name,
          'node_ip': dbNode?.ip,
          'operating_system': dbNode?.os,
          'is_compromised': dbNode?.compromised ? 'ALERT_RED' : 'SECURE_CYAN'
        }];
        setNeoLogs(prev => [...prev, `[SUCCESS] Database node properties retreived. Matched 1 highly sensitive node.`]);
      } else {
        // Generic return all matching nodes
        results = nodes.map(n => ({
          'id': n.id,
          'host_name': n.name,
          'ip_addr': n.ip,
          'is_exploited': n.compromised ? 'TRUE' : 'FALSE',
          'security_compliance': n.alert ? 'HIGH_RISK_WARNING' : 'COMPLIANT_SHIELD_OK'
        }));
        setNeoLogs(prev => [...prev, `[SUCCESS] Returned entire spatial canvas graph context (${results.length} nodes) in 6.09 ms.`]);
      }
      setCypherResults(results);
    }, 400);
  };

  // Run automated Pinecone vector embedding matching
  const handleVectorSearch = () => {
    setIsVectorSearching(true);
    setTimeout(() => {
      const db: { vector: string, text: string, actor: string, matchScore: number, mitigation: string }[] = [
        { vector: '[0.0125, -0.8904, ..., 0.2291]', text: 'LSASS credential dumping utilizing procdump NTLM extraction and Pass-the-Hash protocols.', actor: 'APT29 (COZY_CARRIER)', matchScore: 0.982, mitigation: 'Activate STIA Shield, isolate HR-LAPTOP-01' },
         { vector: '[-0.1042, 0.4491, ..., 0.9103]', text: 'WMI execution of base64 encoded PowerShell shells targeting localized admin endpoints.', actor: 'APT29 (Cozy Carrier)', matchScore: 0.931, mitigation: 'Deploy PrintNightmare vulnerability patch immediately' },
        { vector: '[0.4481, -0.1192, ..., -0.5512]', text: 'DNS Tunneling exfiltration over standard stateful DNS resolution interface. Subdomain high entropy lookup.', actor: 'APT28 (FANCY_BEAR)', matchScore: 0.742, mitigation: 'Reset DNS forwarding tables at Perimeter VPN router' },
        { vector: '[0.8801, 0.1292, ..., 0.0094]', text: 'PostgreSQL privilege escalation via external system UDF injection payload scripts.', actor: 'SANDWORM_TEAM', matchScore: 0.518, mitigation: 'Physical lock of database UART bus ports, purge memory buffers' }
      ];

      // Match logic based on keywords
      const queryLower = vectorQuery.toLowerCase();
      let matches = db;
      if (queryLower.trim()) {
        matches = db.map(item => {
          let scoreIncrease = 0;
          if (queryLower.includes('credentials') || queryLower.includes('lsass') || queryLower.includes('hash')) {
            if (item.text.includes('credential') || item.text.includes('LSASS')) scoreIncrease = 0.15;
          }
          if (queryLower.includes('dns') || queryLower.includes('tunnel') || queryLower.includes('exfiltration')) {
            if (item.text.includes('DNS') || item.text.includes('Tunnel')) scoreIncrease = 0.25;
          }
          if (queryLower.includes('sql') || queryLower.includes('database') || queryLower.includes('postgres')) {
            if (item.text.includes('PostgreSQL')) scoreIncrease = 0.35;
          }
          return {
            ...item,
            matchScore: Math.min(0.999, item.matchScore + scoreIncrease)
          };
        }).sort((a, b) => b.matchScore - a.matchScore);
      }
      setVectorMatches(matches);
      setIsVectorSearching(false);
    }, 600);
  };

  // Auto trigger vector search on query load
  useEffect(() => {
    handleVectorSearch();
  }, []);

  // Filter Elasticsearch logs
  useEffect(() => {
    if (elasticSearchTerm.trim() === '') {
      setElasticLogs(liveElasticLogs);
    } else {
      const term = elasticSearchTerm.toLowerCase();
      const filtered = liveElasticLogs.filter(log => 
        log.source.includes(term) ||
        log.destination.includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.msg.toLowerCase().includes(term) ||
        log.payload.toLowerCase().includes(term)
      );
      setElasticLogs(filtered);
    }
  }, [elasticSearchTerm, liveElasticLogs]);

  // Nodes position helper in SVG coordinates
  const getNodePosition = (node: GraphNode) => {
    const radius = ringRadii[node.ring];
    const angleRad = (node.angle * Math.PI) / 180;
    const x = cx + radius * Math.cos(angleRad);
    const y = cy + radius * Math.sin(angleRad);
    return { x, y };
  };

  // Reset simulation completely
  const resetSimulation = () => {
    setNodes(INITIAL_NODES);
    setSelectedNode(INITIAL_NODES[0]);
    setCompromisePathRun(false);
    setSignalDegradation(1.4);
    setLiveElasticLogs(INITIAL_LOGS);
    setNeoLogs([
      '[INIT] Neo4j Bolt Driver connected to localhost:7687',
      '[OK] Graph Database schema loaded: (Host)-[:LATERAL_MOVE]->(Host)',
      '[DB] Total nodes matching: 8. Total relations matching: 7. Simulation state reset.'
    ]);
  };

  // Run step by step adversary lateral movement expansion
  const simulateLateralExpansion = async () => {
    setCompromisePathRun(true);
    setNeoLogs(prev => [...prev, '[STRIKE_SIMULATION_ACTIVE] Beginning lateral movement sequence...']);
    
    const steps = [
      { id: 'srv-1', actor: 'APT29 (Cross-over hash hijack)', description: 'Lateral movement triggered: Web server port hijacked from compromised workstation!' },
      { id: 'srv-2', actor: 'APT29 (Active SMB probing)', description: 'Lateral movement triggered: SMB host compromised!' },
      { id: 'dc-1', actor: 'APT29 (Domain Admin Takeover)', description: 'Privilege escalation: DCSync triggered on AD controller!' },
      { id: 'db-1', actor: 'APT29 (Database Vault compromise - ALL CORE DATA COMPROMISED)', description: 'Data Exfiltration: SQL database decrypted!' }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 1600));
      setNodes(prev => prev.map(n => {
        if (n.id === step.id) {
          return { ...n, compromised: true, alert: false, threatActor: step.actor };
        }
        return n;
      }));
      setNeoLogs(prev => [...prev, `[EXPL_TRIGGERED] Host (${step.id}) status => COMPROMISED. Vector: ${step.actor}`]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Panel with Quick Explanations */}
      <div className="bg-slate-950/70 p-6 rounded-[2rem] border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Polyglot Persistence Layer & Neo4j Active Canvas</h3>
          </div>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 leading-relaxed max-w-3xl">
            Integrating specialized tactical engines for military-grade persistence: <span className="text-purple-400">Neo4j Graph Database</span> handles lateral node compromise rings, <span className="text-yellow-400">InfluxDB</span> handles sub-second high-density telemetry, <span className="text-cyan-400">Pinecone</span> processes high-dimensional similarity math, and <span className="text-red-400">Elasticsearch</span> indexes real-time tactical security syslog files.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={resetSimulation} 
            className="p-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-400 hover:text-white rounded-xl transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset State
          </button>
          
          <button 
            onClick={simulateLateralExpansion} 
            disabled={compromisePathRun}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
              compromisePathRun 
              ? 'bg-red-950/50 text-red-500 border border-red-900/30 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Simulate Attack Run
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Interactive Graphical Map: Neo4j Canvas with ORBITS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass rounded-[2.5rem] border-2 border-slate-800 bg-[#02050a] flex flex-col overflow-hidden relative shadow-2xl">
            {/* Legend inside map */}
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-1.5 pointer-events-none bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Canvas Index Map</span>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shrink-0 shadow-[0_0_6px_#22d3ee]" />
                Secure Node
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0 shadow-[0_0_6px_#f87171] animate-pulse" />
                Compromised Node
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0 shadow-[0_0_6px_#f59e0b] animate-ping" />
                Under Recon/Alert
              </div>
            </div>

            <div className="absolute top-6 right-6 z-30 flex flex-col text-right pointer-events-none bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 font-mono">
              <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest block mb-0.5">Neo4j Integration Live</span>
              <span className="text-[12px] font-black text-white italic">CYPHER_RENDERING: ACTIVE</span>
            </div>

            <div className="p-6 border-b border-slate-800 bg-slate-900/40 relative z-20 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">NEO4J SPATIAL CONCENTRIC TOPOLOGY</h4>
                <p className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">Lateral Compromise Rings R3 to R0 // Core Vulnerability Index</p>
              </div>
              <div className="text-[9px] font-mono font-black text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                8 Active Nodes Loaded
              </div>
            </div>

            {/* Interactive SVG Stage Area */}
            <div className="relative aspect-video flex-grow flex items-center justify-center p-4 bg-[#010408]">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
              
              <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="relative z-10 select-none overflow-visible">
                {/* 1. Draw Concentric Rings Orbits */}
                {[3, 2, 1, 0].map((ringLevel) => {
                  const radius = ringRadii[ringLevel as 0|1|2|3];
                  return (
                    <g key={ringLevel}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        stroke={ringLevel === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 211, 238, 0.08)'}
                        strokeWidth={ringLevel === 0 ? 2 : 1.5}
                        strokeDasharray={ringLevel === 0 ? '3 3' : '6 6'}
                        className={ringLevel === 0 ? 'animate-spin-slow' : ''}
                      />
                      {/* Orbit Ring Label text aligned path */}
                      <text
                        x={cx}
                        y={cy - radius - 6}
                        fill={ringLevel === 0 ? '#ef4444' : '#64748b'}
                        fontSize="7"
                        fontWeight="900"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="uppercase tracking-widest pointer-events-none opacity-40 selection:bg-transparent"
                      >
                        {ringLevel === 0 && 'RING 0 : Crown Jewel Host Core'}
                        {ringLevel === 1 && 'RING 1 : DMZ Host Router'}
                        {ringLevel === 2 && 'RING 2 : Intranet LAN Terminals'}
                        {ringLevel === 3 && 'RING 3 : Perimeter Gateway WAN'}
                      </text>
                    </g>
                  );
                })}

                {/* 2. Draw Interaction Lines (Edges) */}
                {GRAPH_LINKS.map((link, idx) => {
                  const sourceNode = nodes.find(n => n.id === link.source);
                  const targetNode = nodes.find(n => n.id === link.target);
                  if (!sourceNode || !targetNode) return null;

                  const srcPos = getNodePosition(sourceNode);
                  const tgtPos = getNodePosition(targetNode);

                  const isExploitedActive = sourceNode.compromised && targetNode.compromised;
                  
                  return (
                    <g key={idx}>
                      {/* Thicker backing shadow line */}
                      <line
                        x1={srcPos.x}
                        y1={srcPos.y}
                        x2={tgtPos.x}
                        y2={tgtPos.y}
                        stroke={isExploitedActive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(148, 163, 184, 0.15)'}
                        strokeWidth={isExploitedActive ? 4 : 2}
                        strokeLinecap="round"
                        style={{ filter: isExploitedActive ? 'drop-shadow(0px 0px 4px #ef4444)' : 'none' }}
                      />
                      <line
                        x1={srcPos.x}
                        y1={srcPos.y}
                        x2={tgtPos.x}
                        y2={tgtPos.y}
                        stroke={isExploitedActive ? '#ef4444' : '#1e293b'}
                        strokeWidth={1}
                        strokeLinecap="round"
                      />
                      
                      {/* Pulsing data packets traveling along the pathways */}
                      {simulationActive && (
                        <circle r="3.5" fill={isExploitedActive ? '#ef4444' : '#22d3ee'}>
                          <animateMotion
                            dur={`${2 + Math.random() * 3}s`}
                            repeatCount="indefinite"
                            path={`M ${srcPos.x} ${srcPos.y} L ${tgtPos.x} ${tgtPos.y}`}
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* 3. Handle Rendering Nodes */}
                {nodes.map((node) => {
                  const pos = getNodePosition(node);
                  const isSelected = selectedNode?.id === node.id;
                  
                  // Color codes for node states
                  let mainColor = '#22d3ee'; // clean cyber blue
                  let glowColor = 'rgba(34, 211, 238, 0.4)';
                  if (node.compromised) {
                    mainColor = '#ef4444'; // compromised blood red
                    glowColor = 'rgba(239, 68, 68, 0.6)';
                  } else if (node.alert) {
                    mainColor = '#f59e0b'; // warning caution orange
                    glowColor = 'rgba(245, 158, 11, 0.5)';
                  }

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* Pulsing selection background halo */}
                      {(isSelected || node.alert) && (
                        <circle
                          r="28"
                          fill="none"
                          stroke={mainColor}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          className="animate-spin-slow"
                          style={{ filter: `drop-shadow(0px 0px 8px ${mainColor})` }}
                        />
                      )}

                      {/* Broad backdrop hover */}
                      <circle
                        r="24"
                        fill="#050810"
                        stroke={isSelected ? mainColor : 'rgba(51, 65, 85, 0.7)'}
                        strokeWidth={isSelected ? 3 : 1.5}
                        style={{ filter: isSelected ? `drop-shadow(0 0 12px ${glowColor})` : 'none' }}
                        className="transition-all duration-300 group-hover:stroke-cyan-400 group-hover:scale-110"
                      />

                      {/* Small Type Icon */}
                      <g transform="translate(-10, -10)" className="pointer-events-none select-none text-slate-400">
                        {node.type === 'gateway' && <rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke={mainColor} strokeWidth="1.5" />}
                        {node.type === 'gateway' && <line x1="5" y1="10" x2="15" y2="10" stroke={mainColor} strokeWidth="1.5" />}
                        
                        {node.type === 'workstation' && <rect x="2" y="4" width="16" height="10" rx="1.5" fill="none" stroke={mainColor} strokeWidth="1.5" />}
                        {node.type === 'workstation' && <line x1="1" y1="15" x2="19" y2="15" stroke={mainColor} strokeWidth="1.5" />}

                        {node.type === 'server' && <rect x="4" y="2" width="12" height="16" rx="2" fill="none" stroke={mainColor} strokeWidth="1.5" />}
                        {node.type === 'server' && <circle cx="10" cy="6" r="1.5" fill={mainColor} />}
                        {node.type === 'server' && <circle cx="10" cy="11" r="1.5" fill={mainColor} />}

                        {node.type === 'dc' && <path d="M6 8V6a4 4 0 018 0v2" fill="none" stroke={mainColor} strokeWidth="1.5" />}
                        {node.type === 'dc' && <rect x="4" y="8" width="12" height="10" rx="2" fill="none" stroke={mainColor} strokeWidth="1.5" />}

                        {node.type === 'database' && <ellipse cx="10" cy="5" rx="6" ry="2.5" fill="none" stroke={mainColor} strokeWidth="1.5" />}
                        {node.type === 'database' && <path d="M4 5v5c0 1.5 2.5 2.5 6 2.5s6-1 6-2.5V5" fill="none" stroke={mainColor} strokeWidth="1.5" />}
                        {node.type === 'database' && <path d="M4 10v5c0 1.5 2.5 2.5 6 2.5s6-1 6-2.5v-5" fill="none" stroke={mainColor} strokeWidth="1.5" />}
                      </g>

                      {/* Small text node specs */}
                      <text
                        x="0"
                        y="34"
                        fill="#f8fafc"
                        fontSize="8"
                        textAnchor="middle"
                        fontWeight="900"
                        fontFamily="monospace"
                        className="group-hover:fill-cyan-400 select-none pointer-events-none"
                      >
                        {node.name}
                      </text>
                      <text
                        x="0"
                        y="44"
                        fill="#475569"
                        fontSize="7"
                        textAnchor="middle"
                        fontFamily="monospace"
                        className="select-none pointer-events-none"
                      >
                        {node.ip}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Explanatory footer line */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-900 border-dashed text-[10px] font-mono text-slate-500 flex justify-between uppercase">
              <span>Interactive Nodes: CLICK node to load target attributes</span>
              <span>Ring 0 Density: 2 Hosts // Maximum Threat depth: 4</span>
            </div>
          </div>
        </div>

        {/* Right Active Controls: Click Target Inspector & Cypher Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Inspector Card */}
          <div className="glass rounded-[2rem] border-2 border-slate-800 bg-[#050810] p-6 relative overflow-hidden">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" /> Host Node Inspector
            </h4>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-black text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      RING_{selectedNode.ring} OBJECT
                    </span>
                    <h5 className="text-xl font-black text-white uppercase italic mt-1.5">{selectedNode.name}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">SECURITY STATE</span>
                    {selectedNode.compromised ? (
                      <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[9px] font-black uppercase animate-pulse">
                        [COMPROMISED]
                      </span>
                    ) : selectedNode.alert ? (
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-lg text-[9px] font-black uppercase">
                        [RECON_ALERT]
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-lg text-[9px] font-black uppercase">
                        [SECURED]
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-[10px] p-4 bg-slate-950/80 rounded-2xl border border-slate-900">
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase font-bold">IPv4 Address</span>
                    <span className="text-slate-300 font-bold">{selectedNode.ip}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase font-bold">Operating System</span>
                    <span className="text-slate-300">{selectedNode.os}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block text-[8px] uppercase font-bold">Infiltrating Threat Payload</span>
                    <span className="text-red-400 italic">
                      {selectedNode.threatActor || 'None detected (Zone Secured)'}
                    </span>
                  </div>
                </div>

                {/* Inline Interaction: Toggle Compromise/Secure state */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, compromised: !n.compromised, alert: false, threatActor: !n.compromised ? 'APT29 Payload Trigger' : undefined } : n));
                      setSelectedNode(prev => prev ? { ...prev, compromised: !prev.compromised, alert: false, threatActor: !prev.compromised ? 'APT29 Payload Trigger' : undefined } : null);
                      setNeoLogs(prev => [...prev, `[USER_EVENT] Toggled compromise status on node ${selectedNode.name}`]);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedNode.compromised 
                      ? 'bg-emerald-950/40 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 border border-emerald-800' 
                      : 'bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800'
                    }`}
                  >
                    {selectedNode.compromised ? 'Deploy Tactical Patch' : 'Inject Compromise Payload'}
                  </button>

                  <button
                    onClick={() => {
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, alert: !n.alert } : n));
                      setSelectedNode(prev => prev ? { ...prev, alert: !prev.alert } : null);
                      setNeoLogs(prev => [...prev, `[USER_EVENT] Toggled Alert status on node ${selectedNode.name}`]);
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest rounded-xl transition-all"
                  >
                    Toggle Alert
                  </button>
                </div>

                {/* Generated Cypher Query based on Selected Node */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Auto-Generated Cypher Query (Neo4j Graph Engine)</span>
                  <div className="p-3.5 bg-slate-950 text-purple-400 font-mono text-[10px] rounded-xl border border-slate-900 border-l-4 border-l-purple-500 break-words leading-relaxed select-all">
                    {`MATCH (n:${selectedNode.type === 'gateway' ? 'Perimeter' : selectedNode.type === 'workstation' ? 'Host' : 'Asset'} {ip: "${selectedNode.ip}"})-[r:EXPLOITED_ROUTE|CREDENTIAL_PASS_HASH|SQL_PORT_TUNNEL|DCSYNC_ATTEMPT_STAGED]->(target) RETURN n, r, target`}
                  </div>
                  <button
                    onClick={() => {
                      const qStr = `MATCH (n:${selectedNode.type === 'gateway' ? 'Perimeter' : selectedNode.type === 'workstation' ? 'Host' : 'Asset'} {ip: "${selectedNode.ip}"})-[r]->(target) RETURN n, r, target`;
                      setCypherQuery(qStr);
                      setActiveEngine('neo4j');
                      handleRunCypher(qStr);
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-purple-600 hover:text-white text-[9px] font-black text-purple-400 uppercase tracking-widest border border-slate-800 hover:border-purple-500 rounded-lg transition-all"
                  >
                    Load & Execute this Cypher Statement
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-600 font-mono text-xs italic">
                Select any node on the graph canvas to inspect
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-center">
              <span className="text-[8px] font-black text-slate-500 block uppercase tracking-widest mb-1">Graph Density</span>
              <span className="text-2xl font-black text-purple-400 font-mono">0.43</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-center">
              <span className="text-[8px] font-black text-slate-500 block uppercase tracking-widest mb-1">Total Edges</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">7 Path</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-center">
              <span className="text-[8px] font-black text-slate-500 block uppercase tracking-widest mb-1">Infection Rad</span>
              <span className="text-2xl font-black text-red-500 font-mono">37.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Polyglot Command Control Panels (THE 4 DATABASE ENGINES) */}
      <div className="glass rounded-[2rem] border-2 border-slate-800 bg-[#02050a] overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-800 bg-slate-920/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Database className="w-5 h-5 text-yellow-400" /> TACTICAL POLYGLOT DATABASE CONTROL
            </h4>
            <p className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">Inspect and utilize specialized persistence engines concurrently</p>
          </div>

          {/* Engine selectors tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveEngine('neo4j')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeEngine === 'neo4j' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Neo4j DB (Graph)
            </button>
            <button
              onClick={() => setActiveEngine('influx')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeEngine === 'influx' ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              InfluxDB (Time)
            </button>
            <button
              onClick={() => setActiveEngine('pinecone')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeEngine === 'pinecone' ? 'bg-cyan-600 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Pinecone (Vector)
            </button>
            <button
              onClick={() => setActiveEngine('elastic')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeEngine === 'elastic' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Elasticsearch (Logs)
            </button>
          </div>
        </div>

        {/* Console Box container */}
        <div className="p-6 h-[340px] overflow-hidden bg-[#010408]">
          <AnimatePresence mode="wait">
            
            {/* 1. NEO4J PANEL */}
            {activeEngine === 'neo4j' && (
              <motion.div
                key="neo4j"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-slate-300"
              >
                <div className="md:col-span-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block">Query Command Terminal (Cypher Syntax)</span>
                    <textarea
                      value={cypherQuery}
                      onChange={e => setCypherQuery(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 p-3 h-24 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono outline-none focus:border-purple-500 resize-none"
                    />
                    
                    {/* Presets */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setCypherQuery('MATCH (n) RETURN n');
                          handleRunCypher('MATCH (n) RETURN n');
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-bold font-mono text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        MATCH ALL
                      </button>
                      <button
                        onClick={() => {
                          setCypherQuery('MATCH (a)-[r:EXPLOITED_ROUTE]->(b) RETURN a,r,b');
                          handleRunCypher('MATCH (a)-[r:EXPLOITED_ROUTE]->(b) RETURN a,r,b');
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-bold font-mono text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        EXPLOITED RELS
                      </button>
                      <button
                        onClick={() => {
                          setCypherQuery('MATCH (n:Asset {id: "db-1"}) RETURN n');
                          handleRunCypher('MATCH (n:Asset {id: "db-1"}) RETURN n');
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-bold font-mono text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        CROWN_JEWEL_DB
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunCypher()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                    Execute Cypher Query Statement
                  </button>
                </div>

                <div className="md:col-span-7 flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/10 flex justify-between items-center">
                    <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">Compiler Query Output Streams</span>
                    <span className="text-[8px] font-mono text-purple-400">{cypherResults.length} records returned</span>
                  </div>
                  
                  {/* Results area */}
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-[9px] space-y-3 custom-scrollbar">
                    {cypherResults.length === 0 ? (
                      <div className="space-y-1.5 text-slate-600">
                        {neoLogs.map((log, i) => <div key={i}>{log}</div>)}
                        <div className="italic text-slate-600 mt-2">Stdout ready. Run a query expression ...</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-cyan-400">Executing compiler thread =&gt; OK</div>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500 bg-slate-900/30">
                              {Object.keys(cypherResults[0]).map((key, i) => (
                                <th key={i} className="p-1 px-2 text-[8px] uppercase font-black">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {cypherResults.map((row, index) => (
                              <tr key={index} className="border-b border-slate-900 hover:bg-purple-950/10 hover:text-purple-300">
                                {Object.values(row).map((val: any, colIdx) => (
                                  <td key={colIdx} className="p-1 px-2 whitespace-nowrap overflow-hidden max-w-xs text-ellipsis">
                                    {String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. INFLUXDB PANEL */}
            {activeEngine === 'influx' && (
              <motion.div
                key="influx"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-slate-300"
              >
                <div className="md:col-span-4 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest block">Time-Series Telemetry Control</span>
                    
                    {/* Degradation slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase font-black">
                        <span>Physical Signal Degradation</span>
                        <span className="text-yellow-400 font-bold">{signalDegradation}x Factor</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="5.0"
                        step="0.1"
                        value={signalDegradation}
                        onChange={e => {
                          setSignalDegradation(parseFloat(e.target.value));
                          setNeoLogs(prev => [...prev, `[INFLUXDB_CMD] Setting transponder signal degradation multiplier to ${e.target.value}x`]);
                        }}
                        className="w-full accent-yellow-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Sensor list specs */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-2 font-mono text-[9px]">
                      <div className="flex justify-between text-slate-400">
                        <span>SNR MARGIN STIA</span>
                        <span className="text-emerald-400 font-bold">{sensorValues.snr} dB</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>BUC AMBIENT TEMP</span>
                        <span className={sensorValues.bucTemp > 315 ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>{sensorValues.bucTemp} K</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>PACKET LOSS RATE</span>
                        <span className="text-red-500 font-bold">{sensorValues.loss} %</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-yellow-950/20 rounded-xl border border-yellow-900/30 text-[9px] font-mono text-yellow-400">
                    <Activity className="w-4 h-4 text-yellow-500 animate-pulse shrink-0" />
                    <span>Streaming sub-second Influx points, retention=30d</span>
                  </div>
                </div>

                {/* SVG Visualizing dynamic real-time telemetry line charts */}
                <div className="md:col-span-8 flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/10 flex justify-between items-center text-[8px] font-mono text-slate-500">
                    <span>Live InfluxDB telemetry point stream (1s query window)</span>
                    <span className="text-yellow-500 uppercase tracking-widest font-black animate-pulse">DB_WRITE_ACTIVE</span>
                  </div>
                  
                  <div className="flex-1 p-3.5 flex flex-col justify-between">
                    {/* Mini SVG area chart */}
                    <div className="h-40 w-full relative bg-[#04070c]/50 rounded-xl border border-slate-900/80 p-2 overflow-hidden">
                      <svg width="100%" height="80%" viewBox="0 0 400 100" preserveAspectRatio="none">
                        {telemetryHistory.length > 1 && (
                          <g>
                            {/* Area gradient under the line */}
                            <path
                              d={`M 0 100 ${telemetryHistory.map((pt, i) => {
                                const x = (i / (telemetryHistory.length - 1)) * 400;
                                const y = 100 - ((pt.temp - 300) * 4); // Scale temperature
                                return `L ${x} ${y}`;
                              }).join(' ')} L 400 100 Z`}
                              fill="rgba(245, 158, 11, 0.08)"
                            />

                            {/* SNR line (cyan) */}
                            <path
                              d={telemetryHistory.map((pt, i) => {
                                const x = (i / (telemetryHistory.length - 1)) * 400;
                                const y = 100 - (pt.snr * 6); // Scale SNR
                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />

                            {/* Temp line (yellow) */}
                            <path
                              d={telemetryHistory.map((pt, i) => {
                                const x = (i / (telemetryHistory.length - 1)) * 400;
                                const y = 100 - ((pt.temp - 300) * 4); // Scale temperature
                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="1.5"
                              strokeDasharray="4 2"
                            />
                          </g>
                        )}
                      </svg>
                      {/* Subtitles inside the chart */}
                      <div className="absolute bottom-2.5 left-4 flex gap-4 text-[7px] font-mono font-black uppercase">
                        <span className="text-cyan-400">— SNR MARGIN (dB)</span>
                        <span className="text-yellow-500">_ _ BUC TEMP (Kelvin)</span>
                      </div>
                    </div>

                    {/* Logs console */}
                    <div className="h-16 bg-[#03060a] p-2 rounded-lg border border-slate-900 text-[8px] font-mono text-slate-500 overflow-y-auto custom-scrollbar select-all">
                      {timeSeriesLogs.map((log, i) => (
                        <div key={i} className="text-slate-500">
                          <span className="text-yellow-700 font-bold mr-1.5">[INFLUX_WRITE]</span>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. PINECONE VECTOR PANEL */}
            {activeEngine === 'pinecone' && (
              <motion.div
                key="pinecone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-slate-300"
              >
                <div className="md:col-span-4 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block">High-Demensional Query Vector Search</span>
                    <input
                      type="text"
                      value={vectorQuery}
                      onChange={e => setVectorQuery(e.target.value)}
                      placeholder="Prompt threat text vector query..."
                      className="w-full bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-cyan-500"
                    />

                    {/* Presets */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setVectorQuery('Mimikatz local LSASS cred dump');
                          setTimeout(() => handleVectorSearch(), 50);
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-bold font-mono text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        LSASS DUMP
                      </button>
                      <button
                        onClick={() => {
                          setVectorQuery('DNS high-entropy tunnel beacon');
                          setTimeout(() => handleVectorSearch(), 50);
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-bold font-mono text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        DNS TUNNEL
                      </button>
                      <button
                        onClick={() => {
                          setVectorQuery('PostgreSQL UDF shell execution payload');
                          setTimeout(() => handleVectorSearch(), 50);
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-bold font-mono text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        SQL BACKDOOR
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleVectorSearch}
                    disabled={isVectorSearching}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {isVectorSearching ? 'Querying Pinecone Index...' : 'Simulate Vector Similarity Query'}
                  </button>
                </div>

                <div className="md:col-span-8 flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/10 flex justify-between items-center text-[8px] font-mono text-slate-500">
                    <span>Index Dimension: 1536 (Cosine Distance Metric Space)</span>
                    <span className="text-cyan-400">PINECONE_CLIENT_READY</span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto font-mono text-[9px] space-y-3.5 custom-scrollbar">
                    {isVectorSearching ? (
                      <div className="text-cyan-400 animate-pulse text-xs text-center h-full flex items-center justify-center font-black uppercase tracking-widest">
                        Generating query embeddings & computing distance matrices...
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-yellow-500 flex justify-between">
                          <span>[OK] Pinecone Query complete</span>
                          <span className="text-slate-600">Query Embedding: {vectorQuery ? vectorQuery.substring(0, 20).toUpperCase() : 'NONE'}...</span>
                        </div>
                        {vectorMatches.map((match, i) => (
                          <div key={i} className="p-3.5 bg-[#03060a] rounded-xl border border-slate-900/90 hover:border-cyan-500/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1 max-w-md">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200 uppercase text-[9px]">{match.actor}</span>
                                <span className="text-slate-600 font-normal">({match.vector})</span>
                              </div>
                              <p className="text-slate-400 text-[10px] leading-snug italic">"{match.text}"</p>
                              <div className="text-emerald-500 text-[8px] font-black uppercase tracking-wider">
                                Recommended Plan: {match.mitigation}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[8px] font-bold text-slate-600 uppercase">COSINE_SIMILARITY</div>
                              <span className="text-cyan-400 font-extrabold text-[13px]">
                                {(match.matchScore * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. ELASTICSEARCH PANEL */}
            {activeEngine === 'elastic' && (
              <motion.div
                key="elastic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-slate-300"
              >
                <div className="md:col-span-4 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block">Elasticsearch Lucene Matcher Search</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={elasticSearchTerm}
                        onChange={e => setElasticSearchTerm(e.target.value)}
                        placeholder="Search IP, Action, payload properties..."
                        className="w-full bg-slate-950 px-10 py-3.5 rounded-xl border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-red-500"
                      />
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    </div>
                    
                    {/* Presets */}
                    <div className="flex flex-wrap gap-2 text-[8px] font-mono">
                      <button
                        onClick={() => setElasticSearchTerm('10.0.4.15')}
                        className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-slate-400 hover:text-white"
                      >
                        10.0.4.15
                      </button>
                      <button
                        onClick={() => setElasticSearchTerm('CRITICAL')}
                        className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-slate-400 hover:text-white"
                      >
                        CRITICAL
                      </button>
                      <button
                        onClick={() => setElasticSearchTerm('Mimikatz')}
                        className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-slate-400 hover:text-white"
                      >
                        MIMIKATZ
                      </button>
                      <button
                        onClick={() => setElasticSearchTerm('PostgreSQL')}
                        className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-slate-400 hover:text-white"
                      >
                        POSTGRESQL
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-[9px] font-mono text-red-400">
                    Indices query mapping: real-time threat telemetry logs indexed with full tokenization.
                  </div>
                </div>

                <div className="md:col-span-8 flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/10 flex justify-between items-center text-[8px] font-mono text-slate-500">
                    <span>Index Stream: log-syslog-elastic-* (Lucene Full Text Search)</span>
                    <span className="text-red-400 font-bold">{elasticLogs.length} hits matching</span>
                  </div>

                  {/* Logs results */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar font-mono text-[9px] select-all">
                    {elasticLogs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-600 italic">
                        No index records found matching "{elasticSearchTerm}"
                      </div>
                    ) : (
                      elasticLogs.map((log) => (
                        <div key={log.id} className="p-2.5 bg-[#03060a] border border-slate-900 rounded-xl space-y-1.5 hover:border-red-900/40 hover:bg-slate-900/5 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-600 font-black">{log.time}</span>
                              <span className="text-slate-500">{log.source} ➔ {log.destination}</span>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded font-black text-[7px] ${
                              log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                              log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-cyan-500/10 text-cyan-400'
                            }`}>
                              [{log.action}] ({log.severity})
                            </span>
                          </div>
                          <p className="text-slate-300 pr-10 leading-snug">{log.msg}</p>
                          <div className="text-[8px] text-slate-600 bg-black/60 p-1.5 rounded border border-slate-950 overflow-x-auto whitespace-pre">
                            Payload JSON: {log.payload}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
