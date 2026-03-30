import { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { DndItemType, type HandDragItem } from '@/components/table/table-dnd-types';

type HandCard = {
  name?: string;
  fullName?: string;
};

type PlayerLike = {
  id: number;
  hand: {
    cards: HandCard[];
    isPublic?: boolean;
    isSecret?: boolean;
  };
};

type HandDndPanelProps = {
  player: PlayerLike | undefined;
  clientId: number;
  disabled?: boolean;
  onReorder: (order: number[]) => void;
};

function DraggableHandCard(props: {
  orderIndex: number;
  handIndex: number;
  card: HandCard;
  disabled: boolean;
  onMove: (from: number, to: number) => void;
  onDropDone: () => void;
}): JSX.Element {
  const { orderIndex, handIndex, card, disabled, onMove, onDropDone } = props;
  const cardName = card.fullName || card.name || `Card #${handIndex + 1}`;

  const [{ isDragging }, dragRef] = useDrag<HandDragItem, void, { isDragging: boolean }>(() => ({
    type: DndItemType.HAND_CARD,
    canDrag: !disabled,
    item: {
      type: DndItemType.HAND_CARD,
      handIndex,
      orderIndex,
      cardName
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    end: () => {
      onDropDone();
    }
  }), [cardName, disabled, handIndex, onDropDone, orderIndex]);

  const [, dropRef] = useDrop<HandDragItem>(() => ({
    accept: DndItemType.HAND_CARD,
    hover: item => {
      if (item.orderIndex === orderIndex) {
        return;
      }
      onMove(item.orderIndex, orderIndex);
      item.orderIndex = orderIndex;
    }
  }), [onMove, orderIndex]);

  return (
    <div
      ref={node => dragRef(dropRef(node))}
      className="cursor-grab rounded-md border border-border bg-background p-2 text-xs"
      style={{ opacity: isDragging ? 0.35 : 1 }}
    >
      {cardName}
    </div>
  );
}

export function HandDndPanel({ player, clientId, disabled, onReorder }: HandDndPanelProps): JSX.Element {
  const canOperate = Boolean(player && player.id === clientId && !disabled);
  const cards = player?.hand.cards || [];
  const [mutableOrder, setMutableOrder] = useState<number[]>(() => cards.map((_, index) => index));

  useEffect(() => {
    setMutableOrder(cards.map((_, index) => index));
  }, [cards.length]);

  const onMove = (from: number, to: number) => {
    setMutableOrder(previous => {
      const next = previous.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onDropDone = () => {
    if (!canOperate) {
      return;
    }
    const changed = mutableOrder.some((value, index) => value !== index);
    if (changed) {
      onReorder(mutableOrder);
    } else {
      setMutableOrder(cards.map((_, index) => index));
    }
  };

  const orderedCards = mutableOrder
    .map((handIndex, orderIndex) => ({
      handIndex,
      orderIndex,
      card: cards[handIndex]
    }))
    .filter(item => item.card !== undefined) as Array<{
      handIndex: number;
      orderIndex: number;
      card: HandCard;
    }>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hand</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {cards.length === 0 && <p className="text-sm text-muted-foreground">No cards in hand.</p>}
        {orderedCards.map(({ card, handIndex, orderIndex }) => (
          <DraggableHandCard
            key={`${card?.fullName || card?.name || 'hand'}-${handIndex}`}
            orderIndex={orderIndex}
            handIndex={handIndex}
            card={card}
            disabled={!canOperate}
            onMove={onMove}
            onDropDone={onDropDone}
          />
        ))}
      </CardContent>
    </Card>
  );
}
