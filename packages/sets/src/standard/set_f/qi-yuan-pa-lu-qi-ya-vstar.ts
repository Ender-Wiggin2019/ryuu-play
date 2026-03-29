import {
  AttackEffect,
  Card,
  CardTag,
  CardTarget,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  Player,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type VariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const LOGIC_GROUP_KEY = 'pokemon:起源帕路奇亚VSTAR:Y973:F:star-portal:subspace-swell';
const VARIANT_GROUP_KEY = 'pokemon:起源帕路奇亚VSTAR:Y973:F:star-portal:subspace-swell';

function seedVariant(card: QiYuanPaLuQiYaVstar, seed: VariantSeed): QiYuanPaLuQiYaVstar {
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

function getBlockedTargets(player: Player): CardTarget[] {
  const blocked: CardTarget[] = [];

  const activeCard = player.active.getPokemonCard();
  if (activeCard === undefined || !activeCard.cardTypes.includes(CardType.WATER)) {
    blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
  }

  for (let i = 0; i < player.bench.length; i++) {
    const benchCard = player.bench[i].getPokemonCard();
    if (benchCard === undefined || !benchCard.cardTypes.includes(CardType.WATER)) {
      blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: i });
    }
  }

  return blocked;
}

function* useStarPortal(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const blockedTargets = getBlockedTargets(player);
  const hasWaterPokemon = blockedTargets.length < 6;
  const maxEnergyToAttach = Math.min(
    3,
    player.discard.cards.filter(c => c instanceof EnergyCard && c.provides.includes(CardType.WATER)).length
  );

  if (!hasWaterPokemon || maxEnergyToAttach === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let cards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_ATTACH,
      player.discard,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
      { min: 1, max: maxEnergyToAttach, allowCancel: false }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  for (const card of cards) {
    let target: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { allowCancel: false, min: 1, max: 1, blocked: blockedTargets }
      ),
      result => {
        target = result || [];
        next();
      }
    );

    if (target.length > 0) {
      player.discard.moveCardTo(card, target[0].energies);
    }
  }

  return state;
}

export class QiYuanPaLuQiYaVstar extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9555,
      name: '起源帕路奇亚VSTAR',
      yorenCode: 'Y973',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '051/128',
        rarityLabel: 'RRR',
      },
      image: getCardImageUrl(9555),
      attacks: [
        { id: 1098, name: '亚空潮漩', text: '追加造成双方备战宝可梦数量×20点伤害。', cost: ['水', '水'], damage: '60+' },
      ],
      features: [
        { id: 1, name: '星界传说', text: '在自己的回合可以使用1次。从自己弃牌区将最多3张【水】能量卡，以任意方式附着于自己的【水】宝可梦身上。' },
      ],
    },
    collection: { id: 182, commodityCode: 'CS5bC', name: '补充包 勇魅群星 勇' },
    image_url: getR2CardImageUrl(9555),
    logic_group_key: LOGIC_GROUP_KEY,
    variant_group_key: VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };

  public tags = [CardTag.POKEMON_VSTAR];
  public stage = Stage.STAGE_1;
  public evolvesFrom = '起源帕路奇亚V';
  public cardTypes: CardType[] = [CardType.WATER];
  public hp = 280;
  public weakness = [{ type: CardType.LIGHTNING }];
  public retreat = [CardType.COLORLESS, CardType.COLORLESS];
  public powers = [
    {
      name: '星界传说',
      useWhenInPlay: true,
      useVSTARPower: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。从自己弃牌区将最多3张【水】能量卡，以任意方式附着于自己的【水】宝可梦身上。',
    },
  ];
  public attacks = [
    { name: '亚空潮漩', cost: [CardType.WATER, CardType.WATER], damage: '60+', text: '追加造成双方备战宝可梦数量×20点伤害。' },
  ];
  public set = 'set_f';
  public name = '起源帕路奇亚VSTAR';
  public fullName = '起源帕路奇亚VSTAR 051/128#9555';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useStarPortal(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const ownBenchCount = player.bench.filter(slot => slot.getPokemonCard() !== undefined).length;
      const opponentBenchCount = opponent.bench.filter(slot => slot.getPokemonCard() !== undefined).length;
      effect.damage = 60 + (ownBenchCount + opponentBenchCount) * 20;
    }

    return state;
  }
}

export const qiYuanPaLuQiYaVstarVariants = [
  seedVariant(new QiYuanPaLuQiYaVstar(), { id: 9555, collectionNumber: '051/128', rarityLabel: 'RRR', imageUrl: getR2CardImageUrl(9555) }),
  seedVariant(new QiYuanPaLuQiYaVstar(), { id: 9665, collectionNumber: '161/128', rarityLabel: 'HR', imageUrl: getR2CardImageUrl(9665) }),
  seedVariant(new QiYuanPaLuQiYaVstar(), { id: 9677, collectionNumber: '173/128', rarityLabel: 'UR', imageUrl: getR2CardImageUrl(9677) }),
  seedVariant(new QiYuanPaLuQiYaVstar(), { id: 15491, collectionNumber: '037/207', rarityLabel: '无标记', imageUrl: getR2CardImageUrl(15491) }),
  seedVariant(new QiYuanPaLuQiYaVstar(), { id: 10883, collectionNumber: '021/004', rarityLabel: '无标记', imageUrl: getR2CardImageUrl(10883) }),
];
