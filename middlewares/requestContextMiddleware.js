import { asyncLocalStorage } from "../utils/asyncLocalStorage.js";

export const requestContextMiddleware = (req, res, next) => {
  const store = new Map();
  asyncLocalStorage.run(store, () => {
    next();
  });
};
