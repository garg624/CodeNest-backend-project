import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app} from "./app.js";
dotenv.config({
    path:"./env"
})

console.log(process.env.PORT)
// this is asynchronous function which will return a promise
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log("Server is running on port 8000")
    })

    app.on("error", ()=>{
        console.log("Server is not running")
    })

    app.on("connection", ()=>{
        console.log("Server is connected")
    })
}) 
.catch(err=>{
    console.log("This error is occured from the catch block of the connect function ",err)
});
