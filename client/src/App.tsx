import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { SimplePage } from './pages/SimplePage'
import { Playground } from './pages/Playground'

function App(): React.ReactElement {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mind-study" element={<SimplePage title="Mind Study" />} />
        <Route path="/simulation" element={<SimplePage title="Simulation" />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/login" element={<SimplePage title="Login" />} />
        <Route path="/register" element={<SimplePage title="Register" />} />
        <Route path="/demo" element={<SimplePage title="Demo" />} />
        <Route path="*" element={<SimplePage title="Not Found" />} />
      </Routes>
    </>
  )
}

export default App







