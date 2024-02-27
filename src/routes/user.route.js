import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
//? here we will store the fliles like avatar and coverimage on the temp folder 
//? so we  will use middle ware or before registerUser controller we will uplaod them.
router.route("/register").post(upload.fields([{
    name: "avatar",
    maxCount: 1
},
{
    name: 'coverImage',
    maxCount: 1
}]),
    registerUser)

export default router