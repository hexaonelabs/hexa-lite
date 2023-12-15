import Store from '.';

export const setSafeAreaTop = (value: number) => {
  Store.update(s => {
    s.safeAreaTop = value;
  });
};

