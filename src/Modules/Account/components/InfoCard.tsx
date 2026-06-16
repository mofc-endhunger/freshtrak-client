/**
 * InfoCard Component
 *
 * A reusable card component for displaying information sections
 * with a title and content area. Features a left border accent.
 */

import React from 'react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 border-l-highlight p-4 ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-noto-sans font-semibold text-base text-gray-900">{title}</h3>
      </div>
      <div className="font-noto-sans text-sm text-gray-600">{children}</div>
    </div>
  );
};

export default InfoCard;
