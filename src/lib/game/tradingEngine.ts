import { Item, InventoryItem, PlayerState } from '@/types/game';

export function buyMarketItem(
  player: PlayerState,
  inventory: InventoryItem[],
  item: Item,
  quantity: number = 1
): {
  updatedPlayer: PlayerState;
  updatedInventory: InventoryItem[];
  success: boolean;
  message: string;
} {
  const totalCost = item.value * quantity;
  if (player.spiritStones < totalCost) {
    return {
      updatedPlayer: player,
      updatedInventory: inventory,
      success: false,
      message: `Insufficient Spirit Stones. Required: ${totalCost} Stones.`,
    };
  }

  const existingIndex = inventory.findIndex((inv) => inv.item.id === item.id);
  let nextInventory: InventoryItem[];

  if (existingIndex >= 0) {
    nextInventory = inventory.map((inv, idx) =>
      idx === existingIndex ? { ...inv, quantity: inv.quantity + quantity } : inv
    );
  } else {
    nextInventory = [...inventory, { item, quantity }];
  }

  return {
    updatedPlayer: {
      ...player,
      spiritStones: player.spiritStones - totalCost,
    },
    updatedInventory: nextInventory,
    success: true,
    message: `Acquired ${quantity}x [${item.name}] from Heavenly Treasure Pavilion for ${totalCost} Spirit Stones.`,
  };
}

export function sellInventoryItem(
  player: PlayerState,
  inventory: InventoryItem[],
  itemId: string,
  quantity: number = 1
): {
  updatedPlayer: PlayerState;
  updatedInventory: InventoryItem[];
  success: boolean;
  message: string;
} {
  const targetIndex = inventory.findIndex((inv) => inv.item.id === itemId && inv.quantity >= quantity);
  if (targetIndex < 0) {
    return {
      updatedPlayer: player,
      updatedInventory: inventory,
      success: false,
      message: 'Item not found in Spatial Ring or quantity insufficient.',
    };
  }

  const invItem = inventory[targetIndex];
  const sellPricePerUnit = Math.max(1, Math.floor(invItem.item.value * 0.75));
  const totalEarned = sellPricePerUnit * quantity;

  const nextInventory = inventory
    .map((inv, idx) => (idx === targetIndex ? { ...inv, quantity: inv.quantity - quantity } : inv))
    .filter((inv) => inv.quantity > 0);

  return {
    updatedPlayer: {
      ...player,
      spiritStones: player.spiritStones + totalEarned,
    },
    updatedInventory: nextInventory,
    success: true,
    message: `Sold ${quantity}x [${invItem.item.name}] for ${totalEarned} Spirit Stones.`,
  };
}
