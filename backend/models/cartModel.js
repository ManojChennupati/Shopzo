import mongoose from "mongoose";

const CartSchema = mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required: true
            },
            quantity:{
                type:Number,
                required: true
            },
            priceAtAddTime:{
                type:Number,
                required: true
            }
        }
    ],
    totalItems:{
        type:Number
    }
},{timestamps: true}

);

const Cart = mongoose.model("Cart",CartSchema);
export default Cart;
