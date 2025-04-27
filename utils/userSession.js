import { asyncLocalStorage } from "./asyncLocalStorage.js";

class UserSession {
  getUserId() {
    const map = asyncLocalStorage.getStore();
    console.log("user map", map);
    return map.get("userId");
  }
}

export const userSession = new UserSession();
