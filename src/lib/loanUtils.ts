
export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type InterestType = 'simple' | 'compound';

export interface Installment {
    number: number;
    date: string;
    amount: number;
    isPaid: boolean;
}

export const calculateEndDate = (startDate: string, frequency: Frequency, installments: number): string => {
    const date = new Date(startDate);

    for (let i = 0; i < installments; i++) {
        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'biweekly':
                date.setDate(date.getDate() + 15);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
        }
    }

    return date.toISOString().split('T')[0];
};

export const generateSchedule = (
    startDate: string,
    frequency: Frequency,
    installments: number,
    installmentAmount: number,
    paidInstallments: number = 0
): Installment[] => {
    const schedule: Installment[] = [];
    const date = new Date(startDate);

    for (let i = 1; i <= installments; i++) {
        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'biweekly':
                date.setDate(date.getDate() + 15);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
        }

        schedule.push({
            number: i,
            date: date.toISOString().split('T')[0],
            amount: installmentAmount,
            isPaid: i <= paidInstallments
        });
    }

    return schedule;
};

export const calculateLoanDetails = (
    principal: number,
    rate: number,
    installments: number,
    interestType: InterestType = 'simple'
) => {
    let totalInterest = 0;

    if (interestType === 'simple') {
        // En préstamos de consumo rápidos, a menudo el interés es un % fijo del capital inicial
        // Pero técnicamente interés simple es P * r * t. 
        // Vamos a usar la lógica comercial común: Tasa mensual aplicada al capital por el número de meses.
        totalInterest = principal * (rate / 100);
    } else {
        // Interés Compuesto / Francés (simplificado para el sistema de cuotas fijas)
        const monthlyRate = rate / 100;
        const compoundFactor = Math.pow(1 + monthlyRate, installments);
        const totalAmount = principal * compoundFactor;
        totalInterest = totalAmount - principal;
    }

    const totalAmount = principal + totalInterest;
    const installmentAmount = totalAmount / installments;

    return {
        totalInterest,
        totalAmount,
        installmentAmount
    };
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
