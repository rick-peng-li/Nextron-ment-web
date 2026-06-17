import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import WishlistSidebar from './components/WishlistSidebar';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ProductDetails from './pages/ProductDetails';
import Contact from './pages/Contact';
import MysteryDrop from './pages/MysteryDrop';
import Profile from './pages/Profile';
import Trending from './pages/Trending';
import Faq from './pages/Faq';
import Shipping from './pages/Shipping';
import Warranty from './pages/Warranty';
import OrderDetail from './pages/OrderDetail';

function App() {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollProgress = document.getElementById('scrollProgress');
      if (scrollProgress) {
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        scrollProgress.style.width = `${(scrollTop / height) * 100}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-[var(--text)] font-sans antialiased">
      <div className="grain-overlay"></div>
      <div className="scroll-progress" id="scrollProgress"></div>

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/new-arrivals" element={<MysteryDrop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/warranty" element={<Warranty />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/orders/:id" element={<OrderDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      <CartSidebar />
      <WishlistSidebar />
      <CheckoutModal />
      <Footer />
    </div>
  );
}

export default App;
