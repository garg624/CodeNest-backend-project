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


# mongoose has the feature to add some middleware between the database and the backend.
like mongoose.pre is a middleware which can perform some task 
Example : encryption of the password.

# bcrypt VS bcryptjs
> both are almost same o only bcrypt is maded from the nodejs and bcryptjs is from the plain javascript and has no dependencies.


# what is the use of the bcrypt pakage .
> used to encrypt the password and check if the password is correct.

# what is the use of the jsonwebtoken
> create a token with the encrypted field and have some important functions to create the different token.And work as the key to access the database.

# what is fs?
fs is a file system.hepls to readd write ect or open or close the folders.
>fs.unlink is function to delete the file.
>fs.unlinksync force to delete the files.


# MULTER
uplooad the file to the public temp folder from where we can upload it to the cloudinary.

# What is the use of cloudinary in this project?
upload the file from the public/temp folder and get the url so that we can store it to the database.

#       Some things about HTTP.
URI=universal resourse identifier
meta data : data about data.


## http methods
* Get : retreive the data.
* head
* options : available operations.
* trace : debugging its a loop.
* delete : remove the data
* put:fully replace the data
* post:same as get with security.
* patch

