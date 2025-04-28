import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import PressesStates from "./pages/PressesStates";
import PressesProduction from "./pages/PressesProduction";
import Quality from "./pages/Quality";
import ScrapRegister from "./pages/ScrapRegister";
import PressesRegisterProduction from "./pages/PressesRegisterproduction";
import ReportsMenu from "./pages/ReportsMenu";
import ScrapReport from "./pages/ScrapReport";
import ProductionRecordsMenu from "./pages/ProductionRecordsMenu";
import EditProductionRecords from "./pages/EditProductionRecords";
import RubberReport from "./pages/RubberReport";
import ScrapSummary from "./pages/ScrapSummary";
import ParamsRegister from "./pages/ParamsRegister";
import WareHouseShipsHistory from "./pages/WareHouseShipsHistory";
import PartNumCatalogue from "./pages/PartNumCatalogue";
import PartNumCreation from "./pages/PartNumCreation";
import ConfigMenu from "./pages/ConfigMenu";
import ShiftConfig from "./pages/ShiftConfig";
import ProductionRecordsSummary from "./pages/ProductionRecordsSummary";
import ProductionRecordsDetails from "./pages/ProductionRecordsDetails";
import ScrapRegisterTest from "./pages/ScrapRegisterTest";
import InsertsShipsHistory from "./pages/InsertsShipsHistory";
import EmailConfig from "./pages/EmailConfig";
import ParamsSummary from "./pages/ParamsSummary";
import IndividualParam from "./pages/IndividualParam";
import InsertsCatalogue from "./pages/InsertsCatalogue";
import DashBoard from "./pages/DashBoard";
import ProductionPage from "./pages/ProductionPage";
import ScrapDashboard from "./pages/ScrapDashboard";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/presses_states" element={<PressesStates />} />
				<Route path="/presses_production" element={<PressesProduction />} />
				<Route
					path="/presses_production/machine/:machineName"
					element={<ProductionPage />}
				/>
				<Route path="/" element={<Quality />} />
				<Route path="/scrap_register" element={<ScrapRegister />} />
				<Route path="/scrap_register_test" element={<ScrapRegisterTest />} />
				<Route path="/scrap_summary" element={<ScrapSummary />} />
				<Route path="/scrap_analysis" element={<ScrapDashboard />} />
				<Route
					path="/presses_register_production"
					element={<PressesRegisterProduction />}
				/>
				<Route path="/reports_menu" element={<ReportsMenu />} />
				<Route path="/scrap_report" element={<ScrapReport />} />
				<Route path="/inserts_history" element={<InsertsShipsHistory />} />
				<Route path="/inserts" element={<InsertsCatalogue />} />
				<Route path="/rubber_history" element={<WareHouseShipsHistory />} />
				<Route path="/rubber_report" element={<RubberReport />} />
				<Route path="/production_records" element={<ProductionRecordsMenu />} />
				<Route
					path="/edit_production_record"
					element={<EditProductionRecords />}
				/>
				<Route
					path="/press_production_records_summary"
					element={<ProductionRecordsSummary />}
				/>
				<Route
					path="/press_production_records_details"
					element={<ProductionRecordsDetails />}
				/>
				<Route path="/params" element={<ParamsSummary />} />
				<Route path="params_details" element={<IndividualParam />} />
				<Route path="/params_register" element={<ParamsRegister />} />
				<Route path="/part_num" element={<PartNumCatalogue />} />
				<Route path="/part_num_creation" element={<PartNumCreation />} />
				<Route path="/config" element={<ConfigMenu />} />
				<Route path="/set_shift" element={<ShiftConfig />} />
				<Route path="/set_email" element={<EmailConfig />} />
				<Route path="/dashboard" element={<DashBoard />} />
			</Routes>
		</Router>
	);
}

export default App;
