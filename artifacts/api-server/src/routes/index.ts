import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import pledgesRouter from "./pledges";
import storyRouter from "./story";
import liveRouter from "./live";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(pledgesRouter);
router.use(storyRouter);
router.use(liveRouter);

export default router;
