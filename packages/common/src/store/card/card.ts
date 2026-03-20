import { SuperType } from './card-types';
import { Effect } from '../effects/effect';
import { State } from '../state/state';
import { StoreLike } from '../store-like';

export type CardDataEntity = Record<string, unknown>;

export interface CardRawData {
  raw_card: CardDataEntity;
  collection?: CardDataEntity;
  image_url?: string;
}

export abstract class Card {

  public abstract set: string;

  public abstract superType: SuperType;

  public abstract fullName: string;

  public abstract name: string;

  public id: number = -1;

  public tags: string[] = [];

  public rawData?: CardRawData;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
