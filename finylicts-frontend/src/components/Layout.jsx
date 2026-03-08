import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="user-avatar">MM</div>
        </header>
        <div className="content-area">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default Layout;