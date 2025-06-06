import { useState, useEffect } from 'react';
import '../componentescss/superimportantcomponent.css';

function LineaPorLinea({ texto }) {
  const allLines = texto.split('\n');
  const [visibleLineCount, setVisibleLineCount] = useState(0); 

  useEffect(() => {
    if (visibleLineCount < allLines.length) {
      const intervalId = setInterval(() => {
        setVisibleLineCount(prevCount => prevCount + 1); 
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [visibleLineCount, allLines.length]);

  const linesToDisplay = allLines.slice(0, visibleLineCount);

  return (
    <div>
      {linesToDisplay.map((linea, index) => (
        <h1 className='letra_xd' key={index}>{linea}</h1>
      ))}
    </div>
  );
}

export default LineaPorLinea;