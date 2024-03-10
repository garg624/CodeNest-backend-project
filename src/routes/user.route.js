import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
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

router.route("/logout").post(verifyAndExtractDataFromJWTToken, logoutUser);

router.route("/refreshAccessToken").post(refreshAccessToken);

router.route("/changeCurrentPassword").post(verifyAndExtractDataFromJWTToken, changeCurrentPassword);

router.route("/getCurrentUser").get(verifyAndExtractDataFromJWTToken, getCurrentUser);

router.route("/updateAccountDetails").patch(verifyAndExtractDataFromJWTToken, updateAccountDetails);

router.route("/updateUserAvatar").patch(upload.fields([{
    name: "avatar",
    maxCount: 1
}]), verifyAndExtractDataFromJWTToken, updateUserAvatar);


router.route("/updateUserCoverImage").patch(upload.fields([{
    name: "coverImage",
    maxCount: 1
}]), verifyAndExtractDataFromJWTToken, updateUserCoverImage);

router.route("/getUserChannelProfile/:username").get(verifyAndExtractDataFromJWTToken, getUserChannelProfile);


router.route("/getWatchHistory").get(verifyAndExtractDataFromJWTToken, getWatchHistory);



export default router