import React, { useState } from 'react'

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  
  const testClick = () => {
    console.log('Button clicked!')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Button works!')
    }, 1000)
  }
  
  const testAPI = async () => {
    console.log('Testing API...')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      })
      const data = await response.json()
      console.log('API response:', data)
      alert('API works! Check console')
    } catch (error) {
      console.error('API error:', error)
      alert('API failed! Check console')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <button 
        onClick={testClick}
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          marginRight: '10px',
          fontSize: '16px' 
        }}
      >
        {loading ? 'Loading...' : 'Test Click'}
      </button>
      
      <button 
        onClick={testAPI}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px' 
        }}
      >
        Test API
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <p>Open browser console to see logs</p>
      </div>
    </div>
  )
}

export default TestPage