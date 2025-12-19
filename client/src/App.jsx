import './App.css'
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { Home } from "./pages/Home.jsx";
import { SimplePage } from "./pages/SimplePage.jsx";
import { Playground } from "./pages/Playground.jsx";

function App() {
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
