import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import StockScreener from './pages/StockScreener';

const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToHash />
      <div className="font-sans">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<>
              <Hero />
              <About />
              <Projects />
              <Skills />
              <Contact />
            </>} />
            <Route path="/stock-screener" element={<StockScreener />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;