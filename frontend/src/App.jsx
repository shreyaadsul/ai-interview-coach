import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LiveInterview from './pages/LiveInterview';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard Layout */}
        <Route 
          path="/" 
          element={
            <div className="min-h-screen bg-navy-900 selection:bg-primary/30">
              <Sidebar />
              <div className="flex flex-col">
                <Header />
                <main className="ml-64 p-8">
                  <Dashboard />
                </main>
              </div>
            </div>
          } 
        />
        
        {/* Fullscreen Live Interview Route */}
        <Route path="/live" element={<LiveInterview />} />
      </Routes>
    </Router>
  );
}

export default App;
