import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/sanptube/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
// here doesn't matter you use return keyword or not.
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;
    // console.log(req)
    // validations
    if ([fullName, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Fill all the details");
    }
    const userExists = await User.findOne({ $or: [{ email }, { username }] })
    // console.log("userExist",userExists);
    if (userExists) {
        throw new ApiError(400, "Email or username already exists")
    }
    // console.log("req.files",req.files)
    //? it will return the file path 
    const avatarPath = req.files?.avatar[0].path;
    //? we are hadling if the avatar file is received or not but we are not checking coverimage
    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
         coverImagePath = req.files?.coverImage;
        
    }


    // console.log("avatar path ", avatarPath, " coverImage path ", coverImagePath);
    if (!avatarPath) {
        throw new ApiError(400, 'Avatar is required');
    }
    //now uplaod the image on cloudinary
    const avatarUrl = await uploadOnCloudinary(avatarPath);
    const coverImageUrl = await uploadOnCloudinary(coverImagePath)
    // console.log("Avatar url :", avatarUrl, " CoverImage url :", coverImageUrl);
    //? check again if we have recieved the avatar url or not bcz its required in the db.
    if (!avatarUrl) {
        throw new ApiError(400, 'Avatar is required');
    }
    // now validation is complete
    const createdUser = await User.create(
        {
            email,
            username,
            password,
            fullName,
            avatar: avatarUrl,
            coverImage: coverImageUrl || ""
        })

    // now show some info to the user the saved details.
    const userSavedDetails = await User.findById(createdUser._id).select("-password -refreshToken");
    if (!userSavedDetails) {
        throw new ApiError(500, "User is not saved");
    }
    // console.log("Saved user deatils ", userSavedDetails);
    return res.status(201).json(
        new ApiResponse(200, userSavedDetails, "User registered sucessfully")
    )
})
export { registerUser };
