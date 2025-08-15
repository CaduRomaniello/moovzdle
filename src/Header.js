import './styles/header.css';
import Input from './Input';
import Countdown from './Countdown';

function Header(
    { inputValue, setInputValue, employees, setEmployees, todaysEmployee, setTodaysEmployee, yesterdaysEmployee, setYesterdaysEmployee, suggestions, setSuggestions, guesses, setGuesses, gameWon, setGameWon, showModal, setShowModal, timeRemaining, setTimeRemaining, lastPlayedDate, setLastPlayedDate, isResolutionOk, setIsResolutionOk, minWidth, minHeight, handleInputChange, selectSuggestion, handleGuess, closeModal }
) {
    return (
        <>
            <div className='header'>
                <img src="/logo.svg" alt="MOOVZ Logo" className="title" />
                <div className="header-container">
                    {/* Input e botão aparecem APENAS se o usuário NÃO acertou E ainda tem tentativas */}
                    {!gameWon && guesses.length < 4 ? (
                        // {true ? (
                        <Input
                            inputValue={inputValue}
                            handleInputChange={handleInputChange}
                            suggestions={suggestions}
                            selectSuggestion={selectSuggestion}
                            handleGuess={handleGuess}
                            guesses={guesses}
                        />
                    ) : (
                        // Contador aparece APENAS quando o usuário acertou OU acabaram as tentativas
                        <Countdown 
                            timeRemaining={timeRemaining}
                        />
                    )}


                </div>
            </div>
        </>
    );
}

export default Header;