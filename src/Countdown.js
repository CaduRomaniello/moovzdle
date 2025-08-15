import './styles/countdown.css';

function Countdown(
    {timeRemaining}
) {
    return (
        <>
            <div className="countdown-container">
                <div className="countdown-label">Próximo funcionário em:</div>
                <div className="countdown-time">
                    {String(timeRemaining.hours).padStart(2, '0')}:
                    {String(timeRemaining.minutes).padStart(2, '0')}:
                    {String(timeRemaining.seconds).padStart(2, '0')}
                </div>
            </div>
        </>
    );
}

export default Countdown;