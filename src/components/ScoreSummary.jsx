import React from 'react';

const ScoreSummary = ({ score }) => {
    return (
        <div className="score-summary">
            <h2>Score Summary</h2>
            <p>Your Score: {score}</p>
        </div>
    );
};

export default ScoreSummary;