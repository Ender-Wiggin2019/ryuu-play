import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
  TrainerType,
  UseAttackEffect,
} from '@ptcg/common';

import { commonMarkers } from '../../common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type VariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const LOGIC_GROUP_KEY = 'pokemon:起源帕路奇亚V:Y927:F:rule-region:hydro-break';
const VARIANT_GROUP_KEY = 'pokemon:起源帕路奇亚V:Y927:F:rule-region:hydro-break';

function seedVariant(card: QiYuanPaLuQiYaV, seed: VariantSeed): QiYuanPaLuQiYaV {
  card.rawData = {
    ...card.rawData,
    raw_card: {
      ...card.rawData.raw_card,
      id: seed.id,
      image: getCardImageUrl(seed.id),
      details: {
        ...card.rawData.raw_card.details,
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
      },
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: LOGIC_GROUP_KEY,
    variant_group_key: VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

function* useRuleTheRegion(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  let cards: Card[] = [];

  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.TRAINER, trainerType: TrainerType.STADIUM },
      { min: 0, max: 1, allowCancel: true }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  player.deck.moveCardsTo(cards, player.hand);

  if (cards.length > 0) {
    const opponentId = state.players.find(p => p.id !== player.id)?.id;
    if (opponentId !== undefined) {
      yield store.prompt(state, new ShowCardsPrompt(opponentId, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, cards), () => next());
    }
  }

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return state;
}

export class QiYuanPaLuQiYaV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9554,
      name: '起源帕路奇亚V',
      yorenCode: 'Y927',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '050/128',
        rarityLabel: 'RR',
      },
      image: getCardImageUrl(9554),
      attacks: [
        { id: 1096, name: '领域支配', text: '选择自己牌库中的1张竞技场，在给对手看过之后，加入手牌。并重洗牌库。', cost: ['水'], damage: '' },
        { id: 1097, name: '水炮破坏', text: '在下一个自己的回合，这只宝可梦无法使用招式。', cost: ['水', '水', '无色'], damage: '200' },
      ],
    },
    collection: { id: 182, commodityCode: 'CS5bC', name: '补充包 勇魅群星 勇' },
    image_url: getR2CardImageUrl(9554),
    logic_group_key: LOGIC_GROUP_KEY,
    variant_group_key: VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };

  public tags = [CardTag.POKEMON_V];
  public stage = Stage.BASIC;
  public cardTypes: CardType[] = [CardType.WATER];
  public hp = 220;
  public weakness = [{ type: CardType.LIGHTNING }];
  public retreat = [CardType.COLORLESS, CardType.COLORLESS];
  public attacks = [
    { name: '领域支配', cost: [CardType.WATER], damage: '', text: '选择自己牌库中的1张竞技场，在给对手看过之后，加入手牌。并重洗牌库。' },
    { name: '水炮破坏', cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS], damage: '200', text: '在下一个自己的回合，这只宝可梦无法使用招式。' },
  ];
  public set = 'set_f';
  public name = '起源帕路奇亚V';
  public fullName = '起源帕路奇亚V 050/128#9554';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const duringYourNextTurn = commonMarkers.duringYourNextTurn(this, store, state, effect);

    if (effect instanceof UseAttackEffect && effect.attack === this.attacks[1] && duringYourNextTurn.hasMarker(effect)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useRuleTheRegion(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      duringYourNextTurn.setMarker(effect);
    }

    return state;
  }
}

export const qiYuanPaLuQiYaVVariants = [
  seedVariant(new QiYuanPaLuQiYaV(), { id: 9554, collectionNumber: '050/128', rarityLabel: 'RR', imageUrl: getR2CardImageUrl(9554) }),
  seedVariant(new QiYuanPaLuQiYaV(), { id: 9642, collectionNumber: '138/128', rarityLabel: 'SR', imageUrl: getR2CardImageUrl(9642) }),
  seedVariant(new QiYuanPaLuQiYaV(), { id: 9643, collectionNumber: '139/128', rarityLabel: 'SR', imageUrl: getR2CardImageUrl(9643) }),
  seedVariant(new QiYuanPaLuQiYaV(), { id: 15490, collectionNumber: '036/207', rarityLabel: '无标记', imageUrl: getR2CardImageUrl(15490) }),
  seedVariant(new QiYuanPaLuQiYaV(), { id: 9160, collectionNumber: '003/024', rarityLabel: '无标记', imageUrl: getR2CardImageUrl(9160) }),
];
