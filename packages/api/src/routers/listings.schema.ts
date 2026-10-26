import { z } from "zod";

export const LISTING_CATEGORIES = [
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export const listingCategorySchema = z.enum(LISTING_CATEGORIES);

export const createListingSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    price: z
      .union([
        z.string().trim().min(1, "Price is required"),
        z.number().positive("Price must be positive"),
      ])
      .transform((val) => String(val)),
    location: z.string().trim().min(1, "Location is required"),
    category: listingCategorySchema,
    contactWa: z
      .string()
      .trim()
      .min(1, "WhatsApp contact is required")
      .optional(),
    contact_wa: z
      .string()
      .trim()
      .min(1, "WhatsApp contact is required")
      .optional(),
  })
  .refine((data) => Boolean(data.contactWa || data.contact_wa), {
    message: "WhatsApp contact is required",
    path: ["contactWa"],
  });

export type CreateListingInput = z.infer<typeof createListingSchema>;
