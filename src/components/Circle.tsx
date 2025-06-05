import React from 'react';

interface CircleProps {
  width?: number; // width in pixels, optional with default
}

const Circle = ({ width = 64 }: CircleProps) => {
    return (
        <div 
            className='bg-[#484848] rounded-full' 
            style={{ width: `${width}px`, height: `${width}px` }}
        />
    );
};

export default Circle;