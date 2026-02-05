import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { SimplePage } from './pages/SimplePage'
import { Playground } from './pages/Playground'
import { Simulation } from './pages/Simulation'
import { MindStudy } from './pages/MindStudy'

function App(): React.ReactElement {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mind-study" element={<MindStudy />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/login" element={<SimplePage title="Login" />} />
        <Route path="/register" element={<SimplePage title="Register" />} />
        <Route path="*" element={<SimplePage title="Not Found" />} />
      </Routes>
    </>
  )
}

export default App







