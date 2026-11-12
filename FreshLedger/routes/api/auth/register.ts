import { define } from "../../../utils.ts";
import { json, registerUser } from "../../../lib/auth.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      return await registerUser(await ctx.req.json());
    } catch (error) {
      console.error("Fresh register request failed:", error);
      return json({ message: "An unexpected server error occurred." }, {
        status: 500,
      });
    }
  },
});
