import React, { ChangeEvent, useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { GeistProvider, CssBaseline, Textarea, Page } from '@geist-ui/core'
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import Console from './containers/Console'
import './App.css'


function App() {
   return (
    <div className="App">
      <Console />
    </div>
  )
}

export default App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      <App />
    </GeistProvider>
  </React.StrictMode>
)
