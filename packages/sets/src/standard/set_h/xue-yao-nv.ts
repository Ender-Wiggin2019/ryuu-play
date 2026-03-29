import {
  BetweenTurnsEffect,
  CardType,
  Effect,
  PokemonCard,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

export class XueYaoNv extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16225,
      name: '雪妖女',
      yorenCode: 'P478',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '059/204',
        rarityLabel: 'R',
        hp: 90,
      },
      image: getCardImageUrl(16225),
      attacks: [
        { id: 333, name: '冰霜粉碎', text: '', cost: ['水', '无色'], damage: '60' },
      ],
      features: [
        { id: 48, name: '冻结帷幕', text: '只要这只宝可梦在场上，每当宝可梦检查时，给双方所有拥有特性的宝可梦（除「雪妖女」外）身上，各放置1个伤害指示物。' },
      ],
    },
    collection: { id: 324, commodityCode: 'CSV7C', name: '补充包 利刃猛醒' },
    image_url: getR2CardImageUrl(16225),
  };

  public stage = Stage.STAGE_1;
  public evolvesFrom = '雪童子';
  public cardTypes: CardType[] = [CardType.WATER];
  public hp = 90;
  public weakness = [{ type: CardType.METAL }];
  public retreat = [CardType.COLORLESS];
  public powers = [
    { name: '冻结帷幕', powerType: PowerType.ABILITY, useWhenInPlay: true, text: '只要这只宝可梦在场上，每当宝可梦检查时，给双方所有拥有特性的宝可梦（除「雪妖女」外）身上，各放置1个伤害指示物。' },
  ];
  public attacks = [
    { name: '冰霜粉碎', cost: [CardType.WATER, CardType.COLORLESS], damage: '60', text: '' },
  ];
  public set = 'set_h';
  public name = '雪妖女';
  public fullName = '雪妖女 059/204#16225';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof BetweenTurnsEffect) {
      const selfSlot = StateUtils.findPokemonSlot(state, this);
      if (selfSlot === undefined) {
        return state;
      }

      for (const player of state.players) {
        [player.active, ...player.bench].forEach(slot => {
          const pokemon = slot.getPokemonCard();
          if (pokemon === undefined || slot === selfSlot || pokemon.powers.length === 0) {
            return;
          }
          slot.damage += 10;
        });
      }
    }

    return state;
  }
}
