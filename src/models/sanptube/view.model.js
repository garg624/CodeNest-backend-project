import mongoose from "mongoose";

const viewSchema=new mongoose.Schema({
    video:{
        type:mongoose.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }

},
{
    timestamps:true
})

export const View=mongoose.model("View",viewSchema);