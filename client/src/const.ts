export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Return local login page directly, bypassing OAuth
export const getLoginUrl = () => {
  return "/login";
};
