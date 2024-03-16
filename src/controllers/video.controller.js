import { Video } from "../models/sanptube/videos.model.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose"
const publishAVideo=asyncHandler(async (req,res)=>{

    //todos
    //video from the req.files.video[0].path
    //thumbnail from  the req.files.thumbnail[0].path
    //* title from the form data
    //* desription from the form data
    //* duration form the cloudinary response
    // set views to 0
    // ?isPublished form the form data
    //? owner from the req.user._id
    // then uplad the video and thumbnail to the cloudinary and get  the url
    // check for the video[ required] thumbnail[required]  title [required] description [required] duration[required]
    const {title,description=" ",isPublished}=req.body;
    const userId=req.user._id;
    
    if(!title){
        throw new ApiError(409,"title is required")
    }
    const videoPath=req.files?.video[0]?.path;
    const thumbnail=req.files?.thumbnail[0]?.path;

    if( !videoPath || !thumbnail ) {
        throw new ApiError(404,"video or thumbnail is not uploaded");
    }
    // console.log("video path",videoPath);
    const videoUrl=await uploadOnCloudinary(videoPath);
    const thumbUrl= await uploadOnCloudinary(thumbnail);
    const duration=Math.floor(videoUrl?.duration)
    // console.log("videoUrl: ",videoUrl)
    // console.log("thumbUrl : ",thumbUrl)
    if(!videoUrl.url||!thumbUrl.url ){
        throw new ApiError(500,"Failed to save on Cloudinary");
    }
    const videoDoc=await Video.create({
        videoFile:videoUrl.url,
        thumbnail:thumbUrl.url,
        title,
        description,
        owner:userId,
        views:0,
        isPublished,
        duration:duration
    })
    // console.log("video doc : ",videoDoc)
    return res.status(201).json(
        new ApiResponse(200,{videoDoc},"Video and thumbnail  has been created successfully!")
    )

})

const getAllVideos = asyncHandler(async (req, res) => {
    //* ex:localhost:3000/api/videos?page=1&limit=10&sortBy=createdAt&sortType=1&userId=12345

    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    // In this I will return only the thumbnail other wise the response packet size will increase.
    page=parseInt(page)
    limit=parseInt(limit)
    sortType=parseInt(sortType)||1;
    console.log("sortBy:",sortBy,"sortType:",sortType)
    let searchQuery=query ? {$description:{ $regex: query, $options: 'i' }} : {} ;
    if (userId) {
        searchQuery = { ...searchQuery, owner: userId };
    }

    const videos=await Video.find(searchQuery).sort({[sortBy]:sortType}).skip((page - 1) * limit).limit(limit);

    return res.status(200)
    .json(new ApiResponse(201,{videos},"Videos retreived successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"Video ID is required.")
    }

    // Validate videoId format (assuming videoId is a MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Invalid VideoID')
    }

    // Check if the video with the provided videoId exists
    let video = await Video.findById(videoId).select("-__v -updatedAt");
    if (!video) {
        throw new ApiError(400,"No video found with given id")
    }

    return res.status(200).json(new ApiResponse(201,{video},"Video retrived Successfully! by id"))
})

const updateVideo = asyncHandler(async (req, res) => {
    

    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
   

    if (!videoId) {
        throw new ApiError(400,"Video ID is required.")
    }

    // Validate videoId format (assuming videoId is a MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Invalid VideoID')
    }

    let video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not Found")
    }
    // firstly check you are the owner of the video
    if(video.owner != req.user._id){
        throw new ApiError(409,"You are not the owner of the video")
    }

    let thumbnail;
    if(Array.isArray(req.files?.thumbnail) && req.files?.thumbnail.length > 0){
        thumbnail = req.files.thumbnail[0].path
    }
    let newThumbnailUrl;

    if(thumbnail){
        const deleteThumbnailResponse=await cloudinary.deleteFromCloudinary(video.thumbnail)
        console.log("deleteThumbnailResponse:",deleteThumbnailResponse)
        if (!deleteThumbnailResponse) {
            throw new ApiError(500, "Failed to delete old thumbnail.");
        }
        newThumbnailUrl=await uploadOnCloudinary(thumbnail)
        if(!newThumbnailUrl){
            throw new ApiError(500,"Thumbnail is not uploaded to Cloudinary server")
        }

    }

    video.title=title || video.title;
    video.description=description || video.description
    video.thumbnail=newThumbnailUrl || video.thumbnail
    

    const savedVideoResponse=await video.save()

    return res.status(200).json(new ApiResponse(201,{savedVideoResponse},"Video details updated succesfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    //? first delete the video and the thumbnail from the cloudinary
    if(!videoId){
        throw new ApiError(400,'No Video ID provided')
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Invalid VideoID')
    }

    let video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not Found")
    }
    // firstly check you are the owner of the video
    if(video.owner != req.user._id){
        throw new ApiError(409,"You are not the owner of the video")
    }

    const oldVideoUrl=video.videoFile;
    const oldThumbnailUrl=video.thumbnail;

    const videoDeleteResponse=await deleteFromCloudinary(oldVideoUrl);
    const thumbnailDeleteResponse=await deleteFromCloudinary(oldThumbnailUrl);

    if(videoDeleteResponse.result === 'ok' && thumbnailDeleteResponse.result === 'ok') {
        // Delete video from your database
        const videoDeleteResponse=await video.remove();
        return res.status(200).json(new ApiResponse(201,{videoDeleteResponse},"Video deleted successfully"));
    } else {
        throw new ApiError(500, "Failed to delete video");
    }
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    //? there are two options only 1.public{true} 2.private{false}
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400,"Video ID is required.")
    }

    // Validate videoId format (assuming videoId is a MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Invalid VideoID')
    }

    let video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not Found")
    }
    // firstly check you are the owner of the video
    if(video.owner != req.user._id){
        throw new ApiError(409,"You are not the owner of the video")
    }

    video.isPublished = !video.isPublished;
    const savedVideoResponse=await video.save();

    if(!savedVideoResponse){
        throw new ApiError(500,"Failed to toggle the publish video")
    }

    return res.status(200).json(201,{savedVideoResponse},"is published is toggled successfully")

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
