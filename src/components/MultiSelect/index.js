import React from 'react';
import Select from 'react-select';
import { IoClose } from 'react-icons/io5'; // O cualquier icono de 'X' que uses

export default function MultiSelect ({ options, value, onChange, placeholder, styles }) {
  // Maneja la eliminación de un badge individual al hacer clic en la "X"
  const handleRemove = (valToRemove) => {
    onChange(value.filter(val => val !== valToRemove));
  };

  return (
    <div className="d-flex flex-column gap-2">
      {/* Selector Principal (Buscador limpio arriba) */}
      <Select
        isMulti
        options={options.map(opt => ({ value: opt, label: opt }))}
        value={value.map(opt => ({ value: opt, label: opt }))}
        onChange={selectedOptions => 
          onChange(selectedOptions ? selectedOptions.map(opt => opt.value) : [])
        }
        placeholder={placeholder}
        styles={{
          ...styles,
          // Ocultamos las etiquetas dentro del input para que el buscador siempre empiece primero
          multiValue: () => ({ display: 'none' }), 
        }}
        // Mantiene la lista limpia de los ya seleccionados si lo deseas
        hideSelectedOptions={true} 
      />

      {/* Lista de Seleccionados (Acumulados hacia abajo) */}
      {value.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-1">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="badge d-inline-flex align-items-center gap-1 fw-normal text-dark border px-2 py-1"
              style={{
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1',
                borderRadius: '6px',
                fontSize: '0.8rem'
              }}
            >
              {item}
              <IoClose
                className="cursor-pointer text-muted"
                style={{ cursor: 'pointer' }}
                onClick={() => handleRemove(item)}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};