// * anothere apporach to makr the async handler
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error) => { next(error) });
    }
}
export {asyncHandler}
// * is you want to use .then - then takes the callback function and executes the function in the callback body


// * don't worry about the synatx its just const asyncHandler=() =>{
//     ()=>{

//     }
// }

// * one and good appraoch to handle the async function
// export const asyncHandler =(fn)=async(req,res,next)=>{
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         return res.json({success:false,message:error},{status:500})
//     }
// }
/*
* method to call the above function
 const someAsyncFunction = async (req, res, next) => {
    // Your code here...
};

const handledFunction = asyncHandler(someAsyncFunction);

// Now you can call handledFunction with req, res, and next
handledFunction(req, res, next);
*/