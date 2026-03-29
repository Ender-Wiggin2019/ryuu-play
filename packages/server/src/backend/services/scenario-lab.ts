import {
  Action,
  AddPlayerAction,
  AppendLogAction,
  AttackAction,
  Card,
  CardList,
  CardManager,
  CardTarget,
  ChangeAvatarAction,
  GameLog,
  GameSettings,
  PassTurnAction,
  PlayCardAction,
  PokemonCard,
  ReorderBenchAction,
  ReorderHandAction,
  ResolvePromptAction,
  RetreatAction,
  Rules,
  GamePhase,
  SuperType,
  EnergyType,
  SpecialCondition,
  Stage,
  State,
  UseAbilityAction,
  UseStadiumAction,
  UseTrainerInPlayAction,
  generateId,
  deepClone
} from '@ptcg/common';
import { Core } from '../../game/core/core';
import { Game } from '../../game/core/game';
import { Client } from '../../game/client/client.interface';
import { Message, User } from '../../storage';

export type ScenarioActor = 'PLAYER_1' | 'PLAYER_2';
export type ScenarioExportScope = 'bench' | 'active' | 'player' | 'board' | 'full';

type ScenarioPayload = Record<string, unknown>;

interface ScenarioRecord {
  gameId: number;
  player1ClientId: number;
  player2ClientId: number;
}

interface ScenarioZoneRef {
  player: ScenarioActor;
  zone: string;
  slotIndex?: number;
}

interface AssertResult {
  type: string;
  passed: boolean;
  message: string;
}

class PassiveScenarioClient implements Client {
  public id = 0;
  public name: string;
  public user: User;
  public core: Core | undefined;
  public games: Game[] = [];

  constructor(name: string, user: User) {
    this.name = name;
    this.user = user;
  }

  public onConnect(client: Client): void { }
  public onDisconnect(client: Client): void { }
  public onUsersUpdate(users: User[]): void { }
  public onGameAdd(game: Game): void { }
  public onGameDelete(game: Game): void { }
  public onGameJoin(game: Game, client: Client): void { }
  public onGameLeave(game: Game, client: Client): void { }
  public onStateChange(game: Game, state: State): void { }
  public onMessage(from: Client, message: Message): void { }
  public onMessageRead(user: User): void { }
}

export class ScenarioLabService {
  private static readonly scenarios = new Map<number, ScenarioRecord>();
  private static readonly pendingScenarioGameIds = new Set<number>();

  constructor(private readonly core: Core) { }

  public static isScenarioGame(gameId: number): boolean {
    return ScenarioLabService.scenarios.has(gameId)
      || ScenarioLabService.pendingScenarioGameIds.has(gameId);
  }

  public createScenario(options: {
    viewerClient?: Client;
    viewerUser: User;
    player1Deck?: string[];
    player2Deck?: string[];
    formatName?: string;
  }): { scenarioId: number; player1Id: number; player2Id: number; state: any } {
    const player1Deck = options.player1Deck && options.player1Deck.length > 0
      ? options.player1Deck
      : this.buildAutoDeck(options.formatName);
    const player2Deck = options.player2Deck && options.player2Deck.length > 0
      ? options.player2Deck
      : this.buildAutoDeck(options.formatName);

    this.validateDeck(player1Deck);
    this.validateDeck(player2Deck);

    const settings = new GameSettings();
    settings.timeLimit = 0;
    settings.recordingEnabled = true;
    settings.rules = this.getRulesForFormat((options.formatName || '').trim());

    const viewerName = options.viewerUser.name || 'Scenario';
    const player1 = this.createPassiveClient(`${viewerName}-Scenario-P1`, options.viewerUser);
    const player2 = this.createPassiveClient(`${viewerName}-Scenario-P2`, options.viewerUser);
    const scenarioId = generateId(this.core.games);
    ScenarioLabService.pendingScenarioGameIds.add(scenarioId);
    const game = this.core.createGame(player1, player1Deck, settings, player2);
    ScenarioLabService.pendingScenarioGameIds.delete(scenarioId);
    const invitePrompt = game.state.prompts.find(prompt =>
      prompt.playerId === player2.id && prompt.result === undefined
    );
    if (invitePrompt) {
      game.dispatch(player2, new ResolvePromptAction(invitePrompt.id, player2Deck));
    }

    if (options.viewerClient) {
      this.core.joinGame(options.viewerClient, game);
    }
    ScenarioLabService.scenarios.set(game.id, {
      gameId: game.id,
      player1ClientId: player1.id,
      player2ClientId: player2.id
    });

    return {
      scenarioId: game.id,
      player1Id: player1.id,
      player2Id: player2.id,
      state: this.exportState(game.state, 'full')
    };
  }

  public deleteScenario(scenarioId: number): void {
    const record = ScenarioLabService.scenarios.get(scenarioId);
    if (!record) {
      throw new Error('SCENARIO_NOT_FOUND');
    }

    const game = this.core.games.find(item => item.id === record.gameId);
    if (!game) {
      ScenarioLabService.scenarios.delete(scenarioId);
      throw new Error('GAME_INVALID_ID');
    }

    this.core.deleteGame(game);
    ScenarioLabService.scenarios.delete(scenarioId);

    for (const clientId of [record.player1ClientId, record.player2ClientId]) {
      const client = this.core.clients.find(item => item.id === clientId);
      if (client) {
        this.core.disconnect(client);
      }
    }
  }

  public getScenarioState(scenarioId: number): any {
    return this.exportState(this.getScenarioGame(scenarioId).state, 'full');
  }

  public dispatchAction(scenarioId: number, actor: ScenarioActor, actionType: string, payload: any): void {
    const game = this.getScenarioGame(scenarioId);
    const client = this.getActorClient(scenarioId, actor);
    const action = this.createAction(client.id, actionType, this.readPayload(payload));
    game.dispatch(client, action);
  }

  public resolvePrompt(scenarioId: number, actor: ScenarioActor, promptId: number, result: any): void {
    const game = this.getScenarioGame(scenarioId);
    const client = this.getActorClient(scenarioId, actor);
    const prompt = game.state.prompts.find(item => item.id === promptId);
    if (!prompt) {
      throw new Error('PROMPT_INVALID_ID');
    }
    if (prompt.playerId !== client.id) {
      throw new Error('PROMPT_NOT_FOR_ACTOR');
    }
    const decoded = prompt.decode(result, game.state);
    if (!prompt.validate(decoded, game.state)) {
      throw new Error('PROMPT_INVALID_RESULT');
    }
    game.dispatch(client, new ResolvePromptAction(promptId, decoded));
  }

  public applyPatch(scenarioId: number, operations: any[]): any {
    const game = this.getScenarioGame(scenarioId);

    for (const operation of operations || []) {
      const patch = this.readPayload(operation);
      const op = String(patch.op || '');
      if (op === 'setDamage') {
        const slot = this.resolvePokemonSlot(game.state, patch.target);
        slot.damage = Number(patch.damage) || 0;
      } else if (op === 'setSpecialCondition') {
        const slot = this.resolvePokemonSlot(game.state, patch.target);
        slot.specialConditions = this.readStringArray(patch.conditions)
          .map(name => (SpecialCondition as any)[name])
          .filter(value => value !== undefined);
      } else if (op === 'setTurnMarker') {
        const player = this.resolvePlayer(game.state, patch.player);
        const marker = String(patch.marker || '');
        const value = Number(patch.value) || 0;
        if (marker === 'energyPlayedTurn') player.energyPlayedTurn = value;
        if (marker === 'retreatedTurn') player.retreatedTurn = value;
        if (marker === 'stadiumPlayedTurn') player.stadiumPlayedTurn = value;
        if (marker === 'stadiumUsedTurn') player.stadiumUsedTurn = value;
      } else if (op === 'setZoneCards') {
        const zone = this.resolveZone(game.state, patch.target as ScenarioZoneRef | undefined);
        zone.cards = this.toCards(this.readStringArray(patch.cards));
      } else if (op === 'moveCard') {
        const from = this.resolveZone(game.state, patch.from as ScenarioZoneRef | undefined);
        const to = this.resolveZone(game.state, patch.to as ScenarioZoneRef | undefined);
        const index = Number(patch.index);
        if (Number.isFinite(index) && index >= 0 && index < from.cards.length) {
          const [card] = from.cards.splice(index, 1);
          if (card !== undefined) {
            to.cards.push(card);
          }
        }
      } else if (op === 'clearPrompts') {
        game.state.prompts = [];
      } else if (op === 'setState') {
        if (typeof patch.phase === 'number' && patch.phase >= GamePhase.WAITING_FOR_PLAYERS && patch.phase <= GamePhase.FINISHED) {
          game.state.phase = patch.phase;
        }
        if (typeof patch.turn === 'number' && Number.isFinite(patch.turn)) {
          game.state.turn = Math.max(0, Math.floor(patch.turn));
        }
        if (typeof patch.activePlayer === 'number' && Number.isFinite(patch.activePlayer)) {
          game.state.activePlayer = Math.max(0, Math.floor(patch.activePlayer));
        }
        if (typeof patch.winner === 'number' && Number.isFinite(patch.winner)) {
          game.state.winner = patch.winner;
        }
      }
    }

    this.rebuildCardNames(game.state);
    this.syncCardIds(game.state);
    game.state.players.forEach(player => player.refreshCardListTargets());
    game.onStateChange(game.state);
    return this.exportState(game.state, 'full');
  }

  public exportScenarioState(scenarioId: number, scope: ScenarioExportScope, player?: ScenarioActor): any {
    return this.exportState(this.getScenarioGame(scenarioId).state, scope, player);
  }

  public assertState(scenarioId: number, checks: any[]): { passed: boolean; summary: string; checks: AssertResult[] } {
    const exported = this.exportScenarioState(scenarioId, 'full');
    const results: AssertResult[] = [];

    for (const check of checks || []) {
      const type = String(check?.type || 'unknown');
      let passed = false;
      let message = `${type}: unsupported`;

      if (type === 'zoneCount') {
        const zone = this.readZone(exported, check.player, check.zone, check.slotIndex);
        const expected = Number(check.expected);
        passed = !!zone && zone.length === expected;
        message = `zoneCount expected=${expected} actual=${zone ? zone.length : 'N/A'}`;
      } else if (type === 'cardInZone') {
        const zone = this.readZone(exported, check.player, check.zone, check.slotIndex) || [];
        const cardName = String(check.cardName || '');
        passed = zone.some((card: any) => card.fullName === cardName || card.name === cardName);
        message = `cardInZone card=${cardName}`;
      } else if (type === 'damage') {
        const slot = this.readSlot(exported, check.player, check.slot, check.slotIndex);
        const expected = Number(check.expected);
        passed = !!slot && Number(slot.damage) === expected;
        message = `damage expected=${expected} actual=${slot ? Number(slot.damage) : 'N/A'}`;
      } else if (type === 'specialCondition') {
        const slot = this.readSlot(exported, check.player, check.slot, check.slotIndex);
        const expected = String(check.condition || '');
        const conditions = slot?.specialConditions || [];
        passed = conditions.includes(expected);
        message = `specialCondition condition=${expected}`;
      } else if (type === 'energyAttached') {
        const slot = this.readSlot(exported, check.player, check.slot, check.slotIndex);
        const expected = Number(check.expected);
        const actual = (slot?.energies || []).length;
        passed = actual === expected;
        message = `energyAttached expected=${expected} actual=${actual}`;
      } else if (type === 'prizeRemaining') {
        const player = this.readPlayer(exported, check.player);
        const expected = Number(check.expected);
        const actual = Number(player?.prizeLeft ?? -1);
        passed = actual === expected;
        message = `prizeRemaining expected=${expected} actual=${actual}`;
      } else if (type === 'turnMarker') {
        const player = this.readPlayer(exported, check.player);
        const marker = String(check.marker || '');
        const expected = Number(check.expected);
        const actual = Number(player?.markers?.[marker] ?? -1);
        passed = actual === expected;
        message = `turnMarker ${marker} expected=${expected} actual=${actual}`;
      } else if (type === 'promptPending') {
        const expected = Number(check.expected);
        const actual = (exported.prompts || []).length;
        passed = actual === expected;
        message = `promptPending expected=${expected} actual=${actual}`;
      }
      results.push({ type, passed, message });
    }

    const passed = results.every(result => result.passed);
    const failed = results.filter(result => !result.passed).length;
    return {
      passed,
      summary: passed ? `All ${results.length} checks passed` : `${failed}/${results.length} checks failed`,
      checks: results
    };
  }

  private createPassiveClient(name: string, baseUser: User): Client {
    const user = new User();
    user.id = baseUser.id;
    user.name = name;
    user.email = baseUser.email;
    user.avatarFile = baseUser.avatarFile;
    user.ranking = baseUser.ranking;
    user.registered = baseUser.registered;
    user.lastSeen = baseUser.lastSeen;
    user.lastRankingChange = baseUser.lastRankingChange;
    return this.core.connect(new PassiveScenarioClient(name, user));
  }

  private getScenarioGame(scenarioId: number): Game {
    const record = ScenarioLabService.scenarios.get(scenarioId);
    if (!record) {
      throw new Error('SCENARIO_NOT_FOUND');
    }
    const game = this.core.games.find(item => item.id === record.gameId);
    if (!game) {
      throw new Error('GAME_INVALID_ID');
    }
    return game;
  }

  private getActorClient(scenarioId: number, actor: ScenarioActor): Client {
    const record = ScenarioLabService.scenarios.get(scenarioId);
    if (!record) {
      throw new Error('SCENARIO_NOT_FOUND');
    }
    const clientId = actor === 'PLAYER_1' ? record.player1ClientId : record.player2ClientId;
    const client = this.core.clients.find(item => item.id === clientId);
    if (!client) {
      throw new Error('ACTOR_NOT_FOUND');
    }
    return client;
  }

  private createAction(clientId: number, actionType: string, payload: ScenarioPayload): Action {
    switch (actionType) {
      case 'passTurn': return new PassTurnAction(clientId);
      case 'attack': return new AttackAction(clientId, String(payload.attack || ''));
      case 'ability': return new UseAbilityAction(clientId, String(payload.ability || ''), payload.target as CardTarget);
      case 'stadium': return new UseStadiumAction(clientId);
      case 'trainer': return new UseTrainerInPlayAction(clientId, payload.target as CardTarget, String(payload.cardName || ''));
      case 'playCard': return new PlayCardAction(clientId, Number(payload.handIndex), payload.target as CardTarget);
      case 'retreat': return new RetreatAction(clientId, Number(payload.to));
      case 'reorderBench': return new ReorderBenchAction(clientId, Number(payload.from), Number(payload.to));
      case 'reorderHand': return new ReorderHandAction(clientId, this.readNumberArray(payload.order));
      case 'appendLog': return new AppendLogAction(clientId, GameLog.LOG_TEXT, { text: String(payload.message || '') });
      case 'changeAvatar': return new ChangeAvatarAction(clientId, String(payload.avatarName || ''));
      case 'play':
        return new AddPlayerAction(clientId, String(payload.name || 'Scenario Player'), this.readStringArray(payload.deck));
      default:
        throw new Error(`UNSUPPORTED_ACTION:${actionType}`);
    }
  }

  private buildAutoDeck(formatName?: string): string[] {
    const manager = CardManager.getInstance();
    const format = formatName
      ? manager.getAllFormats().find(item => item.name === formatName)
      : undefined;
    const cards = format ? format.cards : manager.getAllCards();

    const basicPokemon = cards.find(card => {
      if (!(card instanceof PokemonCard)) {
        return false;
      }
      return card.stage === Stage.BASIC;
    });
    if (!basicPokemon) {
      throw new Error('AUTO_DECK_NO_BASIC_POKEMON');
    }

    const basicEnergy = cards.find(card => {
      const energy = card as any;
      return energy.superType === SuperType.ENERGY && energy.energyType === EnergyType.BASIC;
    });
    if (!basicEnergy) {
      throw new Error('AUTO_DECK_NO_BASIC_ENERGY');
    }

    const deck: string[] = [];
    for (let i = 0; i < 4; i++) {
      deck.push(basicPokemon.fullName);
    }
    for (let i = 0; i < 56; i++) {
      deck.push(basicEnergy.fullName);
    }
    return deck;
  }

  private validateDeck(deck: string[]): void {
    if (!(deck instanceof Array)) {
      throw new Error('DECK_INVALID');
    }
    const manager = CardManager.getInstance();
    if (!deck.every(name => typeof name === 'string' && manager.isCardDefined(name))) {
      throw new Error('DECK_INVALID');
    }
  }

  private getRulesForFormat(formatName: string): Rules {
    const format = CardManager.getInstance().getAllFormats().find(item => item.name === formatName);
    return format ? new Rules({ ...format.rules, formatName }) : new Rules({ formatName });
  }

  private resolvePlayer(state: State, side: unknown) {
    if (side !== 'PLAYER_1' && side !== 'PLAYER_2') {
      throw new Error('ACTOR_INVALID');
    }
    const player = side === 'PLAYER_1' ? state.players[0] : state.players[1];
    if (!player) {
      throw new Error('PLAYER_NOT_FOUND');
    }
    return player;
  }

  private resolvePokemonSlot(state: State, target: unknown) {
    const ref = this.readPayload(target);
    const player = this.resolvePlayer(state, ref.player);
    const slot = String(ref.slot || 'ACTIVE').toUpperCase();
    const index = Number(ref.index || 0);
    if (slot === 'ACTIVE') {
      return player.active;
    }
    if (slot === 'BENCH' && player.bench[index]) {
      return player.bench[index];
    }
    throw new Error('SLOT_INVALID');
  }

  private resolveZone(state: State, ref: ScenarioZoneRef | null | undefined): CardList<Card> {
    if (ref === undefined || ref === null) {
      throw new Error('ZONE_INVALID');
    }
    const player = this.resolvePlayer(state, ref.player);
    const zone = String(ref.zone || '');
    if (zone === 'deck') return player.deck;
    if (zone === 'hand') return player.hand;
    if (zone === 'discard') return player.discard;
    if (zone === 'lostzone') return player.lostzone;
    if (zone === 'stadium') return player.stadium;
    if (zone === 'supporter') return player.supporter;
    if (zone === 'prize') {
      const index = Number(ref.slotIndex || 0);
      if (!player.prizes[index]) throw new Error('PRIZE_SLOT_INVALID');
      return player.prizes[index];
    }
    if (zone === 'active.pokemons') return player.active.pokemons as CardList<Card>;
    if (zone === 'active.energies') return player.active.energies as CardList<Card>;
    if (zone === 'active.trainers') return player.active.trainers as CardList<Card>;
    if (zone.startsWith('bench.')) {
      const index = Number(ref.slotIndex || 0);
      const bench = player.bench[index];
      if (!bench) throw new Error('BENCH_SLOT_INVALID');
      if (zone === 'bench.pokemons') return bench.pokemons as CardList<Card>;
      if (zone === 'bench.energies') return bench.energies as CardList<Card>;
      if (zone === 'bench.trainers') return bench.trainers as CardList<Card>;
    }
    throw new Error('ZONE_INVALID');
  }

  private toCards(fullNames: string[]): Card[] {
    const manager = CardManager.getInstance();
    return fullNames.map(fullName => {
      const card = manager.getCardByName(String(fullName));
      if (!card) throw new Error(`UNKNOWN_CARD:${fullName}`);
      return deepClone(card, [Card]);
    });
  }

  private exportState(state: State, scope: ScenarioExportScope, playerSide?: ScenarioActor): any {
    const players = state.players.map((player, index) => {
      const side: ScenarioActor = index === 0 ? 'PLAYER_1' : 'PLAYER_2';
      return {
        side,
        id: player.id,
        name: player.name,
        markers: {
          retreatedTurn: player.retreatedTurn,
          energyPlayedTurn: player.energyPlayedTurn,
          stadiumPlayedTurn: player.stadiumPlayedTurn,
          stadiumUsedTurn: player.stadiumUsedTurn
        },
        prizeLeft: player.getPrizeLeft(),
        zones: {
          deck: this.exportCards(player.deck),
          hand: this.exportCards(player.hand),
          discard: this.exportCards(player.discard),
          lostzone: this.exportCards(player.lostzone),
          stadium: this.exportCards(player.stadium),
          supporter: this.exportCards(player.supporter),
          prizes: player.prizes.map(item => this.exportCards(item))
        },
        active: this.exportSlot(player.active),
        bench: player.bench.map(item => this.exportSlot(item))
      };
    });

    const base = {
      turn: state.turn,
      phase: state.phase,
      activePlayer: state.activePlayer,
      winner: state.winner,
      prompts: state.prompts.filter(item => item.result === undefined).map(prompt => ({
        id: prompt.id,
        playerId: prompt.playerId,
        type: prompt.constructor.name
      })),
      players
    };
    if (scope === 'full') return base;

    const selected = playerSide ? players.find(player => player.side === playerSide) : players[0];
    if (!selected) return base;
    if (scope === 'player') return { turn: base.turn, phase: base.phase, player: selected };
    if (scope === 'active') return { turn: base.turn, phase: base.phase, player: selected.side, active: selected.active };
    if (scope === 'bench') return { turn: base.turn, phase: base.phase, player: selected.side, bench: selected.bench };
    return {
      turn: base.turn,
      phase: base.phase,
      players: players.map(player => ({
        side: player.side,
        active: player.active,
        bench: player.bench,
        zones: {
          discard: player.zones.discard,
          lostzone: player.zones.lostzone,
          prizes: player.zones.prizes
        }
      }))
    };
  }

  private exportSlot(slot: any): any {
    return {
      damage: Number(slot?.damage || 0),
      specialConditions: (slot?.specialConditions || []).map((condition: any) => SpecialCondition[condition]),
      pokemons: this.exportCards(slot?.pokemons || new CardList<Card>()),
      energies: this.exportCards(slot?.energies || new CardList<Card>()),
      trainers: this.exportCards(slot?.trainers || new CardList<Card>())
    };
  }

  private exportCards(list: CardList<Card>): any[] {
    const cards = list?.cards || [];
    return cards.map((card, index) => ({
      cardInstanceId: card.id,
      cardIndex: index,
      name: card.name,
      fullName: card.fullName,
      superType: card.superType
    }));
  }

  private readPlayer(state: any, side: ScenarioActor): any {
    return (state.players || []).find((player: any) => player.side === side);
  }

  private readZone(state: any, side: ScenarioActor, zone: string, slotIndex?: number): any[] | undefined {
    const player = this.readPlayer(state, side);
    if (!player) return undefined;
    if (zone === 'deck' || zone === 'hand' || zone === 'discard' || zone === 'lostzone' || zone === 'stadium' || zone === 'supporter') {
      return player.zones?.[zone];
    }
    if (zone === 'prize') return player.zones?.prizes?.[Number(slotIndex || 0)];
    if (zone === 'active.pokemons') return player.active?.pokemons;
    if (zone === 'active.energies') return player.active?.energies;
    if (zone === 'active.trainers') return player.active?.trainers;
    if (zone === 'bench.pokemons') return player.bench?.[Number(slotIndex || 0)]?.pokemons;
    if (zone === 'bench.energies') return player.bench?.[Number(slotIndex || 0)]?.energies;
    if (zone === 'bench.trainers') return player.bench?.[Number(slotIndex || 0)]?.trainers;
    return undefined;
  }

  private readSlot(state: any, side: ScenarioActor, slot: string, slotIndex?: number): any {
    const player = this.readPlayer(state, side);
    if (!player) return undefined;
    if (slot === 'ACTIVE') return player.active;
    if (slot === 'BENCH') return player.bench?.[Number(slotIndex || 0)];
    return undefined;
  }

  private readPayload(value: unknown): ScenarioPayload {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as ScenarioPayload;
    }
    return {};
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter(item => typeof item === 'string');
  }

  private readNumberArray(value: unknown): number[] {
    if (!Array.isArray(value)) return [];
    return value
      .map(item => Number(item))
      .filter(item => Number.isFinite(item));
  }

  private rebuildCardNames(state: State): void {
    const names = new Set<string>();
    state.players.forEach(player => {
      const collect = (list: CardList<Card>) => {
        list.cards.forEach(card => names.add(card.fullName));
      };

      collect(player.deck);
      collect(player.hand);
      collect(player.discard);
      collect(player.lostzone);
      collect(player.stadium);
      collect(player.supporter);
      player.prizes.forEach(collect);

      collect(player.active.pokemons as CardList<Card>);
      collect(player.active.energies as CardList<Card>);
      collect(player.active.trainers as CardList<Card>);
      player.bench.forEach(slot => {
        collect(slot.pokemons as CardList<Card>);
        collect(slot.energies as CardList<Card>);
        collect(slot.trainers as CardList<Card>);
      });
    });
    state.cardNames = [...names];
  }

  private syncCardIds(state: State): void {
    const indexByName = new Map<string, number>();
    state.cardNames.forEach((name, index) => indexByName.set(name, index));

    state.players.forEach(player => {
      const sync = (list: CardList<Card>) => {
        list.cards.forEach(card => {
          const index = indexByName.get(card.fullName);
          card.id = index === undefined ? -1 : index;
        });
      };

      sync(player.deck);
      sync(player.hand);
      sync(player.discard);
      sync(player.lostzone);
      sync(player.stadium);
      sync(player.supporter);
      player.prizes.forEach(sync);

      sync(player.active.pokemons as CardList<Card>);
      sync(player.active.energies as CardList<Card>);
      sync(player.active.trainers as CardList<Card>);
      player.bench.forEach(slot => {
        sync(slot.pokemons as CardList<Card>);
        sync(slot.energies as CardList<Card>);
        sync(slot.trainers as CardList<Card>);
      });
    });
  }
}
