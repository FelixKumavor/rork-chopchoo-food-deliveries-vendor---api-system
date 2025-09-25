import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const hiInputSchema = z.object({ 
  name: z.string().optional() 
}).optional();

export const hiProcedure = publicProcedure
  .input(hiInputSchema)
  .query(({ input }) => {
    console.log('🔍 Hi procedure called with input:', input);
    const name = input?.name || "World";
    const response = {
      hello: `Hello ${name}!`,
      date: new Date(),
      status: "success",
      message: "tRPC connection working!",
      timestamp: new Date().toISOString()
    };
    console.log('✅ Hi procedure response:', response);
    return response;
  });

// Keep default export for backward compatibility
export default hiProcedure;