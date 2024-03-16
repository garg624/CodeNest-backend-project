import { Router } from "express";
import { verifyAndExtractDataFromJWTToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllVideos, getVideoById, publishAVideo } from "../controllers/video.controller.js";

const router=Router();

router.use(verifyAndExtractDataFromJWTToken)

router.route("/new-video").post(upload.fields([{
    name: "video",
    maxCount: 1
},
{
    name: 'thumbnail',
    maxCount: 1
}]),publishAVideo);

router.route("/get-videos").get(getAllVideos);

router.route("/:videoId").get(getVideoById);

export default router;