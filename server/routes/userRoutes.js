import express from 'express';
import { isAuth, Login, Logout, register } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';


const userRouter =  express.Router();

userRouter.post('/register', register);
userRouter.post('/login', Login);
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout',Logout);


export default userRouter;