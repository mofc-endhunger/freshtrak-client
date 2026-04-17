declare module 'redux-mock-store' {
  export default function configureStore(middlewares?: any[]): (initialState?: any) => any;
}
