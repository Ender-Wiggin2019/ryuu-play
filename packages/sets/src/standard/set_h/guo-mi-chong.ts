import {
  AttackEffect,
  CardType,
  Effect,
  EndTurnEffect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

export class GuoMiChong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17401,
      name: '裹蜜虫',
      yorenCode: 'P1011',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '024/207',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '草',
        hp: 80,
        evolveText: '1阶进化',
        weakness: '火 ×2',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/67.png',
      ruleLines: [],
      attacks: [
        {
          id: 34,
          name: '朋友环',
          text: '造成自己备战宝可梦数量×20伤害。',
          cost: ['草'],
          damage: '20×',
        },
      ],
      features: [
        {
          id: 5,
          name: '祭典乐舞',
          text: '如果场上有「祭典会场」的话，则这只宝可梦，可以连续使用2次拥有的招式。（如果第1次的招式令对手的战斗宝可梦【昏厥】的话，则在下一只对手的宝可梦被放于战斗场后，继续使用第2次招式。）',
        },
      ],
      illustratorNames: ['Mina Nakai'],
      pokemonCategory: '糖苹果宝可梦',
      pokedexCode: '1011',
      pokedexText: '背上的苹果从树上掉下来后，就会立即去捡起来继续装点身体。',
      height: 0.4,
      weight: 13.0,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/67.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '苹裹龙';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp = 80;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '朋友环',
      cost: [CardType.GRASS],
      damage: '20×',
      text: '造成自己备战宝可梦数量×20伤害。',
    },
  ];

  public set = 'set_h';

  public name = '裹蜜虫';

  public fullName = '裹蜜虫 024/207#17401';

  public readonly FESTIVAL_DANCE_PENDING_MARKER = 'FESTIVAL_DANCE_PENDING_MARKER';
  public readonly FESTIVAL_DANCE_USED_MARKER = 'FESTIVAL_DANCE_USED_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const stadium = StateUtils.getStadiumCard(state);
      if (
        stadium !== undefined
        && stadium.name === '祭典会场'
        && !effect.player.marker.hasMarker(this.FESTIVAL_DANCE_PENDING_MARKER, this)
        && !effect.player.marker.hasMarker(this.FESTIVAL_DANCE_USED_MARKER, this)
      ) {
        effect.player.marker.addMarker(this.FESTIVAL_DANCE_PENDING_MARKER, this);
      }

      effect.damage = effect.player.bench.filter(slot => slot.pokemons.cards.length > 0).length * 20;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      if (effect.player.marker.hasMarker(this.FESTIVAL_DANCE_PENDING_MARKER, this)) {
        effect.player.marker.removeMarker(this.FESTIVAL_DANCE_PENDING_MARKER, this);
        effect.player.marker.addMarker(this.FESTIVAL_DANCE_USED_MARKER, this);

        const active = effect.player.active.getPokemonCard();
        if (active === this) {
          return store.reduceEffect(state, new UseAttackEffect(effect.player, this.attacks[0]));
        }
      }

      if (effect.player.marker.hasMarker(this.FESTIVAL_DANCE_USED_MARKER, this)) {
        effect.player.marker.removeMarker(this.FESTIVAL_DANCE_USED_MARKER, this);
      }
    }

    return state;
  }
}
