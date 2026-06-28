import React from 'react';

interface Props {
    questions: string[];
    onClick: (q: string) => void;
}

export const FollowUpChips: React.FC<Props> = ({ questions, onClick }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
                <button
                    key={idx}
                    onClick={() => onClick(q)}
                    className="px-3 py-1 bg-transparent border border-brand-console hover:border-brand-mint transition-colors rounded-full text-xs text-text-secondary hover:text-brand-mint"
                >
                    {q}
                </button>
            ))}
        </div>
    );
};
