import { Router } from "express";
import { analyticsControllers } from "./analytics.controller";

const router = Router();

router.get("/analyze-orders", analyticsControllers.analyticsOrders);
router.get(
  "/over-year-analytics",
  analyticsControllers.getLast12MonthsAnalyticsData
);
router.get("/top-selling-products", analyticsControllers.getTopSellingProducts);

export const analyticsRoutes = router;
