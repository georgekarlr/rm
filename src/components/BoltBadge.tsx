import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-110 duration-200"
        aria-label="Powered by Bolt.new"
      >
        <img
          src="/black_circle_360x360.png"
          alt="Powered by Bolt.new"
          className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </a>
    </div>
  );
};

export default BoltBadge;