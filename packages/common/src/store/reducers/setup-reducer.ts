import { Action } from '../actions/action';
import { AddPlayerAction } from '../actions/add-player-action';
import { AlertPrompt } from '../prompts/alert-prompt';
import { Card } from '../card/card';
import { CardList } from '../state/card-list';
import { CoinFlipPrompt } from '../prompts/coin-flip-prompt';
import { ChooseCardsPrompt } from '../prompts/choose-cards-prompt';
import { DeckAnalyser } from '../../game/cards/deck-analyser';
import { InvitePlayerAction } from '../actions/invite-player-action';
import { InvitePlayerPrompt } from '../prompts/invite-player-prompt';
import { Player } from '../state/player';
import { ShowCardsPrompt } from '../prompts/show-cards-prompt';
import { ShuffleDeckPrompt } from '../prompts/shuffle-prompt';
import { State, GamePhase, GameWinner } from '../state/state';
import { GameError } from '../../game-error';
import { GameMessage, GameLog } from '../../game-message';
import { PlayerType } from '../actions/play-card-action';
import { StoreLike } from '../store-like';
import { SuperType, Stage, CardTag } from '../card/card-types';
import { WhoBeginsEffect } from '../effects/game-phase-effects';
import { endGame } from '../effect-reducers/check-effect';
import { initNextTurn } from '../effect-reducers/game-phase-effect';
import { PokemonSlot } from '../state/pokemon-slot';
import { FilterUtils, FilterType } from '../card/filter-utils';
import { SelectPrompt } from '../prompts/select-prompt';


function putStartingPokemonsAndPrizes(player: Player, cards: Card[]): void {
  if (cards.length === 0) {
    return;
  }
  player.hand.moveCardTo(cards[0], player.active.pokemons);
  for (let i = 1; i < cards.length; i++) {
    player.hand.moveCardTo(cards[i], player.bench[i - 1].pokemons);
  }
  for (let i = 0; i < 6; i++) {
    player.deck.moveTo(player.prizes[i], 1);
  }
}

function* decideStartingPlayer(next: Function, store: StoreLike, state: State): IterableIterator<State> {
  const player = state.players[0];
  const opponent = state.players[1];
  const coinCallerIndex = Math.round(Math.random());
  const coinCaller = state.players[coinCallerIndex];
  const otherPlayer = state.players[coinCallerIndex === 0 ? 1 : 0];
  const coinSideValues = [
    GameMessage.SETUP_COIN_SIDE_HEADS,
    GameMessage.SETUP_COIN_SIDE_TAILS
  ];
  const turnOrderValues = [
    GameMessage.SETUP_TURN_ORDER_FIRST,
    GameMessage.SETUP_TURN_ORDER_SECOND
  ];
  let selectedSide = 0;
  let guessedCorrectly = false;

  store.log(state, GameLog.LOG_SETUP_COIN_TOSS_CALL, { name: coinCaller.name });

  yield store.prompt(
    state,
    new SelectPrompt(
      coinCaller.id,
      GameMessage.SETUP_CHOOSE_COIN_SIDE,
      coinSideValues,
      { allowCancel: false }
    ),
    result => {
      selectedSide = result;
      store.log(state, GameLog.LOG_SETUP_COIN_TOSS_CHOICE, {
        name: coinCaller.name,
        choice: coinSideValues[selectedSide]
      });
      next();
    }
  );

  yield store.prompt(
    state,
    new CoinFlipPrompt(coinCaller.id, GameMessage.SETUP_WHO_BEGINS_FLIP),
    result => {
      guessedCorrectly = selectedSide === (result ? 0 : 1);
      if (guessedCorrectly) {
        store.log(state, GameLog.LOG_SETUP_COIN_TOSS_WON, { name: coinCaller.name });
      } else {
        store.log(state, GameLog.LOG_SETUP_COIN_TOSS_LOST, {
          name: coinCaller.name,
          opponent: otherPlayer.name
        });
      }
      next();
    }
  );

  const decisionPlayer = guessedCorrectly ? coinCaller : otherPlayer;
  yield store.prompt(
    state,
    new SelectPrompt(
      decisionPlayer.id,
      GameMessage.SETUP_CHOOSE_TURN_ORDER,
      turnOrderValues,
      { allowCancel: false }
    ),
    turnOrder => {
      state.activePlayer = turnOrder === 0
        ? state.players.indexOf(decisionPlayer)
        : state.players.indexOf(decisionPlayer === player ? opponent : player);
      store.log(state, GameLog.LOG_SETUP_TURN_ORDER_CHOICE, {
        name: decisionPlayer.name,
        choice: turnOrderValues[turnOrder]
      });
      next();
    }
  );
}

function* setupGame(next: Function, store: StoreLike, state: State): IterableIterator<State> {
  const basicPokemon: FilterType = [
    {superType: SuperType.POKEMON, stage: Stage.BASIC},
    {superType: SuperType.TRAINER, tags: [CardTag.FOSSIL]}
  ];
  const chooseCardsOptions = { min: 1, max: 6, allowCancel: false };
  const player = state.players[0];
  const opponent = state.players[1];

  yield* decideStartingPlayer(next, store, state);

  let playerHasBasic = false;
  let opponentHasBasic = false;

  while (!playerHasBasic || !opponentHasBasic) {
    if (!playerHasBasic) {
      player.hand.moveTo(player.deck);
      yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
        player.deck.applyOrder(order);
        player.deck.moveTo(player.hand, 7);
        playerHasBasic = FilterUtils.count(player.hand.cards, basicPokemon) > 0;
        next();
      });
    }

    if (!opponentHasBasic) {
      opponent.hand.moveTo(opponent.deck);
      yield store.prompt(state, new ShuffleDeckPrompt(opponent.id), order => {
        opponent.deck.applyOrder(order);
        opponent.deck.moveTo(opponent.hand, 7);
        opponentHasBasic = FilterUtils.count(opponent.hand.cards, basicPokemon) > 0;
        next();
      });
    }

    if (playerHasBasic && !opponentHasBasic) {
      store.log(state, GameLog.LOG_SETUP_NO_BASIC_POKEMON, { name: opponent.name });
      yield store.prompt(state, [
        new ShowCardsPrompt(player.id, GameMessage.SETUP_OPPONENT_NO_BASIC,
          opponent.hand.cards, { allowCancel: true }),
        new AlertPrompt(opponent.id, GameMessage.SETUP_PLAYER_NO_BASIC)
      ], results => {
        if (results[0]) {
          player.deck.moveTo(player.hand, 1);
        }
        next();
      });
    }

    if (!playerHasBasic && opponentHasBasic) {
      store.log(state, GameLog.LOG_SETUP_NO_BASIC_POKEMON, { name: player.name });
      yield store.prompt(state, [
        new ShowCardsPrompt(opponent.id, GameMessage.SETUP_OPPONENT_NO_BASIC,
          player.hand.cards, { allowCancel: true }),
        new AlertPrompt(player.id, GameMessage.SETUP_PLAYER_NO_BASIC)
      ], results => {
        if (results[0]) {
          opponent.deck.moveTo(opponent.hand, 1);
        }
        next();
      });
    }
  }

  yield store.prompt(state, [
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_STARTING_POKEMONS,
      player.hand,
      basicPokemon,
      chooseCardsOptions
    ),
    new ChooseCardsPrompt(
      opponent.id,
      GameMessage.CHOOSE_STARTING_POKEMONS,
      opponent.hand,
      basicPokemon,
      chooseCardsOptions
    )
  ], choice => {
    putStartingPokemonsAndPrizes(player, choice[0]);
    putStartingPokemonsAndPrizes(opponent, choice[1]);
    next();
  });

  const whoBeginsEffect = new WhoBeginsEffect();
  store.reduceEffect(state, whoBeginsEffect);

  if (whoBeginsEffect.player) {
    state.activePlayer = state.players.indexOf(whoBeginsEffect.player);
  }

  if (state.activePlayer !== 0 && state.activePlayer !== 1) {
    state.activePlayer = 0;
  }

  // Set initial Pokemon Played Turn, so players can't evolve during first turn
  const first = state.players[state.activePlayer];
  const second = state.players[state.activePlayer ? 0 : 1];
  first.forEachPokemon(PlayerType.BOTTOM_PLAYER, cardList => { cardList.pokemonPlayedTurn = 1; });
  second.forEachPokemon(PlayerType.TOP_PLAYER, cardList => { cardList.pokemonPlayedTurn = 2; });

  return initNextTurn(store, state);
}

function createPlayer(id: number, name: string): Player {
  const player = new Player();
  player.id = id;
  player.name = name;

  // Empty prizes, places for 6 cards
  for (let i = 0; i < 6; i++) {
    const prize = new CardList();
    prize.isSecret = true;
    player.prizes.push(prize);
  }

  // Empty bench, places for 5 pokemons
  for (let i = 0; i < 5; i++) {
    const bench = new PokemonSlot();
    bench.pokemons.isPublic = true;
    bench.energies.isPublic = true;
    bench.trainers.isPublic = true;
    player.bench.push(bench);
  }

  player.active.pokemons.isPublic = true;
  player.active.energies.isPublic = true;
  player.active.trainers.isPublic = true;
  player.discard.isPublic = true;
  player.lostzone.isPublic = true;
  player.stadium.isPublic = true;
  player.supporter.isPublic = true;
  player.refreshCardListTargets();
  return player;
}

export function setupPhaseReducer(store: StoreLike, state: State, action: Action): State {

  if (state.phase === GamePhase.WAITING_FOR_PLAYERS) {

    if (action instanceof AddPlayerAction) {
      if (state.players.length >= 2) {
        throw new GameError(GameMessage.MAX_PLAYERS_REACHED);
      }

      if (state.players.length == 1 && state.players[0].id === action.clientId) {
        throw new GameError(GameMessage.ALREADY_PLAYING);
      }

      const deckAnalyser = new DeckAnalyser(action.deck);
      if (!deckAnalyser.isValid()) {
        throw new GameError(GameMessage.INVALID_DECK);
      }
      const formatName = state.rules.formatName;
      if (formatName && !deckAnalyser.getDeckFormats().some(f => f.name === formatName)) {
        throw new GameError(GameMessage.INVALID_DECK);
      }

      const player = createPlayer(action.clientId, action.name);
      player.deck = CardList.fromList(action.deck);
      player.deck.isSecret = true;
      player.refreshCardListTargets();
      player.deck.cards.forEach(c => {
        state.cardNames.push(c.fullName);
        c.id = state.cardNames.length - 1;
      });

      state.players.push(player);

      if (state.players.length === 2) {
        state.phase = GamePhase.SETUP;
        const generator = setupGame(() => generator.next(), store, state);
        return generator.next().value;
      }

      return state;
    }

    if (action instanceof InvitePlayerAction) {
      if (state.players.length >= 2) {
        throw new GameError(GameMessage.MAX_PLAYERS_REACHED);
      }

      if (state.players.length == 1 && state.players[0].id === action.clientId) {
        throw new GameError(GameMessage.ALREADY_PLAYING);
      }

      const player = createPlayer(action.clientId, action.name);
      state.players.push(player);

      state = store.prompt(state, new InvitePlayerPrompt(
        player.id,
        GameMessage.INVITATION_MESSAGE
      ), deck => {
        if (deck === null) {
          store.log(state, GameLog.LOG_INVITATION_NOT_ACCEPTED, { name: player.name });
          const winner = GameWinner.NONE;
          state = endGame(store, state, winner);
          return;
        }
        const deckAnalyser = new DeckAnalyser(deck);
        if (!deckAnalyser.isValid()) {
          throw new GameError(GameMessage.INVALID_DECK);
        }

        player.deck = CardList.fromList(deck);
        player.deck.isSecret = true;
        player.refreshCardListTargets();
        player.deck.cards.forEach(c => {
          state.cardNames.push(c.fullName);
          c.id = state.cardNames.length - 1;
        });

        if (state.players.length === 2) {
          state.phase = GamePhase.SETUP;
          const generator = setupGame(() => generator.next(), store, state);
          return generator.next().value;
        }
      });
    }
  }

  return state;
}
