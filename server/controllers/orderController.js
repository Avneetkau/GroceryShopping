import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from 'stripe';
import User from '../models/User.js';


//Place order COD   /api/order/cod

export const placeOrderCOD = async ( req, res ) => {
       
    try{
        const userId = req.userId;
const { items, address } = req.body;
 // const { userId, items, address } = req.body;
       
        if(!address || items.length === 0){
            return res.json({ success : false, message : 'Invalid data' });
        }

        //Calculate Amount Using Items

        let amount =  await items.reduce(async(acc, item) => {
            const product = await  Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0 )

        //Add Tax charges(2%)

        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType : "COD",
        });

        return res.json({ success : true, message : 'Order Placed Successfully'})

    } catch(error){
        return res.json( { success : false , message : error.message });
    }
} 
  
//Place order Online   /api/order/stripe

export const placeOrderStripe = async ( req, res ) => {
       
    try{
       const userId = req.userId;
       const {  items, address } = req.body;
        const { origin } = req.headers;
        console.log(req.body);
        console.log(req.userId);

        if(!address || items.length === 0){
            return res.json({ success : false, message : 'Invalid data' });
        }

        let productData = [];

        //Calculate Amount Using Items

        let amount =  await items.reduce(async(acc, item) => {
            const product = await  Product.findById(item.product);
            productData.push({
                name: product.name,
                price : product.offerPrice,
                quantity : item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0 )

        //Add Tax charges(2%)

        amount += Math.floor(amount * 0.02);

       const order =  await Order.create({
          
            userId,
            items,
            amount,
            address,
            paymentType : "Online",
        });

        //stripe gateway initialization
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //create line items for stripe
        const line_items = productData.map((item)=>{
            return {
                price_data : {
                    currency : 'usd',
                    product_data : {
                        name : item.name,
                    },
                    unit_amount : Math.floor(item.price + item.price  * 0.02) * 100 
                },
                quantity: item.quantity,
            }
        })

        // from stripe initiate and line items we will get session for getting url.so,create session 
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url  : `${origin}/loader?next=my-orders`,
            cancel_url : `${origin}/cart`,
            metadata : {
                orderId : order._id.toString(),
                userId,
            }
        })
           
        return res.json({ success : true, url : session.url })

    } catch(error){
        return res.json( { success : false , message : error.message });
    }
} 


//stripe webhooks to verify payment  /stripe
export const stripeWebhooks =async (request, response) => {
    //stripe payment initialization
     const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY );


     const sig = request.headers["stripe-signature"];
     let event;

     try{
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
     }catch(error){
         return response.status(400).send(`Webhook Error : ${error.message}`)
     }

     switch (event.type){
        case "checkout.session.completed": { 
             // "payment_intent.succeeded"
            //const paymentIntent = event.data.object;
            //const paymentIntentId = paymentIntent.id;
            //getting session metadata
          //  const session = await stripeInstance.checkout.sessions.list({
            //    payment_intent : paymentIntentId,
           // });    

    //check if session exists
    //if (!session.data.length) {
       // console.log("No session found");
        //return response.json({ received: true });
    //}
               const session = event.data.object; 
            const { orderId, userId } = session.metadata; //session.data[0].metadata;
          
            //await Order.findByIdAndUpdate(orderId, {isPaid:true})
           // console.log("Payment Success");


            //await User.findByIdAndUpdate(userId, {cartItems : {}})
            //break;
             if (!orderId || !userId) {
                console.log("Missing metadata in session:", session.id);
                return response.json({ received: true });
            }

            // Only mark paid if payment was actually collected
            if (session.payment_status === "paid") {
                await Order.findByIdAndUpdate(orderId, { isPaid: true });
                await User.findByIdAndUpdate(userId, { cartItems: {} });
                console.log("Order marked as paid:", orderId);
            }
            break;
        }
          case "checkout.session.expired":{
         //case "payment_intent.payment_failed": {
           // const paymentIntent = event.data.object;
            //const paymentIntentId = paymentIntent.id;

            //getting session metadata

            //const session = await stripeInstance.checkout.sessions.list({
              //  payment_intent : paymentIntentId,
            //});

            //const { orderId } = session.data[0].metadata;
            //await Order.findByIdAndDelete(orderId);
             let orderId;

            if (event.type === "checkout.session.expired") {
                orderId = event.data.object.metadata?.orderId;
            } else {
                // payment_intent.payment_failed — need to look up session
                const paymentIntent = event.data.object;
                const sessions = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                });
                orderId = sessions.data[0]?.metadata?.orderId;
            }

            if (orderId) {
                await Order.findByIdAndDelete(orderId);
                console.log("Order deleted due to failed/expired payment:", orderId);
            }
            break;
        }
        default :
        console.error(`Unhandled event type ${event.type}`);
        break;
     }
     response.json({received : true});

}

//Get order by Id   /api/order/user

export const getUserOrders = async (req, res) => {
    try{
        const  userId  = req.userId;
        const orders = await Order.find({
            userId,
            $or : [{ paymentType : 'COD' }, { isPaid : true }]
        }).populate("items.product address").sort({ createdAt : -1 });
        res.json({success : true , orders});
    }
    catch(error){
        return res.json( { success : false , message : error.message })
    }
}

//get orders for seller   /api/order/seller

export const getSellerOrders = async (req, res) => {
    try{
       
        const orders = await Order.find({
            $or : [{ paymentType : 'COD' }, { isPaid : true }]
        }).populate("items.product address").sort({ createdAt : -1 });
        res.json({success : true , orders});
    }
    catch(error){
        return res.json( { success : false , message : error.message })
    }
}

export const getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      $or: [{ paymentType: 'COD' }, { isPaid: true }]
    })
    .populate("items.product address")
    .sort({ createdAt: -1 });

    res.json({ success: true, orders });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};