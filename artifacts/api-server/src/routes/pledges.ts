import { Router, type IRouter } from "express";
import { db, pledgesTable } from "@workspace/db";
import { CreatePledgeBody } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/pledges", async (req, res): Promise<void> => {
  const parsed = CreatePledgeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { city, pledgeType } = parsed.data;

  const [pledge] = await db
    .insert(pledgesTable)
    .values({ city, pledgeType })
    .returning();

  res.status(201).json({
    id: pledge.id,
    city: pledge.city,
    pledgeType: pledge.pledgeType,
    createdAt: pledge.createdAt.toISOString(),
  });
});

router.get("/pledges/stats", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      pledgeType: pledgesTable.pledgeType,
      count: sql<number>`count(*)::int`,
    })
    .from(pledgesTable)
    .groupBy(pledgesTable.pledgeType)
    .orderBy(sql`count(*) desc`);

  res.json(rows);
});

export default router;
