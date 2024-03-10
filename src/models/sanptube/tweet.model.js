import mongoose from  'mongoose';

const tweetSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    img:{
        // currently single image feature 
        // with cloudinary
        type:String
    },
    content:{
        type:String,
        required:true
    }

},
{
    timestamps:true
})

export const Tweet=mongoose.model("Tweet",tweetSchema)

