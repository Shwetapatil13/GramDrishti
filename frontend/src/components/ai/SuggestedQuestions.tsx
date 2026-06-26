import React from 'react';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onSelect }) => {
  const questions = [
    "Why did the health score decrease?",
    "Which areas need intervention?",
    "Compare vegetation with last year",
    "Suggest climate adaptation measures",
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {questions.map((q, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(q)}
          className="bg-surface-elevated border border-surface-border text-text-secondary text-[11px] font-mono uppercase px-3 py-1.5 rounded-full hover:border-brand-mint hover:text-brand-mint transition-colors text-left"
        >
          {q}
        </button>
      ))}
    </div>
  );
};