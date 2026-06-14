import { Router, type IRouter } from "express";
import { db, submissionsTable } from "@workspace/db";
import { CreateSubmissionBody } from "@workspace/api-zod";
import { desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/submissions", async (req, res): Promise<void> => {
  const parsed = CreateSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { city, totalCO2, dietScore, transportScore, energyScore, shoppingScore } = parsed.data;

  const [submission] = await db
    .insert(submissionsTable)
    .values({
      city,
      totalCO2,
      dietScore,
      transportScore,
      energyScore,
      shoppingScore,
    })
    .returning();

  res.status(201).json({
    id: submission.id,
    city: submission.city,
    totalCO2: submission.totalCO2,
    dietScore: submission.dietScore,
    transportScore: submission.transportScore,
    energyScore: submission.energyScore,
    shoppingScore: submission.shoppingScore,
    createdAt: submission.createdAt.toISOString(),
  });
});

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      city: submissionsTable.city,
      avgCO2: sql<number>`avg(${submissionsTable.totalCO2})`,
      count: sql<number>`count(*)::int`,
    })
    .from(submissionsTable)
    .groupBy(submissionsTable.city)
    .orderBy(sql`avg(${submissionsTable.totalCO2}) asc`)
    .limit(20);

  res.json(rows.map((r) => ({
    city: r.city,
    avgCO2: Math.round(r.avgCO2),
    count: r.count,
  })));
});

export default router;
