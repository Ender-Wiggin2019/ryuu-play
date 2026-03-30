export const DndItemType = {
  HAND_CARD: 'HAND_CARD',
  BOARD_SLOT: 'BOARD_SLOT',
  PROMPT_CARD: 'PROMPT_CARD'
} as const;

export const PlayerType = {
  ANY: 0,
  TOP_PLAYER: 1,
  BOTTOM_PLAYER: 2
} as const;

export const SlotType = {
  BOARD: 0,
  ACTIVE: 1,
  BENCH: 2,
  HAND: 3,
  DISCARD: 4
} as const;

export type CardTarget = {
  player: number;
  slot: number;
  index: number;
};

export type HandDragItem = {
  type: typeof DndItemType.HAND_CARD;
  handIndex: number;
  orderIndex: number;
  cardName: string;
};

export type BoardDragItem = {
  type: typeof DndItemType.BOARD_SLOT;
  slot: 'ACTIVE' | 'BENCH';
  benchIndex: number;
  cardName: string;
};
