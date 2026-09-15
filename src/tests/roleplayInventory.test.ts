import { describe, it, expect, beforeEach } from 'vitest';
import { useRoleplayStore } from '../store/useRoleplayStore';
import { KNOWLEDGE_CARDS } from '../data/unit1RoleplayContent';
import { InventoryItem } from '../shared/domain/roleplayTypes';

describe('Unit 1 Roleplay Inventory System', () => {
  beforeEach(() => {
    useRoleplayStore.setState({
      inventory: [null, null, null, null, null],
      activeSlotIndex: 0,
      carriedItem: null,
      totalAttempts: 0,
      totalMistakes: 0,
    });
  });

  it('adds picked up item to active slot if empty', () => {
    const item = KNOWLEDGE_CARDS.M1_LENS!;
    const success = useRoleplayStore.getState().pickupItem(item);
    expect(success).toBe(true);

    const store = useRoleplayStore.getState();
    expect(store.inventory[0]?.id).toBe('M1_LENS');
    expect(store.carriedItem?.id).toBe('M1_LENS');
  });

  it('prevents picking up duplicate items already in inventory', () => {
    const item = KNOWLEDGE_CARDS.M1_LENS!;
    useRoleplayStore.getState().pickupItem(item);
    const secondTry = useRoleplayStore.getState().pickupItem(item);
    expect(secondTry).toBe(false);
  });

  it('respects maximum capacity of 5 slots', () => {
    const cards = [
      KNOWLEDGE_CARDS.M1_LENS!,
      KNOWLEDGE_CARDS.M1_SENSOR!,
      KNOWLEDGE_CARDS.M1_PROCESSOR!,
      KNOWLEDGE_CARDS.M1_LAN!,
      KNOWLEDGE_CARDS.M2_CAM!,
    ];

    for (const c of cards) {
      const ok = useRoleplayStore.getState().pickupItem(c);
      expect(ok).toBe(true);
    }

    const extraItem: InventoryItem = {
      id: 'EXTRA_ITEM',
      type: 'KNOWLEDGE_CARD',
      nameTh: 'การ์ดเกิน',
      nameEn: 'Extra',
      description: '',
      icon: '',
      quantity: 1,
      weight: 'LIGHT',
      sourceZone: 'ZONE_A',
    };

    const overflow = useRoleplayStore.getState().pickupItem(extraItem);
    expect(overflow).toBe(false);
  });

  it('allows switching slots via selectSlot (1-5 hotbar keys)', () => {
    useRoleplayStore.getState().pickupItem(KNOWLEDGE_CARDS.M1_LENS!); // slot 0
    useRoleplayStore.getState().selectSlot(1);
    expect(useRoleplayStore.getState().carriedItem).toBe(null);

    useRoleplayStore.getState().selectSlot(0);
    expect(useRoleplayStore.getState().carriedItem?.id).toBe('M1_LENS');
  });
});
