import { Circles } from 'react-loader-spinner';

function Spinner({ message }) {
  return (
    <div className="loader-state">
      <Circles
        color="#111827"
        height={50}
        width={50}
      />

      {message && <p>{message}</p>}
    </div>
  );
}

export default Spinner;
