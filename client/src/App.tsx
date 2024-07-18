import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PressesStates from './pages/PressesStates';
import PressesProduction from './pages/PressesProduction';
import Quality from './pages/Quality';
import ScrapRegister from './pages/ScrapRegister';
import PressesRegisterProduction from './pages/PressesRegisterproduction';


function App() {
    return (
        <Router>
        <Routes>
            <Route path="/presses_states" element={<PressesStates />} />
            <Route path="/presses_production" element={<PressesProduction />} />
            <Route path="/" element={<Quality />} />
            <Route path="/scrap_register" element={<ScrapRegister />} />
            <Route path="/presses_register_production" element={<PressesRegisterProduction />} />
        </Routes>
        </Router>
    );
}

export default App;