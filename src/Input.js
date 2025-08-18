import './styles/input.css';

function toTitleCase(str) {
    if (!str) return str;

    return str
        .toLowerCase()
        .split(' ')
        .map(word => {
            if (word.length === 0) return word;
            return word[0].toUpperCase() + word.slice(1);
        })
        .join(' ');
}

function Input(
    { inputValue, handleInputChange, suggestions, selectSuggestion, handleGuess, guesses }
) {
    const handleEnter = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleGuess();
        }
    };

    return (
        <>
            <div className="subtitle-container">
                <p className="subtitle">Adivinhe o funcionário</p>
            </div>
            <div className='input-wrapper'>
                <div className="input-container">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleEnter}
                        placeholder="Digite o nome de alguém aqui..."
                        className="text-input" />

                    {suggestions.length > 0 && (
                        <div className="suggestions-container">
                            {suggestions.map((employee, index) => (
                                <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() => selectSuggestion(employee)}
                                >
                                    <img
                                        src={employee.PROFILEPIC || 'https://marketplace.canva.com/A5alg/MAESXCA5alg/1/tl/canva-user-icon-MAESXCA5alg.png'}
                                        alt={employee.NOME}
                                        className="suggestion-image" />
                                    <span className="suggestion-name">{toTitleCase(employee.NOME)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="button-container">
                    <button
                        className="action-button"
                        onClick={handleGuess}
                    >
                        <span className="arrow-right">&#9654;</span>
                    </button>
                </div>
            </div>

            <div className="attempts-container">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className={`attempt-circle ${index < 4 - guesses.length ? 'remaining' : 'used'}`}
                    />
                ))}
            </div>
        </>
    );
}

export default Input;