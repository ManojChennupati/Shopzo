import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
           type:String,
           required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        role:{
            type:String,
            enum:["USER","ADMIN"],
            required:true
        },
        phone:{
            type:String,
            required:true
        },
        isActive:{
           type:Boolean,
           default:true
        },
        address:{
            street:{type:String,required:true},
            city:{type:String,required:true},
            state:{type:String,required:true},
            country:{type:String,required:true},
            zipCode:{type:String,required:true}
        }
    },
        {timestamps:true}
   
);

const User = mongoose.model("User",userSchema);
export default User;

