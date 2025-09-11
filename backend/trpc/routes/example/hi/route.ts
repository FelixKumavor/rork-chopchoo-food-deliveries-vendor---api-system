import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(({ input }) => {
    const name = input?.name || "World";
    return {
      hello: `Hello ${name}!`,
      date: new Date(),
      status: "success",
      message: "tRPC connection working!"
    };
  });