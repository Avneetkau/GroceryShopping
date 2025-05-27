import React from 'react';
import MainBanner from '../MainBanner/MainBanner';
import Categories from '../Categories/Categories';
import BestSeller from '../BestSeller/BestSeller';
import BottomBanner from '../BottomBanner/BottomBanner';
import NewsLetter from '../NewsLetter/NewsLetter';


const Home = () => {
  return (
    <div className="mt-10">
      <MainBanner/>
      <Categories/>
      <BestSeller/>
      <BottomBanner/>
      <NewsLetter/>
      
    </div>
  );
}

export default Home;
