import { v2 as cloudinary } from "cloudinary";
// ? file system module class.
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadOnCloudinary(filepath) {
    try {
        if (!filepath) return null;
        // below is the actual working
        // resourse type auto means it will automaticaly detect the resource type (image/video etc.)
        const response = await cloudinary.uploader.upload(filepath, { resource_type: "auto" });
        console.log("File successfully uploaded from cloudinary ", response)
        fs.unlinkSync(filepath);
        //returning the cloudinary url where the file is stored.
        return response.url;
    } catch (error) {
        // it will remove the file from the temporary folder.
        fs.unlinkSync(filepath);
        return null;
    }
}
async function deleteFromCloudinary(url) {
    try {
        // I have to extract the id http://res.cloudinary.com/drh72x02f/image/upload/v1709040732/adwmtvsmedzpim3xct33.jpg

        let urlParts = url.split("/");
        let finalUrl = urlParts[urlParts.length - 1].split(".")[0];
        const response = await cloudinary.api.delete_resources([finalUrl], { type: 'upload', resource_type: 'image' });
        console.log("Response : ",response)

        return response;
        // const result = await cloudinary.uploader.destroy()
    } catch (error) {
        return null
    }
}

export { uploadOnCloudinary ,deleteFromCloudinary };