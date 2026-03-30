import { useEffect, useMemo, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { DndItemType } from '@/components/table/table-dnd-types';

type PromptCard = {
  index: number;
  name: string;
  isAvailable: boolean;
  isSecret: boolean;
};

type PromptLike = {
  cards?: { cards?: Array<{ name?: string; fullName?: string }> };
  options?: {
    blocked?: number[];
    isSecret?: boolean;
  };
};

type PromptDragItem = {
  type: typeof DndItemType.PROMPT_CARD;
  card: PromptCard;
  sourcePane: 'TOP' | 'BOTTOM';
};

type PromptChooseCardsDndProps = {
  prompt: PromptLike;
  disabled?: boolean;
  singlePaneMode?: boolean;
  onChange: (result: number[]) => void;
};

function PromptCardView(props: {
  card: PromptCard;
  pane: 'TOP' | 'BOTTOM';
  disabled?: boolean;
  onMove: (item: PromptDragItem, pane: 'TOP' | 'BOTTOM', hoverIndex: number) => void;
  index: number;
}): JSX.Element {
  const { card, pane, disabled, onMove, index } = props;
  const label = card.isSecret ? `Secret #${card.index + 1}` : card.name;

  const [{ isDragging }, dragRef] = useDrag<PromptDragItem, void, { isDragging: boolean }>(() => ({
    type: DndItemType.PROMPT_CARD,
    canDrag: !disabled && card.isAvailable,
    item: { type: DndItemType.PROMPT_CARD, card, sourcePane: pane },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }), [card, disabled, pane]);

  const [, dropRef] = useDrop<PromptDragItem>(() => ({
    accept: DndItemType.PROMPT_CARD,
    hover: item => {
      onMove(item, pane, index);
      item.sourcePane = pane;
    }
  }), [index, onMove, pane]);

  return (
    <div
      ref={node => dragRef(dropRef(node))}
      className={`rounded-md border p-2 text-xs ${card.isAvailable ? 'border-border bg-background' : 'border-border/40 bg-muted text-muted-foreground'}`}
      style={{ opacity: isDragging ? 0.35 : 1 }}
    >
      {label}
    </div>
  );
}

function DropPane(props: {
  pane: 'TOP' | 'BOTTOM';
  cards: PromptCard[];
  disabled?: boolean;
  onMove: (item: PromptDragItem, pane: 'TOP' | 'BOTTOM', hoverIndex: number) => void;
  onDropToEmpty: (item: PromptDragItem, pane: 'TOP' | 'BOTTOM') => void;
  title: string;
}): JSX.Element {
  const { pane, cards, disabled, onMove, onDropToEmpty, title } = props;

  const [, dropRef] = useDrop<PromptDragItem>(() => ({
    accept: DndItemType.PROMPT_CARD,
    canDrop: () => !disabled,
    drop: item => {
      if (cards.length === 0) {
        onDropToEmpty(item, pane);
      }
    }
  }), [cards.length, disabled, onDropToEmpty, pane]);

  return (
    <div ref={dropRef} className="grid gap-2 rounded-md border border-border p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      {cards.length === 0 && <p className="text-xs text-muted-foreground">Drop cards here</p>}
      {cards.map((card, index) => (
        <PromptCardView
          key={`prompt-card-${card.index}-${pane}`}
          card={card}
          pane={pane}
          disabled={disabled}
          onMove={onMove}
          index={index}
        />
      ))}
    </div>
  );
}

export function PromptChooseCardsDnd({
  prompt,
  disabled,
  singlePaneMode,
  onChange
}: PromptChooseCardsDndProps): JSX.Element {
  const baseCards = useMemo(() => {
    const blocked = new Set(prompt.options?.blocked || []);
    const isSecret = Boolean(prompt.options?.isSecret);
    return (prompt.cards?.cards || []).map((card, index) => ({
      index,
      name: card.fullName || card.name || `Card #${index + 1}`,
      isAvailable: !blocked.has(index),
      isSecret
    }));
  }, [prompt.cards?.cards, prompt.options?.blocked, prompt.options?.isSecret]);

  const [topCards, setTopCards] = useState<PromptCard[]>(baseCards);
  const [bottomCards, setBottomCards] = useState<PromptCard[]>([]);

  useEffect(() => {
    setTopCards(baseCards);
    setBottomCards([]);
    onChange([]);
  }, [baseCards, onChange]);

  const emit = (nextTop: PromptCard[], nextBottom: PromptCard[]) => {
    onChange((singlePaneMode ? nextTop : nextBottom).map(card => card.index));
  };

  const onMove = (item: PromptDragItem, targetPane: 'TOP' | 'BOTTOM', hoverIndex: number) => {
    if (disabled) {
      return;
    }
    let nextTop = topCards.filter(card => card.index !== item.card.index);
    let nextBottom = bottomCards.filter(card => card.index !== item.card.index);
    const targetList = targetPane === 'TOP' ? nextTop : nextBottom;
    const insertAt = Math.max(0, Math.min(hoverIndex, targetList.length));
    targetList.splice(insertAt, 0, item.card);

    if (targetPane === 'TOP') {
      nextTop = targetList;
    } else {
      nextBottom = targetList;
    }

    setTopCards(nextTop);
    setBottomCards(nextBottom);
    emit(nextTop, nextBottom);
  };

  const onDropToEmpty = (item: PromptDragItem, targetPane: 'TOP' | 'BOTTOM') => {
    onMove(item, targetPane, 0);
  };

  return (
    <div className="grid gap-3">
      <DropPane
        pane="TOP"
        title="Available Cards"
        cards={topCards}
        disabled={disabled}
        onMove={onMove}
        onDropToEmpty={onDropToEmpty}
      />
      {!singlePaneMode && (
        <DropPane
          pane="BOTTOM"
          title="Selected Cards"
          cards={bottomCards}
          disabled={disabled}
          onMove={onMove}
          onDropToEmpty={onDropToEmpty}
        />
      )}
    </div>
  );
}
