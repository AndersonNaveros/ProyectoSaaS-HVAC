import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './globalStyles.css'
import './catalogPage.css'
import './aboutPage.css'
import './contactPage.css'

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
