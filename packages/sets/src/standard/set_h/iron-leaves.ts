import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  GameMessage,
  GamePhase,
  KnockOutEffect,
  PokemonCard,
  ShowCardsPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class IronLeaves extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16629,
      name: '铁斑叶',
      yorenCode: 'P1010',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '032/204',
        rarityLabel: 'R★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '草',
        specialCardLabel: '未来',
        hp: 120,
        evolveText: '基础',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/93.png',
      ruleLines: [],
      attacks: [
        {
          id: 2067,
          name: '复原网',
          text: '选择自己弃牌区中最多2张宝可梦，在给对手看过之后，加入手牌。',
          cost: ['草'],
          damage: null,
        },
        {
          id: 2068,
          name: '复仇利刃',
          text: '在上一个对手的回合，如果因为招式的伤害，而导致自己的宝可梦【昏厥】的话，则追加造成60伤害。',
          cost: ['草', '无色', '无色'],
          damage: '100+',
        },
      ],
      features: [],
      illustratorNames: ['Mitsuhiro Arita'],
      pokemonCategory: '悖谬宝可梦',
      pokedexCode: '1010',
      pokedexText: '根据极少的目击报告，它用散发着光辉的剑将大树和大石头切成了丝。',
      height: 1.5,
      weight: 125,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/93.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 120;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '复原网',
      cost: [CardType.GRASS],
      damage: '',
      text: '选择自己弃牌区中最多2张宝可梦，在给对手看过之后，加入手牌。',
    },
    {
      name: '复仇利刃',
      cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '100+',
      text: '在上一个对手的回合，如果因为招式的伤害，而导致自己的宝可梦【昏厥】的话，则追加造成60伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '铁斑叶';

  public fullName: string = '铁斑叶 CSV7C';

  public readonly REVENGE_BLADE_MARKER = 'REVENGE_BLADE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const maxCards = player.discard.cards.filter(card => card.superType === SuperType.POKEMON).length;

      if (maxCards === 0) {
        return state;
      }

      let selectedCards: any[] = [];
      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.discard,
          { superType: SuperType.POKEMON },
          { min: 0, max: Math.min(2, maxCards), allowCancel: false }
        ),
        cards => {
          selectedCards = cards || [];

          if (selectedCards.length === 0) {
            return;
          }

          store.prompt(
            state,
            new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selectedCards),
            () => {
              player.discard.moveCardsTo(selectedCards, player.hand);
            }
          );
        }
      );
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      if (effect.player.marker.hasMarker(this.REVENGE_BLADE_MARKER)) {
        effect.damage += 60;
      }
      return state;
    }

    if (effect instanceof KnockOutEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const duringTurn = [GamePhase.PLAYER_TURN, GamePhase.ATTACK].includes(state.phase);

      if (!duringTurn || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner === player) {
        player.marker.addMarker(this.REVENGE_BLADE_MARKER, this);
      }
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.REVENGE_BLADE_MARKER);
      return state;
    }

    return state;
  }
}
