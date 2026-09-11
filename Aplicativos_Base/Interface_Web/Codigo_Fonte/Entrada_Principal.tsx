import React from 'react';
import ReactDOM from 'react-dom/client';
import { AplicativoVisual } from './Aplicativo_Visual.js';
import './Estilos_Globais.css';

const elementoRaiz = document.getElementById('raiz-aplicativo');

if (elementoRaiz) {
  ReactDOM.createRoot(elementoRaiz).render(
    <React.StrictMode>
      <AplicativoVisual />
    </React.StrictMode>
  );
}
