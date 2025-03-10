import { asyncLocalStorage } from "./asyncLocalStorage.js";

class UserSession {
  getUserId() {
    const map = asyncLocalStorage.getStore();
    return map.get("userId");
  }
}

export const userSession = new UserSession();
