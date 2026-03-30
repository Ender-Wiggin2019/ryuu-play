import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestingPage } from '@/pages/testing-page';
import { apiClient } from '@/lib/api-client';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock('@/lib/toast', () => ({
  showToast: vi.fn()
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue || _key
  })
}));

describe('TestingPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockReset();
  });

  it('creates a test game and navigates to the table', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      decks: [
        { id: 1, name: 'Deck A', formatNames: ['Standard'], isValid: true },
        { id: 2, name: 'Deck B', formatNames: ['Standard'], isValid: true }
      ]
    } as never);
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      gameId: 88,
      formatName: 'Standard',
      botUserId: 2
    } as never);

    render(
      <MemoryRouter>
        <TestingPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByLabelText('Player deck')).toBeTruthy());
    const createButton = screen.getByRole('button', { name: 'Create test game' }) as HTMLButtonElement;
    await waitFor(() => expect(createButton.disabled).toBe(false));
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/table/88');
    });
  });

  it('creates a scenario and navigates to scenario lab with scenario id', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      decks: [
        { id: 1, name: 'Deck A', formatNames: ['Standard'], isValid: true },
        { id: 2, name: 'Deck B', formatNames: ['Standard'], isValid: true }
      ]
    } as never);
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      scenarioId: 321,
      player1Id: 10,
      player2Id: 11,
      state: {}
    } as never);

    render(
      <MemoryRouter>
        <TestingPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Create Scenario Sandbox')).toBeTruthy());
    fireEvent.click(screen.getByText('Create Scenario Sandbox'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/scenario?scenarioId=321');
    });
  });
});
