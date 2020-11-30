import * as rx from "rxjs";

/**
 *
 * This is the interface an object being serialized at Redis, for example in
 * queues, must comply. Basicly, it has to have a parametrized constructor and a
 * serial method that returns an object compatible with the constructor.
 *
 */
export interface IRedisMessageObject {
  /**
   *
   * The method that serializes the object. The output of this method must be
   * compatible with the deconstructed constructor parameters.
   *
   */
  serial$: () => rx.Observable<any>;
}
