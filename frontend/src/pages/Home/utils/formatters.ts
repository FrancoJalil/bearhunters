import {
    holding,
    stockGroupBySector,
    stockImage,
} from '../models/responses'

export const chartDataLoader = [
    {
        date: 'Start',
    },
    {
        date: 'End',
    } 
];


export const dataFormatter = (number: number) => `$ ${Intl.NumberFormat('us').format(number).toString()}`;
export const dataFormatterTwo = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}%`;

export function groupHoldingsBySector(data: holding[]): stockGroupBySector[] {
    const sectorValues: { [sector: string]: number } = {}
    const sectorStocks: { [sector: string]: stockImage[] } = {}

    for (const obj of data) {
        const sector = obj.sector
        const symbol = obj.symbol
        const logoId = obj.logo_id
        const currentPrice = Number(obj.current_price)
        const quantity = Number(obj.quantity)

        const totalValue = currentPrice * quantity

        sectorValues[sector] = (sectorValues[sector] || 0) + totalValue

        if (!sectorStocks[sector]) {
            sectorStocks[sector] = []
        }
        sectorStocks[sector].push({ name: symbol, logo_id: logoId })
    }

    return Object.entries(sectorValues)
       .map(([sector, value]) => ({
           name: sector,
           value,
           stocks: sectorStocks[sector],
       }))
       .sort((a, b) => a.name.localeCompare(b.name));
}