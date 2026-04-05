import React from 'react'; const Card = ({ children, className = "" }) => ( <div className={`bg-white shadow-md ${className}`}> {children} </div>
); export default Card;