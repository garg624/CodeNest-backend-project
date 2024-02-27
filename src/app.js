// !in app file we imports most of the things like routes and controllers etc rather than writting the whole code here

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()
// the app.use() is used from the middleware
// this pakage is used to solve the cors problem
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
// these are the preparation for getting the data on the server.
// because some send the json , form data,headers etc

// command to get the json data with some limit to secure the server from the overloading
app.use(express.json({limit:"16kb"}))

// to get the data from the url 
app.use(express.urlencoded({extended:true,limit:"16kb"}))


// to store the pdf,images , csv's etc
app.use(express.static("public"))

// 
// cookies parser used to handle the cookies
app.use(cookieParser());

//? all the route are handled here.

import userRouter from "./routes/user.route.js"

app.use("/api/v1/users",userRouter);



export {app}