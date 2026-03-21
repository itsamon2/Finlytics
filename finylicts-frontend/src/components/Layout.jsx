import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({children}) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="user-avatar">MM</div>
        </header>
        <div className="content-area">
          {children } 
        </div>
      </main>
    </div>
  );
};

export default Layout;