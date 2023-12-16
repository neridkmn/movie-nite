import React, { useState } from "react";

export const ErrorContext = React.createContext();
export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const setErrorMessage = (errorMessage) => {
        setError(errorMessage);
        setTimeout(() => setError(null), 4000)
    }
    return (
        <ErrorContext.Provider value={{ error, setErrorMessage }}>
            {children}
        </ErrorContext.Provider>
    );
};