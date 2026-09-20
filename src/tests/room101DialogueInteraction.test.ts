import { describe, expect, it, beforeEach } from 'vitest';
import { useRoleplayStore } from '../store/useRoleplayStore';
import { useCctvTrainingStore } from '../store/useCctvTrainingStore';

describe('Room 101 table dialogue and mission launch interaction', () => {
  beforeEach(() => {
    // Reset store states
    useRoleplayStore.setState({
      activeDialogue: null,
      isNotebookOpen: false,
      notebookActiveTab: 'checklist',
    });
    useCctvTrainingStore.setState({
      activeStation101Modal: null,
    });
  });

  it('ZONE_A: finishes briefing dialogue with manager and automatically opens Field Notebook Checklist tab', () => {
    const store = useRoleplayStore.getState();
    store.openStationDialogue('ZONE_A');

    const d = useRoleplayStore.getState().activeDialogue;
    expect(d).not.toBeNull();
    expect(d?.zoneId).toBe('ZONE_A');
    expect(d?.isOpen).toBe(true);

    // Advance through all bubbles until last
    const bubblesCount = d!.bubbles.length;
    for (let i = 0; i < bubblesCount; i++) {
      useRoleplayStore.getState().nextDialogueBubble();
    }

    // Dialogue is closed
    expect(useRoleplayStore.getState().activeDialogue).toBeNull();
    // Checklist tab in notebook is opened
    expect(useRoleplayStore.getState().isNotebookOpen).toBe(true);
    expect(useRoleplayStore.getState().notebookActiveTab).toBe('checklist');
  });

  it('ZONE_B: finishes Table 1 dialogue with camera technician and automatically launches Mission 1 Modal', () => {
    useRoleplayStore.getState().openStationDialogue('ZONE_B');

    const d = useRoleplayStore.getState().activeDialogue;
    expect(d?.zoneId).toBe('ZONE_B');

    // Finish dialogue
    useRoleplayStore.getState().finishDialogueAndLaunchMission();

    expect(useRoleplayStore.getState().activeDialogue).toBeNull();
    expect(useCctvTrainingStore.getState().activeStation101Modal).toBe(1);
  });

  it('ZONE_C: finishes Table 2 dialogue with network engineer and automatically launches Mission 2 Modal', () => {
    useRoleplayStore.getState().openStationDialogue('ZONE_C');

    useRoleplayStore.getState().finishDialogueAndLaunchMission();

    expect(useRoleplayStore.getState().activeDialogue).toBeNull();
    expect(useCctvTrainingStore.getState().activeStation101Modal).toBe(2);
  });

  it('ZONE_D: finishes Table 3 dialogue with security chief and automatically launches Mission 3 Modal', () => {
    useRoleplayStore.getState().openStationDialogue('ZONE_D');

    useRoleplayStore.getState().finishDialogueAndLaunchMission();

    expect(useRoleplayStore.getState().activeDialogue).toBeNull();
    expect(useCctvTrainingStore.getState().activeStation101Modal).toBe(3);
  });

  it('ZONE_F: finishes Table 4 dialogue with instructor and automatically launches Mission 4 Modal', () => {
    useRoleplayStore.getState().openStationDialogue('ZONE_F');

    useRoleplayStore.getState().finishDialogueAndLaunchMission();

    expect(useRoleplayStore.getState().activeDialogue).toBeNull();
    expect(useCctvTrainingStore.getState().activeStation101Modal).toBe(4);
  });

  it('ZONE_E: finishes Table 5 dialogue with monitor operator and automatically launches Mission 5 Modal', () => {
    useRoleplayStore.getState().openStationDialogue('ZONE_E');

    useRoleplayStore.getState().finishDialogueAndLaunchMission();

    expect(useRoleplayStore.getState().activeDialogue).toBeNull();
    expect(useCctvTrainingStore.getState().activeStation101Modal).toBe(5);
  });

  it('closeDialogue without finishing closes dialogue without opening modal', () => {
    useRoleplayStore.getState().openStationDialogue('ZONE_B');
    expect(useRoleplayStore.getState().activeDialogue).not.toBeNull();

    useRoleplayStore.getState().closeDialogue();

    expect(useRoleplayStore.getState().activeDialogue).toBeNull();
    expect(useCctvTrainingStore.getState().activeStation101Modal).toBeNull();
  });
});
