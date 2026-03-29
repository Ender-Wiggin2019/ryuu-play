import { Card } from '@ptcg/common';
import { setF as rawSetF } from './set_f';
import { setG as rawSetG } from './set_g';
import { setH as rawSetH } from './set_h';

type SetCard = Card & {
  fullName: string;
  set: string;
};

function uniqueByFullName<T extends SetCard>(cards: T[]): T[] {
  const seen = new Set<string>();
  return cards.filter(card => {
    if (seen.has(card.fullName)) {
      return false;
    }
    seen.add(card.fullName);
    return true;
  });
}

function cloneWithSet<T extends SetCard>(card: T, setName: string): T {
  return Object.assign(Object.create(Object.getPrototypeOf(card)), card, { set: setName });
}

function isSetFCard(card: SetCard): boolean {
  return card.set === 'set_f';
}

function isSetGCard(card: SetCard): boolean {
  return card.set === 'set_g';
}

function isSetHCard(card: SetCard): boolean {
  return card.set === 'set_h';
}

export const setF: Card[] = uniqueByFullName(
  rawSetF
    .filter((card): card is SetCard => isSetFCard(card as SetCard))
    .map(card => cloneWithSet(card, 'set_f'))
);

export const setG: Card[] = uniqueByFullName([
  ...rawSetG as SetCard[],
  ...rawSetF.filter((card): card is SetCard => isSetGCard(card as SetCard))
]);

export const setH: Card[] = uniqueByFullName([
  ...rawSetH as SetCard[],
  ...rawSetF.filter((card): card is SetCard => isSetHCard(card as SetCard))
]);
