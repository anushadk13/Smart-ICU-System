import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import PatientDetailPage from './pages/PatientDetailPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
    return (
        <Router>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden">
                    <Navbar />
                    <main className="p-6">
                        <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/patient/:id" element={<PatientDetailPage />} />
                            {/* Add more routes as needed */}
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
