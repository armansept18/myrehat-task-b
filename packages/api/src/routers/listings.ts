import { listing } from "@myrehat-task-b/db/schema/listing";
import { desc } from "drizzle-orm";

import { protectedProcedure, publicProcedure } from "../index";
import { createListingSchema } from "./listings.schema";

export const listingRouter = {
  list: publicProcedure.handler(async ({ context }) => {
    return context.db.select().from(listing).orderBy(desc(listing.createdAt));
  }),
  create: protectedProcedure
    .input(createListingSchema)
    .handler(async ({ input, context }) => {
      const contactWa = input.contactWa || input.contact_wa || "";
      const newListing = {
        id: crypto.randomUUID(),
        title: input.title,
        price: input.price,
        location: input.location,
        category: input.category,
        contactWa,
        createdAt: new Date(),
      };
      await context.db.insert(listing).values(newListing);
      return newListing;
    }),
};
