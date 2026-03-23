import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[
        {
            productId:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
            titleSnapshot:{type:String,required:true},
            thumbnailSnapshot:{type:String,required:true},
            quantity:{type:Number,required:true},
            priceSnapshot:{type:Number,required:true}
        }
    ],
    totalAmount:{
        type:Number,
        required:true
    },
    orderStatus:{
        type:String,
        enum:["PLACED","SHIPPED","DELIVERED","CANCELLED"],
        required:true
    },
    paymentStatus:{
        type:String,
        enum:["PENDING","PAID"],
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    ShippingAddress:{
        street:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        country:{type:String,required:true},
        zipCode:{type:String,required:true}
    }
},
{timestamps:true}

);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;
