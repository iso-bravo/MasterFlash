import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PressesStates from './pages/PressesStates';
import PressesProduction from './pages/PressesProduction';

function App() {
    return (
        <Router>
        <Routes>
            <Route path="/presses_states" element={<PressesStates />} />
            <Route path="/presses_production" element={<PressesProduction />} />
        </Routes>
        </Router>
    );
}

export default App;