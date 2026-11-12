import { define } from "../../../utils.ts";
import { getDatabase } from "../../../lib/database.ts";
import {
  clearSessionCookie,
  hashSessionToken,
  readSessionToken,
} from "../../../lib/session.ts";
import { json } from "../../../lib/auth.ts";
import { clearJwtCookie } from "../../../lib/jwt.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const token = readSessionToken(ctx.req);
      if (token) {
        const database = await getDatabase();
        await database.collection("sessions").deleteOne({
          tokenHash: hashSessionToken(token),
        });
      }
      const headers = new Headers();
      headers.append("Set-Cookie", clearSessionCookie());
      headers.append("Set-Cookie", clearJwtCookie());
      return json({ message: "Logged out successfully." }, { headers });
    } catch (error) {
      console.error("Fresh logout request failed:", error);
      return json({ message: "An unexpected server error occurred." }, {
        status: 500,
      });
    }
  },
});
