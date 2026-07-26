import './styles.css'

function Inactivity({
  inactiveCounter,
  setCounter,
  setInactiveCounter,
  limitInactive,
}) {
  return (
    <div
      id="inac-container"
      className="d-flex flex-column position-fixed text-center w-100 h-100 px-3 pl-3"
    >
      <div
        id="inac-body"
        className="card d-flex flex-column bg-light position-relative bordered p-4"
      >
        <strong className="fs-3">Tiempo de Inactividad</strong>
        <p>Ha estado mucho tiempo inactivo</p>
        <p>Será redirigido en {inactiveCounter} segundos</p>
        <button
          className="btn btn-success"
          onClick={(e) => {
            setCounter(0);
            setInactiveCounter(limitInactive);
          }}
        >
          SIGO AQUÍ
        </button>
      </div>
    </div>
  );
}

export default Inactivity;
