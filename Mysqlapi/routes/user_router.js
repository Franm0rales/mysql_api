import express from "express";
import userController from "../controller/user_controller.js";

const userRouter = express.Router();

userRouter.post("/", userController.addUser);
userRouter.post("/login", userController.loginUser);
userRouter.delete("/:id", userController.deleteUser);
userRouter.patch("/:id", userController.updateUser);

export default userRouter;
