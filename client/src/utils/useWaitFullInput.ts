import { useState, useEffect, useCallback } from 'react';

export const useWaitFullInput = (initialInput: string, callback: (input: string) => void, delay = 500) => {
    const [input, setInput] = useState(initialInput);
    const [debouncedValue, setDebouncedValue] = useState(initialInput);

    // Manejar el cambio de input
    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    // Actualizar el valor "debounced" después del delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(input);
        }, delay);

        return () => clearTimeout(timer);
    }, [input, delay]);

    // Ejecutar el callback cuando cambie el valor "debounced"
    useEffect(() => {
        if (debouncedValue !== initialInput) {
            callback(debouncedValue);
        }
    }, [debouncedValue, callback, initialInput]);

    return { input, handleInput };
};
