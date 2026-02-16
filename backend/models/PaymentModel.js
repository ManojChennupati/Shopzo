import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    provider:{
        type:String,
        enum: ["razorpay", "stripe", "paypal", "cod"],
        required:true,
    },
    status:{
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },

    transactionId:{
        type:String,
        required:true
    }
},
{timestamps:true}

);

const Payment = mongoose.model("Payment",PaymentSchema);
export default Payment;