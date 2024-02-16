import mongoose from "mongoose"

const patientSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowercase:true
    },
    diagonedWith:{
        type:String,
        required:true,
        
    },
    age:{
        type:Number,
        required:true,
       
    },
    bloodgroup:{
        type:String,
        required:true,
    },
    gender:{
        type:String,
        required:true,
        enum:['male','female','other'],
    },
    address:{
        type:String,
        required:true
    },
    addmittedIn:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital",

    },
    
},{timestamps:true})

export const Patient=mongoose.model("Patient",patientSchema)