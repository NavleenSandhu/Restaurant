import React from 'react';
import { ClipLoader } from 'react-spinners';

const Spinner = () => {
    return (
        <div style={spinnerStyles}>
            <ClipLoader color="#3B82F6" loading={true} size={50} />
        </div>
    );
};

const spinnerStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
};

export default Spinner;