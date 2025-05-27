

import React from 'react';
import { Route, Routes,useLocation } from 'react-router-dom';

import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import  { Toaster } from 'react-hot-toast'
import Footer from './components/Footer/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login/Login';
import AllProducts from './components/AllProducts/AllProducts';
import ProductCategory from './components/ProductCategory/ProductCategory';
import ProductDetails from './components/ProductDetails/ProductDetails';
import Cart from './components/Cart/Cart';
import AddAddress from './components/AddAddress/AddAddress';
import MyOrders from './components/MyOrders/MyOrders';
import SellerLogin from './components/SellerLogin/SellerLogin';
import SellerLayout from './components/Seller/SellerLayout';
import AddProducts from './components/Seller/AddProducts';
import ProductList from './components/Seller/ProductList';
import Orders from './components/Seller/Orders';
import Loading from './components/Loading/Loading';


const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin , isSeller} = useAppContext();
  return (
     <div className='text-default min-h-screen text-gray-700  bg-white'>

       {isSellerPath ? null : <Navbar />}
       {showUserLogin ? <Login/> : null }

       <Toaster/>

       <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/products" element={<AllProducts/>}/>
          <Route path="/products/:category" element={<ProductCategory/>}/>
           <Route path="/products/:category/:id" element={<ProductDetails/>}/>
            <Route path="/cart" element={<Cart/>}/>
             <Route path="/add-address" element={<AddAddress/>}/>
             <Route path="/my-orders" element={<MyOrders/>}/>
             <Route path="/loader" element={<Loading/>}/>
             <Route path="/seller" element={isSeller ? <SellerLayout/> : <SellerLogin/>} >
                 <Route index element={isSeller ? <AddProducts/> : null} />
                 <Route path="product-list" element={<ProductList/>} />
                 <Route path="orders" element={<Orders/>} />
             </Route>
        </Routes>
       </div>
       {!isSellerPath && <Footer/>}
     </div>
     
     
       
   
  );
};

export default App;

{/*import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css'
import Navbar from './components/Navbar/Navbar';
import Fruits from './components/Pages/Fruits';
import OtpForm from './components/OtpForm/OtpForm';

const App = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
      <Route path="/fruits" element={<Fruits/>} />
      <Route path="/login" element={<OtpForm/>} />
      </Routes>
      </Router>
  );
}

export default App;*/}
