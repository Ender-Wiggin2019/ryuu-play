import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardTag,
  CardType,
  BetweenTurnsEffect,
  Effect,
  PokemonCard,
  PowerType,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

export class GuangHuiXiCuiDaNiuLa extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9863,
      name: '光辉洗翠大狃拉',
      yorenCode: 'P999',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '079/127',
        rarityLabel: 'K',
        cardTypeLabel: '宝可梦',
        attributeLabel: '恶',
        specialCardLabel: '光辉',
        hp: 130,
        evolveText: '基础',
        weakness: '斗 ×2',
        retreatCost: 1,
      },
      image: getCardImageUrl(9863),
      ruleLines: ['1副卡组中只能放入1张光辉宝可梦卡。'],
      attacks: [
        {
          id: 1,
          name: '毒击',
          text: '令对手的战斗宝可梦陷入【中毒】状态。',
          cost: ['恶', '无色'],
          damage: '90',
        },
      ],
      features: [
        {
          id: 1,
          name: '巅峰毒性',
          text: '只要这只宝可梦在场上，对手的战斗宝可梦，因【中毒】而放置的伤害指示物数量增加2个。',
        },
      ],
      illustratorNames: ['Tomokazu Komiya'],
    },
    collection: {
      id: 206,
      commodityCode: 'CSV8C',
      name: '补充包 碧海暗影 逐',
    },
    image_url: getR2CardImageUrl(9863),
  };

  public tags = [CardTag.RADIANT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 130;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '巅峰毒性',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦在场上，对手的战斗宝可梦，因【中毒】而放置的伤害指示物数量增加2个。',
    },
  ];

  public attacks = [
    {
      name: '毒击',
      cost: [CardType.DARK, CardType.COLORLESS],
      damage: '90',
      text: '令对手的战斗宝可梦陷入【中毒】状态。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '光辉洗翠大狃拉';

  public fullName: string = '光辉洗翠大狃拉 079/127';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const poison = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      poison.target = effect.opponent.active;
      store.reduceEffect(state, poison);
      return state;
    }

    if (effect instanceof BetweenTurnsEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      const owner = slot !== undefined ? StateUtils.findOwner(state, slot) : undefined;
      if (owner !== undefined && effect.player === StateUtils.getOpponent(state, owner) && effect.player.active.specialConditions.includes(SpecialCondition.POISONED)) {
        effect.poisonDamage += 20;
      }
    }

    return state;
  }
}
