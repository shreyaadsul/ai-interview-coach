import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import ResumeAnalysis from './components/ResumeAnalysis';
import PerformanceRadar from './components/PerformanceRadar';
import QuestionAnalysis from './components/QuestionAnalysis';
import ScoreBreakdown from './components/ScoreBreakdown';
import ATSSuggestions from './components/ATSSuggestions';
import RecentInterviews from './components/RecentInterviews';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-navy-900 selection:bg-primary/30">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        
        <main className="ml-64 p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <KPICards />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                <ResumeAnalysis />
              </div>
              <div className="lg:col-span-2">
                <PerformanceRadar />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <QuestionAnalysis />
              </div>
              <div className="lg:col-span-1">
                <ScoreBreakdown />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ATSSuggestions />
              <RecentInterviews />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;
