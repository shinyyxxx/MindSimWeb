import React from 'react'
import { Link } from 'react-router-dom'
import { SamskaraDemo } from '../components/SamskaraDemo'

export function Home(): React.ReactElement {
  return (
    <main className="page">
      <section className="hero-section">
        <div className="hero-content">
          <img className="logo" src="/assets/logoP.png" alt="Logo" />
          <h1 className="hero-heading">Welcome to Mindsim</h1>
          <p className="hero-text">
            Explore and visualize mental factors in an interactive 3D environment
          </p>
          <div className="hero-buttons">
            <Link className="btn btn-primary" to="/register">
              Get Started
            </Link>
            <Link className="btn btn-outline" to="/login">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-heading">The Five Skandhas</h2>

        <div className="skandha-item">
          <div className="skandha-card">
            <div style={{ fontSize: 48, color: '#667eea' }}>●</div>
            <h3 className="skandha-title">Rupa (Form)</h3>
            <p className="skandha-text">
              The physical form and material aspects of existence
            </p>
          </div>
          <div className="skandha-3d">
            <model-viewer
              src="/assets/humanMind/human.gltf"
              alt="Human form 3D model"
              camera-controls
              disable-zoom
              auto-rotate
              rotation-per-second="20deg"
              touch-action="pan-y"
              style={{ width: '100%', height: '100%' }}
            ></model-viewer>
          </div>
        </div>

        <div className="skandha-item">
          <div className="skandha-3d" style={{ background: 'white' }}>
            <img
              src="/assets/emotion/emotion.png"
              alt="Emotion"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          <div className="skandha-card">
            <div style={{ fontSize: 48, color: '#e74c3c' }}>♥</div>
            <h3 className="skandha-title">Vedana (Sensation)</h3>
            <p className="skandha-text">
              Feelings and sensations arising from contact with objects
            </p>
          </div>
        </div>

        <div className="skandha-item">
          <div className="skandha-card">
            <div style={{ fontSize: 48, color: '#764ba2' }}>👁</div>
            <h3 className="skandha-title">Samjna (Perception)</h3>
            <p className="skandha-text">
              Recognition and perception of objects and their characteristics
            </p>
          </div>
          <div className="skandha-3d" style={{ background: 'white' }}>
            <img
              src="/assets/optical/opticBunny.png"
              alt="Optical perception"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </div>

        <div className="skandha-item">
          <SamskaraDemo />
          <div className="skandha-card">
            <div style={{ fontSize: 48, color: '#f39c12' }}>⚡</div>
            <h3 className="skandha-title">Samskara (Mental Formations)</h3>
            <p className="skandha-text">
              Volitional factors, mental formations, and conditioned responses
            </p>
          </div>
        </div>

        <div className="skandha-item">
          <div className="skandha-card">
            <div style={{ fontSize: 48, color: '#27ae60' }}>🧠</div>
            <h3 className="skandha-title">Vijnana (Consciousness)</h3>
            <p className="skandha-text">
              Awareness and consciousness that cognizes and distinguishes
            </p>
          </div>
          <div className="skandha-3d">
            <model-viewer
              src="/assets/brain/scene.gltf"
              alt="Brain 3D model"
              camera-controls
              disable-zoom
              auto-rotate
              rotation-per-second="15deg"
              touch-action="pan-y"
              style={{ width: '100%', height: '100%' }}
            ></model-viewer>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-heading">Ready to explore?</h2>
        <p className="cta-text">Join Mindsim today and start visualizing mental factors</p>
        <div className="hero-buttons">
          <Link className="btn btn-white" to="/register">
            Create Account
          </Link>
          <Link
            className="btn btn-outline"
            to="/login"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderColor: 'white',
            }}
          >
            Learn More
          </Link>
        </div>
      </section>
    </main>
  )
}







