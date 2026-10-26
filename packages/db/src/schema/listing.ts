import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const listing = pgTable("listing", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  price: text("price").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  contactWa: text("contact_wa").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Listing = typeof listing.$inferSelect;
export type NewListing = typeof listing.$inferInsert;
