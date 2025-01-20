import { useEffect } from "react";

export const useWaitFullInput = (
    input: string,
    setInput: (input: string) => void,
    callback: () => void,
    delay = 500
) => {
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            callback();
        }, delay);

        return () => clearTimeout(timer);
    }, [input]);

    return handleInput;
}; 