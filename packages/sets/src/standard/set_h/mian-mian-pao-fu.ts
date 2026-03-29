import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutCountersEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

export class MianMianPaoFu extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17462,
      name: '绵绵泡芙',
      yorenCode: 'P0684',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '085/207',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        hp: 50,
        evolveText: '基础',
        weakness: '钢 ×2',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/232.png',
      ruleLines: [],
      attacks: [
        {
          id: 130,
          name: '轻轻放置',
          text: '给对手的1只宝可梦身上，放置2个伤害指示物。',
          cost: ['超'],
          damage: null,
        },
      ],
      features: [
        {
          id: 19,
          name: '祭典乐舞',
          text: '如果场上有「祭典会场」的话，则这只宝可梦，可以连续使用2次拥有的招式。（如果第1次的招式令对手的战斗宝可梦【昏厥】的话，则在下一只对手的宝可梦被放于战斗场后，继续使用第2次招式。）',
        },
      ],
      illustratorNames: ['Shibuzoh.'],
      pokemonCategory: '棉花糖宝可梦',
      pokedexCode: '0684',
      pokedexText: '蓬松的体毛闻起来就像棉花糖一样甜甜的。会放出黏糊糊的丝缠住敌人。',
      height: 0.4,
      weight: 3.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/232.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp = 50;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '轻轻放置',
      cost: [CardType.PSYCHIC],
      damage: '',
      text: '给对手的1只宝可梦身上，放置2个伤害指示物。',
    },
  ];

  public set = 'set_h';

  public name = '绵绵泡芙';

  public fullName = '绵绵泡芙 085/207#17462';

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

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          effect.player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        targets => {
          const target = targets?.[0];
          if (target === undefined) {
            return;
          }

          const putCountersEffect = new PutCountersEffect(effect, 20);
          putCountersEffect.target = target;
          store.reduceEffect(state, putCountersEffect);
        }
      );
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
