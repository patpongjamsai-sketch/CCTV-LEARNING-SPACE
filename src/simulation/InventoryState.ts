import type { EquipmentDefinition, InventoryEntry, SerializableGameState } from '../data/types';

export function addInventoryItem(state: SerializableGameState, equipment: EquipmentDefinition, quantity = 1): void {
  const current = state.inventory[equipment.id];
  state.inventory[equipment.id] = {
    equipmentId: equipment.id,
    quantity: (current?.quantity ?? 0) + Math.max(0, quantity),
    condition: equipment.condition,
  };
}

export function removeInventoryItem(state: SerializableGameState, equipmentId: string, quantity = 1): boolean {
  const current = state.inventory[equipmentId];
  if (!current || current.quantity < quantity || quantity <= 0) return false;
  const nextQuantity = current.quantity - quantity;
  if (nextQuantity === 0) delete state.inventory[equipmentId];
  else current.quantity = nextQuantity;
  return true;
}


export function inventoryEntries(state: Readonly<SerializableGameState>): InventoryEntry[] {
  return Object.values(state.inventory).filter((entry) => entry.quantity > 0);
}
