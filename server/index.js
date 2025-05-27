import express from 'express';
import cors from "cors";
import dotenv from "dotenv";

import cookieParser from 'cookie-parser';
import connectDB from './configs/db.js';
import 'dotenv/config.js'
import userRouter from './routes/userRoutes.js';
import sellerRouter from './routes/sellerRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import addressRouter from './routes/addressRoute.js';
import OrderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

dotenv.config();

const PORT=3000;
const allowedOrigins=['http://localhost:5173','https://grocery-shopping-three.vercel.app']



const app = express();
app.get("/", (req, res) => {
  res.send("API is running!");
});
app.post('/stripe',express.raw({type:'application/json'}), stripeWebhooks)
app.use(cors({ origin : allowedOrigins, credentials : true}));
app.use(express.json());
app.use(cookieParser());


await connectDB();
await connectCloudinary();

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", OrderRouter);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
   
  });