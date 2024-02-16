# This file contain all the tools I have used and all the about dev-dependencies

[.gitignore Generator](https://www.toptal.com/developers/gitignore)

 ## what is the use of gitkeep file


## what is nodemon

> Noting but restart the server when you save the files

## TO use the import syntax -
Add this code 
> type : "module"

## What is dev dependencies?
These dependencies which are not pushed onto the production only for development purposes
Ex: Nodemon
syntax to install the dev dependencies :
> npm install -D nodemon
here -D represents the dev dependencies


### command to run nodemon
> nodemon scr/index.js 

## use of prettier pakage ?
The main use case is when more than one person is developing the same project 
and to have the same formatting we use prettier pakage.

### How to use prettier
first file:.prettierrc file
this file contains the configurations for the prettier
second file: .prettierignore file
it define the prettier to not touch the listed files.


## How to use env variables in your other files
* install it
* syntax1: require("dotenv").config({path: "./env"})
* syntax2: >import dotenv from "dotenv";
            dotenv.config({path: "./env"})
            change the dev command to "nodemon -r dotenv/config --experimental-json-modules src/index.js"

# boilerplate code for mongodb models
import mongoose from "mongoose";
const UserSchema=new mongoose.Schema({


},{timestamps:true})
note: timestamp give createdat and updatedat fields.
export const User=new mongoose.model("User",UserSchema);



# error class in node js
whats is the error stack?
describing the point in the code at which the Error was instantiated.

 example: Error: Things keep happening! //this is the error.message followed by the error stack with start with "at".
   at /home/gbusey/file.js:525:2
   at Frobnicator.refrobulate (/home/gbusey/business-logic.js:424:21)
   at Actor.<anonymous> (/home/gbusey/actors.js:400:8)
   at increaseSynergy (/home/gbusey/actors.js:701:6)
# what is Error.captureStackTrace(targetObject[, constructorOpt])
Creates a .stack property on targetObject, which when accessed returns a string representing the location in the code at which Error.captureStackTrace() was called.