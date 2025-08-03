import React from 'react';
import MapView from './components/MapView';

interface AppProps {
  ctx: {
    apiUrl: string;
    tileUrl: string;
    gridUrl: string;
  };
}

const App: React.FC<AppProps> = ({ ctx }) => {
  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      <MapView ctx={ctx} />
    </div>
  );
};

export default App;