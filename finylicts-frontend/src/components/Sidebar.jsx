import "./Sidebar.css";
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    main: [
      { name: 'Dashboard', path: '/' },
      { name: 'Transactions', path: '/transactions' },
      { name: 'Budgets', path: '/budgets' },
      { name: 'Goals', path: '/goals' }
    ],
    analysis: [
      { name: 'Feasibility', path: '/feasibility' },
      { name: 'Advisory', path: '/advisory' },
      { name: 'Scenarios', path: '/scenarios' }
    ],
    tools: [
      { name: 'Tax & Health', path: '/tax-health' },
      { name: 'Reports', path: '/reports' }
    ]
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Finlytics</h2>
        <span>Personal Finance</span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>MAIN</h3>
          <ul>
            {menuItems.main.map((item) => (
              <li 
                key={item.name}
                className={isActive(item.path) ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <h3>ANALYSIS</h3>
          <ul>
            {menuItems.analysis.map((item) => (
              <li 
                key={item.name}
                className={isActive(item.path) ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <h3>TOOLS</h3>
          <ul>
            {menuItems.tools.map((item) => (
              <li 
                key={item.name}
                className={isActive(item.path) ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;