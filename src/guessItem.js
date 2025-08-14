import React from 'react';
import './styles/App.css';

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

const GuessItem = ({ guess, correctAnswer, guessNumber }) => {
    // Função para determinar a cor com base na comparação com a resposta correta
    const getColorClass = (field, value) => {
        // Caso especial para hobby que é um array
        if (field === 'HOBBY') {
            var hasAll = true;
            var hasOne = false;
            // Verifica se qualquer hobby da tentativa está na lista da resposta correta
            for (let hobby of guess.HOBBY) {
                if (correctAnswer.HOBBY.includes(hobby)) {
                    hasOne = true;
                } else {
                    hasAll = false;
                }
            }
            if (hasAll) return 'correct';
            if (hasOne) return 'parcial';
            return 'incorrect';
        }

        // Verificar se é uma correspondência exata
        if (value === correctAnswer[field]) {
            return 'correct';
        }

        // Campos numéricos com comparação especial
        if (field === 'ALTURA') {
            const guessValue = parseFloat(value);
            const correctValue = parseFloat(correctAnswer[field]);

            if (guessValue < correctValue) {
                return 'incorrect up';
            } else {
                return 'incorrect down';
            }
        }

        // Para ingresso (formato MM/YYYY)
        if (field === 'INGRESSO') {
            const [guessMonth, guessYear] = value.split('/').map(num => parseInt(num));
            const [correctMonth, correctYear] = correctAnswer[field].split('/').map(num => parseInt(num));

            // Comparar anos primeiro, depois meses
            if (guessYear < correctYear || (guessYear === correctYear && guessMonth < correctMonth)) {
                return 'incorrect up';
            } else {
                return 'incorrect down';
            }
        }

        // Para nascimento (formato DD/MM/YYYY)
        if (field === 'NASCIMENTO') {
            const [guessDay, guessMonth, guessYear] = value.split('/').map(num => parseInt(num));
            const [correctDay, correctMonth, correctYear] = correctAnswer[field].split('/').map(num => parseInt(num));

            // Comparar anos, depois meses, depois dias
            if (guessYear < correctYear ||
                (guessYear === correctYear && guessMonth < correctMonth) ||
                (guessYear === correctYear && guessMonth === correctMonth && guessDay < correctDay)) {
                return 'incorrect up';
            } else if (guessYear > correctYear ||
                (guessYear === correctYear && guessMonth > correctMonth) ||
                (guessYear === correctYear && guessMonth === correctMonth && guessDay > correctDay)) {
                return 'incorrect down';
            }
        }

        // Para outros campos, retorna apenas incorrect
        return 'incorrect';
    };

    // Função para renderizar setas quando necessário
    const renderArrow = (className) => {
        if (className.includes('up')) {
            return <p className="arrow up">↑</p>;
        } else if (className.includes('down')) {
            return <p className="arrow down">↓</p>;
        }
        return null;
    };

    return (
        <div className="guess-item">
            <div className='guess-item-header'>
                <div className='guess-item-profile'>
                    <img src={guess.FOTOS} alt={guess.NOME} className="profile-pic" />
                    <span className="profile-name">{toTitleCase(guess.NOME)}</span>
                </div>
                <div className='guess-item-number'>
                    <span className="guess-number">#{guessNumber}</span>
                </div>
            </div>

            <div className="divider"></div>

            <div className="guess-item-content-container">
                <div className="info-content">
                    <p>Idade</p>
                    {(() => {
                        const colorClass = getColorClass('NASCIMENTO', guess.NASCIMENTO);
                        return (
                            <div className={`info-content-container ${colorClass}`}>
                                <p>{guess.NASCIMENTO}</p>
                                {renderArrow(colorClass)}
                            </div>
                        );
                    })()}
                </div>

                <div className="info-content">
                    <p>Gênero</p>
                    <div className={`info-content-container ${getColorClass('GENERO', guess.GENERO)}`}>
                        <p>{guess.GENERO}</p>
                    </div>
                </div>

                <div className="info-content">
                    <p>Altura</p>
                    {(() => {
                        const colorClass = getColorClass('ALTURA', guess.ALTURA);
                        return (
                            <div className={`info-content-container ${colorClass}`}>
                                <p>{guess.ALTURA} cm</p>
                                {renderArrow(colorClass)}
                            </div>
                        );
                    })()}
                </div>

                <div className="info-content">
                    <p>Cabelo</p>
                    <div className={`info-content-container ${getColorClass('CABELO', guess.CABELO)}`}>
                        <p>{guess.CABELO}</p>
                    </div>
                </div>

                <div className="info-content">
                    <p>Setor</p>
                    <div className={`info-content-container ${getColorClass('SETOR', guess.SETOR)}`}>
                        <p>{guess.SETOR}</p>
                    </div>
                </div>

                <div className="info-content">
                    <p>Cargo</p>
                    <div className={`info-content-container ${getColorClass('CARGO', guess.CARGO)}`}>
                        <p>{guess.CARGO}</p>
                    </div>
                </div>

                <div className="info-content">
                    <p>Liderança</p>
                    <div className={`info-content-container ${getColorClass('LIDERANÇA', guess.LIDERANÇA)}`}>
                        <p>{guess.LIDERANÇA}</p>
                    </div>
                </div>

                <div className="info-content">
                    <p>Ingresso</p>
                    {(() => {
                        const colorClass = getColorClass('INGRESSO', guess.INGRESSO);
                        return (
                            <div className={`info-content-container ${colorClass}`}>
                                <p>{guess.INGRESSO}</p>
                                {renderArrow(colorClass)}
                            </div>
                        );
                    })()}
                </div>

                <div className="info-content">
                    <p>Hobby</p>
                    <div className={`info-content-container ${getColorClass('HOBBY', guess.HOBBY)}`}>
                        {guess.HOBBY.map((hobby, index) => (
                            <p key={index}>{hobby}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuessItem;