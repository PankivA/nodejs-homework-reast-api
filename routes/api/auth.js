const express = require("express");

const ctrl = require("../../controllers/auth");

const {
  validateBody,
  validateSubscription,
  authenticate,
  upload,
} = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();
router.post(
  "/register",
  validateBody(schemas.registerSchema),
  ctrl.register
);

router.get("/verify/:verificationCode", ctrl.verify);

router.post(
  "/verify",
  validateBody(schemas.userEmailSchema),
  ctrl.resendVerify
);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.get("/current", authenticate, ctrl.getCurrent);

router.post("/logout", authenticate, ctrl.logout);

router.patch(
  "/:userId/subscription",
  authenticate,
  validateSubscription(schemas.updateSubscriptionSchema),
  ctrl.updateSubscription
);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;