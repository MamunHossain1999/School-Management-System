import React from 'react';

// A responsive page container that constrains width on large screens and
// adds consistent paddings and vertical spacing. It also ensures proper
// scroll area on mobile while keeping the header sticky from the layout.
export const PageContainer: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
  return (
    <div className={`mx-auto w-full max-w-7xl sm:px-4 px-3 sm:py-4 py-3 ${className || ''}`}>
      {children}
    </div>
  );
};

// A simple wrapper for wide tables to enable horizontal scrolling on small screens
// without breaking layout.
export const TableWrap: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
  return (
    <div className={`w-full overflow-x-auto -mx-3 sm:mx-0 ${className || ''}`}>
      <div className="min-w-full inline-block align-middle">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
