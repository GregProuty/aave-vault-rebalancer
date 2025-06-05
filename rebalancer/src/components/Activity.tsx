import React from 'react';
import Circle from './Circle';
interface ActivityProps {
  events: string[];
}

const Activity = ({ events }: ActivityProps) => {
    return (
        <div className='bg-[#1a1a1a] border border-[#333] rounded-lg w-full p-4'>
            <p className='text-2xl text-white mb-2'>Activity</p>
            <ul className='text-white'>
                {events.map((event, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Circle width={18} />
                    <li className='text-gray-400 my-2'>{event}</li>
                  </div>
                ))}
            </ul>
        </div>
    );
};

export default Activity;