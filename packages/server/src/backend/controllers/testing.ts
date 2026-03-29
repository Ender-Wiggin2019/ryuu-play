import { Request, Response } from 'express';
import { CardManager, GameSettings, ResolvePromptAction, Rules } from '@ptcg/common';

import { Controller, Post } from './controller';
import { AuthToken, Validate, check } from '../services';
import { ApiErrorEnum } from '@ptcg/common';
import { BotManager } from '../../game/bots/bot-manager';
import { BotClient } from '../../game/bots/bot-client';
import { Deck, User } from '../../storage';
import { Get } from './controller';
import { ScenarioActor, ScenarioExportScope, ScenarioLabService } from '../services/scenario-lab';

export class Testing extends Controller {

  private scenarioLab = new ScenarioLabService(this.core);

  @Post('/create')
  @AuthToken()
  @Validate({
    playerDeckId: check().isNumber(),
    botDeckId: check().isNumber()
  })
  public async onCreate(req: Request, res: Response) {
    const userId: number = req.body.userId;
    const playerDeckId: number = req.body.playerDeckId;
    const botDeckId: number = req.body.botDeckId;
    const clientId: number | undefined = typeof req.body.clientId === 'number'
      ? req.body.clientId
      : undefined;
    const formatName: string = typeof req.body.formatName === 'string'
      ? req.body.formatName.trim()
      : '';

    const user = await User.findOneById(userId);
    if (user === null) {
      res.status(400);
      res.send({ error: ApiErrorEnum.PROFILE_INVALID });
      return;
    }

    const playerDeck = await Deck.findOne({ where: { id: playerDeckId }, relations: ['user'] });
    const botDeck = await Deck.findOne({ where: { id: botDeckId }, relations: ['user'] });
    if (playerDeck === null || botDeck === null || playerDeck.user.id !== userId || botDeck.user.id !== userId) {
      res.status(400);
      res.send({ error: ApiErrorEnum.DECK_INVALID });
      return;
    }
    if (!this.isDeckAllowedInFormat(playerDeck, formatName) || !this.isDeckAllowedInFormat(botDeck, formatName)) {
      res.status(400);
      res.send({ error: ApiErrorEnum.DECK_INVALID });
      return;
    }

    const playerCards = JSON.parse(playerDeck.cards) as string[];
    const botCards = JSON.parse(botDeck.cards) as string[];
    if (!this.validateCards(playerCards) || !this.validateCards(botCards)) {
      res.status(400);
      res.send({ error: ApiErrorEnum.DECK_INVALID });
      return;
    }

    const settings = new GameSettings();
    settings.timeLimit = 0;
    settings.recordingEnabled = true;
    settings.rules = this.getRulesForFormat(formatName);

    let bot: BotClient;
    try {
      bot = BotManager.getInstance().getBot('bot');
    } catch (error) {
      res.status(400);
      res.send({ ok: false, error: 'Bot not available.' });
      return;
    }

    const client = clientId !== undefined
      ? this.core.clients.find(c => c.id === clientId && c.user.id === userId)
      : this.core.clients.find(c => c.user.id === userId);
    if (client === undefined) {
      res.status(400);
      res.send({ error: ApiErrorEnum.AUTH_TOKEN_INVALID });
      return;
    }

    const game = this.core.createGame(client, playerCards, settings, bot);
    const invitePrompt = game.state.prompts.find(prompt =>
      prompt.playerId === bot.id && prompt.result === undefined
    );

    if (invitePrompt) {
      game.dispatch(bot, new ResolvePromptAction(invitePrompt.id, botCards));
    }

    res.send({
      ok: true,
      gameId: game.id,
      formatName: settings.rules.formatName,
      botUserId: bot.user.id
    });
  }

  private validateCards(deck: string[]) {
    if (!(deck instanceof Array)) {
      return false;
    }

    const cardManager = CardManager.getInstance();
    return deck.every(card => typeof card === 'string' && cardManager.isCardDefined(card));
  }

  private getRulesForFormat(formatName: string): Rules {
    const format = CardManager.getInstance().getAllFormats().find(item => item.name === formatName);
    return format
      ? new Rules({ ...format.rules, formatName })
      : new Rules({ formatName });
  }

  private isDeckAllowedInFormat(deck: Deck, formatName: string): boolean {
    if (formatName === '') {
      return true;
    }

    try {
      const formatNames = JSON.parse(deck.formatNames) as string[];
      return formatNames.includes(formatName);
    } catch {
      return false;
    }
  }

  @Post('/scenario/create')
  @AuthToken()
  public async onCreateScenario(req: Request, res: Response) {
    const userId: number = req.body.userId;
    const playerDeckId = typeof req.body.playerDeckId === 'number'
      ? req.body.playerDeckId
      : undefined;
    const botDeckId = typeof req.body.botDeckId === 'number'
      ? req.body.botDeckId
      : undefined;
    const formatName: string = typeof req.body.formatName === 'string'
      ? req.body.formatName.trim()
      : '';

    const user = await User.findOneById(userId);
    if (user === null) {
      res.status(400).send({ error: ApiErrorEnum.PROFILE_INVALID });
      return;
    }
    const client = this.core.clients.find(item => item.user.id === userId);

    let playerDeckCards: string[] | undefined;
    let botDeckCards: string[] | undefined;
    if (playerDeckId !== undefined || botDeckId !== undefined) {
      if (playerDeckId === undefined || botDeckId === undefined) {
        res.status(400).send({ error: ApiErrorEnum.DECK_INVALID });
        return;
      }
      const playerDeck = await Deck.findOne({ where: { id: playerDeckId }, relations: ['user'] });
      const botDeck = await Deck.findOne({ where: { id: botDeckId }, relations: ['user'] });
      if (playerDeck === null || botDeck === null || playerDeck.user.id !== userId || botDeck.user.id !== userId) {
        res.status(400).send({ error: ApiErrorEnum.DECK_INVALID });
        return;
      }
      playerDeckCards = JSON.parse(playerDeck.cards);
      botDeckCards = JSON.parse(botDeck.cards);
    }

    try {
      const result = this.scenarioLab.createScenario({
        viewerClient: client,
        viewerUser: user,
        player1Deck: playerDeckCards,
        player2Deck: botDeckCards,
        formatName
      });
      res.send({ ok: true, ...result });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  @Get('/scenario/:id/state')
  @AuthToken()
  public async onGetScenarioState(req: Request, res: Response) {
    try {
      const scenarioId = parseInt(String(req.params.id), 10);
      const state = this.scenarioLab.getScenarioState(scenarioId);
      res.send({ ok: true, scenarioId, state });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  @Post('/scenario/:id/action')
  @AuthToken()
  public async onScenarioAction(req: Request, res: Response) {
    try {
      const scenarioId = parseInt(String(req.params.id), 10);
      const actor = this.readActor(req.body.actor);
      const actionType = String(req.body.actionType || '');
      this.scenarioLab.dispatchAction(scenarioId, actor, actionType, req.body.payload);
      res.send({ ok: true });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  @Post('/scenario/:id/prompt/resolve')
  @AuthToken()
  @Validate({
    promptId: check().isNumber()
  })
  public async onScenarioResolvePrompt(req: Request, res: Response) {
    try {
      const scenarioId = parseInt(String(req.params.id), 10);
      const actor = this.readActor(req.body.actor);
      const promptId = Number(req.body.promptId);
      this.scenarioLab.resolvePrompt(scenarioId, actor, promptId, req.body.result);
      res.send({ ok: true });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  @Post('/scenario/:id/patch')
  @AuthToken()
  public async onScenarioPatch(req: Request, res: Response) {
    try {
      const scenarioId = parseInt(String(req.params.id), 10);
      const operations = req.body.operations instanceof Array ? req.body.operations : [];
      const state = this.scenarioLab.applyPatch(scenarioId, operations);
      res.send({ ok: true, state });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  @Post('/scenario/:id/export')
  @AuthToken()
  public async onScenarioExport(req: Request, res: Response) {
    try {
      const scenarioId = parseInt(String(req.params.id), 10);
      const scope = this.readScope(req.body.scope);
      const player = req.body.player ? this.readActor(req.body.player) : undefined;
      const state = this.scenarioLab.exportScenarioState(scenarioId, scope, player);
      res.send({ ok: true, scope, state });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  @Post('/scenario/:id/assert')
  @AuthToken()
  public async onScenarioAssert(req: Request, res: Response) {
    try {
      const scenarioId = parseInt(String(req.params.id), 10);
      const checks = req.body.checks instanceof Array ? req.body.checks : [];
      const result = this.scenarioLab.assertState(scenarioId, checks);
      res.send({ ok: true, result });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  @Post('/scenario/:id/delete')
  @AuthToken()
  public async onDeleteScenario(req: Request, res: Response) {
    try {
      const scenarioId = parseInt(String(req.params.id), 10);
      this.scenarioLab.deleteScenario(scenarioId);
      res.send({ ok: true, scenarioId });
    } catch (error: any) {
      this.handleScenarioError(error, res);
    }
  }

  private readActor(value: unknown): ScenarioActor {
    const actor = String(value || '').toUpperCase();
    if (actor === 'PLAYER_1' || actor === 'PLAYER_2') {
      return actor;
    }
    throw new Error('ACTOR_INVALID');
  }

  private readScope(value: unknown): ScenarioExportScope {
    const scope = String(value || 'full').toLowerCase();
    if (scope === 'bench' || scope === 'active' || scope === 'player' || scope === 'board' || scope === 'full') {
      return scope as ScenarioExportScope;
    }
    throw new Error('SCOPE_INVALID');
  }

  private handleScenarioError(error: any, res: Response): void {
    const message = String(error?.message || error || 'UNKNOWN_ERROR');
    if ([
      'SCENARIO_NOT_FOUND',
      'GAME_INVALID_ID',
      'PLAYER_NOT_FOUND',
      'ACTOR_NOT_FOUND',
      'PROMPT_INVALID_ID'
    ].includes(message)) {
      res.status(404).send({ ok: false, error: message });
      return;
    }
    if ([
      'ACTOR_INVALID',
      'SCOPE_INVALID',
      'PROMPT_INVALID_RESULT',
      'PROMPT_NOT_FOR_ACTOR',
      'DECK_INVALID',
      'SLOT_INVALID',
      'ZONE_INVALID',
      'PRIZE_SLOT_INVALID',
      'BENCH_SLOT_INVALID'
    ].includes(message)
      || message.startsWith('UNKNOWN_CARD')
      || message.startsWith('UNSUPPORTED_ACTION')
      || message.startsWith('AUTO_DECK_')) {
      res.status(400).send({ ok: false, error: message });
      return;
    }
    res.status(500).send({ ok: false, error: message });
  }
}
