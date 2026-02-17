import React from 'react';

interface TimelineProps {
  status: string;
}

const statuses = [
  'pending',
  'awaiting_payment',
  'confirmed',
  'completed',
  'expired',
];

const Timeline: React.FC<TimelineProps> = ({ status }) => {
  return (
    <div className="flex items-center space-x-4">
      {statuses.map((s, index) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-4 h-4 rounded-full ${
              statuses.indexOf(status) >= index ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          ></div>
          {index < statuses.length - 1 && <div className="w-8 h-1 bg-gray-300"></div>}
        </div>
      ))}
    </div>
  );
};

export default Timeline;