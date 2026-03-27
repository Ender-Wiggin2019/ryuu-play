import {
  Card,
  CardTarget,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EvolveEffect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerType,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '赛吉',
  fullName: '赛吉 247/204#16413',
  text: '从自己牌库中选择1张，从自己场上的1只宝可梦进化而来的卡牌（除拥有特性的宝可梦外），放于那只宝可梦身上进行进化。并重洗牌库。（对在对战准备时放出的宝可梦，以及这回合刚被放出的宝可梦也可使用。）\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 16413,
      name: '赛吉',
      yorenCode: 'Y1420',
      cardType: '2',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '247/204',
        rarityLabel: 'SAR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/592.png',
      ruleLines: [
        '从自己牌库中选择1张，从自己场上的1只宝可梦进化而来的卡牌（除拥有特性的宝可梦外），放于那只宝可梦身上进行进化。并重洗牌库。（对在对战准备时放出的宝可梦，以及这回合刚被放出的宝可梦也可使用。）',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Tetsu Kayama'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/592.png',
  },
};

function isAbilityPokemon(pokemon: PokemonCard): boolean {
  return pokemon.powers.some(power => power.powerType === PowerType.ABILITY);
}

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const evolutionBlocked: number[] = [];
  let evolutionCount = 0;
  player.deck.cards.forEach((card, index) => {
    const matches = card instanceof PokemonCard && card.stage !== Stage.BASIC && card.stage !== Stage.RESTORED;
    if (matches) {
      evolutionCount += 1;
      return;
    }
    evolutionBlocked.push(index);
  });

  if (evolutionCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      {},
      { min: 1, max: 1, allowCancel: false, blocked: evolutionBlocked }
    ),
    cards => {
      selectedCards = cards || [];
      next();
    }
  );

  const selectedCard = selectedCards[0] as PokemonCard | undefined;
  if (selectedCard === undefined || selectedCard.stage === Stage.BASIC || selectedCard.stage === Stage.RESTORED) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.deck.moveCardTo(selectedCard, player.hand);

  const opponent = StateUtils.getOpponent(state, player);
  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, [selectedCard]),
    () => next()
  );

  const targetBlocked: CardTarget[] = [];
  let hasTarget = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (slot, pokemon, target) => {
    const canEvolve = pokemon.stage < selectedCard.stage
      && pokemon.name === selectedCard.evolvesFrom
      && !isAbilityPokemon(pokemon);
    if (canEvolve) {
      hasTarget = true;
      return;
    }
    targetBlocked.push(target);
  });

  if (!hasTarget) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked: targetBlocked }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  const target = targets[0];
  store.reduceEffect(state, new EvolveEffect(player, target, selectedCard));

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });

  return state;
}

export class SaiJi extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
