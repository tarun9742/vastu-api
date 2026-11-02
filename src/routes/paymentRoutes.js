import { Router } from "express";
import {
  getMyEnrollments,
  initiateEnrollment,
  verifyEnrollment,
  initiateOrderPayment,
  verifyOrderPayment,
  createCodOrder,
  handlePayUResponse,
} from "../controllers/paymentController.js";
import { getMyOrders } from "../controllers/orderController.js";

const router = Router();

// PayU Response Callback (POST from PayU gateway)
router.post("/payu/response", handlePayUResponse);

// Training enrollments
router.get("/my-enrollments", getMyEnrollments);
router.post("/payu/initiate-enrollment", initiateEnrollment);
router.post("/payu/verify-enrollment", verifyEnrollment);

// Product orders
router.get("/my-orders", getMyOrders);
router.post("/payu/initiate-order", initiateOrderPayment);
router.post("/payu/verify-order", verifyOrderPayment);
router.post("/cod-order", createCodOrder);

export default router;
