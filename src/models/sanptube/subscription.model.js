import mongoose from "mongoose"


//? lets understand the working of the subscription model
//* question is why we created two different name fields with same refrence?
//* because  in our case, one user can have multiple subscriptions and each subscription belongs to a single user.and for getting all the subsriber of a single channel
const subscriptionSchema=mongoose.Schema(
    {
        subscriber:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }

    }
    ,{timestamps:true});

export const Subscription=mongoose.model("Subscription",subscriptionSchema);