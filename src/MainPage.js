import './styles/main-page.css';
import React, { useState, useEffect } from 'react';
import employeesData from './data/data.json';
import Header from './Header';
import Caption from './Caption';
import Guesses from './Guesses';
import YesterdayEmployee from './YesterdayEmployee';
import VictoryModal from './VictoryModal';

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

function MainPage() {
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

                if (savedGameWon || savedGuesses.length >= 4) {
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

        if (guesses.length + 1 >= 4) {
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <>
            <div className='main-page'>
                <Header
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    employees={employees}
                    setEmployees={setEmployees}
                    todaysEmployee={todaysEmployee}
                    setTodaysEmployee={setTodaysEmployee}
                    yesterdaysEmployee={yesterdaysEmployee}
                    setYesterdaysEmployee={setYesterdaysEmployee}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                    guesses={guesses}
                    setGuesses={setGuesses}
                    gameWon={gameWon}
                    setGameWon={setGameWon}
                    showModal={showModal}
                    setShowModal={setShowModal}
                    timeRemaining={timeRemaining}
                    setTimeRemaining={setTimeRemaining}
                    lastPlayedDate={lastPlayedDate}
                    setLastPlayedDate={setLastPlayedDate}
                    isResolutionOk={isResolutionOk}
                    setIsResolutionOk={setIsResolutionOk}
                    minWidth={minWidth}
                    minHeight={minHeight}
                    handleInputChange={handleInputChange}
                    selectSuggestion={selectSuggestion}
                    handleGuess={handleGuess}
                    closeModal={closeModal}
                />
                <Caption />
                <Guesses 
                    guesses={guesses}
                    todaysEmployee={todaysEmployee}
                />
                <YesterdayEmployee
                    yesterdaysEmployee={yesterdaysEmployee}
                />
                <VictoryModal
                    showModal={showModal}
                    closeModal={closeModal}
                    todaysEmployee={todaysEmployee} 
                    guesses={guesses}
                    gameWon={gameWon}
                />
            </div>
        </>
    );
}

export default MainPage;