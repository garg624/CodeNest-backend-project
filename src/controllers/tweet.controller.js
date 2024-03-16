import { Tweet } from "../models/sanptube/tweet.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
// import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const newTweet = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { tweetContent } = req.body;
    if (!tweetContent) {
        throw new ApiError(404, "Please provide the content")
    }
    const userId = req.user?._id;
    let imagePath;
    if (Array.isArray(req.files.image) && req.files.image.length > 0) {
        imagePath = req.files.image[0]?.path || "";
    }



    const imageurl = await uploadOnCloudinary(imagePath);


    const tweet = await Tweet.create({
        owner: userId,
        image: imageurl.url || "",
        content: tweetContent
    })

    return res.status(201).json(
        new ApiResponse("success", tweet, "Tweet created successfully")
    )
})

const getAllTweets = asyncHandler(async (req, res) => {
    // now we will implement pagination
    let { page = 1, limit = 10, query = "" } = req.query;

    // first convert them into the number
    page = parseInt(page); // Convert to integer
    limit = parseInt(limit); // Convert to integer

    // query is optional based on the client search 
    // Construct the find query with optional text search on the content field options i will search ince sensetive
    const findQuery = query ? { content: { $regex: query, $options: 'i' } } : {};

    // Fetch tweets with pagination
    const tweets = await Tweet.find(findQuery)
        .skip((page - 1) * limit) // Skip documents based on the current page
        .limit(limit) // Limit the number of documents per page
        .sort({ createdAt: -1 }); // Sort by createdAt field in descending order


    return res.status(200)
        .json(new ApiResponse(201, { data: tweets, totalPages: Math.ceil(tweets.length / limit) }, "Successfully fetched all Tweets"))

});

const deleteTweet = asyncHandler(async (req, res) => {
    // console.log("req.user : ",req.user)
    const { id } = req.params;
    // we have to delete the image from the cloudinary
    //   
    //    const deletedImage=await deleteFromCloudinary(imageUrlToDelete)
    //    console.log("Deleted image response : ",deletedImage)
    // before deleting the tweet we should delete the image also
    const tweet = await Tweet.findByIdAndDelete(id)
    if (!tweet) {
        throw new ApiError(404, "There is no such a tweet.")
    }
    const deletedImage = await deleteFromCloudinary(tweet.image)
    // console.log("Deleted image response : ",deletedImage)

    return res.status(200).json(new ApiResponse(201, tweet, "Deleted Successfully"))

})


export {
    newTweet,
    getAllTweets,
    deleteTweet
}
