import React, { useEffect, useState } from 'react';

function Loading({ isLoading }) {
  const [loadingText, setLoadingText] = useState('Loading');
  useEffect(() => {
    setTimeout(() => {
      if (loadingText === 'Loading...') {
        setLoadingText('Loading');
        return;
      }
      setLoadingText(`${loadingText}.`);
    }, 600);
  }, [loadingText]);
  return (
    <div className={isLoading ? 'loading' : 'loading loading_hidden'}>
      <h2 className="loading__text">{loadingText}</h2>
    </div>
  );
}

export default Loading;
