import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScenarioPage } from '@/pages/scenario-page';
import { apiClient } from '@/lib/api-client';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue || _key
  })
}));

describe('ScenarioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies a zone patch from the editor and reloads scenario state', async () => {
    vi.spyOn(apiClient, 'post')
      .mockResolvedValueOnce({
        scenarioId: 77,
        player1Id: 10,
        player2Id: 11,
        state: {
          phase: 1,
          turn: 2,
          activePlayer: 0,
          winner: 0,
          prompts: [],
          players: [
            {
              side: 'PLAYER_1',
              name: 'Alice',
              id: 10,
              zones: {
                deck: [],
                hand: [{ name: 'Pikachu', fullName: 'SV1 Pikachu' }],
                discard: [],
                lostzone: [],
                stadium: [],
                supporter: [],
                prizes: [[], [], [], [], [], []]
              },
              active: { damage: 0, specialConditions: [], pokemons: [], energies: [], trainers: [] },
              bench: []
            },
            {
              side: 'PLAYER_2',
              name: 'Bob',
              id: 11,
              zones: { deck: [], hand: [], discard: [], lostzone: [], stadium: [], supporter: [], prizes: [[], [], [], [], [], []] },
              active: { damage: 0, specialConditions: [], pokemons: [], energies: [], trainers: [] },
              bench: []
            }
          ]
        }
      } as never)
      .mockResolvedValueOnce({
        ok: true
      } as never);

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      scenarioId: 77,
      state: {
        phase: 1,
        turn: 2,
        activePlayer: 0,
        winner: 0,
        prompts: [],
        players: [
          {
            side: 'PLAYER_1',
            name: 'Alice',
            id: 10,
            zones: {
              deck: [],
              hand: [{ name: 'Raichu', fullName: 'SV1 Raichu' }],
              discard: [],
              lostzone: [],
              stadium: [],
              supporter: [],
              prizes: [[], [], [], [], [], []]
            },
            active: { damage: 0, specialConditions: [], pokemons: [], energies: [], trainers: [] },
            bench: []
          },
          {
            side: 'PLAYER_2',
            name: 'Bob',
            id: 11,
            zones: { deck: [], hand: [], discard: [], lostzone: [], stadium: [], supporter: [], prizes: [[], [], [], [], [], []] },
            active: { damage: 0, specialConditions: [], pokemons: [], energies: [], trainers: [] },
            bench: []
          }
        ]
      }
    } as never);

    render(
      <MemoryRouter>
        <ScenarioPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create scenario' }));

    await waitFor(() => expect(screen.getByDisplayValue('77')).toBeTruthy());

    fireEvent.click(screen.getAllByRole('button', { name: 'Load Current' })[0]);
    await waitFor(() => expect(screen.getByDisplayValue('SV1 Pikachu')).toBeTruthy());

    fireEvent.change(screen.getByDisplayValue('SV1 Pikachu'), { target: { value: 'SV1 Raichu' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Zone Patch' }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/v1/testing/scenario/77/patch', {
        operations: [
          {
            op: 'setZoneCards',
            target: {
              player: 'PLAYER_1',
              zone: 'hand',
              slotIndex: undefined
            },
            cards: ['SV1 Raichu']
          }
        ]
      });
    });

    expect(apiClient.get).toHaveBeenCalledWith('/v1/testing/scenario/77/state');
  });

  it('applies a slot patch with pokemon, energy, trainer, damage, and conditions', async () => {
    vi.spyOn(apiClient, 'post')
      .mockResolvedValueOnce({
        scenarioId: 88,
        player1Id: 10,
        player2Id: 11,
        state: {
          phase: 1,
          turn: 2,
          activePlayer: 0,
          winner: 0,
          prompts: [],
          players: [
            {
              side: 'PLAYER_1',
              name: 'Alice',
              id: 10,
              zones: { deck: [], hand: [], discard: [], lostzone: [], stadium: [], supporter: [], prizes: [[], [], [], [], [], []] },
              active: { damage: 30, specialConditions: ['POISONED'], pokemons: [{ name: 'Pikachu', fullName: 'SV1 Pikachu' }], energies: [{ name: 'Lightning Energy', fullName: 'Basic Lightning Energy' }], trainers: [] },
              bench: []
            },
            {
              side: 'PLAYER_2',
              name: 'Bob',
              id: 11,
              zones: { deck: [], hand: [], discard: [], lostzone: [], stadium: [], supporter: [], prizes: [[], [], [], [], [], []] },
              active: { damage: 0, specialConditions: [], pokemons: [], energies: [], trainers: [] },
              bench: []
            }
          ]
        }
      } as never)
      .mockResolvedValueOnce({
        ok: true
      } as never);

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      scenarioId: 88,
      state: {
        phase: 1,
        turn: 2,
        activePlayer: 0,
        winner: 0,
        prompts: [],
        players: [
          {
            side: 'PLAYER_1',
            name: 'Alice',
            id: 10,
            zones: { deck: [], hand: [], discard: [], lostzone: [], stadium: [], supporter: [], prizes: [[], [], [], [], [], []] },
            active: { damage: 50, specialConditions: ['POISONED', 'BURNED'], pokemons: [{ name: 'Raichu', fullName: 'SV1 Raichu' }], energies: [{ name: 'Lightning Energy', fullName: 'Basic Lightning Energy' }], trainers: [{ name: 'Choice Belt', fullName: 'Choice Belt' }] },
            bench: []
          },
          {
            side: 'PLAYER_2',
            name: 'Bob',
            id: 11,
            zones: { deck: [], hand: [], discard: [], lostzone: [], stadium: [], supporter: [], prizes: [[], [], [], [], [], []] },
            active: { damage: 0, specialConditions: [], pokemons: [], energies: [], trainers: [] },
            bench: []
          }
        ]
      }
    } as never);

    const view = render(
      <MemoryRouter>
        <ScenarioPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create scenario' }));
    await waitFor(() => expect(screen.getByDisplayValue('88')).toBeTruthy());

    fireEvent.click(screen.getAllByRole('button', { name: 'Load Current' })[1]);

    await waitFor(() => expect(screen.getByDisplayValue('SV1 Pikachu')).toBeTruthy());
    const textareas = view.container.querySelectorAll('textarea');
    fireEvent.change(textareas[1], { target: { value: 'SV1 Raichu' } });
    fireEvent.change(textareas[2], { target: { value: 'Basic Lightning Energy' } });
    fireEvent.change(textareas[3], { target: { value: 'Choice Belt' } });
    fireEvent.change(screen.getByPlaceholderText('POISONED, ASLEEP'), { target: { value: 'POISONED, BURNED' } });
    fireEvent.change(screen.getByDisplayValue('30'), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: 'Apply Slot Patch' }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/v1/testing/scenario/88/patch', {
        operations: [
          {
            op: 'setZoneCards',
            target: { player: 'PLAYER_1', zone: 'active.pokemons', slotIndex: undefined },
            cards: ['SV1 Raichu']
          },
          {
            op: 'setZoneCards',
            target: { player: 'PLAYER_1', zone: 'active.energies', slotIndex: undefined },
            cards: ['Basic Lightning Energy']
          },
          {
            op: 'setZoneCards',
            target: { player: 'PLAYER_1', zone: 'active.trainers', slotIndex: undefined },
            cards: ['Choice Belt']
          },
          {
            op: 'setDamage',
            target: { player: 'PLAYER_1', slot: 'ACTIVE', index: undefined },
            damage: 50
          },
          {
            op: 'setSpecialCondition',
            target: { player: 'PLAYER_1', slot: 'ACTIVE', index: undefined },
            conditions: ['POISONED', 'BURNED']
          }
        ]
      });
    });
  });
});
