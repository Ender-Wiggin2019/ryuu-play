import {
  AttackEffect,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  EnergyCard,
  GameMessage,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';
import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';

type JiaHeRenWaExTeraVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
};

const JIA_HE_REN_WA_EX_TERA_LOGIC_GROUP_KEY = 'pokemon:甲贺忍蛙ex:Y1247:H:fighting-tera-hp310:忍刃170:分身连打';
const JIA_HE_REN_WA_EX_TERA_VARIANT_GROUP_KEY = 'pokemon:甲贺忍蛙ex:Y1247:H:fighting-tera-hp310:忍刃170:分身连打';

function seedJiaHeRenWaExTeraVariant(card: JiaHeRenWaExTera, seed: JiaHeRenWaExTeraVariantSeed): JiaHeRenWaExTera {
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
    logic_group_key: JIA_HE_REN_WA_EX_TERA_LOGIC_GROUP_KEY,
    variant_group_key: JIA_HE_REN_WA_EX_TERA_VARIANT_GROUP_KEY,
    variant_group_size: 3,
  };
  card.fullName = `${card.name} ${card.rawData.raw_card.commodityCode} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

function damageTarget(store: StoreLike, state: State, effect: AttackEffect, target: PokemonSlot, amount: number): void {
  if (target === effect.opponent.active) {
    const damageEffect = new DealDamageEffect(effect, amount);
    damageEffect.target = target;
    store.reduceEffect(state, damageEffect);
    return;
  }

  const damageEffect = new PutDamageEffect(effect, amount);
  damageEffect.target = target;
  store.reduceEffect(state, damageEffect);
}

function* useBunshinCombo(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const source = player.active;

  let discarded: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      source.energies,
      { superType: SuperType.ENERGY },
      { min: 2, max: 2, allowCancel: false }
    ),
    cards => {
      discarded = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (discarded.length !== 2) {
    return state;
  }

  source.energies.moveCardsTo(discarded, player.discard);

  const targets: PokemonSlot[] = [];
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, slot => {
    targets.push(slot);
  });

  if (targets.length === 0) {
    return state;
  }

  let firstTarget: PokemonSlot | undefined;
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false }
    ),
    selected => {
      firstTarget = selected?.[0];
      next();
    }
  );

  if (firstTarget === undefined) {
    return state;
  }

  damageTarget(store, state, effect, firstTarget, 120);

  if (targets.length === 1) {
    return state;
  }

  const blocked = [{
    player: PlayerType.TOP_PLAYER,
    slot: firstTarget === opponent.active ? SlotType.ACTIVE : SlotType.BENCH,
    index: firstTarget === opponent.active ? 0 : opponent.bench.indexOf(firstTarget),
  }];

  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked }
    ),
    selected => {
      if (selected?.[0] !== undefined) {
        damageTarget(store, state, effect, selected[0], 120);
      }
      next();
    }
  );

  return state;
}

export class JiaHeRenWaExTera extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16289,
      name: '甲贺忍蛙ex',
      yorenCode: 'Y1247',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '123/204',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '太晶',
        hp: 310,
        evolveText: '2阶进化',
        weakness: '超 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/336.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 921,
          name: '忍刃',
          text: '若希望，可选择自己牌库中任意1张卡牌，加入手牌。并重洗牌库。',
          cost: ['水'],
          damage: '170',
        },
        {
          id: 922,
          name: '分身连打',
          text: '将这只宝可梦身上附着的2个能量放于弃牌区，给对手的2只宝可梦，各造成120伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['水', '无色', '无色'],
          damage: '',
        },
      ],
      features: [],
      illustratorNames: ['5ban Graphics'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/336.png',
    logic_group_key: JIA_HE_REN_WA_EX_TERA_LOGIC_GROUP_KEY,
    variant_group_key: JIA_HE_REN_WA_EX_TERA_VARIANT_GROUP_KEY,
    variant_group_size: 3,
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage = Stage.STAGE_2;

  public evolvesFrom = '呱呱泡蛙';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp = 310;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '忍刃',
      cost: [CardType.WATER],
      damage: '170',
      text: '若希望，可选择自己牌库中任意1张卡牌，加入手牌。并重洗牌库。',
    },
    {
      name: '分身连打',
      cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: '',
      text: '将这只宝可梦身上附着的2个能量放于弃牌区，给对手的2只宝可梦，各造成120伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set = 'set_h';

  public name = '甲贺忍蛙ex';

  public fullName = '甲贺忍蛙ex CSV7C 123/204#16289';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      effect.damage = 170;

      if (player.deck.cards.length === 0) {
        return state;
      }

      const generator = searchCardsToHand(
        () => generator.next(),
        store,
        state,
        player,
        player.deck,
        {},
        { min: 0, max: 1, allowCancel: false, showToOpponent: false, shuffleAfterSearch: true }
      );
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useBunshinCombo(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}

export const jiaHeRenWaExTeraVariants = [
  seedJiaHeRenWaExTeraVariant(new JiaHeRenWaExTera(), {
    id: 16289,
    collectionNumber: '123/204',
    rarityLabel: 'RR',
  }),
  seedJiaHeRenWaExTeraVariant(new JiaHeRenWaExTera(), {
    id: 16389,
    collectionNumber: '223/204',
    rarityLabel: 'SR',
  }),
  seedJiaHeRenWaExTeraVariant(new JiaHeRenWaExTera(), {
    id: 16408,
    collectionNumber: '242/204',
    rarityLabel: 'SAR',
  }),
];
