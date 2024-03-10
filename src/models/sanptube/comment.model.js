
import mongoose from "mongoose";

const commentSchema=new  mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:mongoose.Types.ObjectId,
        ref:"Video" 
    },
    owner:{
        type:mongoose.Types.Object,
        ref:"User"
    }
},{timestamps:true})

export const  Comment = mongoose.model("Comment",commentSchema)