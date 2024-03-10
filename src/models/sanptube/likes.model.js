import mongoose from "mongoose";

const likesSchema=new mongoose.Schema({
    comment:{
        type:mongoose.Types.ObjectId, 
        ref:"Comment"
    },
    video:{
        type:mongoose.Types.ObjectId, 
        ref:"Video"
    },
    tweet:{
        type:mongoose.Types.ObjectId,
        ref:"Tweet"
    },
    owner:{
        type:mongoose.Types.ObjectId,
        ref: "User"
    },
},
{
    timestamps:true
})

export const  Like = mongoose.model("Like",likesSchema)