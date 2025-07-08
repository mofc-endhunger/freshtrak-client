declare module 'redux-mock-store' {
  import { Store, AnyAction } from 'redux';

  interface MockStore {
    getState(): any;
    getActions(): AnyAction[];
    clearActions(): void;
    dispatch(action: AnyAction): AnyAction;
    subscribe(listener: () => void): () => void;
    replaceReducer(nextReducer: any): void;
    [Symbol.observable](): any;
  }

  interface ConfigureStore {
    (middlewares?: any[]): (initialState?: any) => MockStore;
  }

  const configureStore: ConfigureStore;
  export default configureStore;
} 