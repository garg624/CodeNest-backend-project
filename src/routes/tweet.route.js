import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAndExtractDataFromJWTToken } from "../middlewares/auth.middleware.js";
import { deleteTweet, getAllTweets, newTweet } from "../controllers/tweet.controller.js";



const router=Router();
router.use(verifyAndExtractDataFromJWTToken)
router.route("/new-tweet").post(upload.fields([{
    name: "image",
    maxCount: 1
}]),newTweet);

router.route("/allTweets").get(getAllTweets)

router.route("/deleteTweet/:id").delete(deleteTweet)
export default router;