import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getSellerOrders, getUserOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js';

 const OrderRouter = express.Router();


 OrderRouter.post('/cod', authUser, placeOrderCOD);
 OrderRouter.get('/user', authUser, getUserOrders);
 OrderRouter.get('/seller', authUser,getSellerOrders);
  OrderRouter.post('/stripe', authUser, placeOrderStripe);


 export default OrderRouter;