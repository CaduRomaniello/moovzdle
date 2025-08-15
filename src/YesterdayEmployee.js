import './styles/yesterday-employee.css';

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

function YesterdayEmployee(
    { yesterdaysEmployee }
) {
    return (
        <>
            <div className="yesterday-employee">
                {yesterdaysEmployee && (
                    <>
                        <p>O funcionário de ontem foi</p>
                        <p><strong>{toTitleCase(yesterdaysEmployee.NOME)}</strong></p>
                        <img
                            src={yesterdaysEmployee.PROFILEPIC || 'https://marketplace.canva.com/A5alg/MAESXCA5alg/1/tl/canva-user-icon-MAESXCA5alg.png'}
                            alt={yesterdaysEmployee.NOME}
                            className="yesterday-employee-image"
                        />
                    </>
                )}
            </div>
        </>
    );
}

export default YesterdayEmployee;