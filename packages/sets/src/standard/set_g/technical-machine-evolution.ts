import {
  Card,
  CardTarget,
  CardType,
  CheckProvidedEnergyEffect,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  ShuffleDeckPrompt,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

function getEvolutionStage(stage: Stage): Stage | undefined {
  if (stage === Stage.BASIC) {
    return Stage.STAGE_1;
  }
  if (stage === Stage.STAGE_1) {
    return Stage.STAGE_2;
  }
  return undefined;
}

function getAvailableEvolutionCards(playerDeck: Card[], sourcePokemon: PokemonCard): PokemonCard[] {
  const evolutionStage = getEvolutionStage(sourcePokemon.stage);
  if (!evolutionStage) {
    return [];
  }

  return playerDeck.filter(
    card => card instanceof PokemonCard
      && card.evolvesFrom === sourcePokemon.name
      && card.stage === evolutionStage
  ) as PokemonCard[];
}

export class TechnicalMachineEvolution extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 16922,
      name: '招式学习器 进化',
      yorenCode: 'Y1347',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '025/033',
      },
      image: 'img\\329\\24.png',
      hash: 'f96d2f33e8f87ec6b37dc59b80edffe1',
    },
    collection: {
      id: 329,
      name: '大师战略卡组构筑套装 沙奈朵ex',
      commodityCode: 'CSVM1bC',
      salesDate: '2026-01-16',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/329/24.png',
  };

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'set_g';

  public name: string = 'Technical Machine: Evolution';

  public fullName: string = 'Technical Machine: Evolution CSVM1bC';

  public text: string =
    'The Pokemon this card is attached to can use the attack on this card. (You still need the necessary Energy to use this attack.) ' +
    'If this card is attached to 1 of your Pokemon, discard it at the end of your turn. ' +
    'Evolution: Choose up to 2 of your Benched Pokemon. For each of those Pokemon, search your deck for a card that evolves from that Pokemon and put it onto that Pokemon to evolve it. Then, shuffle your deck.';

  public useWhenInPlay = true;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseTrainerInPlayEffect && effect.trainerCard === this) {
      const player = effect.player;
      const sourcePokemon = effect.target.getPokemonCard();
      if (!sourcePokemon || !effect.target.trainers.cards.includes(this)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player, effect.target);
      state = store.reduceEffect(state, checkProvidedEnergy);
      if (!StateUtils.checkEnoughEnergy(checkProvidedEnergy.energyMap, [CardType.COLORLESS])) {
        throw new GameError(GameMessage.NOT_ENOUGH_ENERGY);
      }

      const blocked: CardTarget[] = [];
      player.bench.forEach((slot, index) => {
        const pokemonCard = slot.getPokemonCard();
        if (!pokemonCard || getAvailableEvolutionCards(player.deck.cards, pokemonCard).length === 0) {
          blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
        }
      });

      const allBlocked = blocked.length === player.bench.length;
      if (allBlocked) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.BENCH],
          { min: 0, max: 2, allowCancel: true, blocked }
        ),
        targets => {
          const selectedTargets = targets || [];
          if (selectedTargets.length === 0) {
            return;
          }

          for (const target of selectedTargets) {
            const targetPokemon = target.getPokemonCard();
            if (!targetPokemon) {
              continue;
            }

            const evolutions = getAvailableEvolutionCards(player.deck.cards, targetPokemon);
            if (evolutions.length === 0) {
              continue;
            }

            const blockedIndexes: number[] = [];
            player.deck.cards.forEach((card, index) => {
              if (!(card instanceof PokemonCard)
                || card.evolvesFrom !== targetPokemon.name
                || card.stage !== getEvolutionStage(targetPokemon.stage)) {
                blockedIndexes.push(index);
              }
            });

            store.prompt(
              state,
              new ChooseCardsPrompt(
                player.id,
                GameMessage.CHOOSE_CARD_TO_EVOLVE,
                player.deck,
                {},
                { min: 1, max: 1, allowCancel: false, blocked: blockedIndexes }
              ),
              cards => {
                const selectedCard = (cards || [])[0];
                if (selectedCard instanceof PokemonCard) {
                  player.deck.moveCardTo(selectedCard, target.pokemons);
                  target.pokemonPlayedTurn = state.turn;
                  target.clearEffects();
                }
              }
            );
          }

          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      if (!slot) {
        return state;
      }

      const owner = StateUtils.findOwner(state, slot);
      if (owner !== effect.player) {
        return state;
      }

      slot.trainers.moveCardTo(this, owner.discard);
      return state;
    }

    return state;
  }
}
