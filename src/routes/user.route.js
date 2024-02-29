import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAndExtractDataFromJWTToken } from "../middlewares/auth.middleware.js";

const router = Router();
//? here we will store the fliles like avatar and coverimage on the temp folder 
//? so we  will use middle ware or before registerUser controller we will uplaod them.

//? we are getting avatar and coverImage filed from the form data  and we have to store them in the temp folder before going to the user controller bcz cloundinary upload function will upload them from the temp folder and this middleware will complete the task.

router.route("/register").post(upload.fields([{
    name: "avatar",
    maxCount: 1
},
{
    name: 'coverImage',
    maxCount: 1
}]),
    registerUser)

router.route("/login").post(loginUser);

router.route("/logout").post(verifyAndExtractDataFromJWTToken,logoutUser);

router.route("/refreshAccessToken").post(refreshAccessToken);

export default router