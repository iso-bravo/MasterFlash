import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PressesStates from './pages/PressesStates';
import PressesProduction from './pages/PressesProduction';
import Quality from './pages/Quality';
import ScrapRegister from './pages/ScrapRegister';
import PressesRegisterProduction from './pages/PressesRegisterproduction';
import ReportsMenu from './pages/ReportsMenu';
import ScrapReport from './pages/ScrapReport';
import ProductionRecordsMenu from './pages/ProductionRecordsMenu';
import EditProductionRecords from './pages/EditProductionRecords';
import RubberReport from './pages/RubberReport';
import ScrapSummary from './pages/ScrapSummary';

function App() {
    return (
        <Router>
        <Routes>
            <Route path="/presses_states" element={<PressesStates />} />
            <Route path="/presses_production" element={<PressesProduction />} />
            <Route path="/" element={<Quality />} />
            <Route path="/scrap_register" element={<ScrapRegister />} />
            <Route path='/scrap_summary' element={<ScrapSummary />} />
            <Route path="/presses_register_production" element={<PressesRegisterProduction />} />
            <Route path="/reports_menu" element={<ReportsMenu/>} />
            <Route path="/scrap_report" element={<ScrapReport/>} />
            <Route path="/rubber_report" element={<RubberReport/>} />
            <Route path='/production_records' element={<ProductionRecordsMenu/>} />
            <Route path='/edit_production_record' element={<EditProductionRecords/>} />
        </Routes>
        </Router>
    );
}

export default App;