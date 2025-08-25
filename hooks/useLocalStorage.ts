import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : (initialValue instanceof Function ? initialValue() : initialValue);
        } catch (error) {
            console.error(error);
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                if (storedValue === undefined || storedValue === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, JSON.stringify(storedValue));
                }
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        }
    }, [key, storedValue]);


    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                if (e.newValue) {
                    try {
                        setStoredValue(JSON.parse(e.newValue));
                    } catch (error) {
                        console.error(`Error parsing storage change for key "${key}":`, error);
                    }
                } else {
                    setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue]);

    return [storedValue, setStoredValue];
}
