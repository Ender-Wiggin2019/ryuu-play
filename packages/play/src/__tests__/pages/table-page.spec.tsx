import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TablePage } from '@/pages/table-page';
import { decodeStateData } from '@/lib/ptcg-runtime';

let searchParamsValue = '';
const navigateMock = vi.fn();
const connectMock = vi.fn();
const disconnectMock = vi.fn();
const onMock = vi.fn();
const offMock = vi.fn();
const emitMock = vi.fn();
const replayDeserializeMock = vi.fn();
const replayGetStateMock = vi.fn();
const replayGetStateCountMock = vi.fn(() => 2);
const replayGetTurnCountMock = vi.fn(() => 1);
const replayGetTurnPositionMock = vi.fn(() => 0);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ gameId: '88' }),
    useSearchParams: () => [new URLSearchParams(searchParamsValue)]
  };
});

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    apiUrl: 'http://localhost:3000',
    token: 'token'
  })
}));

vi.mock('@/lib/ptcg-runtime', () => ({
  decodeStateData: vi.fn().mockResolvedValue({
    phase: 'PLAYER_TURN',
    turn: 3,
    activePlayer: 0,
    rules: { formatName: 'Standard' },
    logs: [],
    prompts: [{ id: 5, playerId: 10, type: 'Choose cards' }],
    players: [
      {
        id: 10,
        name: 'Alice',
        hand: { cards: [] },
        deck: { cards: [] },
        prizes: [],
        discard: { cards: [] },
        active: { pokemonCard: { name: 'Pikachu' } },
        bench: []
      },
      {
        id: 11,
        name: 'Bob',
        hand: { cards: [] },
        deck: { cards: [] },
        prizes: [],
        discard: { cards: [] },
        active: { pokemonCard: { name: 'Charmander' } },
        bench: []
      }
    ]
  })
}));

vi.mock('@/lib/socket-client', () => ({
  SocketClient: vi.fn().mockImplementation(() => ({
    connect: connectMock,
    disconnect: disconnectMock,
    on: onMock,
    off: offMock,
    emit: emitMock
  }))
}));

vi.mock('@/lib/recent-games', () => ({
  rememberRecentGame: vi.fn(),
  forgetRecentGame: vi.fn()
}));

vi.mock('@/lib/toast', () => ({
  showToast: vi.fn()
}));

vi.mock('@/components/table/board-dnd-panel', () => ({
  BoardDndPanel: () => <div>Board Panel</div>
}));

vi.mock('@/components/table/hand-dnd-panel', () => ({
  HandDndPanel: () => <div>Hand Panel</div>
}));

vi.mock('@/components/table/prompt-host', () => ({
  PromptHost: ({ prompt, onResolve }: { prompt?: { id: number }; onResolve: (result: unknown) => Promise<void> }) => (
    prompt ? <button type="button" onClick={() => void onResolve(['picked-card'])}>Resolve Prompt</button> : null
  )
}));

vi.mock('../../../../common/src/game/replay', () => ({
  Replay: vi.fn().mockImplementation(() => ({
    deserialize: replayDeserializeMock,
    getState: replayGetStateMock,
    getStateCount: replayGetStateCountMock,
    getTurnCount: replayGetTurnCountMock,
    getTurnPosition: replayGetTurnPositionMock
  }))
}));

vi.mock('../../../../common/src/utils/base64', () => ({
  Base64: vi.fn().mockImplementation(() => ({
    decode: vi.fn().mockReturnValue('decoded-replay')
  }))
}));

describe('TablePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsValue = '';
    emitMock.mockImplementation(async (event: string) => {
      if (event === 'core:getInfo') {
        return { clientId: 10 };
      }
      if (event === 'game:join') {
        return {
          gameId: 88,
          stateData: 'encoded-state',
          clientIds: [10, 11],
          recordingEnabled: true,
          timeLimit: 25,
          playerStats: []
        };
      }
      return {};
    });
  });

  it('connects to the table socket and resolves the active prompt', async () => {
    render(
      <MemoryRouter>
        <TablePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Table #88')).toBeTruthy());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Resolve Prompt' })).toBeTruthy());

    expect(connectMock).toHaveBeenCalledWith('http://localhost:3000', 'token');
    expect(emitMock).toHaveBeenCalledWith('core:getInfo');
    expect(emitMock).toHaveBeenCalledWith('game:join', 88);
    expect(onMock).toHaveBeenCalledWith('game[88]:stateChange', expect.any(Function));

    fireEvent.click(screen.getByRole('button', { name: 'Resolve Prompt' }));

    await waitFor(() => {
      expect(emitMock).toHaveBeenCalledWith('game:action:resolvePrompt', {
        gameId: 88,
        id: 5,
        result: ['picked-card']
      });
    });
  });

  it('applies socket stateChange events and refreshes rendered state', async () => {
    let stateChangeHandler: ((event: { stateData: string; playerStats: unknown[] }) => void) | undefined;
    onMock.mockImplementation((event: string, handler: (data: { stateData: string; playerStats: unknown[] }) => void) => {
      if (event === 'game[88]:stateChange') {
        stateChangeHandler = handler;
      }
    });

    vi.mocked(decodeStateData)
      .mockResolvedValueOnce({
        phase: 'PLAYER_TURN',
        turn: 3,
        activePlayer: 0,
        rules: { formatName: 'Standard' },
        logs: [{ id: 1, client: 0, message: 'Initial', params: {} }],
        prompts: [],
        players: [
          {
            id: 10,
            name: 'Alice',
            hand: { cards: [] },
            deck: { cards: [{}, {}] },
            prizes: [],
            discard: { cards: [] },
            active: { pokemonCard: { name: 'Pikachu' } },
            bench: []
          },
          {
            id: 11,
            name: 'Bob',
            hand: { cards: [] },
            deck: { cards: [{}] },
            prizes: [],
            discard: { cards: [] },
            active: { pokemonCard: { name: 'Charmander' } },
            bench: []
          }
        ]
      } as never)
      .mockResolvedValueOnce({
        phase: 'ATTACK',
        turn: 4,
        activePlayer: 1,
        rules: { formatName: 'Standard' },
        logs: [{ id: 2, client: 0, message: 'Updated', params: {} }],
        prompts: [],
        players: [
          {
            id: 10,
            name: 'Alice',
            hand: { cards: [{}, {}] },
            deck: { cards: [{}, {}, {}] },
            prizes: [],
            discard: { cards: [] },
            active: { pokemonCard: { name: 'Raichu' } },
            bench: []
          },
          {
            id: 11,
            name: 'Bob',
            hand: { cards: [{}] },
            deck: { cards: [{}] },
            prizes: [],
            discard: { cards: [] },
            active: { pokemonCard: { name: 'Charmeleon' } },
            bench: []
          }
        ]
      } as never);

    render(
      <MemoryRouter>
        <TablePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(stateChangeHandler).toBeTruthy());
    expect(screen.getByText('Turn')).toBeTruthy();

    stateChangeHandler?.({ stateData: 'updated-state', playerStats: [] });

    await waitFor(() => expect(screen.getByText('4')).toBeTruthy());
    expect(screen.getByText('Updated')).toBeTruthy();
  });

  it('loads replay mode from session storage and advances replay position', async () => {
    searchParamsValue = 'mode=replay';
    replayGetStateMock
      .mockReturnValueOnce({
        phase: 'PLAYER_TURN',
        turn: 1,
        activePlayer: 0,
        rules: { formatName: 'Standard' },
        logs: [{ id: 1, client: 0, message: 'Replay Start', params: {} }],
        prompts: [],
        players: [
          { id: 10, name: 'Alice', hand: { cards: [] }, deck: { cards: [] }, prizes: [], discard: { cards: [] }, active: { pokemonCard: { name: 'Pikachu' } }, bench: [] }
        ]
      })
      .mockReturnValueOnce({
        phase: 'ATTACK',
        turn: 2,
        activePlayer: 0,
        rules: { formatName: 'Standard' },
        logs: [{ id: 2, client: 0, message: 'Replay Next', params: {} }],
        prompts: [],
        players: [
          { id: 10, name: 'Alice', hand: { cards: [] }, deck: { cards: [] }, prizes: [], discard: { cards: [] }, active: { pokemonCard: { name: 'Raichu' } }, bench: [] }
        ]
      });

    vi.spyOn(window.sessionStorage.__proto__, 'getItem').mockReturnValue('encoded-replay');

    render(
      <MemoryRouter>
        <TablePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Replay')).toBeTruthy());
    expect(replayDeserializeMock).toHaveBeenCalledWith('decoded-replay');
    expect(screen.getByText('Replay Start')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(screen.getByText('Replay Next')).toBeTruthy());
    expect(screen.getByText('2')).toBeTruthy();
  });
});
