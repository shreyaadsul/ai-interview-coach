import React, { useState } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, CheckCircle, Info } from 'lucide-react';

export default function MockInterviewPage({ 
  onSubmit, 
  questionNumber: propQuestionNumber, 
  setQuestionNumber: propSetQuestionNumber,
  questions: propQuestions
}) {
  const defaultQuestions = [
    "Explain the difference between supervised and unsupervised learning.",
    "What is overfitting, and how do you prevent it?",
    "What are the key differences between React and Angular?",
    "How do you optimize frontend performance in a React application?",
    "Explain the difference between inner, outer, left, and right joins in SQL.",
    "How do you handle missing values in a dataset during data preprocessing?",
    "How would you resolve a conflict between two members of your project team?",
    "What is your strategy for keeping employees engaged in a long-term project?",
    "What is a REST API, and what are its key design principles?",
    "Explain the difference between a list and a tuple in Python.",
    "What is the role of a validation dataset during machine learning model training?",
    "What are the differences between Git merge and Git rebase?",
    "How does asynchronous programming work in JavaScript (async/await, promises)?",
    "Explain the concept of database normalization and why it is useful.",
    "What is your biggest professional achievement, and how did you accomplish it?"
  ];

  const questions = (propQuestions && propQuestions.length > 0) ? propQuestions : defaultQuestions;

  // State variables (uses props if controlled, else falls back to local state)
  const [localQuestionNumber, localSetQuestionNumber] = useState(3);
  const questionNumber = propQuestionNumber !== undefined ? propQuestionNumber : localQuestionNumber;
  const setQuestionNumber = propSetQuestionNumber !== undefined ? propSetQuestionNumber : localSetQuestionNumber;

  const [answers, setAnswers] = useState({}); // Keep answers saved by question number

  const currentQuestion = questions[questionNumber - 1] || "";
  const currentAnswer = answers[questionNumber] || "";
  const progressPercentage = Math.round((questionNumber / questions.length) * 100);

  const handleTextareaChange = (e) => {
    const text = e.target.value;
    if (text.length <= 1000) {
      setAnswers({
        ...answers,
        [questionNumber]: text
      });
    }
  };

  const handleNext = () => {
    if (questionNumber < questions.length) {
      setQuestionNumber(questionNumber + 1);
    }
  };

  const handlePrev = () => {
    if (questionNumber > 1) {
      setQuestionNumber(questionNumber - 1);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(questionNumber, currentQuestion, currentAnswer);
    } else {
      alert(`Answer submitted for Question ${questionNumber}!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Mock Interview
        </h1>
        <p className="text-gray-400 text-sm mt-1">Interactive mock session designed to hone your interview responses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Column Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: Interview Progress Card */}
          <div className="glass p-6 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-200">Interview Progress</span>
              <span className="text-xs text-gray-400 font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                Question {questionNumber} of {questions.length}
              </span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* SECTION 2: Current Question Card */}
          <div className="glass p-6 border border-white/10 rounded-2xl flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-success mt-2 flex-shrink-0 animate-pulse" />
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Question {questionNumber}</span>
              <p className="text-white font-medium text-lg mt-1 leading-relaxed">
                {currentQuestion}
              </p>
            </div>
          </div>

          {/* SECTION 3: Answer Input Area */}
          <div className="glass p-6 border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="answer-input" className="text-sm font-semibold text-gray-200">
                Your Answer
              </label>
            </div>
            <div className="relative">
              <textarea
                id="answer-input"
                className="w-full min-h-[220px] p-4 bg-navy-900/50 border border-white/10 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none transition-all duration-300 resize-y"
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={handleTextareaChange}
              />
              {/* Character Counter */}
              <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-500 bg-navy-900/80 px-2 py-1 rounded border border-white/5">
                {currentAnswer.length}/1000
              </div>
            </div>
          </div>

          {/* SECTION 4: Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 text-white font-semibold transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Submit Answer
          </button>
        </div>

        {/* Sidebar Info Area (Column Span 1) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* SECTION 5: Interview Tips Card */}
          <div className="glass p-6 border border-primary/20 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Info className="w-5 h-5" />
              <h3 className="font-semibold text-white">Interview Tips</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Be clear and concise in your explanation.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Provide real-world examples.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Structure your answer for better impact.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 6: Navigation Buttons */}
      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={questionNumber === 1}
          className="flex items-center gap-2 px-5 py-2.5 border border-primary/30 hover:border-primary disabled:opacity-30 disabled:pointer-events-none rounded-xl bg-white/5 hover:bg-primary/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-300 focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={questionNumber === questions.length}
          className="flex items-center gap-2 px-5 py-2.5 border border-primary/30 hover:border-primary disabled:opacity-30 disabled:pointer-events-none rounded-xl bg-white/5 hover:bg-primary/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-300 focus:outline-none"
        >
          Next Question
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
