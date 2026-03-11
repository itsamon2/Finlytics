import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      x: -20,
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: 20,
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.1 
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="user-avatar">MM</div>
        </header>
        
        {/* Animated page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="content-area"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;