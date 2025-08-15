import './styles/guesses.css';
import GuessItem from './GuessItem';

function Guesses(
    { guesses, todaysEmployee }
) {
    return (
        <>
            <div className='guesses-container'>
                {guesses.map((guess, index) => (
                    <GuessItem
                        key={index}
                        guess={guess}
                        correctAnswer={todaysEmployee || {}}
                        guessNumber={guesses.length - index}
                    />
                ))}
            </div>
        </>
    );
}

export default Guesses;