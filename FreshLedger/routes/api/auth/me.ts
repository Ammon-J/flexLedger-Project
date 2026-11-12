import { define } from "../../../utils.ts";
import { currentUser, json, publicUser } from "../../../lib/auth.ts";

export const handler = define.handlers({
  async GET(ctx) {
    try {
      const user = await currentUser(ctx.req);
      return user
        ? json({ user: publicUser(user) })
        : json({ message: "Sign in to view this page." }, { status: 401 });
    } catch (error) {
      console.error("Fresh current-user request failed:", error);
      return json({ message: "An unexpected server error occurred." }, {
        status: 500,
      });
    }
  },
});
