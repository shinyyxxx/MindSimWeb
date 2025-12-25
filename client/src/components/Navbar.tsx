import React from 'react'
import { NavLink } from 'react-router-dom'

export function Navbar(): React.ReactElement {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `link ${isActive ? 'active' : ''}`

  return (
    <header className="nav">
      <NavLink className="brand" to="/">
        Mindsim
      </NavLink>
      <nav className="links">
        <NavLink className={linkClass} to="/">
          Home
        </NavLink>
        <NavLink className={linkClass} to="/mind-study">
          Mind Study
        </NavLink>
        <NavLink className={linkClass} to="/playground">
          Playground
        </NavLink>
        <NavLink className={linkClass} to="/simulation">
          Simulation
        </NavLink>
      </nav>
    </header>
  )
}







