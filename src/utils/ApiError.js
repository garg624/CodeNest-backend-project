class ApiError extends Error {
    constructor(statusCode,message,errors=[],stack=""){
        super(message);
        // * Nulling the value of this.data is a good practice that can help to prevent memory leaks, make Error objects more reusable, and protect sensitive data.
        this.data=null
        this.message=message
        this.statusCode=statusCode
        this.sucess=false
        this.errors=errors

        // if there is any error stack then assign it to this.stack
        // and  if not then use the super error class method Error.captureStackTrace(targetObject[, constructorOpt])

        if(stack){
            this.stack=stack;
        }else{
            // this method require the insatnce if the current onbject and the constructor.
            Error.captureStackTrace(this,this.constructor);
        }
    }
}
export {ApiError};