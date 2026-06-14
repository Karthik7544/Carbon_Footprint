import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pledgesTable = pgTable("pledges", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  pledgeType: text("pledge_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPledgeSchema = createInsertSchema(pledgesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPledge = z.infer<typeof insertPledgeSchema>;
export type Pledge = typeof pledgesTable.$inferSelect;
