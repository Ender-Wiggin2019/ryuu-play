import {
  AttackEffect,
  CardList,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PlayerType,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class RagingBoltEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16320,
      name: '猛雷鼓ex',
      yorenCode: 'Y1399',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '154/204',
      },
      image: 'img/324/419.png',
      hash: '88bb8a843fd664b158b742c7d6e410e8',
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
      salesDate: '2026-01-16',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/419.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 240;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '飞溅咆哮',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '将自己的手牌全部放于弃牌区，从牌库上方抽取6张卡牌。',
    },
    {
      name: '极雷轰',
      cost: [CardType.LIGHTNING, CardType.FIGHTING],
      damage: '70×',
      text:
        '将自己场上宝可梦身上附着的任意数量的基本能量放于弃牌区，造成其张数×70伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '猛雷鼓ex';

  public fullName: string = '猛雷鼓ex CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      player.hand.moveTo(player.discard);
      player.deck.moveTo(player.hand, 6);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const attachedBasicEnergy = new CardList<EnergyCard>();

      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
        pokemonSlot.energies.cards.forEach(card => {
          if (card instanceof EnergyCard && card.energyType === EnergyType.BASIC) {
            attachedBasicEnergy.cards.push(card);
          }
        });
      });

      if (attachedBasicEnergy.cards.length === 0) {
        effect.damage = 0;
        return state;
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          attachedBasicEnergy,
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
          { min: 0, max: attachedBasicEnergy.cards.length, allowCancel: false }
        ),
        selected => {
          const cards = (selected || []) as EnergyCard[];
          cards.forEach(card => {
            const source = StateUtils.findCardList(state, card);
            source.moveCardTo(card, player.discard);
          });
          effect.damage = cards.length * 70;
        }
      );
    }

    return state;
  }
}
