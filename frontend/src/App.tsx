import { useState } from 'react'
import './App.css'

interface PredictionResponse {
  risk_level: string
  probability: number
}

interface FormData {
  duration: string
  credit_amount: string
  installment_commitment: string
  residence_since: string
  age: string
  existing_credits: string
  num_dependents: string
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    duration: '',
    credit_amount: '',
    installment_commitment: '',
    residence_since: '',
    age: '',
    existing_credits: '',
    num_dependents: ''
  })

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const features = {
        duration: parseFloat(formData.duration),
        credit_amount: parseFloat(formData.credit_amount),
        installment_commitment: parseFloat(formData.installment_commitment),
        residence_since: parseFloat(formData.residence_since),
        age: parseFloat(formData.age),
        existing_credits: parseFloat(formData.existing_credits),
        num_dependents: parseFloat(formData.num_dependents)
      }

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features })
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fillHighRisk = () => {
    setFormData({
      duration: '24',
      credit_amount: '5000',
      installment_commitment: '3',
      residence_since: '2',
      age: '28',
      existing_credits: '2',
      num_dependents: '1'
    })
  }

  const fillLowRisk = () => {
    setFormData({
      duration: '6',
      credit_amount: '1000',
      installment_commitment: '1',
      residence_since: '4',
      age: '45',
      existing_credits: '1',
      num_dependents: '1'
    })
  }

  return (
    <div className="app">
      <div className="container">
        <h1>💳 Credit Risk Prediction</h1>
        <p className="subtitle">Enter applicant details to assess credit risk</p>

        <div className="quick-fill">
          <button onClick={fillHighRisk} className="btn-secondary">
            Fill High Risk Example
          </button>
          <button onClick={fillLowRisk} className="btn-secondary">
            Fill Low Risk Example
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="age">Age (years)</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="18"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Loan Duration (months)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="1"
                max="72"
              />
            </div>

            <div className="form-group">
              <label htmlFor="credit_amount">Credit Amount ($)</label>
              <input
                type="number"
                id="credit_amount"
                name="credit_amount"
                value={formData.credit_amount}
                onChange={handleChange}
                required
                min="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="installment_commitment">Installment Rate (%)</label>
              <input
                type="number"
                id="installment_commitment"
                name="installment_commitment"
                value={formData.installment_commitment}
                onChange={handleChange}
                required
                min="1"
                max="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="residence_since">Residence Since (years)</label>
              <input
                type="number"
                id="residence_since"
                name="residence_since"
                value={formData.residence_since}
                onChange={handleChange}
                required
                min="1"
                max="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="existing_credits">Existing Credits</label>
              <input
                type="number"
                id="existing_credits"
                name="existing_credits"
                value={formData.existing_credits}
                onChange={handleChange}
                required
                min="1"
                max="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="num_dependents">Number of Dependents</label>
              <input
                type="number"
                id="num_dependents"
                name="num_dependents"
                value={formData.num_dependents}
                onChange={handleChange}
                required
                min="1"
                max="2"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Predict Risk'}
          </button>
        </form>

        {error && (
          <div className="result error">
            <h2>❌ Error</h2>
            <p>{error}</p>
          </div>
        )}

        {prediction && (
          <div className={`result ${prediction.risk_level.toLowerCase()}`}>
            <h2>
              {prediction.risk_level === 'High' ? '⚠️' : '✅'} Risk Assessment
            </h2>
            <div className="prediction-details">
              <div className="risk-level">
                <span className="label">Risk Level:</span>
                <span className="value">{prediction.risk_level}</span>
              </div>
              <div className="probability">
                <span className="label">Default Probability:</span>
                <span className="value">{(prediction.probability * 100).toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${prediction.probability * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
