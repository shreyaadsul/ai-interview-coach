import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import EvaluationMetric from './EvaluationMetric';

export default function AnswerEvaluationPage({ 
  questionNumber = 3, 
  question = "Explain the difference between supervised and unsupervised learning.", 
  userAnswer = "", 
  onNextQuestion 
}) {

  // Mock data DB to supply details per question based on spec
  const mockEvaluations = {
    1: {
      technicalScore: 8,
      communicationScore: 7,
      completenessScore: 8,
      confidenceScore: 8,
      strengths: [
        "Clear distinction between classification and clustering.",
        "Strong logical structuring of supervised goals."
      ],
      improvements: [
        "Incorporate examples of regression algorithms.",
        "Mention semi-supervised learning briefly."
      ]
    },
    2: {
      technicalScore: 9,
      communicationScore: 8,
      completenessScore: 7,
      confidenceScore: 8,
      strengths: [
        "Excellent definition of model variance.",
        "Correctly listed regularization techniques (L1/L2)."
      ],
      improvements: [
        "Detail cross-validation techniques.",
        "Explain early stopping as a prevention method."
      ]
    },
    3: {
      technicalScore: 8,
      communicationScore: 7,
      completenessScore: 8,
      confidenceScore: 7,
      strengths: [
        "Good understanding of core concepts.",
        "Clear and concise explanation."
      ],
      improvements: [
        "Add more real-world examples.",
        "Explain with use cases.",
        "Improve depth in unsupervised learning."
      ]
    }
  };

  const evaluation = mockEvaluations[questionNumber] || {
    technicalScore: 8,
    communicationScore: 8,
    completenessScore: 7,
    confidenceScore: 8,
    strengths: [
      "Demonstrated solid understanding of the subject matter.",
      "Well-structured response formatting."
    ],
    improvements: [
      "Elaborate further on key technical definitions.",
      "Provide a practical industry example."
    ]
  };

  const getStars = (score) => Math.floor(score / 2);

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Answer Evaluation
        </h1>
        <p className="text-gray-400 text-sm mt-1">Detailed evaluation and recommendations for improvement.</p>
      </div>

      {/* SECTION 1: Success Alert Banner */}
      <div className="flex items-center gap-3 p-4 bg-[#111827] border-l-4 border-[#22C55E] rounded-r-xl border border-y-[#1F2937] border-r-[#1F2937]">
        <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
        <span className="text-sm font-semibold text-white">Answer Submitted</span>
      </div>

      {/* SECTION 2: Question Card */}
      <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl flex items-start gap-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] mt-2 flex-shrink-0" />
        <div>
          <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Question {questionNumber}</span>
          <p className="text-white font-medium text-lg mt-1 leading-relaxed">
            Q{questionNumber}. {question}
          </p>
        </div>
      </div>

      {/* SECTION 3: User Answer Card */}
      <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Your Answer</h3>
        <p className="text-gray-300 text-sm leading-relaxed bg-[#0B1020]/40 p-4 rounded-xl border border-[#1F2937]/50 select-text whitespace-pre-wrap">
          {userAnswer || "No answer submitted."}
        </p>
      </div>

      {/* SECTION 4: AI Evaluation */}
      <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-gray-300">AI Evaluation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EvaluationMetric 
            title="Technical Accuracy" 
            score={evaluation.technicalScore} 
            stars={getStars(evaluation.technicalScore)} 
          />
          <EvaluationMetric 
            title="Communication" 
            score={evaluation.communicationScore} 
            stars={getStars(evaluation.communicationScore)} 
          />
          <EvaluationMetric 
            title="Completeness" 
            score={evaluation.completenessScore} 
            stars={getStars(evaluation.completenessScore)} 
          />
          <EvaluationMetric 
            title="Confidence" 
            score={evaluation.confidenceScore} 
            stars={getStars(evaluation.confidenceScore)} 
          />
        </div>
      </div>

      {/* SECTION 5: Feedback Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT CARD: Strengths */}
        <div className="bg-[#22C55E]/5 border border-[#22C55E]/40 p-6 rounded-2xl space-y-4">
          <h4 className="text-lg font-bold text-[#22C55E]">Strengths</h4>
          <ul className="space-y-3">
            {evaluation.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mt-2 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT CARD: Improvements */}
        <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/40 p-6 rounded-2xl space-y-4">
          <h4 className="text-lg font-bold text-[#F59E0B]">Improvements</h4>
          <ul className="space-y-3">
            {evaluation.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-2 flex-shrink-0" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SECTION 6: NEXT QUESTION BUTTON */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onNextQuestion}
          className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:shadow-lg hover:shadow-[#7C3AED]/25 text-white font-semibold rounded-xl text-sm transition-all duration-300 focus:outline-none hover:scale-[1.02] transform"
        >
          Next Question
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
