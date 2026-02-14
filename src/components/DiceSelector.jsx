import React from 'react';

const DiceSelector = ({ dice, onDiceSelect }) => {
    const handleSelect = (selectedDice) => {
        onDiceSelect(selectedDice);
    };

    return (
        <div>
            {dice.map((die) => (
                <button key={die} onClick={() => handleSelect(die)}>
                    {die}
                </button>
            ))}
        </div>
    );
};

export default DiceSelector;
