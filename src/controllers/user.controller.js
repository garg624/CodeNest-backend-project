import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/sanptube/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


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
    if (Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagePath = req.files?.coverImage[0].path;

    }
    console.log("Cover Image path : ", coverImagePath);

    // console.log("avatar path ", avatarPath, " coverImage path ", coverImagePath);
    if (!avatarPath) {
        throw new ApiError(400, 'Avatar is required');
    }
    console.log("before the cloudinary upload")
    //now uplaod the image on cloudinary
    const avatarUrl = await uploadOnCloudinary(avatarPath);
    const coverImageUrl = await uploadOnCloudinary(coverImagePath)
    // console.log("Avatar url :", avatarUrl, " CoverImage url :", coverImageUrl);
    //? check again if we have recieved the avatar url or not bcz its required in the db.
    if (!avatarUrl.url) {
        throw new ApiError(400, 'Avatar is required');
    }
    // now validation is complete
    const createdUser = await User.create(
        {
            email,
            username,
            password,
            fullName,
            avatar: avatarUrl.url,
            coverImage: coverImageUrl.url || ""
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

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //todos
    //? bcz of the auth middleware we now have the user details req.user
    //? in the req.body we have the old and new password
    //? if both are same return error
    //? exrtract the user _id from the req.user
    //? check if the old password is correct by the user.isPassordCorrect
    //?if correct the user.password to be changed to new password . [pre method middleware of the model willl take care]
    //? save the user
    //? return the api response to the client.

    const {oldpassword,newpassword}=req.body;
    // check if both the passwords are correct by the way this work is of the client side but I am doing this.
    if(newpassword === oldpassword){
        throw new ApiError(400,"New password cannot be same as Old Password.")
    }
    // checking the user old password is correct or not.
    const user=await User.findById(req.user._id).select({password:1});
    const isValid=await user.isPasswordCorrect(oldpassword)
    if(!isValid){
        throw new ApiError(400,'Old Password is incorrect')
    }
    // only password will be received
    user.password=newpassword;
    await user.save();

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password has been updated successfully"))



})

const getCurrentUser=asyncHandler(async (req,res)=>{
    //todos
    //*req.user which contains the logged-in user data
    //* check if the user has 
    //*get the data from the user except the password and the refresh token 
    //*send the userDetails to the client side
    
    const user=await User.findById(req.user._id).select({password:0,refreshToken:0});
    // console.log("user : ",user);
    if(user===null){
        throw new ApiError(404,"user not found");
    }
    return res
    .status(200)
    .json(new ApiResponse(201,user,"Successfully got the details of current user"));
})

const updateAccountDetails=asyncHandler( async (req,res)=>{
    const {email,fullName}=req.body;
    if(!email && !fullName){
        throw new ApiError(400,"Fill the details");
    }
    const user=await User.findByIdAndUpdate(
        req.user._id ,
        {
            $set:{
                email:email,
                fullName:fullName
            }
        },
        {new:true}
        ).select({password:0,refreshToken:0});
    if(!user){
        throw new ApiError(404,"User Not Found")
    }

    return  res.status(200).json(new ApiResponse(200,user,"Updated Successfully"))


})

const updateUserAvatar=asyncHandler(async (req,res)=> {
    //todos
    // get the new image .   
    // delete old one.
    //update db with new image url.
    //req.user has the id
    const avatarPath = req.files?.avatar[0].path;
    if(!avatarPath){
        throw new ApiError(400,'Please select an Image')
    }
    const newUrl=await uploadOnCloudinary(avatarPath);
    console.log("Cloudinary response : ",newUrl.url)
    const user=await User.findById(req.user._id);
    const oldurl=user.avatar
    const deleteResponse=await deleteFromCloudinary(oldurl)
    console.log('Delete from Cloudinary Response',deleteResponse)
    user.avatar=newUrl.url;
    const savedUser=await user.save()

    return res.status(201).json(new ApiResponse(201,savedUser,"Image updated successfully") )
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    //* main things is avatar image is a required field but cover image field is not.
    const coverPath = req.files?.coverImage[0].path;
    if(!coverPath){
        throw new ApiError(400,'Please select an Image')
    }
    const newUrl=await uploadOnCloudinary(coverPath);
    console.log("Cloudinary response : ",newUrl.url)
    const user=await User.findById(req.user._id);
    const oldurl=user.coverImage
    if(oldurl!==null){
        const deleteResponse=await deleteFromCloudinary(oldurl)
        console.log('Delete from Cloudinary Response',deleteResponse)
    }
    user.coverImage=newUrl.url;
    const savedUser=await user.save()

    return res.status(201).json(new ApiResponse(201,savedUser,"Cover Image updated successfully") )
})

const getUserChannelProfile=asyncHandler( async (req,res)=>{
    const {username}=req?.params;
    if(!username?.trim()){
        throw new ApiError(400,"Url contain no params")
    }

    const channelInfo=await User.aggregate([
        {
            $match:{
                username:username
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribed"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                subscribedCount:{
                    $size:"$subscribed"
                },
                // { $cond: { if: <boolean-expression>, then: <true-case>, else: <false-case> } }

                isSubscribe:{
                    $cond:{
                        if:{
                            $in:[req?.user?._id,"$subscribers.subscriber"]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                avatar:1,
                coverImage:1,
                isSubscribe:1,
                subscribedCount:1,
                subscribersCount:1,
                email:1
            }
        }
    ])
    console.log(channelInfo);
    if(channelInfo?.length==0){
        throw new ApiError(404,'Channel not found');
    }
    return res.status(200).json(
        new ApiResponse(201,channelInfo[0],'Get channel info successfully')
    )

})

const  getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField: "_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        avatar:1,
                                        fullName:1,
                                        username:1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
                
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(201,user, 'get user watch history success'))

})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};

