import {
  createListingSchema,
  LISTING_CATEGORIES,
  listingCategorySchema,
} from "@myrehat-task-b/api";
import { describe, expect, it } from "vitest";

describe("Listing Category and Input Validation", () => {
  it("accepts all 4 exact categories", () => {
    const expectedCategories = [
      "Buy Property",
      "Buy land to build homestay",
      "Buy Airbnb Profile",
      "Buy Airbnb Business",
    ] as const;

    expect(LISTING_CATEGORIES).toEqual(expectedCategories);

    for (const cat of expectedCategories) {
      const result = listingCategorySchema.safeParse(cat);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(cat);
      }
    }
  });

  it("rejects invalid categories", () => {
    const invalidCategories = [
      "Rent Room",
      "Hotel",
      "buy property",
      "Buy Property ",
      "",
      "Random Category",
    ];

    for (const invalid of invalidCategories) {
      const result = listingCategorySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    }
  });

  it("validates full listing creation payload with valid categories", () => {
    const validPayload = {
      title: "Charming Hillside Homestay",
      price: "450000",
      location: "Cameron Highlands",
      category: "Buy Airbnb Business",
      contactWa: "+60123456789",
    };

    const result = createListingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts numeric price coerced to string", () => {
    const validPayload = {
      title: "Beachfront Land Parcel",
      price: 250000,
      location: "Langkawi",
      category: "Buy land to build homestay",
      contact_wa: "+60198765432",
    };

    const result = createListingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe("250000");
    }
  });

  it("rejects listing creation with missing required fields", () => {
    const missingTitle = {
      title: "",
      price: "100",
      location: "KL",
      category: "Buy Property",
      contactWa: "+60123456789",
    };
    expect(createListingSchema.safeParse(missingTitle).success).toBe(false);

    const missingContact = {
      title: "Nice Place",
      price: "100",
      location: "KL",
      category: "Buy Property",
    };
    expect(createListingSchema.safeParse(missingContact).success).toBe(false);
  });
});
