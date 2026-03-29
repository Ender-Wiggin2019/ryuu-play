import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  CoinFlipPrompt,
  Effect,
  EndTurnEffect,
  EnergyCard,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  UseAttackEffect,
} from '@ptcg/common';

export class JiaoJinYu extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17427,
      name: '角金鱼',
      yorenCode: 'P0118',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '050/207',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        hp: 50,
        evolveText: '基础',
        weakness: '雷 ×2',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/137.png',
      ruleLines: [],
      attacks: [
        {
          id: 81,
          name: '潮旋',
          text: '抛掷1次硬币如果为正面，则选择对手战斗宝可梦身上附着的1个能量，放于弃牌区。',
          cost: ['无色', '无色'],
          damage: '10',
        },
      ],
      features: [
        {
          id: 9,
          name: '祭典乐舞',
          text: '如果场上有「祭典会场」的话，则这只宝可梦，可以连续使用2次拥有的招式。（如果第1次的招式令对手的战斗宝可梦【昏厥】的话，则在下一只对手的宝可梦被放于战斗场后，继续使用第2次招式。）',
        },
      ],
      illustratorNames: ['saino misaki'],
      pokemonCategory: '金鱼宝可梦',
      pokedexCode: '0118',
      pokedexText: '会优雅地摇摆背鳍、胸鳍和尾鳍，所以被称之为水中的舞者。',
      height: 0.6,
      weight: 15,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/137.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp = 50;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '潮旋',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '10',
      text: '抛掷1次硬币如果为正面，则选择对手战斗宝可梦身上附着的1个能量，放于弃牌区。',
    },
  ];

  public set = 'set_h';

  public name = '角金鱼';

  public fullName = '角金鱼 050/207#17427';

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

      const energyCards = effect.opponent.active.energies.cards.filter(card => card.superType === SuperType.ENERGY);
      if (energyCards.length === 0) {
        effect.damage = 10;
        return state;
      }

      return store.prompt(
        state,
        new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP),
        result => {
          if (result) {
            return store.prompt(
              state,
              new ChooseCardsPrompt(
                effect.player.id,
                GameMessage.CHOOSE_CARD_TO_DISCARD,
                effect.opponent.active.energies,
                { superType: SuperType.ENERGY },
                { min: 1, max: 1, allowCancel: false }
            ),
            selected => {
              const cards = selected || [];
              if (cards.length > 0) {
                effect.opponent.active.energies.moveCardTo(cards[0] as EnergyCard, effect.opponent.discard);
              }
            }
          );
        }
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
