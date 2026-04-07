import SubmitForm from '../components/SubmitForm'

export default function Submit() {
  return (
    <div className="submit-page">
      <div className="page-header">
        <h1 className="page-title">Confess</h1>
        <p className="page-subtitle">Get it off your chest. No one will ever know it was you.</p>
      </div>
      <SubmitForm />
    </div>
  )
}
