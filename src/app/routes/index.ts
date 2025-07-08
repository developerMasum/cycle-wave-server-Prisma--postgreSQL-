import express from "express";
import { UserRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { productRoutes } from "../modules/product/product.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { analyticsRoutes } from "../modules/analytics/analytics.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/product",
    route: productRoutes,
  },
  {
    path: "/orders",
    route: orderRoutes,
  },
  {
    path: "/analytics",
    route: analyticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
