import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PromptChooseCardsDnd } from '@/components/table/prompt-choose-cards-dnd';
import { apiClient } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

import { PlayerType, SlotType, type CardTarget } from '../../../../common/src/store/actions/play-card-action';
import type { State } from '../../../../common/src/store/state/state';
import type { CardType } from '../../../../common/src/store/card/card-types';
import type { EnergyCard } from '../../../../common/src/store/card/energy-card';

type PromptLike = {
  id: number;
  type: string;
  playerId?: number;
  message?: string;
  values?: string[];
  playerType?: PlayerType;
  slots?: SlotType[];
  options?: Record<string, unknown>;
  filter?: Record<string, unknown>;
  cards?: Array<{
    name: string;
    attacks?: Array<{ name: string }>;
    powers?: Array<{ name: string; useWhenInPlay?: boolean; useFromHand?: boolean; useFromDiscard?: boolean }>;
  }> | {
    cards?: Array<{ name?: string; fullName?: string }>;
  };
  validate?: (result: unknown) => boolean;
};

type DeckListEntry = {
  id: number;
  name: string;
  isValid: boolean;
};

type DeckListResponse = {
  decks: DeckListEntry[];
};

type DeckResponse = {
  deck: {
    cards: string[];
  };
};

type PromptHostProps = {
  prompt: PromptLike | undefined;
  state?: State | null;
  loading?: boolean;
  onResolve: (result: unknown) => Promise<void>;
};

type PromptPokemonChoice = {
  label: string;
  target: CardTarget;
};

type AttachEnergyRow = {
  cardIndex: number;
  to: CardTarget;
};

type MoveEnergyRow = {
  from: CardTarget;
  to: CardTarget;
  cardIndex: number;
};

type DamageTransferRow = {
  from: CardTarget;
  to: CardTarget;
};

function targetKey(target: CardTarget): string {
  return `${target.player}:${target.slot}:${target.index}`;
}

function moveIndex(list: number[], from: number, to: number): number[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) {
    return next;
  }
  next.splice(to, 0, item);
  return next;
}

function buildPokemonChoices(prompt: PromptLike | undefined, state?: State | null): PromptPokemonChoice[] {
  if (!prompt || !state || !prompt.playerId || !prompt.slots?.length) {
    return [];
  }

  const player = state.players.find(entry => entry.id === prompt.playerId);
  const opponent = state.players.find(entry => entry.id !== prompt.playerId);
  if (!player || !opponent) {
    return [];
  }

  const rows: PromptPokemonChoice[] = [];
  const pushSlots = (owner: typeof player, ownerType: PlayerType, slotType: SlotType, slots: typeof player.bench | [typeof player.active]) => {
    slots.forEach((slot, index) => {
      const pokemonName = slot.pokemons.cards[0]?.name;
      if (!pokemonName) {
        return;
      }
      rows.push({
        label: `${ownerType === PlayerType.BOTTOM_PLAYER ? 'You' : 'Opponent'} · ${slotType === SlotType.ACTIVE ? 'Active' : `Bench ${index + 1}`} · ${pokemonName}`,
        target: { player: ownerType, slot: slotType, index }
      });
    });
  };

  if ([PlayerType.TOP_PLAYER, PlayerType.ANY].includes(prompt.playerType as PlayerType)) {
    if (prompt.slots.includes(SlotType.BENCH)) {
      pushSlots(opponent, PlayerType.TOP_PLAYER, SlotType.BENCH, opponent.bench);
    }
    if (prompt.slots.includes(SlotType.ACTIVE)) {
      pushSlots(opponent, PlayerType.TOP_PLAYER, SlotType.ACTIVE, [opponent.active]);
    }
  }

  if ([PlayerType.BOTTOM_PLAYER, PlayerType.ANY].includes(prompt.playerType as PlayerType)) {
    if (prompt.slots.includes(SlotType.ACTIVE)) {
      pushSlots(player, PlayerType.BOTTOM_PLAYER, SlotType.ACTIVE, [player.active]);
    }
    if (prompt.slots.includes(SlotType.BENCH)) {
      pushSlots(player, PlayerType.BOTTOM_PLAYER, SlotType.BENCH, player.bench);
    }
  }

  return rows;
}

function resolveTargetSlot(state: State | null | undefined, prompt: PromptLike | undefined, target: CardTarget) {
  if (!state || !prompt?.playerId) {
    return undefined;
  }
  const player = state.players.find(entry => entry.id === prompt.playerId);
  const opponent = state.players.find(entry => entry.id !== prompt.playerId);
  const actor = target.player === PlayerType.BOTTOM_PLAYER ? player : opponent;
  if (!actor) {
    return undefined;
  }
  if (target.slot === SlotType.ACTIVE) {
    return actor.active;
  }
  if (target.slot === SlotType.BENCH) {
    return actor.bench[target.index];
  }
  return undefined;
}

export function PromptHost({ prompt, state, loading, onResolve }: PromptHostProps): JSX.Element | null {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [manualJson, setManualJson] = useState('');
  const [attackCardIndex, setAttackCardIndex] = useState(0);
  const [attackName, setAttackName] = useState('');
  const [decks, setDecks] = useState<DeckListEntry[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [chooseCardsResult, setChooseCardsResult] = useState<number[]>([]);
  const [isChooseCardsInvalid, setIsChooseCardsInvalid] = useState(false);
  const [orderedIndices, setOrderedIndices] = useState<number[]>([]);
  const [selectedPrizeIndices, setSelectedPrizeIndices] = useState<number[]>([]);
  const [selectedPokemonTargets, setSelectedPokemonTargets] = useState<CardTarget[]>([]);
  const [selectedEnergyIndices, setSelectedEnergyIndices] = useState<number[]>([]);
  const [attachRows, setAttachRows] = useState<AttachEnergyRow[]>([]);
  const [attachCardIndex, setAttachCardIndex] = useState(0);
  const [attachTargetKey, setAttachTargetKey] = useState('');
  const [moveEnergyRows, setMoveEnergyRows] = useState<MoveEnergyRow[]>([]);
  const [moveEnergySourceKey, setMoveEnergySourceKey] = useState('');
  const [moveEnergyCardIndex, setMoveEnergyCardIndex] = useState(0);
  const [moveEnergyTargetKey, setMoveEnergyTargetKey] = useState('');
  const [moveDamageRows, setMoveDamageRows] = useState<DamageTransferRow[]>([]);
  const [moveDamageSourceKey, setMoveDamageSourceKey] = useState('');
  const [moveDamageTargetKey, setMoveDamageTargetKey] = useState('');
  const [putDamageMap, setPutDamageMap] = useState<Record<string, number>>({});
  const [putDamageTargetKey, setPutDamageTargetKey] = useState('');
  const promptCardsArray = Array.isArray(prompt?.cards) ? prompt.cards : [];

  useEffect(() => {
    setManualJson('');
    setSelectedIndex(0);
    setAttackCardIndex(0);
    setAttackName('');
    setChooseCardsResult([]);
    setIsChooseCardsInvalid(false);
    setOrderedIndices([]);
    setSelectedPrizeIndices([]);
    setSelectedPokemonTargets([]);
    setSelectedEnergyIndices([]);
    setAttachRows([]);
    setAttachCardIndex(0);
    setAttachTargetKey('');
    setMoveEnergyRows([]);
    setMoveEnergySourceKey('');
    setMoveEnergyCardIndex(0);
    setMoveEnergyTargetKey('');
    setMoveDamageRows([]);
    setMoveDamageSourceKey('');
    setMoveDamageTargetKey('');
    setPutDamageMap({});
    setPutDamageTargetKey('');
  }, [prompt?.id]);

  useEffect(() => {
    const loadDecks = async () => {
      if (!prompt || prompt.type !== 'Invite player') {
        return;
      }

      const response = await apiClient.get<DeckListResponse>('/v1/decks/list');
      const validDecks = response.decks.filter(deck => deck.isValid);
      setDecks(validDecks);
      setSelectedDeckId(validDecks[0]?.id ?? null);
    };

    void loadDecks();
  }, [prompt]);

  const attackOptions = useMemo(() => {
    if (!prompt || prompt.type !== 'Choose attack' || promptCardsArray.length === 0) {
      return [];
    }
    const card = promptCardsArray[attackCardIndex];
    if (!card) {
      return [];
    }
    const powers = (card.powers || []).map(power => power.name);
    const attacks = (card.attacks || []).map(attack => attack.name);
    return [...powers, ...attacks];
  }, [attackCardIndex, prompt, promptCardsArray]);

  useEffect(() => {
    if (attackOptions.length > 0) {
      setAttackName(attackOptions[0]);
    }
  }, [attackOptions]);

  useEffect(() => {
    if (!prompt) {
      return;
    }
    if (prompt.type === 'Order cards') {
      const cards = Array.isArray(prompt.cards) ? [] : prompt.cards?.cards || [];
      setOrderedIndices(cards.map((_, index) => index));
    }
  }, [prompt]);

  const prizeChoices = useMemo(() => {
    if (!state || !prompt || prompt.type !== 'Choose prize' || !prompt.playerId) {
      return [];
    }
    const player = state.players.find(entry => entry.id === prompt.playerId);
    if (!player) {
      return [];
    }
    return player.prizes
      .filter(prize => prize.cards.length > 0)
      .map((prize, index) => ({
        index,
        label: `Prize ${index + 1}`,
        cards: prize.cards.map(card => card.name)
      }));
  }, [prompt, state]);
  const energyPromptData = useMemo(() => {
    const value = prompt as PromptLike & {
      energy?: Array<{ card: EnergyCard; provides: CardType[] }>;
      cost?: CardType[];
    };
    return {
      energy: value?.energy || [],
      cost: value?.cost || []
    };
  }, [prompt]);
  const attachPromptData = useMemo(() => {
    const value = prompt as PromptLike & {
      cardList?: { cards: EnergyCard[] };
      options?: {
        blocked?: number[];
        blockedTo?: CardTarget[];
        min?: number;
        max?: number;
        sameTarget?: boolean;
        differentTargets?: boolean;
      };
    };
    return {
      cards: value?.cardList?.cards || [],
      blocked: value?.options?.blocked || [],
      blockedTo: value?.options?.blockedTo || [],
      min: Number(value?.options?.min ?? 0),
      max: Number(value?.options?.max ?? (value?.cardList?.cards.length || 0)),
      sameTarget: Boolean(value?.options?.sameTarget),
      differentTargets: Boolean(value?.options?.differentTargets)
    };
  }, [prompt]);
  const moveEnergyData = useMemo(() => {
    const value = prompt as PromptLike & {
      options?: {
        blockedFrom?: CardTarget[];
        blockedTo?: CardTarget[];
        blockedMap?: Array<{ source: CardTarget; blocked: number[] }>;
        min?: number;
        max?: number;
      };
    };
    return {
      blockedFrom: value?.options?.blockedFrom || [],
      blockedTo: value?.options?.blockedTo || [],
      blockedMap: value?.options?.blockedMap || [],
      min: Number(value?.options?.min ?? 0),
      max: typeof value?.options?.max === 'number' ? value.options.max : undefined
    };
  }, [prompt]);
  const moveDamageData = useMemo(() => {
    const value = prompt as PromptLike & {
      maxAllowedDamage?: Array<{ target: CardTarget; damage: number }>;
      options?: { blockedFrom?: CardTarget[]; blockedTo?: CardTarget[]; min?: number; max?: number };
    };
    return {
      maxAllowedDamage: value?.maxAllowedDamage || [],
      blockedFrom: value?.options?.blockedFrom || [],
      blockedTo: value?.options?.blockedTo || [],
      min: Number(value?.options?.min ?? 0),
      max: typeof value?.options?.max === 'number' ? value.options.max : undefined
    };
  }, [prompt]);
  const putDamageData = useMemo(() => {
    const value = prompt as PromptLike & {
      damage?: number;
      maxAllowedDamage?: Array<{ target: CardTarget; damage: number }>;
      options?: { blocked?: CardTarget[] };
    };
    return {
      damage: Number(value?.damage ?? 0),
      maxAllowedDamage: value?.maxAllowedDamage || [],
      blocked: value?.options?.blocked || []
    };
  }, [prompt]);

  if (!prompt) {
    return null;
  }

  const promptCardList = Array.isArray(prompt.cards) ? [] : prompt.cards?.cards || [];
  const pokemonChoices = buildPokemonChoices(prompt, state);
  const pokemonChoiceMap = new Map(pokemonChoices.map(choice => [targetKey(choice.target), choice]));

  const currentMoveDamageMap = useMemo(() => {
    const map = new Map<string, number>();
    moveDamageData.maxAllowedDamage.forEach(entry => {
      map.set(targetKey(entry.target), entry.damage);
    });
    moveDamageRows.forEach(entry => {
      map.set(targetKey(entry.from), Math.max(0, (map.get(targetKey(entry.from)) ?? 0) - 10));
      map.set(targetKey(entry.to), (map.get(targetKey(entry.to)) ?? 0) + 10);
    });
    return map;
  }, [moveDamageData.maxAllowedDamage, moveDamageRows]);

  const currentMoveEnergyCards = useMemo(() => {
    const map = new Map<string, EnergyCard[]>();
    pokemonChoices.forEach(choice => {
      const energies = resolveTargetSlot(state, prompt, choice.target)?.energies.cards || [];
      map.set(targetKey(choice.target), [...energies]);
    });
    moveEnergyRows.forEach(row => {
      const fromKey = targetKey(row.from);
      const toKey = targetKey(row.to);
      const fromCards = map.get(fromKey) || [];
      const [card] = fromCards.splice(row.cardIndex, 1);
      map.set(fromKey, fromCards);
      if (card) {
        map.set(toKey, [...(map.get(toKey) || []), card]);
      }
    });
    return map;
  }, [moveEnergyRows, pokemonChoices, prompt, state]);

  const validateChooseCardsResult = (indices: number[]) => {
    const min = Number((prompt.options as { min?: number } | undefined)?.min ?? 0);
    const max = Number((prompt.options as { max?: number } | undefined)?.max ?? promptCardList.length);
    const inRange = indices.length >= min && indices.length <= max;

    if (!inRange) {
      setIsChooseCardsInvalid(true);
      return;
    }

    if (typeof prompt.validate === 'function') {
      const selectedCards = indices
        .map(index => promptCardList[index])
        .filter(Boolean);
      setIsChooseCardsInvalid(!prompt.validate(selectedCards));
      return;
    }

    setIsChooseCardsInvalid(false);
  };

  const resolveInvitePlayer = async () => {
    if (!selectedDeckId) {
      return;
    }
    const deck = await apiClient.get<DeckResponse>(`/v1/decks/get/${selectedDeckId}`);
    await onResolve(deck.deck.cards);
  };

  const togglePrizeSelection = (index: number) => {
    const count = Number((prompt.options as { count?: number } | undefined)?.count ?? 1);
    setSelectedPrizeIndices(previous => {
      const exists = previous.includes(index);
      if (exists) {
        return previous.filter(value => value !== index);
      }
      if (count === 1) {
        return [index];
      }
      if (previous.length >= count) {
        return previous;
      }
      return [...previous, index];
    });
  };

  const togglePokemonSelection = (target: CardTarget) => {
    const min = Number((prompt.options as { min?: number } | undefined)?.min ?? 1);
    const max = Number((prompt.options as { max?: number } | undefined)?.max ?? 1);
    const blocked = ((prompt.options as { blocked?: CardTarget[] } | undefined)?.blocked) || [];
    const isBlocked = blocked.some(entry => entry.player === target.player && entry.slot === target.slot && entry.index === target.index);
    if (isBlocked) {
      return;
    }

    setSelectedPokemonTargets(previous => {
      const exists = previous.some(entry => entry.player === target.player && entry.slot === target.slot && entry.index === target.index);
      if (exists) {
        return previous.filter(entry => !(entry.player === target.player && entry.slot === target.slot && entry.index === target.index));
      }
      if (max === 1) {
        return [target];
      }
      if (previous.length >= max) {
        return previous;
      }
      return [...previous, target];
    });

    if (min === 0 && max === 0) {
      setSelectedPokemonTargets([]);
    }
  };

  const renderBody = () => {
    switch (prompt.type) {
      case 'Alert':
        return (
          <div className="app-inline-actions">
            <Button disabled={loading} onClick={() => void onResolve(true)}>OK</Button>
          </div>
        );
      case 'Confirm':
        return (
          <div className="app-inline-actions">
            <Button disabled={loading} onClick={() => void onResolve(true)}>Yes</Button>
            <Button disabled={loading} variant="outline" onClick={() => void onResolve(false)}>No</Button>
          </div>
        );
      case 'Select':
        return (
          <div className="grid gap-3">
            <div className="app-form-field">
              <Label htmlFor="prompt-select">Option</Label>
              <select
                id="prompt-select"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedIndex}
                onChange={e => setSelectedIndex(Number(e.target.value))}
              >
                {(prompt.values || []).map((value, index) => (
                  <option key={`${value}-${index}`} value={index}>{value}</option>
                ))}
              </select>
            </div>
            <Button disabled={loading} onClick={() => void onResolve(selectedIndex)}>Confirm</Button>
          </div>
        );
      case 'Invite player':
        return (
          <div className="grid gap-3">
            <div className="app-form-field">
              <Label htmlFor="prompt-invite-deck">Deck</Label>
              <select
                id="prompt-invite-deck"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedDeckId ?? ''}
                onChange={e => setSelectedDeckId(Number(e.target.value))}
              >
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
            </div>
            <Button disabled={loading || !selectedDeckId} onClick={() => void resolveInvitePlayer()}>
              Confirm Deck
            </Button>
          </div>
        );
      case 'Show cards':
        return (
          <div className="grid gap-3">
            <div className="grid gap-2">
              {promptCardsArray.map((card, index) => (
                <div key={`${card.name}-${index}`} className="rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  {card.name}
                </div>
              ))}
            </div>
            <div className="app-inline-actions">
              <Button disabled={loading} onClick={() => void onResolve(true)}>Confirm</Button>
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
            </div>
          </div>
        );
      case 'Choose attack':
        return (
          <div className="grid gap-3">
            <div className="app-form-field">
              <Label htmlFor="prompt-choose-attack-card">Pokemon</Label>
              <select
                id="prompt-choose-attack-card"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={attackCardIndex}
                onChange={e => setAttackCardIndex(Number(e.target.value))}
              >
              {promptCardsArray.map((card, index) => (
                <option key={`${card.name}-${index}`} value={index}>{card.name}</option>
              ))}
              </select>
            </div>
            <div className="app-form-field">
              <Label htmlFor="prompt-choose-attack-name">Attack / Ability</Label>
              <select
                id="prompt-choose-attack-name"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={attackName}
                onChange={e => setAttackName(e.target.value)}
              >
                {attackOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <Button
              disabled={loading || attackName.length === 0}
              onClick={() => void onResolve({ index: attackCardIndex, name: attackName })}
            >
              Confirm Action
            </Button>
          </div>
        );
      case 'Order cards':
        return (
          <div className="grid gap-3">
            <div className="grid gap-2">
              {orderedIndices.map((cardIndex, position) => {
                const card = promptCardList[cardIndex];
                return (
                  <div key={`${card?.fullName || card?.name || cardIndex}-${position}`} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                    <span>{position + 1}. {card?.name || card?.fullName || `Card ${cardIndex + 1}`}</span>
                    <div className="app-inline-actions">
                      <Button size="sm" variant="outline" disabled={position === 0} onClick={() => setOrderedIndices(current => moveIndex(current, position, position - 1))}>Up</Button>
                      <Button size="sm" variant="outline" disabled={position === orderedIndices.length - 1} onClick={() => setOrderedIndices(current => moveIndex(current, position, position + 1))}>Down</Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button disabled={loading || orderedIndices.length === 0} onClick={() => void onResolve(orderedIndices)}>
                Confirm Order
              </Button>
            </div>
          </div>
        );
      case 'Choose prize': {
        const expectedCount = Number((prompt.options as { count?: number } | undefined)?.count ?? 1);
        const isInvalid = selectedPrizeIndices.length !== expectedCount;
        return (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">Select {expectedCount} prize card(s).</p>
            <div className="grid gap-2">
              {prizeChoices.map(choice => (
                <button
                  key={choice.index}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-left text-sm ${selectedPrizeIndices.includes(choice.index) ? 'border-primary bg-primary/10' : 'border-border bg-background/70'}`}
                  onClick={() => togglePrizeSelection(choice.index)}
                >
                  <div className="font-semibold">{choice.label}</div>
                  <div className="text-xs text-muted-foreground">{choice.cards.join(', ') || 'Hidden prize'}</div>
                </button>
              ))}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button disabled={loading || isInvalid} onClick={() => void onResolve(selectedPrizeIndices)}>
                Confirm Prize
              </Button>
            </div>
            {isInvalid && <p className="text-sm text-destructive">Prize selection count is invalid.</p>}
          </div>
        );
      }
      case 'Choose pokemon': {
        const min = Number((prompt.options as { min?: number } | undefined)?.min ?? 1);
        const max = Number((prompt.options as { max?: number } | undefined)?.max ?? 1);
        const blocked = ((prompt.options as { blocked?: CardTarget[] } | undefined)?.blocked) || [];
        const isInvalid = selectedPokemonTargets.length < min || selectedPokemonTargets.length > max;
        return (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">Select {min === max ? max : `${min}-${max}`} Pokemon target(s).</p>
            <div className="grid gap-2">
              {pokemonChoices.map(choice => {
                const isSelected = selectedPokemonTargets.some(target =>
                  target.player === choice.target.player && target.slot === choice.target.slot && target.index === choice.target.index
                );
                const isBlocked = blocked.some(target =>
                  target.player === choice.target.player && target.slot === choice.target.slot && target.index === choice.target.index
                );
                return (
                  <button
                    key={`${choice.target.player}-${choice.target.slot}-${choice.target.index}`}
                    type="button"
                    disabled={isBlocked}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background/70'} ${isBlocked ? 'opacity-50' : ''}`}
                    onClick={() => togglePokemonSelection(choice.target)}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button disabled={loading || isInvalid || pokemonChoices.length === 0} onClick={() => void onResolve(selectedPokemonTargets)}>
                Confirm Targets
              </Button>
            </div>
            {isInvalid && <p className="text-sm text-destructive">Pokemon selection count is invalid.</p>}
          </div>
        );
      }
      case 'Choose energy': {
        const isInvalid = typeof prompt.validate === 'function'
          ? !(prompt.validate as (result: unknown) => boolean)(selectedEnergyIndices.map(index => energyPromptData.energy[index]))
          : selectedEnergyIndices.length === 0;
        return (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">Cost: {energyPromptData.cost.join(', ') || 'Any exact match'}</p>
            <div className="grid gap-2">
              {energyPromptData.energy.map((entry, index) => (
                <label key={`${entry.card.name}-${index}`} className="flex items-center gap-3 rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedEnergyIndices.includes(index)}
                    onChange={event => {
                      setSelectedEnergyIndices(previous => event.target.checked
                        ? [...previous, index]
                        : previous.filter(value => value !== index));
                    }}
                  />
                  <span>{entry.card.name}</span>
                  <span className="text-xs text-muted-foreground">{entry.provides.join(', ')}</span>
                </label>
              ))}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button disabled={loading || isInvalid} onClick={() => void onResolve(selectedEnergyIndices)}>
                Confirm Energy
              </Button>
            </div>
            {isInvalid && <p className="text-sm text-destructive">Selected energy does not satisfy the prompt cost.</p>}
          </div>
        );
      }
      case 'Attach energy': {
        const targetChoices = pokemonChoices.filter(choice =>
          !attachPromptData.blockedTo.some(target => targetKey(target) === targetKey(choice.target))
        );
        const isInvalid = attachRows.length < attachPromptData.min || attachRows.length > attachPromptData.max;
        return (
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={attachCardIndex} onChange={event => setAttachCardIndex(Number(event.target.value))}>
                {attachPromptData.cards.map((card, index) => (
                  <option key={`${card.name}-${index}`} value={index} disabled={attachPromptData.blocked.includes(index)}>
                    {card.name}{attachPromptData.blocked.includes(index) ? ' (blocked)' : ''}
                  </option>
                ))}
              </select>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={attachTargetKey} onChange={event => setAttachTargetKey(event.target.value)}>
                <option value="">Choose target</option>
                {targetChoices.map(choice => (
                  <option key={targetKey(choice.target)} value={targetKey(choice.target)}>{choice.label}</option>
                ))}
              </select>
              <Button
                disabled={!attachTargetKey || attachPromptData.blocked.includes(attachCardIndex)}
                onClick={() => {
                  const target = pokemonChoiceMap.get(attachTargetKey)?.target;
                  if (!target) {
                    return;
                  }
                  setAttachRows(previous => {
                    if (attachPromptData.sameTarget && previous.length > 0 && targetKey(previous[0].to) !== targetKey(target)) {
                      return previous;
                    }
                    if (attachPromptData.differentTargets && previous.some(row => targetKey(row.to) === targetKey(target))) {
                      return previous;
                    }
                    return [...previous, { cardIndex: attachCardIndex, to: target }];
                  });
                }}
              >
                Add
              </Button>
            </div>
            <div className="grid gap-2">
              {attachRows.map((row, index) => (
                <div key={`${row.cardIndex}-${targetKey(row.to)}-${index}`} className="flex items-center justify-between rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  <span>{attachPromptData.cards[row.cardIndex]?.name}{' -> '}{pokemonChoiceMap.get(targetKey(row.to))?.label}</span>
                  <Button size="sm" variant="outline" onClick={() => setAttachRows(previous => previous.filter((_, current) => current !== index))}>Remove</Button>
                </div>
              ))}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button disabled={loading || isInvalid} onClick={() => void onResolve(attachRows)}>
                Confirm Attachments
              </Button>
            </div>
            {isInvalid && <p className="text-sm text-destructive">Attachment count is outside prompt limits.</p>}
          </div>
        );
      }
      case 'Move energy': {
        const sourceChoices = pokemonChoices.filter(choice =>
          !moveEnergyData.blockedFrom.some(target => targetKey(target) === targetKey(choice.target))
        );
        const sourceCards = moveEnergySourceKey ? (currentMoveEnergyCards.get(moveEnergySourceKey) || []) : [];
        const blockedCardIndices = moveEnergyData.blockedMap.find(entry => moveEnergySourceKey && targetKey(entry.source) === moveEnergySourceKey)?.blocked || [];
        const isInvalid = moveEnergyRows.length < moveEnergyData.min || (moveEnergyData.max !== undefined && moveEnergyRows.length > moveEnergyData.max);
        return (
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={moveEnergySourceKey} onChange={event => setMoveEnergySourceKey(event.target.value)}>
                <option value="">Choose source</option>
                {sourceChoices.map(choice => <option key={targetKey(choice.target)} value={targetKey(choice.target)}>{choice.label}</option>)}
              </select>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={moveEnergyCardIndex} onChange={event => setMoveEnergyCardIndex(Number(event.target.value))}>
                {sourceCards.map((card, index) => (
                  <option key={`${card.name}-${index}`} value={index} disabled={blockedCardIndices.includes(index)}>
                    {card.name}{blockedCardIndices.includes(index) ? ' (blocked)' : ''}
                  </option>
                ))}
              </select>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={moveEnergyTargetKey} onChange={event => setMoveEnergyTargetKey(event.target.value)}>
                <option value="">Choose target</option>
                {pokemonChoices.filter(choice => !moveEnergyData.blockedTo.some(target => targetKey(target) === targetKey(choice.target))).map(choice => (
                  <option key={targetKey(choice.target)} value={targetKey(choice.target)}>{choice.label}</option>
                ))}
              </select>
              <Button
                disabled={!moveEnergySourceKey || !moveEnergyTargetKey || moveEnergySourceKey === moveEnergyTargetKey}
                onClick={() => {
                  const from = pokemonChoiceMap.get(moveEnergySourceKey)?.target;
                  const to = pokemonChoiceMap.get(moveEnergyTargetKey)?.target;
                  if (!from || !to) {
                    return;
                  }
                  setMoveEnergyRows(previous => [...previous, { from, to, cardIndex: moveEnergyCardIndex }]);
                }}
              >
                Add
              </Button>
            </div>
            <div className="grid gap-2">
              {moveEnergyRows.map((row, index) => (
                <div key={`${targetKey(row.from)}-${targetKey(row.to)}-${row.cardIndex}-${index}`} className="flex items-center justify-between rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  <span>{pokemonChoiceMap.get(targetKey(row.from))?.label}{' -> '}{pokemonChoiceMap.get(targetKey(row.to))?.label}</span>
                  <Button size="sm" variant="outline" onClick={() => setMoveEnergyRows(previous => previous.filter((_, current) => current !== index))}>Remove</Button>
                </div>
              ))}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button disabled={loading || isInvalid} onClick={() => void onResolve(moveEnergyRows)}>
                Confirm Moves
              </Button>
            </div>
            {isInvalid && <p className="text-sm text-destructive">Energy move count is outside prompt limits.</p>}
          </div>
        );
      }
      case 'Move damage': {
        const sourceChoices = pokemonChoices.filter(choice =>
          !moveDamageData.blockedFrom.some(target => targetKey(target) === targetKey(choice.target)) && (currentMoveDamageMap.get(targetKey(choice.target)) ?? 0) > 0
        );
        const isInvalid = moveDamageRows.length < moveDamageData.min || (moveDamageData.max !== undefined && moveDamageRows.length > moveDamageData.max);
        return (
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={moveDamageSourceKey} onChange={event => setMoveDamageSourceKey(event.target.value)}>
                <option value="">Choose source</option>
                {sourceChoices.map(choice => <option key={targetKey(choice.target)} value={targetKey(choice.target)}>{choice.label}</option>)}
              </select>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={moveDamageTargetKey} onChange={event => setMoveDamageTargetKey(event.target.value)}>
                <option value="">Choose target</option>
                {pokemonChoices.filter(choice => !moveDamageData.blockedTo.some(target => targetKey(target) === targetKey(choice.target))).map(choice => (
                  <option key={targetKey(choice.target)} value={targetKey(choice.target)}>{choice.label}</option>
                ))}
              </select>
              <Button
                disabled={!moveDamageSourceKey || !moveDamageTargetKey || moveDamageSourceKey === moveDamageTargetKey}
                onClick={() => {
                  const from = pokemonChoiceMap.get(moveDamageSourceKey)?.target;
                  const to = pokemonChoiceMap.get(moveDamageTargetKey)?.target;
                  if (!from || !to) {
                    return;
                  }
                  setMoveDamageRows(previous => [...previous, { from, to }]);
                }}
              >
                Move 10
              </Button>
            </div>
            <div className="grid gap-2">
              {moveDamageRows.map((row, index) => (
                <div key={`${targetKey(row.from)}-${targetKey(row.to)}-${index}`} className="flex items-center justify-between rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  <span>{pokemonChoiceMap.get(targetKey(row.from))?.label}{' -> '}{pokemonChoiceMap.get(targetKey(row.to))?.label} · 10 damage</span>
                  <Button size="sm" variant="outline" onClick={() => setMoveDamageRows(previous => previous.filter((_, current) => current !== index))}>Remove</Button>
                </div>
              ))}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button disabled={loading || isInvalid} onClick={() => void onResolve(moveDamageRows)}>
                Confirm Damage Moves
              </Button>
            </div>
            {isInvalid && <p className="text-sm text-destructive">Damage movement count is outside prompt limits.</p>}
          </div>
        );
      }
      case 'Put damage': {
        const allocatedDamage = Object.values(putDamageMap).reduce((sum, value) => sum + value, 0);
        const remainingDamage = putDamageData.damage - allocatedDamage;
        const blockedKeys = new Set(putDamageData.blocked.map(target => targetKey(target)));
        const isInvalid = remainingDamage !== 0;
        return (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">Remaining damage to assign: {remainingDamage}</p>
            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={putDamageTargetKey} onChange={event => setPutDamageTargetKey(event.target.value)}>
                <option value="">Choose target</option>
                {pokemonChoices.filter(choice => !blockedKeys.has(targetKey(choice.target))).map(choice => (
                  <option key={targetKey(choice.target)} value={targetKey(choice.target)}>{choice.label}</option>
                ))}
              </select>
              <Button disabled={!putDamageTargetKey || remainingDamage < 10} onClick={() => setPutDamageMap(previous => ({ ...previous, [putDamageTargetKey]: (previous[putDamageTargetKey] || 0) + 10 }))}>Add 10</Button>
              <Button variant="outline" disabled={!putDamageTargetKey || (putDamageMap[putDamageTargetKey] || 0) <= 0} onClick={() => setPutDamageMap(previous => ({ ...previous, [putDamageTargetKey]: Math.max(0, (previous[putDamageTargetKey] || 0) - 10) }))}>Remove 10</Button>
            </div>
            <div className="grid gap-2">
              {Object.entries(putDamageMap).filter(([, damage]) => damage > 0).map(([key, damage]) => (
                <div key={key} className="rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  {pokemonChoiceMap.get(key)?.label} · {damage} damage
                </div>
              ))}
            </div>
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>Cancel</Button>
              )}
              <Button
                disabled={loading || isInvalid}
                onClick={() => void onResolve(
                  Object.entries(putDamageMap)
                    .filter(([, damage]) => damage > 0)
                    .map(([key, damage]) => ({ target: pokemonChoiceMap.get(key)!.target, damage }))
                )}
              >
                Confirm Damage Placement
              </Button>
            </div>
            {isInvalid && <p className="text-sm text-destructive">All prompt damage must be allocated before confirming.</p>}
          </div>
        );
      }
      case 'Choose cards':
        return (
          <div className="grid gap-3">
            <PromptChooseCardsDnd
              prompt={{
                cards: Array.isArray(prompt.cards) ? { cards: [] } : prompt.cards,
                options: {
                  blocked: ((prompt.options as { blocked?: number[] } | undefined)?.blocked) || [],
                  isSecret: Boolean((prompt.options as { isSecret?: boolean } | undefined)?.isSecret)
                }
              }}
              disabled={loading}
              onChange={result => {
                setChooseCardsResult(result);
                validateChooseCardsResult(result);
              }}
            />
            <div className="app-inline-actions">
              {Boolean((prompt.options as { allowCancel?: boolean } | undefined)?.allowCancel) && (
                <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>
                  Cancel
                </Button>
              )}
              <Button
                disabled={loading || isChooseCardsInvalid}
                onClick={() => void onResolve(chooseCardsResult)}
              >
                Confirm
              </Button>
            </div>
            {isChooseCardsInvalid && (
              <p className="text-sm text-destructive">Selection does not satisfy prompt constraints.</p>
            )}
          </div>
        );
      default:
        return (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              Unsupported prompt type. Use manual JSON result as temporary fallback.
            </p>
            <Textarea
              placeholder='Example: [0] or {"index":0,"name":"..."} or null'
              value={manualJson}
              onChange={e => setManualJson(e.target.value)}
            />
            <div className="app-inline-actions">
              <Button
                disabled={loading}
                onClick={() => {
                  try {
                    const parsed = manualJson.trim() ? JSON.parse(manualJson) : null;
                    void onResolve(parsed);
                  } catch {
                    showToast('error', 'Invalid JSON');
                  }
                }}
              >
                Submit Manual Result
              </Button>
              <Button disabled={loading} variant="outline" onClick={() => void onResolve(null)}>
                Cancel
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt: {prompt.type}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-muted-foreground">{String(prompt.message || '')}</p>
        {renderBody()}
      </CardContent>
    </Card>
  );
}
