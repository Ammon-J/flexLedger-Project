import { ObjectId } from "mongodb";
import { define } from "../../utils.ts";
import { currentUser, json } from "../../lib/auth.ts";
import { getDatabase } from "../../lib/database.ts";

export const handler = define.handlers({
  async GET(ctx) {
    try {
      const user = await currentUser(ctx.req);
      if (!user) {
        return json({ message: "Sign in to view this page." }, { status: 401 });
      }
      const database = await getDatabase();
      const blocks = await database.collection("blocks").find({
        userId: user._id,
      }).sort({ date: -1 }).toArray();
      return json({ blocks });
    } catch (error) {
      console.error("Fresh blocks request failed:", error);
      return json({ message: "An unexpected server error occurred." }, {
        status: 500,
      });
    }
  },
  async POST(ctx) {
    try {
      const user = await currentUser(ctx.req);
      if (!user) {
        return json({ message: "Sign in to manage blocks." }, { status: 401 });
      }
      const body = await ctx.req.json() as Record<string, unknown>;
      const startOdometer = Number(body.startOdometer);
      const endOdometer = Number(body.endOdometer);
      const date = typeof body.date === "string" ? new Date(body.date) : null;
      const earnings =
        body.earnings === "" || typeof body.earnings === "undefined"
          ? undefined
          : Number(body.earnings);
      if (
        !date || Number.isNaN(date.getTime()) ||
        !Number.isFinite(startOdometer) ||
        !Number.isFinite(endOdometer) || endOdometer < startOdometer ||
        (typeof earnings !== "undefined" &&
          (!Number.isFinite(earnings) || earnings < 0))
      ) {
        return json({ message: "Enter a valid date and odometer range." }, {
          status: 400,
        });
      }
      const database = await getDatabase();
      const block = {
        userId: user._id as ObjectId,
        startOdometer,
        endOdometer,
        milesDriven: endOdometer - startOdometer,
        date,
        createdAt: new Date(),
        ...(typeof user.defaultVehicle === "string" && user.defaultVehicle
          ? { vehicle: user.defaultVehicle }
          : {}),
        ...(typeof earnings === "number" ? { earnings } : {}),
        ...(typeof body.routeNotes === "string"
          ? { routeNotes: body.routeNotes.trim() }
          : {}),
      };
      const result = await database.collection("blocks").insertOne(block);
      return json({ block: { ...block, _id: result.insertedId } }, {
        status: 201,
      });
    } catch (error) {
      console.error("Fresh block creation failed:", error);
      return json({ message: "An unexpected server error occurred." }, {
        status: 500,
      });
    }
  },
});
