import User from "../models/User.js";

//update cart = /api/cart/update


export const updateCart = async ( req, res) => {
    try{
        const { cartItems } = req.body;
        const userId = req.userId;

        console.log("Incoming cartItems:", cartItems);
        console.log("Decoded userId:", userId);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,  { $set: { cartItems } },
            { new: true, runValidators: true });

             console.log("Updated user cartItems in DB:", updatedUser.cartItems);

        res.json({ success: true , message : 'Cart Updated'});

    } catch(error){
        console.log(error.message);
        res.json({success : false, message : error.message })
    }
}