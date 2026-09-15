import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Fallback if index.html hasn't added #root yet
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
  ReactDOM.createRoot(div).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
