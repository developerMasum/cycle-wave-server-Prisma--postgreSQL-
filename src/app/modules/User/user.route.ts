import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";

import { userValidation } from "./user.validation";
import { ZodError } from "../../Interfaces/errorSource";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    userValidation.createUser.parse(req.body);

    return userController.createUser(req, res, next);
  } catch (error: unknown) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      const errorDetails = {
        issues: zodError.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      };
      const errorMessage = zodError.issues
        .map((issue) => issue.message)
        .join(". ");

      return res.status(400).json({
        success: false,
        message: errorMessage,
        errorDetails: errorDetails,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: (error as Error).message || "Unknown error occurred",
      });
    }
  }
});
router.get("/me", auth("USER"), userController.getMe);
router.get("/", userController.getAllUser);
// router.delete("/users/:id", userController.deleteUser);
router.patch("/me", userController.updateMyself);
router.patch("/:id/toggle-state", userController.userBlockUnblock);
// todo: add update here
export const UserRoutes = router;
