import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import FlashNews from '../components/FlashNews';
import PopupAdModal from '../components/PopupAdModal';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-light text-gray-100 font-inter">
      <PopupAdModal />
      <FlashNews />
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;


