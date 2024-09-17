import React, { createContext, useState, useContext } from 'react';

export const TableNumberContext = createContext();

export const TableNumberProvider = ({ children }) => {
    const [tableNumber, setTableNumber] = useState(null);

    return (
        <TableNumberContext.Provider value={{ tableNumber, setTableNumber }}>
            {children}
        </TableNumberContext.Provider>
    );
};
