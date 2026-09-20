import { unit4SubmissionSchema, type CommonUnitEvaluation } from '../../shared/domain/workstationTypes';
import type { Room104LabSubmissionPayload } from '../../shared/domain/room104Types';

const ST3_TECHNICAL_KEYWORDS = [
  ['ip conflict', 'ip ชน', 'duplicate', 'ชนกัน'],
  ['arp', 'mac address', 'table', 'ตาราง'],
  ['subnet', 'ซับเน็ต', '255.255.255.0', 'mask'],
  ['gateway', 'เกตเวย์', '192.168.1.1', 'default gateway'],
  ['poe', 'budget', 'watt', 'วัตต์', 'overload', 'กำลังไฟ'],
  ['retest', 'ทดสอบซ้ำ', 'ตรวจซ้ำ', 'loss 0%', '0% loss', 'icmp'],
];

export function evaluateUnit4Submission(rawInput: unknown): CommonUnitEvaluation {
  const anyInput = (rawInput || {}) as Record<string, any>;
  const payload = (anyInput.smartNetwork || anyInput) as Partial<Room104LabSubmissionPayload> & Record<string, any>;

  // Detect Room 104 3-Station Simulation Payload
  if (payload.station1 || payload.station2 || payload.station3) {
    let s1Score = 0;
    let s2Score = 0;
    let s3Score = 0;

    // -------------------------------------------------------------
    // STATION 1: IP Address Planning & IP Address Table (35 pts max)
    // -------------------------------------------------------------
    const st1 = payload.station1 || ({} as any);

    // 1. Subnetting & CIDR logic (10 pts)
    if (st1.networkAddress === '192.168.1.0') s1Score += 3;
    if (st1.subnetMask === '255.255.255.0') s1Score += 3;
    if (Number(st1.cidrPrefix) === 24) s1Score += 2;
    if (st1.defaultGateway === '192.168.1.1') s1Score += 2;

    // 2. IP Table Complete & Subnet Consistency (10 pts)
    const table = Array.isArray(st1.ipAddressTable) ? st1.ipAddressTable : [];
    let validRows = 0;
    const seenIps = new Set<string>();
    let hasDuplicate = false;

    for (const row of table) {
      if (typeof row.ipAddress === 'string') {
        if (seenIps.has(row.ipAddress)) {
          hasDuplicate = true;
        }
        seenIps.add(row.ipAddress);

        // Verify device IP is in 192.168.1.x subnet
        if (/^192\.168\.1\.\d{1,3}$/.test(row.ipAddress)) {
          validRows++;
        }
      }
    }

    if (table.length >= 5 && validRows >= 5) {
      s1Score += 10;
    } else if (validRows >= 3) {
      s1Score += 6;
    }

    // 3. IP Conflict Resolution & Unique Host IPs (10 pts)
    if (!hasDuplicate && seenIps.size >= 5 && st1.ipConflictDetected === false) {
      s1Score += 10;
    } else if (!hasDuplicate && seenIps.size >= 3) {
      s1Score += 6;
    }

    // 4. Method Classification (5 pts)
    // Core devices (NVR, Router, Switch) should use STATIC
    const coreStatic = table.filter(
      (r: any) => ['NVR', 'GATEWAY', 'POE_SWITCH'].includes(r.deviceType) && r.method === 'STATIC'
    ).length;
    if (coreStatic >= 2) s1Score += 3;

    // Cameras can use DHCP_RESERVATION or STATIC
    const camsValid = table.filter(
      (r: any) => r.deviceType === 'IP_CAMERA' && (r.method === 'DHCP_RESERVATION' || r.method === 'STATIC')
    ).length;
    if (camsValid >= 2) s1Score += 2;

    s1Score = Math.min(35, s1Score);

    // -------------------------------------------------------------
    // STATION 2: Device Configuration & Network Tools (35 pts max)
    // -------------------------------------------------------------
    const st2 = payload.station2 || ({} as any);

    // 1. Device IP & Config matching plan (10 pts)
    const configuredDevices = st2.configuredDevices || {};
    const devKeys = Object.keys(configuredDevices);
    let validConfigs = 0;
    for (const key of devKeys) {
      const dev = configuredDevices[key];
      if (
        dev &&
        /^192\.168\.1\.\d{1,3}$/.test(dev.ipAddress) &&
        dev.subnetMask === '255.255.255.0' &&
        dev.defaultGateway === '192.168.1.1'
      ) {
        validConfigs++;
      }
    }
    if (validConfigs >= 3 || devKeys.length >= 3) {
      s2Score += 10;
    } else if (validConfigs >= 1) {
      s2Score += 5;
    }

    // 2. Ping Verification (10 pts)
    const pingLogs = Array.isArray(st2.pingLogs) ? st2.pingLogs : [];
    const successfulPings = pingLogs.filter(
      (p: any) => p.packetLossPercent === 0 && (p.status === 'SUCCESS' || p.avgLatencyMs <= 20)
    );
    if (successfulPings.length >= 2) {
      s2Score += 10;
    } else if (successfulPings.length === 1) {
      s2Score += 5;
    }

    // 3. ARP Table & DNS Lookup (5 pts)
    const arpEntries = Array.isArray(st2.arpEntries) ? st2.arpEntries : [];
    if (arpEntries.length >= 2) s2Score += 3;
    else if (arpEntries.length === 1) s2Score += 2;

    const dns = st2.dnsLookup || {};
    if (dns.status === 'SUCCESS' || dns.resolvedIp) s2Score += 2;

    // 4. PoE Power Budget & Load Balancing (10 pts)
    const poe = st2.poeBudget || {};
    const cap = poe.switchCapacityWatts || 65;
    const load = poe.connectedLoadWatts || 48;
    const isOverloaded = poe.isOverloaded || load > cap;

    if (!isOverloaded && load <= cap) {
      s2Score += 5;
      if (poe.isLoadBalanced || load <= 50) {
        s2Score += 5; // Optimum balanced load!
      } else {
        s2Score += 2;
      }
    }

    s2Score = Math.min(35, s2Score);

    // -------------------------------------------------------------
    // STATION 3: Systematic Troubleshooting & Retest (30 pts max)
    // -------------------------------------------------------------
    const st3 = payload.station3 || ({} as any);

    // 1. Evidence Tools Used (10 pts)
    const tools = st3.evidenceToolsUsed || {};
    let toolCount = 0;
    if (tools.ipConfigChecked) toolCount++;
    if (tools.pingVerified) toolCount++;
    if (tools.arpTableChecked) toolCount++;
    if (tools.poeLoadChecked) toolCount++;
    s3Score += Math.round((toolCount / 4) * 10);

    // 2. Fault Log Documentation & Technical Keywords (10 pts)
    const fLog = st3.faultLog || {};
    const combinedLogText = `${fLog.problemDescription || ''} ${fLog.rootCauseIdentified || ''} ${fLog.appliedSolution || ''} ${fLog.postFixVerification || ''} ${fLog.preventativeMeasures || ''}`.toLowerCase();

    let keywordsFound = 0;
    for (const group of ST3_TECHNICAL_KEYWORDS) {
      if (group.some((w) => combinedLogText.includes(w.toLowerCase()))) {
        keywordsFound++;
      }
    }
    const keywordPoints = Math.min(8, Math.round((keywordsFound / 4) * 8));
    const documentationComplete =
      (fLog.problemDescription || '').length >= 15 &&
      (fLog.appliedSolution || '').length >= 15;
    s3Score += keywordPoints + (documentationComplete ? 2 : 0);

    // 3. Retest Verification with 0% Loss (10 pts)
    const retestLogs = Array.isArray(st3.retestLogs) ? st3.retestLogs : [];
    const retestSuccess = retestLogs.some((r: any) => r.packetLossPercent === 0 && r.status === 'SUCCESS');
    if (st3.retestPassed && retestSuccess) {
      s3Score += 10;
    } else if (st3.retestPassed) {
      s3Score += 8;
    }

    s3Score = Math.min(30, s3Score);

    const totalScore = Math.min(100, Math.round(s1Score + s2Score + s3Score));

    // Mandatory Checks
    const cameraOnline = !hasDuplicate && !isOverloaded && table.length >= 4;
    const nvrReachable = (successfulPings.length > 0 || st3.retestPassed) && !hasDuplicate;
    const clientLiveViewActive = totalScore >= 70 && cameraOnline && nvrReachable;
    const isPassed = totalScore >= 70 && cameraOnline && nvrReachable;

    return {
      totalScore,
      isPassed,
      missionScores: {
        STATION_1_IP_PLANNING: s1Score,
        STATION_2_DEVICE_CONFIG_POE: s2Score,
        STATION_3_TROUBLESHOOTING: s3Score,
      },
      mandatoryChecks: {
        cameraOnline,
        nvrReachable,
        clientLiveViewActive,
      },
      resultDetails: {
        station1Score: s1Score,
        station2Score: s2Score,
        station3Score: s3Score,
        hasDuplicateIp: hasDuplicate,
        poeConnectedWatts: load,
        poeOverload: isOverloaded,
        retestPassed: Boolean(st3.retestPassed),
      },
    };
  }

  // -------------------------------------------------------------
  // Legacy Workstation Submission Evaluation (Backward-Compatible)
  // -------------------------------------------------------------
  const parsed = unit4SubmissionSchema.parse(rawInput || {});

  let score = 0;
  const missionScores: Record<string, number> = {
    M1_IP_ALLOCATION: 0,
    M2_SUBNET_GATEWAY: 0,
    M3_POE_BUDGET_CALC: 0,
    M4_POE_LOAD_BALANCE: 0,
    M5_PING_VERIFICATION: 0,
  };

  // M1 & M2: IP and Subnet / Gateway (Check valid IPv4 and same subnet)
  const isValidIp = /^192\.168\.1\.\d{1,3}$/.test(parsed.ipAddress);
  const isValidGw = /^192\.168\.1\.1$/.test(parsed.defaultGateway);

  if (isValidIp) {
    missionScores.M1_IP_ALLOCATION = 20;
    score += 20;
  } else {
    missionScores.M1_IP_ALLOCATION = 5;
    score += 5;
  }

  if (isValidGw && parsed.subnetMask === '255.255.255.0') {
    missionScores.M2_SUBNET_GATEWAY = 20;
    score += 20;
  } else {
    missionScores.M2_SUBNET_GATEWAY = 10;
    score += 10;
  }

  // M3: PoE Power Budget within 65W
  if (parsed.poeBudgetTotalWatts <= 65) {
    missionScores.M3_POE_BUDGET_CALC = 20;
    score += 20;
  } else {
    missionScores.M3_POE_BUDGET_CALC = 0; // Overload!
  }

  // M4: Load Balancing (optimum <= 45W)
  if (parsed.loadBalanced && parsed.poeBudgetTotalWatts <= 50) {
    missionScores.M4_POE_LOAD_BALANCE = 20;
    score += 20;
  } else if (parsed.poeBudgetTotalWatts <= 65) {
    missionScores.M4_POE_LOAD_BALANCE = 10;
    score += 10;
  }

  // M5: Network Ping Tool
  if (parsed.pingTested && parsed.pingResult.packetLossPercent === 0 && parsed.pingResult.packetsReceived >= 4) {
    missionScores.M5_PING_VERIFICATION = 20;
    score += 20;
  } else if (parsed.pingTested) {
    missionScores.M5_PING_VERIFICATION = 10;
    score += 10;
  }

  const hintPenalty = Math.min(10, parsed.totalHintsUsed * 2);
  const finalScore = Math.max(0, score - hintPenalty);

  return {
    totalScore: finalScore,
    isPassed: finalScore >= 70 && parsed.poeBudgetTotalWatts <= 65,
    missionScores,
    mandatoryChecks: {
      cameraOnline: isValidIp && parsed.poeBudgetTotalWatts <= 65,
      nvrReachable: isValidGw && parsed.pingResult.packetLossPercent === 0,
      clientLiveViewActive: parsed.pingTested,
    },
    resultDetails: {
      ipAddress: parsed.ipAddress,
      defaultGateway: parsed.defaultGateway,
      poeBudgetTotalWatts: parsed.poeBudgetTotalWatts,
      loadBalanced: parsed.loadBalanced,
      pingResult: parsed.pingResult,
    },
  };
}
