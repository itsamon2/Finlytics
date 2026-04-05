import React from 'react';
import './Loader.css';

/**
 * Usage:
 *   <Loader />                        — three shapes, centered in a full page
 *   <Loader fullPage={false} />       — inline, no page fill
 *   <Loader message="Loading data" /> — custom message below the shapes
 */
const Loader = ({ fullPage = true, message = 'Loading...' }) => {
  const shapes = (
    <div className="loader-shapes">
      {/* Circle */}
      <div className="loader">
        <svg viewBox="0 0 80 80">
          <circle r="32" cy="40" cx="40" />
        </svg>
      </div>

      {/* Triangle */}
      <div className="loader triangle">
        <svg viewBox="0 0 86 80">
          <polygon points="43 8 79 72 7 72" />
        </svg>
      </div>

      {/* Square */}
      <div className="loader">
        <svg viewBox="0 0 80 80">
          <rect height="64" width="64" y="8" x="8" />
        </svg>
      </div>
    </div>
  );

  if (!fullPage) {
    return (
      <div className="loader-inline">
        {shapes}
        {message && <p className="loader-message">{message}</p>}
      </div>
    );
  }

  return (
    <div className="loader-fullpage">
      {shapes}
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;