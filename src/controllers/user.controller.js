import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/sanptube/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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

const loginUser = asyncHandler(async (req, res) => {
    // todos:
    //* get the email and password from req.body
    //* create a functionalty where user can login with username or email.
    //* validations
    //* check if the email is present or not 
    //* if present compare the password with bcrypt
    //* send the access token and send the refersh token
    //* send the verification token
    //* use cookies to send the refresh token
    //* return the response of successfull login

    const { email, password, username } = req.body
    console.log("req.body ----- ",req.body)
    if (!email && !username) {
        throw new ApiError(400, "Email or username are must.")
    }
    const userExist = await User.findOne({ $or: [{ email }, { username }] })

    if (!userExist) {
        throw new ApiError(400, "User does not exist . Register first")
    }
    console.log("user's id : ", userExist._id);

    const isPasswordValid = await userExist.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, 'Invalid Password')
    }

    const refreshToken = await userExist.generateRefreshToken();
    userExist.refreshToken = refreshToken;
    //* we will save this token in the secured cookies.
    const accessToken = await userExist.generateAccessToken();

    const savedUser = await userExist.save();
    console.log(savedUser);

    // now setup the cookies

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user:{ refreshToken, accessToken, savedUser}                },
                "Login successfull"
            )
        )


})

const logoutUser = asyncHandler(async (req, res) => {
    //todos:
    //* get the refresh and access token form the cookies--create a middlware for that.
    //* then extract _id from the token 
    //* find the user on the user of _id
    //* assign the undefined to the refreshToken
    //* delete all the cookies form the user.

    const userDetails = req.user;
    console.log("User Deatils", userDetails)
    const user = await User.findByIdAndUpdate(userDetails._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }

    )
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(201,{},"Logout successfull"));
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    // todos
    //*if refresh token is there than generate new access token
    //* check if the token is same as db refresh token
    //* then send it to the user in the form of cookies
    
    let refreshToken=req.cookies?.refreshToken || req.body?.refreshToken

    if(!refreshToken){
        throw new ApiError(408,"Login again. Your session has expired. or refresh token is expired");
    }
    const options={
        httpOnly:true,
        secure:true
    }
    // console.log("Refresh Token===>>>>",refreshToken);
    const decodedToken=await jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,options);
    const userDetails=await User.findById(decodedToken?._id);
    // console.log("userDetails",userDetails);
    if(refreshToken!=userDetails.refreshToken){
        throw new ApiError(403,"Invalid Token or expired")
    }
    const accessToken = await userDetails.generateAccessToken();
     refreshToken = await userDetails.generateRefreshToken();
     userDetails.refreshToken=refreshToken
     const savedUser=await userDetails.save()
    //  console.log("Saved user ",savedUser)
    //  console.log("Before the res")
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200,{accessToken:"New Access Token"},"Access Token Generated Successfully"))



})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};
