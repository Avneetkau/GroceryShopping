import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from 'react-hot-toast';
import axios from 'axios';

//axios.defaults.withCredentials = true;
//axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // ✅ ensures cookies like sellerToken are sent
});

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();

    const  currency =import.meta.env.VITE_CURRENCY;
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setshowUserLogin] = useState(false);
   const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});


    //Fetch Seller Status
    const fetchSeller = async () => {
      try {
        const {data} = await axios.get('/api/seller/is-auth');
        
        if(data.success) {
          setIsSeller(true);
        }else{
          setIsSeller(false);
        }
        
      }
      catch (error){
        setIsSeller(false);
      }
    }
   
     //Fetch User Status  //is auth and their cartitems too
     const fetchUser = async () => {
        try{
             const { data } = await axios.get('/api/user/is-auth');
             if(data.success){
                  setUser(data.user)
                  setCartItems(data.user.cartItems)
             }
        }
        catch(error){
            setUser(null)
        }
     }
     
    //Fetching Products
   const fetchProducts  = async ()=> {
   try{
    const { data } = await axios.get('/api/product/list')
    if(data.success){
      setProducts(data.products)
    }else{
      toast.error(data.message);
    }
   }
   catch(error){
    toast.error(error.message);
   }
   }

   //Adding products to Card
   const addToCart= (itemId)=>{
    let cartData =structuredClone(cartItems);

    if(cartData[itemId]){
      cartData[itemId] += 1;
    } else{
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success('Added to Cart')
   }

     //Update card Item Quantity
     const updateCartItem = (itemId, quantity) => {
      let cartData = structuredClone(cartItems);
      cartData[itemId] = quantity;
      setCartItems(cartData);
      toast.success("Cart Updated");
     }

     //Remove Product from cart
     const removeFromCart = (itemId) => {
      let cartData = structuredClone(cartItems);
      if(cartData[itemId]){
        cartData[itemId] -= 1;
        if(cartData[itemId] === 0){
          delete cartData[itemId];
        }
      }
      toast.success("Removed from Cart");
      setCartItems(cartData);
     }
     
     //Get cart item count
     const getCartCount = () =>{
        let totalCount = 0;
        for(const item in cartItems){
          totalCount += cartItems[item];
        }
        return totalCount;
     }
    
     //get cart total amount
     const getCartAmount = () => {
      let totalAmount = 0 ;
      for(const items in cartItems){
        let itemInfo = products.find((product)=>product._id === items );
        if (cartItems[items] > 0 ){
            totalAmount += itemInfo.offerPrice * cartItems[items]
        }
      }
      return Math.floor(totalAmount * 100) / 100;
     }

   useEffect(()=>{
   
    fetchSeller()
    fetchUser()
    fetchProducts()
   },[])

   //update cart Items in Database
   useEffect(()=>{
    
    const updateCart = async ()=> {
      try{
        const { data } =await axios.post('/api/cart/update', { cartItems });
        if(!data.success){
          toast.error(data.message);
        }
      }catch(error){
          toast.error(error.message);
      }

    }
    if(user){
      updateCart();
    }
   },[cartItems])
  

  const value = {
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setshowUserLogin,
    navigate,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios : axiosInstance,  // for better fetch
    fetchProducts,
    setCartItems
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
