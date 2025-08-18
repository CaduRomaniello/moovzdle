import './styles/caption.css';

function Caption({ timeRemaining }) {
  return (
    <>
      <div className="caption">
        <p className="caption-title">Palpites</p>

        <div className="legend-container">
          <div className="legend-item">
            <div className="circle green"></div>
            <span className="legend-text">Correto</span>
          </div>
          <div className="legend-item">
            <div className="circle yellow"></div>
            <span className="legend-text">Próximo</span>
          </div>
          <div className="legend-item">
            <div className="circle red"></div>
            <span className="legend-text">Incorreto</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Caption;
