import { FilterCardsPipe } from './filter-cards.pipe';
import { DeckEditToolbarFilter } from './deck-edit-toolbar-filter.interface';
import { DeckEditPane } from '../deck-edit-panes/deck-edit-pane.interface';

describe('FilterCardsPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterCardsPipe(null);
    expect(pipe).toBeTruthy();
  });

  it('should match cards by name regardless of case', () => {
    const pipe = new FilterCardsPipe(null as any);
    const filter: DeckEditToolbarFilter = {
      formatName: '',
      superTypes: [],
      cardTypes: [],
      searchValue: 'iono'
    };

    const result = pipe.transform([
      {
        card: { name: 'Iono', fullName: 'Iono CSV8C' } as any,
        count: 1,
        pane: DeckEditPane.LIBRARY,
        scanUrl: '',
        spec: {} as any
      }
    ] as any, filter);

    expect(result.length).toBe(1);
  });

  it('should match cards by fullName regardless of case', () => {
    const pipe = new FilterCardsPipe(null as any);
    const filter: DeckEditToolbarFilter = {
      formatName: '',
      superTypes: [],
      cardTypes: [],
      searchValue: 'csv8c'
    };

    const result = pipe.transform([
      {
        card: { name: 'Iono', fullName: 'Iono CSV8C' } as any,
        count: 1,
        pane: DeckEditPane.LIBRARY,
        scanUrl: '',
        spec: {} as any
      }
    ] as any, filter);

    expect(result.length).toBe(1);
  });

  it('should match cards by chinese name from rawData', () => {
    const pipe = new FilterCardsPipe(null as any);
    const filter: DeckEditToolbarFilter = {
      formatName: '',
      superTypes: [],
      cardTypes: [],
      searchValue: '奇树'
    };

    const result = pipe.transform([
      {
        card: {
          name: 'Iono',
          fullName: 'Iono CSV8C',
          rawData: {
            raw_card: { name: '奇树' }
          }
        } as any,
        count: 1,
        pane: DeckEditPane.LIBRARY,
        scanUrl: '',
        spec: {} as any
      }
    ] as any, filter);

    expect(result.length).toBe(1);
  });

  it('should match cards by collection number and text details', () => {
    const pipe = new FilterCardsPipe(null as any);
    const filter: DeckEditToolbarFilter = {
      formatName: '',
      superTypes: [],
      cardTypes: [],
      searchValue: '151/151'
    };

    const result = pipe.transform([
      {
        card: {
          name: 'Mew ex',
          fullName: 'Mew ex 151C4',
          text: '选择对手战斗宝可梦所拥有的1个招式，作为这个招式使用。',
          rawData: {
            raw_card: {
              name: '梦幻ex',
              details: { collectionNumber: '151/151', rarityLabel: 'RR' }
            },
            collection: { name: '收集啦151 聚' }
          }
        } as any,
        count: 1,
        pane: DeckEditPane.LIBRARY,
        scanUrl: '',
        spec: {} as any
      }
    ] as any, filter);

    expect(result.length).toBe(1);
  });

  it('should filter standard cards by regulation marks F, G and H', () => {
    const pipe = new FilterCardsPipe({
      isCardFromFormat: () => false
    } as any);
    const filter: DeckEditToolbarFilter = {
      formatName: 'Standard',
      superTypes: [],
      cardTypes: [],
      searchValue: ''
    };

    const result = pipe.transform([
      {
        card: {
          name: '奇树',
          fullName: '奇树 CSV2D',
          rawData: {
            raw_card: {
              details: { regulationMarkText: 'G' }
            }
          }
        } as any,
        count: 1,
        pane: DeckEditPane.LIBRARY,
        scanUrl: '',
        spec: {} as any
      },
      {
        card: {
          name: '博士的研究',
          fullName: '博士的研究 SWSH',
          rawData: {
            raw_card: {
              details: { regulationMarkText: 'E' }
            }
          }
        } as any,
        count: 1,
        pane: DeckEditPane.LIBRARY,
        scanUrl: '',
        spec: {} as any
      }
    ] as any, filter);

    expect(result.length).toBe(1);
    expect(result[0].card.fullName).toBe('奇树 CSV2D');
  });
});
