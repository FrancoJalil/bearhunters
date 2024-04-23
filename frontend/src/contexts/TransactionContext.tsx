import React, { createContext, useState } from 'react';

export interface TransactionContextType {
  transactionCompleted: boolean;
  setTransactionCompleted: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TransactionContext = createContext<TransactionContextType | null>(null);


interface TransactionProviderProps {
  children: React.ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactionCompleted, setTransactionCompleted] = useState<boolean>(false);

  return (
    <TransactionContext.Provider value={{ transactionCompleted, setTransactionCompleted }}>
      {children}
    </TransactionContext.Provider>
  );
};

