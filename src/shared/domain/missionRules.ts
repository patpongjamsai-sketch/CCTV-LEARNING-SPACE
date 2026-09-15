import type {
  ConceptId,
  DeviceId,
  InventoryItem,
  MissionState,
  PlacedCardSlot,
  RubricEvaluation,
} from './roleplayTypes';
import type { TopologyEvaluationResult } from './connectionRules';

export interface CardSlotValidationResult {
  isCorrect: boolean;
  status: 'CORRECT' | 'WRONG_ORDER' | 'WRONG_TYPE';
  feedbackTh: string;
}

export function validateCardDrop(
  slot: PlacedCardSlot,
  item: InventoryItem,
  allSlots: PlacedCardSlot[]
): CardSlotValidationResult {
  if (item.type !== 'KNOWLEDGE_CARD') {
    return {
      isCorrect: false,
      status: 'WRONG_TYPE',
      feedbackTh: 'ช่องนี้รับเฉพาะ "การ์ดความรู้" เท่านั้น ไม่สามารถวางอุปกรณ์หรือสายสัญญาณลงในช่องนี้ได้',
    };
  }

  if (item.conceptId === slot.acceptedConceptId) {
    return {
      isCorrect: true,
      status: 'CORRECT',
      feedbackTh: 'ถูกต้อง! การ์ดถูกวางในตำแหน่งที่ตรงกับความหมายของกระบวนการ',
    };
  }

  // Check if this card belongs to this mission but in another slot (wrong order)
  const isPresentInOtherSlot = allSlots.some((s) => s.acceptedConceptId === item.conceptId);
  if (isPresentInOtherSlot) {
    return {
      isCorrect: false,
      status: 'WRONG_ORDER',
      feedbackTh: 'การ์ดนี้อยู่ในหัวข้อเดียวกัน แต่ยังไม่ใช่ลำดับหรือขั้นตอนของช่องนี้ ลองทบทวนลำดับการทำงานอีกครั้ง',
    };
  }

  return {
    isCorrect: false,
    status: 'WRONG_TYPE',
    feedbackTh: 'การ์ดนี้ไม่ใช่คำตอบของหัวข้อนี้ กรุณานำการ์ดกลับหรือเลือกการ์ดใบอื่น',
  };
}

export function checkMission1Complete(slots: PlacedCardSlot[]): {
  isComplete: boolean;
  score: number;
  feedbackTh: string;
} {
  const allCorrect = slots.every((s) => s.currentPlacedItem?.conceptId === s.acceptedConceptId);
  if (allCorrect) {
    return {
      isComplete: true,
      score: 15,
      feedbackTh: 'ถูกต้องครบถ้วน! กล้อง IP ประมวลผลวิดีโอเป็นข้อมูลดิจิทัลภายในตัวกล้องก่อนส่งผ่านเครือข่าย',
    };
  }
  const correctCount = slots.filter((s) => s.currentPlacedItem?.conceptId === s.acceptedConceptId).length;
  return {
    isComplete: false,
    score: Math.round((correctCount / slots.length) * 15),
    feedbackTh: `วางถูกต้อง ${correctCount}/${slots.length} ขั้นตอน กรุณาจัดลำดับกระบวนการให้ครบถ้วน`,
  };
}

export function checkMission2Complete(slots: PlacedCardSlot[]): {
  isComplete: boolean;
  score: number;
  feedbackTh: string;
} {
  const allCorrect = slots.every((s) => s.currentPlacedItem?.conceptId === s.acceptedConceptId);
  if (allCorrect) {
    return {
      isComplete: true,
      score: 20,
      feedbackTh: 'ยอดเยี่ยม! เส้นทางข้อมูลดิจิทัลเรียงถูกต้อง: IP Camera -> PoE Switch -> NVR -> Client PC/Monitor',
    };
  }
  const correctCount = slots.filter((s) => s.currentPlacedItem?.conceptId === s.acceptedConceptId).length;
  return {
    isComplete: false,
    score: Math.round((correctCount / slots.length) * 20),
    feedbackTh: `เรียงเส้นทางข้อมูลถูกต้อง ${correctCount}/${slots.length} ช่วง`,
  };
}

export function checkMission3Matches(matches: Partial<Record<DeviceId, ConceptId>>): {
  isComplete: boolean;
  score: number;
  correctCount: number;
  total: number;
  details: Record<string, { correct: boolean; expectedTh: string }>;
} {
  const expected: Partial<Record<DeviceId, { concept: ConceptId; nameTh: string; funcTh: string }>> = {
    CAMERA_BULLET: {
      concept: 'FUNC_CAMERA',
      nameTh: 'IP Camera',
      funcTh: 'รับภาพ ประมวลผล และส่ง Video Stream',
    },
    POE_SWITCH_8P: {
      concept: 'FUNC_POE_SWITCH',
      nameTh: 'PoE Switch',
      funcTh: 'เชื่อมอุปกรณ์เครือข่ายและจ่ายไฟ PoE',
    },
    NVR_8CH: {
      concept: 'FUNC_NVR',
      nameTh: 'NVR',
      funcTh: 'รับและบันทึก Video Stream จากกล้อง IP',
    },
    ROUTER: {
      concept: 'FUNC_ROUTER',
      nameTh: 'Router',
      funcTh: 'เชื่อมต่อระหว่างเครือข่ายและกำหนดเส้นทาง',
    },
    CLIENT_PC: {
      concept: 'FUNC_CLIENT_PC',
      nameTh: 'Client PC',
      funcTh: 'ดูภาพ ตั้งค่า และจัดการระบบ',
    },
  };

  const deviceIds = Object.keys(expected) as DeviceId[];
  let correctCount = 0;
  const details: Record<string, { correct: boolean; expectedTh: string }> = {};

  for (const devId of deviceIds) {
    const exp = expected[devId];
    if (!exp) continue;
    const userConcept = matches[devId];
    const isCorrect = userConcept === exp.concept;
    if (isCorrect) correctCount++;
    details[devId] = {
      correct: isCorrect,
      expectedTh: `${exp.nameTh}: ${exp.funcTh}`,
    };
  }

  const isComplete = correctCount === deviceIds.length;
  const score = Math.round((correctCount / deviceIds.length) * 15);

  return {
    isComplete,
    score,
    correctCount,
    total: deviceIds.length,
    details,
  };
}

export function checkMission4AnalogVsIp(cardsDistribution: {
  analogCards: ConceptId[];
  ipCards: ConceptId[];
}): {
  isPassed: boolean;
  score: number;
  correctCount: number;
  totalCards: number;
  explanations: Partial<Record<ConceptId, { isCorrect: boolean; side: 'ANALOG' | 'IP'; reasonTh: string }>>;
} {
  const correctAssignment: Partial<Record<ConceptId, { side: 'ANALOG' | 'IP'; reasonTh: string }>> = {
    CARD_COAXIAL: {
      side: 'ANALOG',
      reasonTh: 'สาย Coaxial (RG6) เป็นสายแกนทองแดงสำหรับส่งสัญญาณคลื่นไฟฟ้าของระบบอนาล็อก',
    },
    CARD_DVR: {
      side: 'ANALOG',
      reasonTh: 'เครื่อง DVR ใช้พอร์ต BNC รับสัญญาณอนาล็อกและเข้ารหัสในตัวเครื่อง',
    },
    CARD_ANALOG_SIGNAL: {
      side: 'ANALOG',
      reasonTh: 'สัญญาณรูปคลื่นไฟฟ้าอนาล็อกต่อเนื่อง ส่งตรงจากเซนเซอร์ไปยังเครื่องบันทึก',
    },
    CARD_CAT6: {
      side: 'IP',
      reasonTh: 'สาย UTP Cat6 ส่งข้อมูลดิจิทัลกิกะบิตและไฟ PoE สำหรับระบบกล้องเครือข่าย',
    },
    CARD_NVR: {
      side: 'IP',
      reasonTh: 'เครื่อง NVR รับสตรีมวิดีโอดิจิทัลผ่านเครือข่ายโดยไม่ต้องแปลงสัญญาณซ้ำ',
    },
    CARD_POE: {
      side: 'IP',
      reasonTh: 'เทคโนโลยี PoE (802.3af/at) จ่ายไฟ DC ผ่านสาย LAN เฉพาะระบบ IP เท่านั้น',
    },
    CARD_IP_ADDRESS: {
      side: 'IP',
      reasonTh: 'กล้อง IP แต่ละตัวมีหมายเลข IP Address เป็นอิสระในระบบเครือข่าย',
    },
    CARD_DIGITAL_PACKET: {
      side: 'IP',
      reasonTh: 'ข้อมูลวิดีโอถูกแพ็กลงในดาต้าแพ็กเก็ต TCP/IP ที่มีการตรวจสอบความถูกต้อง',
    },
  };

  const totalCards = 8;
  let correctCount = 0;
  const explanations = {} as Record<ConceptId, { isCorrect: boolean; side: 'ANALOG' | 'IP'; reasonTh: string }>;

  for (const [cId, info] of Object.entries(correctAssignment) as [ConceptId, { side: 'ANALOG' | 'IP'; reasonTh: string }][]) {
    const isPlacedInAnalog = cardsDistribution.analogCards.includes(cId);
    const isPlacedInIp = cardsDistribution.ipCards.includes(cId);

    const placedSide = isPlacedInAnalog ? 'ANALOG' : isPlacedInIp ? 'IP' : null;
    const isCorrect = placedSide === info.side;

    if (isCorrect) correctCount++;

    explanations[cId] = {
      isCorrect,
      side: info.side,
      reasonTh: info.reasonTh,
    };
  }

  // Passing threshold: at least 6/8
  const isPassed = correctCount >= 6;
  const score = isPassed ? (correctCount === 8 ? 15 : Math.round((correctCount / totalCards) * 15)) : 0;

  return {
    isPassed,
    score,
    correctCount,
    totalCards,
    explanations,
  };
}

export function evaluateFullRubric(
  missions: Record<'M1' | 'M2' | 'M3' | 'M4' | 'M5', MissionState>,
  topologyResult: TopologyEvaluationResult,
  totalHintsUsed: number
): RubricEvaluation {
  // Score 1: M1 Video Pipeline (max 15)
  const m1Score = missions.M1.isCompleted ? missions.M1.score : 0;

  // Score 2: M2 Data Flow (max 20)
  const m2Score = missions.M2.isCompleted ? missions.M2.score : 0;

  // Score 3: M3 Device Function (max 15)
  const m3Score = missions.M3.isCompleted ? missions.M3.score : 0;

  // Score 4: M4 Analog vs IP (max 15)
  const m4Score = missions.M4.isCompleted ? missions.M4.score : 0;

  // Score 5: M5 Wiring & Assembly (max 25)
  let m5Score = 0;
  if (topologyResult.isCameraOnline) m5Score += 10;
  if (topologyResult.isNvrReachable) m5Score += 5;
  if (topologyResult.isMonitorConnectedToNvr || topologyResult.isClientPcReachable) m5Score += 5;
  if (topologyResult.isLiveViewActive) m5Score += 5;

  // Score 6: Troubleshooting & Diagnostic independence (max 10)
  let troubleshootingScore = 10;
  if (totalHintsUsed > 4) troubleshootingScore = 5;
  else if (totalHintsUsed > 2) troubleshootingScore = 8;
  if (!topologyResult.isLiveViewActive) troubleshootingScore = Math.min(troubleshootingScore, 5);

  const totalScore = m1Score + m2Score + m3Score + m4Score + m5Score + troubleshootingScore;

  const mandatoryChecks = {
    cameraOnline: topologyResult.isCameraOnline,
    nvrReachable: topologyResult.isNvrReachable,
    clientLiveViewActive: topologyResult.isLiveViewActive,
  };

  const isPassed =
    totalScore >= 80 &&
    mandatoryChecks.cameraOnline &&
    mandatoryChecks.nvrReachable &&
    mandatoryChecks.clientLiveViewActive;

  return {
    m1VideoPipelineScore: m1Score,
    m2DataFlowScore: m2Score,
    m3DeviceFunctionScore: m3Score,
    m4AnalogVsIpScore: m4Score,
    m5WiringAssemblyScore: m5Score,
    troubleshootingScore,
    totalScore,
    isPassed,
    mandatoryChecks,
  };
}
