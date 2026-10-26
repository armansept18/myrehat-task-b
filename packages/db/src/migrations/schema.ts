import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("account_userId_idx").using("btree", table.userId.asc().nullsLast()),
  ],
);

export const listing = pgTable("listing", {
  id: text().primaryKey(),
  title: text().notNull(),
  price: text().notNull(),
  location: text().notNull(),
  category: text().notNull(),
  contactWa: text("contact_wa").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_userId_idx").using("btree", table.userId.asc().nullsLast()),
    unique("session_token_key").on(table.token),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [unique("user_email_key").on(table.email)],
);

export const verification = pgTable(
  "verification",
  {
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("verification_identifier_idx").using(
      "btree",
      table.identifier.asc().nullsLast(),
    ),
  ],
);
