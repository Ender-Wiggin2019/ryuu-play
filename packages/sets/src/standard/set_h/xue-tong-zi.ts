import {
  AttackEffect,
  Card,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

function* useAttack(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const opponent = StateUtils.getOpponent(state, effect.player);
  let cards: Card[] = [];

  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      effect.player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      opponent.hand,
      {},
      { min: 1, max: 1, allowCancel: false, isSecret: true }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  if (cards.length === 0) {
    return state;
  }

  yield store.prompt(
    state,
    new ShowCardsPrompt(effect.player.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, cards),
    () => next()
  );

  opponent.hand.moveCardsTo(cards, opponent.deck);
  yield store.prompt(state, new ShuffleDeckPrompt(opponent.id), order => {
    opponent.deck.applyOrder(order);
    next();
  });

  return state;
}

export class XueTongZi extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16223,
      name: '雪童子',
      yorenCode: 'P361',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '057/204',
        rarityLabel: 'C',
        hp: 60,
      },
      image: getCardImageUrl(16223),
      attacks: [
        { id: 576, name: '惊吓', text: '在不看正面的前提下选择对手1张手牌，查看该卡牌的正面后，放回对手牌库并重洗牌库。', cost: ['水', '无色'], damage: '20' },
      ],
    },
    collection: { id: 324, commodityCode: 'CSV7C', name: '补充包 利刃猛醒' },
    image_url: getR2CardImageUrl(16223),
  };

  public stage = Stage.BASIC;
  public cardTypes: CardType[] = [CardType.WATER];
  public hp = 60;
  public weakness = [{ type: CardType.METAL }];
  public retreat = [CardType.COLORLESS];
  public attacks = [
    { name: '惊吓', cost: [CardType.WATER, CardType.COLORLESS], damage: '20', text: '在不看正面的前提下选择对手1张手牌，查看该卡牌的正面后，放回对手牌库并重洗牌库。' },
  ];
  public set = 'set_h';
  public name = '雪童子';
  public fullName = '雪童子 057/204#16223';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useAttack(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
