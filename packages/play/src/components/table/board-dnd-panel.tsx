import { useDrag, useDrop } from 'react-dnd';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  DndItemType,
  PlayerType,
  SlotType,
  type BoardDragItem,
  type CardTarget,
  type HandDragItem
} from '@/components/table/table-dnd-types';

type PokemonSlotLike = {
  pokemons: { cards: Array<{ name?: string; fullName?: string }> };
};

type PlayerLike = {
  id: number;
  active: PokemonSlotLike;
  bench: PokemonSlotLike[];
};

type BoardDndPanelProps = {
  player: PlayerLike | undefined;
  clientId: number;
  disabled?: boolean;
  onPlayFromHand: (handIndex: number, target: CardTarget) => void;
  onReorderBench: (from: number, to: number) => void;
  onRetreat: (benchIndex: number) => void;
};

function getSlotCardName(slot: PokemonSlotLike | undefined): string {
  const first = slot?.pokemons?.cards?.[0];
  return first ? (first.fullName || first.name || 'Pokemon') : 'Empty';
}

function BoardSlot(props: {
  label: string;
  slotType: 'ACTIVE' | 'BENCH';
  benchIndex: number;
  cardName: string;
  canOperate: boolean;
  onDropCard: (item: HandDragItem | BoardDragItem, slotType: 'ACTIVE' | 'BENCH', benchIndex: number) => void;
}): JSX.Element {
  const { label, slotType, benchIndex, cardName, canOperate, onDropCard } = props;
  const hasCard = cardName !== 'Empty';

  const [{ isDragging }, dragRef] = useDrag<BoardDragItem, void, { isDragging: boolean }>(() => ({
    type: DndItemType.BOARD_SLOT,
    canDrag: canOperate && hasCard,
    item: {
      type: DndItemType.BOARD_SLOT,
      slot: slotType,
      benchIndex,
      cardName
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }), [benchIndex, canOperate, cardName, hasCard, slotType]);

  const [{ isOver, canDrop }, dropRef] = useDrop<HandDragItem | BoardDragItem, void, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: [DndItemType.HAND_CARD, DndItemType.BOARD_SLOT],
    canDrop: item => {
      if (!canOperate) {
        return false;
      }
      if (item.type === DndItemType.BOARD_SLOT) {
        return !(item.slot === slotType && item.benchIndex === benchIndex);
      }
      return true;
    },
    drop: item => {
      onDropCard(item, slotType, benchIndex);
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }), [benchIndex, canOperate, onDropCard, slotType]);

  return (
    <div
      ref={node => dragRef(dropRef(node))}
      className="rounded-md border border-border bg-background p-3 text-sm"
      style={{
        opacity: isDragging ? 0.35 : 1,
        outline: isOver && canDrop ? '2px solid hsl(var(--ring))' : undefined
      }}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{cardName}</p>
    </div>
  );
}

export function BoardDndPanel({
  player,
  clientId,
  disabled,
  onPlayFromHand,
  onReorderBench,
  onRetreat
}: BoardDndPanelProps): JSX.Element {
  const canOperate = Boolean(player && player.id === clientId && !disabled);
  const bench = player?.bench || [];
  const activeName = getSlotCardName(player?.active);

  const onDropCard = (item: HandDragItem | BoardDragItem, targetSlot: 'ACTIVE' | 'BENCH', targetIndex: number) => {
    if (!canOperate) {
      return;
    }

    if (item.type === DndItemType.HAND_CARD) {
      const target: CardTarget = {
        player: PlayerType.BOTTOM_PLAYER,
        slot: targetSlot === 'ACTIVE' ? SlotType.ACTIVE : SlotType.BENCH,
        index: targetSlot === 'ACTIVE' ? 0 : targetIndex
      };
      onPlayFromHand(item.handIndex, target);
      return;
    }

    if (item.slot === 'BENCH' && targetSlot === 'BENCH' && item.benchIndex !== targetIndex) {
      onReorderBench(item.benchIndex, targetIndex);
      return;
    }

    if (item.slot === 'ACTIVE' && targetSlot === 'BENCH') {
      onRetreat(targetIndex);
      return;
    }

    if (item.slot === 'BENCH' && targetSlot === 'ACTIVE') {
      onRetreat(item.benchIndex);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Board</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <BoardSlot
          label="Active"
          slotType="ACTIVE"
          benchIndex={0}
          cardName={activeName}
          canOperate={canOperate}
          onDropCard={onDropCard}
        />
        <div className="grid gap-2 md:grid-cols-2">
          {bench.map((slot, index) => (
            <BoardSlot
              key={`bench-${index}`}
              label={`Bench ${index + 1}`}
              slotType="BENCH"
              benchIndex={index}
              cardName={getSlotCardName(slot)}
              canOperate={canOperate}
              onDropCard={onDropCard}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
