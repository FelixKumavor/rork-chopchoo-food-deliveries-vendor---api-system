import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getAddressesProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("Getting addresses for user:", input.userId);
    
    // Mock addresses data - replace with actual database query
    const mockAddresses = [
      {
        id: "1",
        name: "Home",
        address: "123 Main Street, East Legon",
        city: "Accra",
        type: "home",
        isDefault: true,
        coordinates: { latitude: 5.6037, longitude: -0.1870 },
        phone: "+233 20 747 7013",
        instructions: "Blue gate, apartment 2B",
      },
      {
        id: "2",
        name: "Office",
        address: "456 Business District, Airport City",
        city: "Accra",
        type: "work",
        isDefault: false,
        coordinates: { latitude: 5.6037, longitude: -0.1870 },
        phone: "+233 20 747 7013",
        instructions: "3rd floor, office building",
      },
    ];
    
    return {
      success: true,
      addresses: mockAddresses,
    };
  });

export default getAddressesProcedure;