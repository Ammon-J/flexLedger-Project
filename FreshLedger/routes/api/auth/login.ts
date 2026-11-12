import { define } from "../../../utils.ts";
import { json, loginUser } from "../../../lib/auth.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      return await loginUser(await ctx.req.json());
    } catch (error) {
      console.error("Fresh login request failed:", error);
      return json({ message: "An unexpected server error occurred." }, {
        status: 500,
      });
    }
  },
});
