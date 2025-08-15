import './styles/victory-modal.css';

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

function VictoryModal(
    { showModal, closeModal, todaysEmployee, guesses, gameWon }
) {
    const perdeu = guesses.length === 4 && !gameWon;
    const venceu = gameWon;

    return (
        <>
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <div className="modal-header">
                            <h2>{venceu ? 'Parabéns!' : 'Fim de jogo'}</h2>
                        </div>
                        <div className="modal-body">
                            {perdeu && (
                                <p>Você não acertou! O funcionário do dia era:</p>
                            )}
                            {venceu && (
                                <p>Você acertou! O funcionário do dia é:</p>
                            )}
                            <div className="modal-employee">
                                <img
                                    src={todaysEmployee?.PROFILEPIC || 'https://marketplace.canva.com/A5alg/MAESXCA5alg/1/tl/canva-user-icon-MAESXCA5alg.png'}
                                    alt={todaysEmployee?.NOME}
                                    className="modal-employee-image"
                                />
                                <p className="modal-employee-name">{toTitleCase(todaysEmployee?.NOME)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default VictoryModal;