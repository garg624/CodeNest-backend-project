import mongoose from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            lowercase: true,
            index: true,// * this is only used to optamize the searching of the field
            trim: true, // * any leading or trailing white spaces are removed.
            required: true,
            unique: true
        },
        email: {
            type: String,
            lowercase: true,
            trim: true, // * any leading or trailing white spaces are removed.
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            index: true,// * this is only used to optamize the searching of the field
            trim: true, // * any leading or trailing white spaces are removed.
            required: true,
        },
        avatar: {
            type: String, //cloudinary

            required: true,

        },
        coverImage: {
            type: String, //cloudinary
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",

            }
        ],
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String,

        }

    },{ timestamps: true });


// * now we have to make some middleware so that we can update some values before saving it to the data base.

// ? there is a method called pre in mongoose that helps in creating the middleware.

// ? save is the event. and we are not using callback here because callback can't track os the objects members.

// * next is very curusial bcz we have to past the control to the next middleware.

// ? isMoodified is also a function present in the schema object.


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // this code will run  only when user modifies his/her password otherwise it won't run
    this.password =await bcrypt.hash(this.password, 10);// ? here is the salt or we can say that the number of rounds to encrypt the password.
    next();
})

// ? function to check if the password is correct
// ? we can create new method own accourding to our needs. 
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
// ? mostly this function doon't need the async and await but its your choise.
// ? jwt.sign(payload,secretkey,expiry)
userSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
// ? the payload of the refresh token is always light.
userSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema);