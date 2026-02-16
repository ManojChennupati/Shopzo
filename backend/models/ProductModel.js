import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        discountPrice:{
            type:Number
        },
        stock:{
            type:Number,
            required:true
        },
        images:[
            {type:String}
        ],
        isActive:{
            type:Boolean,
            default:true
        }
},
{timestamps:true}
);

const Product = mongoose.model("Product",ProductSchema);
export default Product;