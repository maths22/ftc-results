export const REGISTER_PROMISE = 'REGISTER_PROMISE';
export const UNREGISTER_PROMISE = 'UNREGISTER_PROMISE';

export const registerPromise = (name, value) => ({
  type: REGISTER_PROMISE,
  name: name,
  value: value
});

export const unregisterPromise = (name) => ({
  type: UNREGISTER_PROMISE,
  name: name
});