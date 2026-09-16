import { z } from 'zod';

import { INITIAL_MISSION_1_SLOTS, INITIAL_MISSION_2_SLOTS } from '../../data/unit1RoleplayContent';
import { evaluateSystemTopology } from '../../shared/domain/connectionRules';
import {
  checkMission1Complete,
  checkMission2Complete,
  checkMission3Matches,
  checkMission4AnalogVsIp,
  evaluateFullRubric,
} from '../../shared/domain/missionRules';
import type {
  CableConnection,
  ConceptId,
  DeviceId,
  InventoryItem,
  MissionState,
  PlacedCardSlot,
} from '../../shared/domain/roleplayTypes';
import { VIRTUAL_EQUIPMENT_CATALOG } from '../../shared/domain/virtualEquipmentCatalog';

const conceptIds = [
  'LENS_GATHER_LIGHT', 'SENSOR_CONVERT_SIGNAL', 'PROCESSOR_COMPRESS_VIDEO', 'LAN_SEND_PACKET',
  'FLOW_CAMERA', 'FLOW_POE_SWITCH', 'FLOW_NVR', 'FLOW_CLIENT_PC',
  'FUNC_CAMERA', 'FUNC_POE_SWITCH', 'FUNC_NVR', 'FUNC_ROUTER', 'FUNC_CLIENT_PC',
  'CARD_COAXIAL', 'CARD_CAT6', 'CARD_DVR', 'CARD_NVR', 'CARD_POE', 'CARD_IP_ADDRESS',
  'CARD_ANALOG_SIGNAL', 'CARD_DIGITAL_PACKET',
] as const;

const deviceIds = [
  'CAMERA_BULLET', 'CAMERA_DOME', 'POE_SWITCH_8P', 'NVR_8CH', 'ROUTER', 'CLIENT_PC',
  'MONITOR', 'ANALOG_CAMERA', 'DVR',
] as const;

const conceptSchema = z.enum(conceptIds);
const deviceSchema = z.enum(deviceIds);
const deviceFlagsSchema = z.partialRecord(deviceSchema, z.boolean());

const connectionSchema = z.object({
  id: z.string().min(1).max(100),
  cableType: z.enum(['CAT6', 'HDMI']),
  fromDeviceId: deviceSchema,
  fromPortId: z.string().min(1).max(100),
  toDeviceId: deviceSchema,
  toPortId: z.string().min(1).max(100),
  // ค่านี้มาจาก Client แต่จะถูกคำนวณใหม่ จึงไม่ใช้ตัดสินคะแนน
  linkStatus: z.enum(['UP', 'DOWN']).default('DOWN'),
  poeSupplied: z.boolean().default(false),
});

const submissionSchema = z.object({
  mission1Answers: z.array(conceptSchema.nullable()).length(4),
  mission2Answers: z.array(conceptSchema.nullable()).length(4),
  mission3Matches: z.partialRecord(deviceSchema, conceptSchema),
  mission4Cards: z.object({
    analogCards: z.array(conceptSchema).max(8),
    ipCards: z.array(conceptSchema).max(8),
  }),
  placedDevices: deviceFlagsSchema,
  poweredDevices: deviceFlagsSchema,
  connections: z.array(connectionSchema).max(32),
  totalHintsUsed: z.number().int().min(0).max(1_000),
}).strip();

export type Unit1Submission = z.input<typeof submissionSchema>;

export type Unit1Evaluation = {
  totalScore: number;
  isPassed: boolean;
  missionScores: Record<'M1' | 'M2' | 'M3' | 'M4' | 'M5', number>;
  mandatoryChecks: {
    cameraOnline: boolean;
    nvrReachable: boolean;
    clientLiveViewActive: boolean;
  };
  resultDetails: Record<string, unknown>;
};

function makeAnswerCard(conceptId: ConceptId, index: number): InventoryItem {
  return {
    id: `server-answer-${index}`,
    type: 'KNOWLEDGE_CARD',
    conceptId,
    nameTh: conceptId,
    nameEn: conceptId,
    description: 'Server evaluation input',
    icon: '',
    quantity: 1,
    weight: 'LIGHT',
    sourceZone: 'ZONE_A',
  };
}

function buildSlots(template: PlacedCardSlot[], answers: Array<ConceptId | null>): PlacedCardSlot[] {
  return template.map((slot, index) => ({
    ...slot,
    currentPlacedItem: answers[index] ? makeAnswerCard(answers[index], index) : undefined,
  }));
}

function missionState(
  missionId: MissionState['missionId'],
  score: number,
  maxScore: number,
  isCompleted: boolean,
): MissionState {
  return {
    missionId,
    titleTh: missionId,
    descriptionTh: '',
    isUnlocked: true,
    isCompleted,
    score,
    maxScore,
    attempts: 1,
    hintsUsed: 0,
  };
}

function assertUniqueCards(analogCards: ConceptId[], ipCards: ConceptId[]) {
  const allCards = [...analogCards, ...ipCards];
  if (new Set(allCards).size !== allCards.length) {
    throw new Error('Duplicate comparison card is not allowed');
  }
}

function assertValidConnections(connections: CableConnection[]) {
  const occupiedPorts = new Set<string>();

  for (const connection of connections) {
    const fromPort = VIRTUAL_EQUIPMENT_CATALOG[connection.fromDeviceId].ports.find(
      (port) => port.id === connection.fromPortId,
    );
    const toPort = VIRTUAL_EQUIPMENT_CATALOG[connection.toDeviceId].ports.find(
      (port) => port.id === connection.toPortId,
    );
    if (!fromPort || !toPort) throw new Error('Connection references an unknown device port');

    const fromKey = `${connection.fromDeviceId}:${connection.fromPortId}`;
    const toKey = `${connection.toDeviceId}:${connection.toPortId}`;
    if (occupiedPorts.has(fromKey) || occupiedPorts.has(toKey)) {
      throw new Error('A device port cannot be used by duplicate connections');
    }
    occupiedPorts.add(fromKey);
    occupiedPorts.add(toKey);
  }
}

export function evaluateUnit1Submission(input: unknown): Unit1Evaluation {
  const submission = submissionSchema.parse(input);
  assertUniqueCards(submission.mission4Cards.analogCards, submission.mission4Cards.ipCards);

  // สำเนาข้อมูลก่อนประเมิน เพราะตัวประเมิน topology จะปรับสถานะสายภายในสำเนา
  const connections = submission.connections.map((connection) => ({ ...connection })) as CableConnection[];
  assertValidConnections(connections);

  const mission1 = checkMission1Complete(buildSlots(INITIAL_MISSION_1_SLOTS, submission.mission1Answers));
  const mission2 = checkMission2Complete(buildSlots(INITIAL_MISSION_2_SLOTS, submission.mission2Answers));
  const mission3 = checkMission3Matches(submission.mission3Matches as Partial<Record<DeviceId, ConceptId>>);
  const mission4 = checkMission4AnalogVsIp(submission.mission4Cards);
  const topology = evaluateSystemTopology(submission.placedDevices, submission.poweredDevices, connections);

  const m5Score =
    (topology.isCameraOnline ? 10 : 0) +
    (topology.isNvrReachable ? 5 : 0) +
    (topology.isMonitorConnectedToNvr || topology.isClientPcReachable ? 5 : 0) +
    (topology.isLiveViewActive ? 5 : 0);

  const missions = {
    M1: missionState('M1', mission1.score, 15, mission1.isComplete),
    M2: missionState('M2', mission2.score, 20, mission2.isComplete),
    M3: missionState('M3', mission3.score, 15, mission3.isComplete),
    M4: missionState('M4', mission4.score, 15, mission4.isPassed),
    M5: missionState('M5', m5Score, 25, topology.isLiveViewActive),
  };
  const rubric = evaluateFullRubric(missions, topology, submission.totalHintsUsed);

  return {
    totalScore: rubric.totalScore,
    isPassed: rubric.isPassed,
    missionScores: {
      M1: rubric.m1VideoPipelineScore,
      M2: rubric.m2DataFlowScore,
      M3: rubric.m3DeviceFunctionScore,
      M4: rubric.m4AnalogVsIpScore,
      M5: rubric.m5WiringAssemblyScore,
    },
    mandatoryChecks: rubric.mandatoryChecks,
    resultDetails: {
      missionScores: missions,
      mandatoryChecks: rubric.mandatoryChecks,
      troubleshootingScore: rubric.troubleshootingScore,
      diagnostics: topology.diagnosticEvents.map((event) => ({
        code: event.code,
        severity: event.severity,
      })),
    },
  };
}
