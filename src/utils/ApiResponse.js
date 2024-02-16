class ApiResponse {
    constructor(statusCode,data,message="SUCCESS"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        // this.success is boolean
        this.success=statusCode < 400 // why 400 because greater than 400 is error
    }
}