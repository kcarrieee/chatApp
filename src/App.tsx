import { PhoneFrame } from './components/PhoneFrame'
import { PrototypeScreen } from './components/PrototypeScreen'
import './App.css'

export default function App() {
  return (
    <main className="prototype-workspace" aria-label="Прототип приложения">
      <PhoneFrame><PrototypeScreen /></PhoneFrame>
    </main>
  )
}
