import { create } from 'zustand';
import {
  CableConnection,
  ConceptId,
  DeviceId,
  InventoryItem,
  MissionState,
  PlacedCardSlot,
  RubricEvaluation,
  ZoneId,
} from '../shared/domain/roleplayTypes';
import {
  INITIAL_MISSION_1_SLOTS,
  INITIAL_MISSION_2_SLOTS,
  KNOWLEDGE_STATIONS,
} from '../data/unit1RoleplayContent';
import { evaluateSystemTopology, TopologyEvaluationResult } from '../shared/domain/connectionRules';
import {
  checkMission1Complete,
  checkMission2Complete,
  checkMission3Matches,
  checkMission4AnalogVsIp,
  evaluateFullRubric,
  validateCardDrop,
} from '../shared/domain/missionRules';
import { createLearningEvidence, LearningEvidenceRecord } from '../utils/learningEvidence';

export interface DialogueState {
  speakerNameTh: string;
  speakerRoleTh: string;
  bubbles: string[];
  currentBubbleIndex: number;
  isOpen: boolean;
}

export interface RoleplayStoreState {
  // Trainee info & Session
  traineeName: string;
  sessionStartTime: number;
  isStarted: boolean;
  isCompleted: boolean;
  currentZone: ZoneId;

  // Inventory & Hotbar (5 slots)
  inventory: (InventoryItem | null)[];
  activeSlotIndex: number;
  carriedItem: InventoryItem | null;

  // Stations & Dialogues
  visitedStations: Record<ZoneId, boolean>;
  activeDialogue: DialogueState | null;

  // Mission States (M1 - M5)
  activeMissionId: 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
  missions: Record<'M1' | 'M2' | 'M3' | 'M4' | 'M5', MissionState>;
  mission1Slots: PlacedCardSlot[];
  mission2Slots: PlacedCardSlot[];
  mission3Matches: Partial<Record<DeviceId, ConceptId>>;
  mission4Cards: {
    analogCards: ConceptId[];
    ipCards: ConceptId[];
  };

  // Physical Placement & Topology
  placedDevices: Partial<Record<DeviceId, boolean>>;
  poweredDevices: Partial<Record<DeviceId, boolean>>;
  connections: CableConnection[];
  topologyResult: TopologyEvaluationResult;

  // Rubric & Evidence
  rubric: RubricEvaluation;
  totalAttempts: number;
  totalMistakes: number;
  totalHintsUsed: number;
  learningEvidence: LearningEvidenceRecord | null;

  // UI Overlays & Prompts
  interactionPromptText: string | null;
  notificationMessage: { text: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  isNotebookOpen: boolean;
  isHintModalOpen: boolean;
  isSettingsOpen: boolean;
  isCertificateOpen: boolean;
  reducedMotion: boolean;
  graphicsQuality: 'HIGH' | 'LOW';

  // Actions
  startSession: (name?: string, roomTitle?: string) => void;
  setCurrentZone: (zone: ZoneId) => void;
  setInteractionPrompt: (prompt: string | null) => void;
  notify: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;

  // Inventory Actions
  pickupItem: (item: InventoryItem) => boolean;
  selectSlot: (index: number) => void;
  dropCarriedItem: () => void;
  returnAllItemsToStations: () => void;

  // Dialogue Actions
  openStationDialogue: (zoneId: ZoneId) => void;
  nextDialogueBubble: () => void;
  closeDialogue: () => void;

  // Mission 1 Actions
  placeCardOnMission1Slot: (slotIndex: number) => void;

  // Mission 2 Actions
  placeCardOnMission2Slot: (slotIndex: number) => void;

  // Mission 3 Actions
  matchDeviceFunction: (deviceId: DeviceId, conceptId: ConceptId) => void;

  // Mission 4 Actions
  placeComparisonCard: (conceptId: ConceptId, targetSide: 'ANALOG' | 'IP') => void;

  // Mission 5 & Hardware Actions
  placeDeviceOnRackOrDesk: (deviceId: DeviceId) => void;
  toggleDevicePower: (deviceId: DeviceId) => void;
  connectCable: (
    cableType: 'CAT6' | 'HDMI',
    fromDeviceId: DeviceId,
    fromPortId: string,
    toDeviceId: DeviceId,
    toPortId: string
  ) => boolean;
  disconnectCable: (connectionId: string) => void;

  // Utility & Hints
  useHint: () => string;
  setNotebookOpen: (open: boolean) => void;
  setHintModalOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setCertificateOpen: (open: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setGraphicsQuality: (quality: 'HIGH' | 'LOW') => void;
  recomputeRubric: () => void;
}

export const useRoleplayStore = create<RoleplayStoreState>((set, get) => ({
  traineeName: 'นักเรียนช่างฝึกหัด CCTV',
  sessionStartTime: Date.now(),
  isStarted: false,
  isCompleted: false,
  currentZone: 'ZONE_A',

  inventory: [null, null, null, null, null],
  activeSlotIndex: 0,
  carriedItem: null,

  visitedStations: {
    ZONE_A: false,
    ZONE_B: false,
    ZONE_C: false,
    ZONE_D: false,
    ZONE_E: false,
    ZONE_F: false,
  },
  activeDialogue: null,

  activeMissionId: 'M1',
  missions: {
    M1: {
      missionId: 'M1',
      titleTh: 'ภารกิจที่ 1: เรียงกระบวนการสร้างภาพดิจิทัล',
      descriptionTh: 'วางการ์ด 4 ขั้นตอน: Lens -> Image Sensor -> Processor/Encoder -> LAN Packet',
      isUnlocked: true,
      isCompleted: false,
      score: 0,
      maxScore: 15,
      attempts: 0,
      hintsUsed: 0,
    },
    M2: {
      missionId: 'M2',
      titleTh: 'ภารกิจที่ 2: เส้นทางข้อมูล Data Flow',
      descriptionTh: 'เรียงลำดับการส่งข้อมูล: IP Camera -> PoE Switch -> NVR -> Client PC/Monitor',
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 20,
      attempts: 0,
      hintsUsed: 0,
    },
    M3: {
      missionId: 'M3',
      titleTh: 'ภารกิจที่ 3: จับคู่อุปกรณ์กับหน้าที่',
      descriptionTh: 'นำการ์ดหน้าที่ไปจับคู่กับอุปกรณ์ CCTV ทั้ง 5 ชนิดให้ถูกต้อง',
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 15,
      attempts: 0,
      hintsUsed: 0,
    },
    M4: {
      missionId: 'M4',
      titleTh: 'ภารกิจที่ 4: แยกคุณสมบัติ Analog vs IP CCTV',
      descriptionTh: 'วางการ์ด 8 ใบลงโต๊ะฝั่ง Analog หรือ IP ให้ถูกต้องอย่างน้อย 6 ข้อ',
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 15,
      attempts: 0,
      hintsUsed: 0,
    },
    M5: {
      missionId: 'M5',
      titleTh: 'ภารกิจที่ 5: ประกอบระบบและเชื่อมต่อสายสัญญาณ',
      descriptionTh: 'ติดตั้งอุปกรณ์ ต่อสาย Cat6/HDMI และเปิดสวิตช์จนกล้องแสดง Online และมีภาพ Live View',
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 25,
      attempts: 0,
      hintsUsed: 0,
    },
  },

  mission1Slots: INITIAL_MISSION_1_SLOTS.map((s) => ({ ...s })),
  mission2Slots: INITIAL_MISSION_2_SLOTS.map((s) => ({ ...s })),
  mission3Matches: {},
  mission4Cards: {
    analogCards: [],
    ipCards: [],
  },

  placedDevices: {},
  poweredDevices: {},
  connections: [],
  topologyResult: {
    isCameraPowered: false,
    isCameraOnline: false,
    isNvrPowered: false,
    isNvrReachable: false,
    isClientPcPowered: false,
    isClientPcReachable: false,
    isMonitorPowered: false,
    isMonitorConnectedToNvr: false,
    isLiveViewActive: false,
    totalPoeWattsUsed: 0,
    poeBudgetWatts: 65,
    diagnosticEvents: [],
  },

  rubric: {
    m1VideoPipelineScore: 0,
    m2DataFlowScore: 0,
    m3DeviceFunctionScore: 0,
    m4AnalogVsIpScore: 0,
    m5WiringAssemblyScore: 0,
    troubleshootingScore: 10,
    totalScore: 10,
    isPassed: false,
    mandatoryChecks: {
      cameraOnline: false,
      nvrReachable: false,
      clientLiveViewActive: false,
    },
  },

  totalAttempts: 0,
  totalMistakes: 0,
  totalHintsUsed: 0,
  learningEvidence: null,

  interactionPromptText: null,
  notificationMessage: null,
  isNotebookOpen: false,
  isHintModalOpen: false,
  isSettingsOpen: false,
  isCertificateOpen: false,
  reducedMotion: false,
  graphicsQuality: 'HIGH',

  startSession: (name, roomTitle) => {
    set({
      isStarted: true,
      sessionStartTime: Date.now(),
      traineeName: name || 'นักเรียนช่างฝึกหัด CCTV',
    });
    get().notify(
      `เริ่มภารกิจ ${roomTitle || 'ห้องปฏิบัติการจำลอง 3D'}!`,
      'info'
    );
  },

  setCurrentZone: (zone) => set({ currentZone: zone }),
  setInteractionPrompt: (prompt) => set({ interactionPromptText: prompt }),

  notify: (text, type = 'info') => {
    set({ notificationMessage: { text, type } });
    setTimeout(() => {
      if (get().notificationMessage?.text === text) {
        set({ notificationMessage: null });
      }
    }, 4500);
  },

  pickupItem: (item) => {
    const { inventory, activeSlotIndex } = get();

    // Check if already in inventory
    const exists = inventory.some((inv) => inv?.id === item.id);
    if (exists) {
      get().notify(`คุณถือ ${item.nameTh} อยู่ในกระเป๋าแล้ว`, 'warning');
      return false;
    }

    // Place into current active slot if empty, otherwise find first empty slot
    let targetIndex = -1;
    if (!inventory[activeSlotIndex]) {
      targetIndex = activeSlotIndex;
    } else {
      targetIndex = inventory.findIndex((slot) => slot === null);
    }

    if (targetIndex === -1) {
      get().notify('กระเป๋าช่างเต็มแล้ว (สูงสุด 5 ช่อง) กรุณานำของไปวางก่อน', 'warning');
      return false;
    }

    const newInventory = [...inventory];
    newInventory[targetIndex] = item;

    set({
      inventory: newInventory,
      activeSlotIndex: targetIndex,
      carriedItem: item,
    });

    get().notify(`หยิบ: ${item.nameTh} (${item.description.slice(0, 140)})`, 'success');
    return true;
  },

  selectSlot: (index) => {
    if (index >= 0 && index < 5) {
      const item = get().inventory[index] ?? null;
      set({ activeSlotIndex: index, carriedItem: item });
      if (item) {
        get().notify(`ถือ: ${item.nameTh}`, 'info');
      }
    }
  },

  dropCarriedItem: () => {
    const { inventory, activeSlotIndex, carriedItem } = get();
    if (!carriedItem) return;

    const newInventory = [...inventory];
    newInventory[activeSlotIndex] = null;
    set({
      inventory: newInventory,
      carriedItem: null,
    });
    get().notify(`เก็บ ${carriedItem.nameTh} ลงที่เดิม`, 'info');
  },

  returnAllItemsToStations: () => {
    set({
      inventory: [null, null, null, null, null],
      carriedItem: null,
    });
    get().notify('นำวัตถุทั้งหมดกลับคืนสถานีเดิมเรียบร้อยแล้ว', 'info');
  },

  openStationDialogue: (zoneId) => {
    const station = KNOWLEDGE_STATIONS[zoneId];
    if (!station) return;

    const visited = { ...get().visitedStations, [zoneId]: true };
    set({
      visitedStations: visited,
      activeDialogue: {
        speakerNameTh: station.npcNameTh || 'สถานีความรู้',
        speakerRoleTh: station.npcRoleTh || 'Instructor',
        bubbles: station.dialogueBubbles,
        currentBubbleIndex: 0,
        isOpen: true,
      },
    });

    // Auto-unlock devices or cards for inspection when talking to NPC
    if (station.rewardDevice) {
      get().pickupItem(station.rewardDevice);
    }
  },

  nextDialogueBubble: () => {
    const d = get().activeDialogue;
    if (!d) return;

    if (d.currentBubbleIndex + 1 < d.bubbles.length) {
      set({
        activeDialogue: {
          ...d,
          currentBubbleIndex: d.currentBubbleIndex + 1,
        },
      });
    } else {
      get().closeDialogue();
    }
  },

  closeDialogue: () => {
    set({ activeDialogue: null });
  },

  placeCardOnMission1Slot: (slotIndex) => {
    const { carriedItem, mission1Slots, missions } = get();
    if (!carriedItem) {
      get().notify('คุณไม่ได้ถือการ์ดคำตอบอยู่ในมือ', 'warning');
      return;
    }

    const slot = mission1Slots[slotIndex];
    if (!slot) return;

    const validation = validateCardDrop(slot, carriedItem, mission1Slots);
    set((s) => ({ totalAttempts: s.totalAttempts + 1 }));

    if (validation.isCorrect) {
      const updatedSlots = [...mission1Slots];
      updatedSlots[slotIndex] = {
        ...slot,
        currentPlacedItem: carriedItem,
        status: 'CORRECT',
      };

      // Remove item from inventory
      const newInventory = [...get().inventory];
      newInventory[get().activeSlotIndex] = null;

      const completion = checkMission1Complete(updatedSlots);
      const updatedMissions = {
        ...missions,
        M1: {
          ...missions.M1,
          score: completion.score,
          isCompleted: completion.isComplete,
          lastFeedbackTh: completion.feedbackTh,
        },
      };

      if (completion.isComplete) {
        updatedMissions.M2.isUnlocked = true;
        set({ activeMissionId: 'M2' });
        get().notify(completion.feedbackTh, 'success');
      } else {
        get().notify(`วางการ์ดสำเร็จ (${validation.feedbackTh})`, 'success');
      }

      set({
        mission1Slots: updatedSlots,
        inventory: newInventory,
        carriedItem: null,
        missions: updatedMissions,
      });

      get().recomputeRubric();
    } else {
      set((s) => ({ totalMistakes: s.totalMistakes + 1 }));
      get().notify(validation.feedbackTh, 'error');
    }
  },

  placeCardOnMission2Slot: (slotIndex) => {
    const { carriedItem, mission2Slots, missions } = get();
    if (!carriedItem) {
      get().notify('คุณไม่ได้ถือการ์ดคำตอบอยู่ในมือ', 'warning');
      return;
    }

    const slot = mission2Slots[slotIndex];
    if (!slot) return;

    const validation = validateCardDrop(slot, carriedItem, mission2Slots);
    set((s) => ({ totalAttempts: s.totalAttempts + 1 }));

    if (validation.isCorrect) {
      const updatedSlots = [...mission2Slots];
      updatedSlots[slotIndex] = {
        ...slot,
        currentPlacedItem: carriedItem,
        status: 'CORRECT',
      };

      const newInventory = [...get().inventory];
      newInventory[get().activeSlotIndex] = null;

      const completion = checkMission2Complete(updatedSlots);
      const updatedMissions = {
        ...missions,
        M2: {
          ...missions.M2,
          score: completion.score,
          isCompleted: completion.isComplete,
          lastFeedbackTh: completion.feedbackTh,
        },
      };

      if (completion.isComplete) {
        updatedMissions.M3.isUnlocked = true;
        set({ activeMissionId: 'M3' });
        get().notify(completion.feedbackTh, 'success');
      } else {
        get().notify(`วางการ์ดเส้นทางสำเร็จ (${validation.feedbackTh})`, 'success');
      }

      set({
        mission2Slots: updatedSlots,
        inventory: newInventory,
        carriedItem: null,
        missions: updatedMissions,
      });

      get().recomputeRubric();
    } else {
      set((s) => ({ totalMistakes: s.totalMistakes + 1 }));
      get().notify(validation.feedbackTh, 'error');
    }
  },

  matchDeviceFunction: (deviceId, conceptId) => {
    const updated = { ...get().mission3Matches, [deviceId]: conceptId };
    set((s) => ({ totalAttempts: s.totalAttempts + 1 }));

    const result = checkMission3Matches(updated);
    const updatedMissions = {
      ...get().missions,
      M3: {
        ...get().missions.M3,
        score: result.score,
        isCompleted: result.isComplete,
        lastFeedbackTh: result.isComplete
          ? 'จับคู่อุปกรณ์กับหน้าที่ครบทั้ง 5 รายการถูกต้อง!'
          : `จับคู่ถูกต้อง ${result.correctCount}/${result.total} รายการ`,
      },
    };

    if (result.isComplete) {
      updatedMissions.M4.isUnlocked = true;
      set({ activeMissionId: 'M4' });
      get().notify('ผ่านภารกิจที่ 3: จับคู่อุปกรณ์กับหน้าที่ถูกต้องครบถ้วน!', 'success');
    }

    set({
      mission3Matches: updated,
      missions: updatedMissions,
    });
    get().recomputeRubric();
  },

  placeComparisonCard: (conceptId, targetSide) => {
    const { mission4Cards, missions } = get();
    set((s) => ({ totalAttempts: s.totalAttempts + 1 }));

    // Remove from other side if already present
    const analog = mission4Cards.analogCards.filter((c) => c !== conceptId);
    const ip = mission4Cards.ipCards.filter((c) => c !== conceptId);

    if (targetSide === 'ANALOG') analog.push(conceptId);
    else ip.push(conceptId);

    const newCards = { analogCards: analog, ipCards: ip };
    const evalResult = checkMission4AnalogVsIp(newCards);

    const updatedMissions = {
      ...missions,
      M4: {
        ...missions.M4,
        score: evalResult.score,
        isCompleted: evalResult.isPassed,
        lastFeedbackTh: `ความถูกต้อง: ${evalResult.correctCount}/${evalResult.totalCards} ข้อ (${evalResult.isPassed ? 'ผ่านเกณฑ์อย่างน้อย 6/8' : 'ยังไม่ถึงเกณฑ์ 6/8'
          })`,
      },
    };

    if (evalResult.isPassed && !missions.M4.isCompleted) {
      updatedMissions.M5.isUnlocked = true;
      set({ activeMissionId: 'M5' });
      get().notify('ผ่านเกณฑ์เปรียบเทียบ Analog vs IP CCTV แล้ว! ปลดล็อก Lab ประกอบระบบ', 'success');
    }

    set({
      mission4Cards: newCards,
      missions: updatedMissions,
    });
    get().recomputeRubric();
  },

  placeDeviceOnRackOrDesk: (deviceId) => {
    const { placedDevices, carriedItem } = get();
    if (carriedItem?.deviceId !== deviceId) {
      get().notify(`คุณต้องถือ ${deviceId} ในมือจึงจะวางได้`, 'warning');
      return;
    }

    const updated = { ...placedDevices, [deviceId]: true };
    const newInventory = [...get().inventory];
    newInventory[get().activeSlotIndex] = null;

    set({
      placedDevices: updated,
      inventory: newInventory,
      carriedItem: null,
    });

    get().notify(`ติดตั้ง ${carriedItem.nameTh} ในตำแหน่งประจำเครื่องเรียบร้อย`, 'success');
    get().recomputeRubric();
  },

  toggleDevicePower: (deviceId) => {
    const current = !!get().poweredDevices[deviceId];
    const updated = { ...get().poweredDevices, [deviceId]: !current };
    set({ poweredDevices: updated });
    get().notify(`${deviceId}: ${!current ? 'เปิดสวิตช์ Power ON' : 'ปิดสวิตช์ Power OFF'}`, 'info');
    get().recomputeRubric();
  },

  connectCable: (cableType, fromDeviceId, fromPortId, toDeviceId, toPortId) => {
    const connection: CableConnection = {
      id: `CABLE_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      cableType,
      fromDeviceId,
      fromPortId,
      toDeviceId,
      toPortId,
      linkStatus: 'DOWN',
      poeSupplied: false,
    };

    const newConnections = [...get().connections, connection];
    set({ connections: newConnections });
    get().recomputeRubric();
    return true;
  },

  disconnectCable: (connectionId) => {
    const updated = get().connections.filter((c) => c.id !== connectionId);
    set({ connections: updated });
    get().notify('ถอดสายสัญญาณออกเรียบร้อย', 'info');
    get().recomputeRubric();
  },

  useHint: (): string => {
    const { activeMissionId, missions, totalHintsUsed } = get();
    const mission = missions[activeMissionId];
    const hintLevel = mission ? Math.min(2, mission.hintsUsed) : 0;
    const hints = [
      'คำใบ้ระดับ 1: ทบทวนบทสนทนาและสังเกตป้ายกำกับของแต่ละโซน',
      'คำใบ้ระดับ 2: ตรวจสอบชนิดพอร์ตและเส้นทางเดินของสาย Cat6 สู่พอร์ต PoE 1-8',
      'คำใบ้ระดับ 3: ต่อ Camera -> PoE Switch -> NVR -> Client PC/Monitor ให้ครบทั้งสายสัญญาณและไฟเลี้ยง',
    ];
    const hintText: string = hints[hintLevel] ?? hints[0] ?? 'ลองตรวจดูสถานีความรู้อีกครั้ง';

    const updatedMissions = {
      ...missions,
      [activeMissionId]: {
        ...mission,
        hintsUsed: (mission?.hintsUsed ?? 0) + 1,
      },
    };

    set({
      totalHintsUsed: totalHintsUsed + 1,
      missions: updatedMissions,
    });

    get().notify(hintText, 'info');
    get().recomputeRubric();
    return hintText;
  },

  setNotebookOpen: (open) => set({ isNotebookOpen: open }),
  setHintModalOpen: (open) => set({ isHintModalOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setCertificateOpen: (open) => set({ isCertificateOpen: open }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),

  recomputeRubric: () => {
    const { placedDevices, poweredDevices, connections, missions, totalHintsUsed, traineeName, sessionStartTime } = get();
    const topology = evaluateSystemTopology(placedDevices, poweredDevices, connections);

    // Update Mission 5 completion based on topology
    const isM5Complete = topology.isCameraOnline && topology.isNvrReachable && topology.isLiveViewActive;
    let m5Score = 0;
    if (topology.isCameraOnline) m5Score += 10;
    if (topology.isNvrReachable) m5Score += 5;
    if (topology.isMonitorConnectedToNvr || topology.isClientPcReachable) m5Score += 5;
    if (topology.isLiveViewActive) m5Score += 5;

    const updatedMissions = {
      ...missions,
      M5: {
        ...missions.M5,
        score: m5Score,
        isCompleted: isM5Complete,
        lastFeedbackTh: isM5Complete
          ? 'ประกอบระบบและเชื่อมต่อสายสำเร็จ ภาพ Live View ขึ้นบนจอแล้ว!'
          : `ความคืบหน้า M5: Camera ${topology.isCameraOnline ? 'Online' : 'Offline'} | Live View: ${topology.isLiveViewActive ? 'Active' : 'Down'
          }`,
      },
    };

    const rubric = evaluateFullRubric(updatedMissions, topology, totalHintsUsed);

    let evidence = get().learningEvidence;
    if (rubric.isPassed && !evidence) {
      evidence = createLearningEvidence(
        traineeName,
        sessionStartTime,
        Date.now(),
        get().totalAttempts,
        totalHintsUsed,
        get().totalMistakes,
        rubric,
        topology.diagnosticEvents.map((e) => `[${e.code}] ${e.messageTh}`)
      );
    }

    set({
      topologyResult: topology,
      missions: updatedMissions,
      rubric,
      isCompleted: rubric.isPassed,
      learningEvidence: evidence,
    });
  },
}));
