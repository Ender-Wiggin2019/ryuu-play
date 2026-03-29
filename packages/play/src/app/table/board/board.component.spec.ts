import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DndModule } from '@ng-dnd/core';
import { TranslateModule } from '@ngx-translate/core';
import { TestBackend } from 'react-dnd-test-backend';
import { CardList, CardType, Player, PokemonCard, PokemonSlot, Stage, TrainerCard, TrainerType } from '@ptcg/common';

import { ApiModule } from '../../api/api.module';
import { CardsModule } from '../../shared/cards/cards.module';
import { CardsBaseService } from '../../shared/cards/cards-base.service';
import { GameService } from '../../api/services/game.service';
import { BoardComponent } from './board.component';

class TestToolCard extends TrainerCard {
  public set = 'TEST';
  public trainerType = TrainerType.TOOL;
  public useWhenInPlay = true;
  public name = '招式学习器 临危一击';
  public fullName = '招式学习器 临危一击 TEST';
}

class TestBoardPokemon extends PokemonCard {
  public set = 'TEST';
  public stage = Stage.BASIC;
  public hp = 120;
  public attacks = [{ name: '测试招式', cost: [CardType.COLORLESS], damage: '10', text: '' }];
  public name = '测试宝可梦';
  public fullName = '测试宝可梦 TEST';
}

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let cardsBaseService: jasmine.SpyObj<CardsBaseService>;
  let gameService: jasmine.SpyObj<GameService>;

  beforeEach(waitForAsync(() => {
    cardsBaseService = jasmine.createSpyObj<CardsBaseService>('CardsBaseService', ['showCardInfo', 'showCardInfoList']);
    cardsBaseService.showCardInfo.and.returnValue(Promise.resolve(undefined));
    cardsBaseService.showCardInfoList.and.returnValue(Promise.resolve(undefined));

    gameService = jasmine.createSpyObj<GameService>('GameService', ['ability', 'attack', 'trainer']);

    TestBed.configureTestingModule({
      imports: [
        ApiModule,
        CardsModule,
        DndModule.forRoot({ backend: TestBackend }),
        TranslateModule.forRoot()
      ],
      declarations: [ BoardComponent ],
      providers: [
        { provide: CardsBaseService, useValue: cardsBaseService },
        { provide: GameService, useValue: gameService }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const topPlayer = new Player();
    topPlayer.id = 2;
    topPlayer.bench = Array.from({ length: 8 }, () => new PokemonSlot());
    const bottomPlayer = new Player();
    bottomPlayer.id = 1;
    bottomPlayer.bench = Array.from({ length: 8 }, () => new PokemonSlot());

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    component.clientId = 1;
    component.topPlayer = topPlayer;
    component.bottomPlayer = bottomPlayer;
    component.gameState = { gameId: 1, deleted: false } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the attached TM directly when clicking your Active Pokemon', async () => {
    const pokemonCard = new TestBoardPokemon();
    const trainerCard = new TestToolCard();
    const cardList = new CardList();
    cardList.cards = [pokemonCard, trainerCard];

    await component.onActiveClick(pokemonCard, cardList);

    expect(cardsBaseService.showCardInfo).toHaveBeenCalledWith(jasmine.objectContaining({
      card: trainerCard,
      cardList
    }));
    expect(cardsBaseService.showCardInfoList).not.toHaveBeenCalled();
  });
});
