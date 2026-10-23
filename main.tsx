import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@/app/App';
import { AudioPlaybackProvider } from '@/components/audio-playback-provider';
import './app/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AudioPlaybackProvider>
        <App />
      </AudioPlaybackProvider>
    </BrowserRouter>
  </React.StrictMode>
);
