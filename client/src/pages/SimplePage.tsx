import React from 'react'

interface SimplePageProps {
  title: string
}

export function SimplePage({ title }: SimplePageProps): React.ReactElement {
  return (
    <main className="page">
      <div className="simple-wrap">
        <h1 className="simple-title">This is {title} Page</h1>
        <p className="simple-muted">This is a placeholder page for now.</p>
      </div>
    </main>
  )
}







