import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PromptHost } from '@/components/table/prompt-host';
import { apiClient } from '@/lib/api-client';

import { PlayerType, SlotType } from '../../../../../common/src/store/actions/play-card-action';

vi.mock('@/lib/toast', () => ({
  showToast: vi.fn()
}));

describe('PromptHost', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves attach energy with structured assignments', async () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);

    render(
      <PromptHost
        prompt={{
          id: 1,
          type: 'Attach energy',
          playerId: 10,
          message: 'Attach energy',
          playerType: PlayerType.BOTTOM_PLAYER,
          slots: [SlotType.ACTIVE, SlotType.BENCH],
          cardList: {
            cards: [{ name: 'Lightning Energy' }, { name: 'Fire Energy' }]
          },
          options: {
            min: 1,
            max: 2,
            blocked: [],
            blockedTo: [],
            sameTarget: false,
            differentTargets: false
          }
        } as never}
        state={{
          players: [
            {
              id: 10,
              active: { pokemons: { cards: [{ name: 'Pikachu' }] }, energies: { cards: [] }, trainers: { cards: [] } },
              bench: [{ pokemons: { cards: [{ name: 'Raichu' }] }, energies: { cards: [] }, trainers: { cards: [] } }]
            },
            {
              id: 11,
              active: { pokemons: { cards: [{ name: 'Charmander' }] }, energies: { cards: [] }, trainers: { cards: [] } },
              bench: []
            }
          ]
        } as never}
        onResolve={onResolve}
      />
    );

    fireEvent.change(screen.getByDisplayValue('Choose target'), { target: { value: '2:1:0' } });
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Confirm Attachments'));

    await waitFor(() => {
      expect(onResolve).toHaveBeenCalledWith([{ cardIndex: 0, to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 } }]);
    });
  });

  it('resolves put damage after assigning all required damage', async () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);

    render(
      <PromptHost
        prompt={{
          id: 2,
          type: 'Put damage',
          playerId: 10,
          message: 'Put damage',
          playerType: PlayerType.BOTTOM_PLAYER,
          slots: [SlotType.ACTIVE],
          damage: 20,
          maxAllowedDamage: [{ target: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }, damage: 200 }],
          options: { blocked: [] }
        } as never}
        state={{
          players: [
            {
              id: 10,
              active: { pokemons: { cards: [{ name: 'Pikachu' }] }, energies: { cards: [] }, trainers: { cards: [] } },
              bench: []
            },
            {
              id: 11,
              active: { pokemons: { cards: [{ name: 'Charmander' }] }, energies: { cards: [] }, trainers: { cards: [] } },
              bench: []
            }
          ]
        } as never}
        onResolve={onResolve}
      />
    );

    fireEvent.change(screen.getByDisplayValue('Choose target'), { target: { value: '2:1:0' } });
    fireEvent.click(screen.getByText('Add 10'));
    fireEvent.click(screen.getByText('Add 10'));
    fireEvent.click(screen.getByText('Confirm Damage Placement'));

    await waitFor(() => {
      expect(onResolve).toHaveBeenCalledWith([
        { target: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }, damage: 20 }
      ]);
    });
  });

  it('loads decks for invite player and resolves selected deck cards', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      decks: [{ id: 7, name: 'Electric Deck', isValid: true }]
    } as never).mockResolvedValueOnce({
      deck: { cards: ['a', 'b', 'c'] }
    } as never);
    const onResolve = vi.fn().mockResolvedValue(undefined);

    render(<PromptHost prompt={{ id: 3, type: 'Invite player' } as never} onResolve={onResolve} />);

    await waitFor(() => expect(screen.getByText('Electric Deck')).toBeTruthy());
    fireEvent.click(screen.getByText('Confirm Deck'));

    await waitFor(() => {
      expect(onResolve).toHaveBeenCalledWith(['a', 'b', 'c']);
    });
  });
});
