import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface TicketData {
    id: string;
    code: string;
    itemName: string;
    validated: boolean;
    createdAt: string;
    expiresAt?: string;
    userId: string;
}

type TicketsContextType = {
    tickets: TicketData[];
    loading: boolean;
    error: string | null;
};

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setTickets([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        const ticketsRef = collection(database, 'tickets');
        const userTicketsQuery = query(ticketsRef, where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(userTicketsQuery, (snapshot) => {
            try {
                if (!snapshot.empty) {
                    const loadedTickets: TicketData[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as TicketData[];
                    setTickets(loadedTickets);
                } else {
                    setTickets([]);
                }
                setLoading(false);
                setError(null);
            } catch (err: any) {
                console.error("Erro no processamento de ingressos:", err);
                setError("Erro ao processar dados dos ingressos.");
                setLoading(false);
            }
        }, (err) => {
            console.error("Erro na escuta de ingressos:", err);
            setError("Erro de conexão com o banco de dados.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <TicketsContext.Provider value={{ tickets, loading, error }}>
            {children}
        </TicketsContext.Provider>
    );
}

export function useTickets() {
    const context = useContext(TicketsContext);
    if (context === undefined) {
        throw new Error('useTickets must be used within a TicketsProvider');
    }
    return context;
}
