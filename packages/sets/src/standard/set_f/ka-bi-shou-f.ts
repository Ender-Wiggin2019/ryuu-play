import {
  AddSpecialConditionsEffect,
  AttackEffect,
  BetweenTurnsEffect,
  CardType,
  CoinFlipPrompt,
  DiscardCardsEffect,
  Effect,
  GameError,
  GameMessage,
  MoveCardsEffect,
  PokemonCard,
  PowerType,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

function* resolveSleep(
  next: Function,
  store: StoreLike,
  state: State,
  effect: BetweenTurnsEffect,
): IterableIterator<State> {
  let first = false;
  yield store.prompt(state, new CoinFlipPrompt(effect.player.id, GameMessage.FLIP_ASLEEP), result => {
    first = result === true;
    next();
  });

  if (!first) {
    effect.asleepFlipResult = false;
    return state;
  }

  let second = false;
  yield store.prompt(state, new CoinFlipPrompt(effect.player.id, GameMessage.FLIP_ASLEEP), result => {
    second = result === true;
    next();
  });

  effect.asleepFlipResult = second;
  return state;
}

function isOpponentAttackTargetingThisCard(state: State, self: KaBiShouF, effect: Effect): boolean {
  if (!('source' in effect) || !('target' in effect)) {
    return false;
  }

  const slot = StateUtils.findPokemonSlot(state, self);
  if (slot === undefined || effect.target !== slot) {
    return false;
  }

  const sourceOwner = StateUtils.findOwner(state, effect.source as any);
  const targetOwner = StateUtils.findOwner(state, effect.target as any);
  return sourceOwner !== undefined && targetOwner !== undefined && sourceOwner !== targetOwner;
}

export class KaBiShouF extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12459,
      name: '卡比兽',
      yorenCode: 'Y1459',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '001/023',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        hp: 150,
        evolveText: '基础',
        weakness: '斗 ×2',
        retreatCost: 4,
      },
      image: getCardImageUrl(12459),
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '轰隆鼾声',
          text: '使这只宝可梦陷入【睡眠】状态。因这个【睡眠】而抛掷的硬币次数变为2次，只要不是全为正面就不会恢复。',
          cost: ['无色', '无色', '无色', '无色'],
          damage: '180',
        },
      ],
      features: [
        {
          id: 1,
          name: '无畏脂肪',
          text: '这只宝可梦，不会受到对手宝可梦所使用招式的效果影响。',
        },
      ],
      illustratorNames: ['Shin Nagasawa'],
    },
    collection: {
      id: 206,
      commodityCode: 'CSV8C',
      name: '补充包 碧海暗影 逐',
    },
    image_url: getR2CardImageUrl(12459),
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 150;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
  ];

  public attacks = [
    {
      name: '轰隆鼾声',
      cost: [
        CardType.COLORLESS,
        CardType.COLORLESS,
        CardType.COLORLESS,
        CardType.COLORLESS,
      ],
      damage: '180',
      text: '使这只宝可梦陷入【睡眠】状态。因这个【睡眠】而抛掷的硬币次数变为2次，只要不是全为正面就不会恢复。',
    },
  ];

  public powers = [
    {
      name: '无畏脂肪',
      powerType: PowerType.ABILITY,
      text: '这只宝可梦，不会受到对手宝可梦所使用招式的效果影响。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '卡比兽';

  public fullName: string = '卡比兽 001/023';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.damage = 180;
      const sleepEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      sleepEffect.target = effect.player.active;
      store.reduceEffect(state, sleepEffect);
      return state;
    }

    if (effect instanceof BetweenTurnsEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      const owner = slot !== undefined ? StateUtils.findOwner(state, slot) : undefined;
      if (owner !== effect.player || effect.player.active.getPokemonCard() !== this || !effect.player.active.specialConditions.includes(SpecialCondition.ASLEEP)) {
        return state;
      }

      const generator = resolveSleep(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AddSpecialConditionsEffect || effect instanceof DiscardCardsEffect || effect instanceof MoveCardsEffect) {
      if (isOpponentAttackTargetingThisCard(state, this, effect)) {
        throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
      }
    }

    return state;
  }
}
