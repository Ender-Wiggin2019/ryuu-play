import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeckEditPage } from '@/pages/deck-edit-page';
import { apiClient } from '@/lib/api-client';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ deckId: '42' })
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string; name?: string; count?: number }) => {
      if (options?.defaultValue && options.name) {
        return options.defaultValue.replace('{{name}}', options.name);
      }
      if (options?.defaultValue && options.count !== undefined) {
        return options.defaultValue.replace('{{count}}', String(options.count));
      }
      return options?.defaultValue || _key;
    }
  })
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    apiUrl: 'http://localhost:3000',
    config: { scansUrl: 'https://images.example.test' }
  })
}));

vi.mock('@/lib/toast', () => ({
  showToast: vi.fn()
}));

vi.mock('@/lib/cards-catalog', () => ({
  getDisplayCards: vi.fn().mockResolvedValue([]),
  getAllFormatNames: vi.fn().mockResolvedValue(['Standard']),
  filterDisplayCards: vi.fn().mockImplementation(async (cards: unknown[]) => cards),
  getCardByName: vi.fn().mockResolvedValue({
    name: 'Pikachu',
    fullName: 'SV1 Pikachu',
    superType: 0
  }),
  getCardScanUrl: vi.fn().mockReturnValue('https://images.example.test/pikachu.png'),
  getCollectionNumber: vi.fn().mockReturnValue('001'),
  getRarityLabel: vi.fn().mockReturnValue('Common'),
  getVariantCards: vi.fn().mockResolvedValue([]),
}));

describe('DeckEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the editor without drag-drop context errors', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      deck: {
        id: 42,
        name: 'Electric Basics',
        cardType: [],
        formatNames: ['Standard'],
        isValid: true,
        cards: ['SV1 Pikachu']
      }
    } as never);

    render(
      <MemoryRouter>
        <DeckEditPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByDisplayValue('Electric Basics')).toBeTruthy());
    expect(screen.getByText('Editing deck: Electric Basics')).toBeTruthy();
    expect(screen.queryByText(/Expected drag drop context/i)).toBeNull();
  });
});
