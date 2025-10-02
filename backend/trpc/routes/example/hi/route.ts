import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

console.log('🔧 Loading hi procedure...');

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

console.log('✅ Hi procedure created:', typeof hiProcedure);

// Keep default export for backward compatibility
export default hiProcedure;

console.log('✅ Hi procedure exported');
console.log('📋 Hi procedure definition:', hiProcedure._def?.type);