import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Ralts extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9827,
      yorenCode: 'P280',
      cardType: '1',
      nameSamePokemonId: 369,
      details: {
        id: 9827,
        evolveText: '基础',
        cardName: '拉鲁拉丝',
        regulationMarkText: 'F',
        collectionNumber: '043/127',
        rarity: '1',
        rarityText: 'C',
        hp: 70,
        attribute: '5',
        yorenCode: 'P280',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '2',
        abilityItemList: [
          {
            abilityName: '瞬移破坏',
            abilityText: '将这只宝可梦与备战宝可梦互换。',
            abilityCost: '5',
            abilityDamage: '10',
          },
        ],
        ruleText: '',
        pokemonCategory: '心情宝可梦',
        weaknessType: '7',
        weaknessFormula: '×2',
        resistanceType: '6',
        resistanceFormula: '-30',
        retreatCost: 1,
        pokedexCode: '280',
        pokedexText: '倾向于亲近心情开朗之人而非心情低落之人，且无男女老少之分。更深入的调查乃是当前课题。',
        height: 0.4,
        weight: 6.6,
        illustratorName: ['Hataya'],
        commodityList: [
          {
            commodityName: '补充包 勇魅群星 魅',
            commodityCode: 'CS5aC',
          },
        ],
        collectionFlag: 0,
        skills: [],
        special_shiny_type: 0,
      },
      name: '拉鲁拉丝',
      image: 'img\\183\\72.png',
      hash: '89afba8dbaff63c139d7bfd7ef9992db',
    },
    collection: {},
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/183/72.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 70;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Teleport Break',
      cost: [CardType.PSYCHIC],
      damage: '10',
      text: 'Switch this Pokemon with 1 of your Benched Pokemon.',
    },
  ];

  public set: string = 'set_f';

  public name: string = 'Ralts';

  public fullName: string = 'Ralts CS5aC';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const hasBench = player.bench.some(b => b.pokemons.cards.length > 0);
      if (!hasBench) {
        return state;
      }

      let targets: PokemonSlot[] = [];
      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_SWITCH,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false }
        ),
        results => {
          targets = results || [];
          if (targets.length > 0) {
            player.switchPokemon(targets[0]);
          }
        }
      );
    }

    return state;
  }
}
