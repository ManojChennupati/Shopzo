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
            required:false,
            default:''
        },
        isActive:{
           type:Boolean,
           default:true
        },
        address:{
            street:{type:String,required:false,default:''},
            city:{type:String,required:false,default:''},
            state:{type:String,required:false,default:''},
            country:{type:String,required:false,default:''},
            zipCode:{type:String,required:false,default:''}
        }
    },
        {timestamps:true}
   
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

