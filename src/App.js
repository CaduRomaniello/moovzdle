import GuessItem from './GuessItem';
import './styles/App.css';
import React, { useState, useEffect } from 'react';
import employeesData from './data/data.json';

const correctAnswer = {}
// const guess = {}

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

const getEmployeeOfTheDay = (employees, offsetDays = 0) => {
  if (!employees || !employees.length) return null;
  
  // Obter a data atual em UTC
  const today = new Date();
  
  // Aplicar offset (0 para hoje, -1 para ontem)
  today.setDate(today.getDate() + offsetDays);
  
  // Componentes UTC da data
  const utcYear = today.getUTCFullYear();
  const utcMonth = today.getUTCMonth();
  const utcDay = today.getUTCDate();
  
  // Criar uma semente baseada na data (consistente para o mesmo dia)
  const dateSeed = (utcYear * 31 * 12) + (utcMonth * 31) + utcDay;
  
  // Usar a semente para selecionar um funcionário
  const index = dateSeed % employees.length;
  
  return employees[index];
};

function App() {
  const [inputValue, setInputValue] = useState('');
  const [employees, setEmployees] = useState([]);
  const [todaysEmployee, setTodaysEmployee] = useState(null);
  const [yesterdaysEmployee, setYesterdaysEmployee] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [guesses, setGuesses] = useState([]); // Array para armazenar os palpites do usuário
  const [gameWon, setGameWon] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [lastPlayedDate, setLastPlayedDate] = useState(null);

  const [isResolutionOk, setIsResolutionOk] = useState(true);
  const minWidth = 1980; // Largura mínima aceitável em pixels
  const minHeight = 600; // Altura mínima aceitável em pixels

  useEffect(() => {
    // Função para verificar se a resolução é adequada
    const checkResolution = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsResolutionOk(width >= minWidth && height >= minHeight);
    };
    
    // Verificar imediatamente ao carregar
    checkResolution();
    
    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', checkResolution);
    
    // Remover listener ao desmontar o componente
    return () => window.removeEventListener('resize', checkResolution);
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      
      // Calcular o próximo dia (meia-noite UTC)
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      
      // Calcular diferença em milissegundos
      const diff = tomorrow - now;
      
      // Converter para horas, minutos e segundos
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
    };
    
    // Executar imediatamente e depois a cada segundo
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(timerId);
  }, []);

  // Carregar dados do JSON e definir funcionários do dia
  useEffect(() => {
    // Carregar dados dos funcionários
    setEmployees(employeesData);
    
    // Verificar data atual para comparar com o último jogo
    const today = new Date();
    const currentDate = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
    
    // Carregar data do último jogo
    const savedDate = localStorage.getItem('moovzdle_lastPlayed');
    setLastPlayedDate(savedDate);
    
    // Se for um novo dia ou primeiro acesso, configurar novo jogo
    if (savedDate !== currentDate) {
      // Definir funcionário do dia atual
      const todayEmployee = getEmployeeOfTheDay(employeesData);
      setTodaysEmployee(todayEmployee);
      
      // Definir funcionário do dia anterior
      const yesterdayEmployee = getEmployeeOfTheDay(employeesData, -1);
      setYesterdaysEmployee(yesterdayEmployee);
      
      // Resetar estado do jogo
      setGuesses([]);
      setGameWon(false);
      
      // Salvar data atual
      localStorage.setItem('moovzdle_lastPlayed', currentDate);
      localStorage.setItem('moovzdle_todayEmployee', JSON.stringify(todayEmployee));
      localStorage.setItem('moovzdle_yesterdayEmployee', JSON.stringify(yesterdayEmployee));
      localStorage.setItem('moovzdle_guesses', JSON.stringify([]));
      localStorage.setItem('moovzdle_gameWon', 'false');
    } 
    // Se for o mesmo dia, carregar estado do jogo salvo
    else {
      try {
        const savedTodayEmployee = JSON.parse(localStorage.getItem('moovzdle_todayEmployee'));
        const savedYesterdayEmployee = JSON.parse(localStorage.getItem('moovzdle_yesterdayEmployee'));
        const savedGuesses = JSON.parse(localStorage.getItem('moovzdle_guesses'));
        const savedGameWon = localStorage.getItem('moovzdle_gameWon') === 'true';
        
        setTodaysEmployee(savedTodayEmployee);
        setYesterdaysEmployee(savedYesterdayEmployee);
        setGuesses(savedGuesses || []);
        setGameWon(savedGameWon);

        if (savedGameWon) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        
        // Fallback em caso de erro: configurar novo jogo
        const todayEmployee = getEmployeeOfTheDay(employeesData);
        setTodaysEmployee(todayEmployee);
        
        const yesterdayEmployee = getEmployeeOfTheDay(employeesData, -1);
        setYesterdaysEmployee(yesterdayEmployee);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Filtrar sugestões apenas se tiver texto no input
    if (value.trim()) {
      const filteredSuggestions = employees.filter(employee => 
        // Verifica se o nome inclui o texto digitado
        employee.NOME.toLowerCase().includes(value.toLowerCase()) &&
        // Exclui funcionários que já foram palpitados
        !guesses.some(guess => guess.NOME === employee.NOME)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Selecionar uma sugestão
  const selectSuggestion = (employee) => {
    setInputValue(employee.NOME);
    setSuggestions([]);
  };

  // Função para adicionar palpite
  const handleGuess = () => {
    // Verificar se há algum texto no input
    if (!inputValue.trim()) return;
    
    // Encontrar o funcionário pelo nome
    const guessedEmployee = employees.find(
      emp => emp.NOME.toLowerCase() === inputValue.toLowerCase()
    );
    
    // Verificar se encontrou o funcionário e se não foi palpitado antes
    if (guessedEmployee && !guesses.some(guess => guess.NOME === guessedEmployee.NOME)) {
      // Atualizar guesses com o novo palpite
      const updatedGuesses = [guessedEmployee, ...guesses];
      setGuesses(updatedGuesses);
      setInputValue(''); // Limpar o input após o palpite
      
      // Verificar se o palpite está correto
      const isCorrect = guessedEmployee.NOME === todaysEmployee.NOME;
      if (isCorrect) {
        setGameWon(true);
        setShowModal(true);
      }
      
      // Salvar estado no localStorage
      localStorage.setItem('moovzdle_guesses', JSON.stringify(updatedGuesses));
      localStorage.setItem('moovzdle_gameWon', isCorrect ? 'true' : 'false');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
    <div className={`App ${!isResolutionOk || showModal ? 'darkened-background' : ''}`}>
      <div className="App-header">
        <img src="/logo.svg" alt="MOOVZ Logo" className="title" />
        <div className="App-header-container">
          {/* Input e botão aparecem APENAS se o usuário NÃO acertou E ainda tem tentativas */}
          {!gameWon && guesses.length < 5 ? (
            <>
            <div className="logo-container">
              <p className="subtitle">Adivinhe o funcionário</p>
            </div><div className='input-wrapper'>
                <div className="input-container">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
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
                            src={employee.FOTOS}
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
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`attempt-circle ${index < 5 - guesses.length ? 'remaining' : 'used'}`}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Contador aparece APENAS quando o usuário acertou OU acabaram as tentativas */
            <div className="countdown-container">
              <div className="countdown-label">Próximo funcionário em:</div>
              <div className="countdown-time">
                {String(timeRemaining.hours).padStart(2, '0')}:
                {String(timeRemaining.minutes).padStart(2, '0')}:
                {String(timeRemaining.seconds).padStart(2, '0')}
              </div>
            </div>
          )}

         
        </div>
      </div>

      {/* Main app */}
      <div className="App-main">

        {/* Adicione este contador acima do caption */}
        {/* <div className="countdown-container">
          <div className="countdown-label">Próximo funcionário em:</div>
          <div className="countdown-time">
            {String(timeRemaining.hours).padStart(2, '0')}:
            {String(timeRemaining.minutes).padStart(2, '0')}:
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
        </div> */}

        <div className="caption">
          <p className="palpites-text">Palpites</p>

          <div className="legend-container">
            <div className="circle green"></div>
            <span className="legend-text">Correto</span>
            
            <div className="circle yellow"></div>
            <span className="legend-text">Próximo</span>
            
            <div className="circle red"></div>
            <span className="legend-text">Incorreto</span>
          </div>
        </div>
        
        <div className='guesses-container'>
          {guesses.map((guess, index) => (
            <GuessItem 
              key={index} 
              guess={guess} 
              correctAnswer={todaysEmployee || correctAnswer}
              guessNumber={guesses.length - index} 
            />
          ))}
        </div>

        {/* Adicione isto após o fechamento da div guesses-container */}
        <div className="yesterday-employee">
          {yesterdaysEmployee && (
            <>
              <p>O funcionário de ontem foi</p>
              <p><strong>{toTitleCase(yesterdaysEmployee.NOME)}</strong></p>
              <img 
                src={yesterdaysEmployee.FOTOS} 
                alt={yesterdaysEmployee.NOME}
                className="yesterday-employee-image" 
              />
            </>
          )}
        </div>
      </div>

    </div>
    {/* Modal de vitória */}
    {showModal && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>×</button>
          <div className="modal-header">
            <h2>Parabéns!</h2>
          </div>
          <div className="modal-body">
            <p>Você acertou! O funcionário do dia é:</p>
            <div className="modal-employee">
              <img 
                src={todaysEmployee?.FOTOS} 
                alt={todaysEmployee?.NOME} 
                className="modal-employee-image"
              />
              <p className="modal-employee-name">{toTitleCase(todaysEmployee?.NOME)}</p>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Adicione o modal de resolução inadequada aqui */}
    {!isResolutionOk && (
      <div className="resolution-modal-overlay">
        <div className="resolution-modal-content">
          <div className="resolution-modal-header">
            <h2>Resolução inadequada</h2>
          </div>
          <div className="resolution-modal-body">
            <p>O Moovzdle ainda não suporta essa resolução de tela.</p>
            <p>Por favor, aumente a janela do seu navegador ou diminua o zoom para continuar jogando.</p>
            <div className="resolution-icon">
              <span className="resolution-icon-arrows">↔️</span>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default App;