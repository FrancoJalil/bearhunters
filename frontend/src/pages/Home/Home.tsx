import { Divider } from '@tremor/react';
import { useContext, useEffect, useState } from 'react';
import { urlBase } from '@/utils/variables';
import axios from 'axios';
import { StocksTable } from './components/StocksTable';
import { WatchList } from './components/WatchList';
import { CardsData } from './components/CardsData';
import { StockNews } from './components/StockNews';
import { TransactionContext, TransactionContextType } from '@/contexts/TransactionContext';

import {
    holding,
    todayNums,
    todayStock,
    perfomerStock,
    myMoney,
    HoldingValue,
    stockGroupBySector,
    timeProfit,
    cash_days,
    todayPrices
} from './models/responses'
import { DonnutCash } from './components/DonnutCash';
import { DailyGainLoss } from './components/DailyGainLoss';
import { StocksSectors } from './components/StocksSectors';
import { groupHoldingsBySector } from './utils/formatters'
import {
    calculateProfitLossPercentage,
    calculateProfitInDollars,
    calculateProfitLossDollars,
    determineChangeType,
    isStockMarketLive

} from "./utils/calculations"
import { motion } from 'framer-motion'

export const Home = () => {
    const { transactionCompleted, setTransactionCompleted } = useContext(TransactionContext) as TransactionContextType

    const [totalStocksHold, setTotalStocksHold] = useState<HoldingValue[]>()
    const [stocksTodayData, setStocksTodayData] = useState<todayStock[]>()
    const [todayPrices, setTodayPrices] = useState<todayPrices>({})
    const [holdings, setHoldings] = useState<holding[]>()
    const [sectorCount, setSectorCount] = useState<stockGroupBySector[]>()
    const [bestPerfomer, setBestPerfomer] = useState<perfomerStock>();
    const [worstPerfomer, setWorstPerfomer] = useState<perfomerStock>();
    const [money, setMoney] = useState<myMoney>()
    const [todayNums, setTodayNums] = useState<todayNums>()
    const [timeProfit, setTimeProfit] = useState<timeProfit[]>()
    const [timeProfitLoading, setTimeProfitLoading] = useState(false)
    const [selectedDailyCountToggleValue, setselectedDailyCountToggleValue] = useState<cash_days>(30);

    const handleToggleChange = async (value: cash_days) => {
        setTimeProfitLoading(true)

        setselectedDailyCountToggleValue(value);
        await getTimeProfit(value)
        setTimeProfitLoading(false)

    };

    const getTimeProfit = async (cashDays = 30) => {
        const response = await axios.get(`${urlBase}/portfolio/time-profit/${cashDays}`)
        const data = response.data
        setTimeProfit(data)

        const lastData = data[data.length - 1]
        const previousData = data[data.length - 2]

        const gainsToday = lastData.money - previousData.money
        const percentGainsToday = previousData.money !== 0 ? (gainsToday / previousData.money) * 100 : 0
        const changeType = gainsToday >= 0 ? 'positive' : 'negative'
        const absGainsToday = Math.abs(gainsToday)

        setTodayNums({
            priceChange: absGainsToday.toFixed(2),
            percentChange: percentGainsToday.toFixed(2),
            changeType,
        })

        const totalCurrentValue = lastData.money
        const totalInitialInvestment = lastData.invested_money
        const totalDifference = totalCurrentValue - totalInitialInvestment
        const totalPercentageChange = totalInitialInvestment !== 0 ? ((totalDifference / totalInitialInvestment) * 100).toFixed(2) : 0
        const changeTypeMoney = totalDifference >= 0 ? 'positive' : 'negative'
        const absTotalDifference = Math.abs(totalDifference)

        setMoney({
            totalInitialInvestment,
            totalCurrentValue: parseFloat(totalCurrentValue),
            totalDifference: absTotalDifference,
            totalPercentageChange: Number(totalPercentageChange),
            changeType: changeTypeMoney,
        })
    }


    const getHoldings = async () => {
        const response = await axios.get(`${urlBase}/portfolio/holding/`)
        const holdings: holding[] = response.data.holdings
        setHoldings(holdings)

        const holdingGroupBySector = groupHoldingsBySector(holdings)
        setSectorCount(holdingGroupBySector)

        const holdingsValues = holdings.map(({ symbol, quantity, current_price }) => ({
            name: symbol,
            value: quantity * current_price
        }))

        holdingsValues.sort((a, b) => a.name.localeCompare(b.name))
        setTotalStocksHold(holdingsValues)

        const incrementos = holdings.map(holding => {
            const profitLossPercentage = calculateProfitLossPercentage(holding)
            const profit = calculateProfitInDollars(holding)
            const profitLossDollars = calculateProfitLossDollars(holding, profit)
            const changeType = determineChangeType(profitLossPercentage, profitLossDollars)
            return { symbol: holding.symbol, priceUp: profitLossDollars, percentUp: profitLossPercentage, changeType } as perfomerStock
        })

        const [maxIncrementoPorcentaje, minIncrementoPorcentaje] = [
            Math.max(...incrementos.map(({ percentUp }) => percentUp)),
            Math.min(...incrementos.map(({ percentUp }) => percentUp))
        ]

        const accionMaxIncrementoPorcentaje = incrementos.find(({ percentUp }) => percentUp === maxIncrementoPorcentaje)
        const accionMinIncrementoPorcentaje = incrementos.find(({ percentUp }) => percentUp === minIncrementoPorcentaje)

        setBestPerfomer(accionMaxIncrementoPorcentaje)
        setWorstPerfomer(accionMinIncrementoPorcentaje)
    }


    const getTodayStockData = async () => {
        const response = await axios.get(`${urlBase}/portfolio/today-stocks-data/`)
        const stocksTodayData: todayStock[] = response.data.stocks

        const stocksWithChangeData: todayStock[] = stocksTodayData.map((stock) => {
            const change = ((Number(stock.current_price) - Number(stock.previous_close)) / Number(stock.previous_close)) * 100
            const changeType: 'positive' | 'negative' = change >= 0 ? 'positive' : 'negative'
            return { ...stock, change: change.toFixed(2) + '%', changeType }
        })

        stocksWithChangeData.sort((a, b) => a.symbol.localeCompare(b.symbol))
        setStocksTodayData(stocksWithChangeData)

        let todayPrices: todayPrices = stocksWithChangeData.reduce((acc: todayPrices, curr) => {
            const { symbol, today_hourly_prices } = curr
            acc[symbol] = acc[symbol] || []
            today_hourly_prices.forEach((price, index) => {
                acc[symbol].push({ index, price: price ** 12 })
            })
            return acc
        }, {})

        const isAnyListEmpty = Object.values(todayPrices).some(list => list.length === 0)
        if (isAnyListEmpty) {
            todayPrices = stocksWithChangeData.reduce((acc: todayPrices, curr) => {
                const { symbol, previous_close, current_price } = curr
                acc[symbol] = [
                    { index: 0, price: Number(previous_close) ** 12 },
                    { index: 1, price: Number(current_price) ** 12 }
                ]
                return acc
            }, {})
        }

        setTodayPrices(todayPrices)
    }


    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                getHoldings(),
                getTodayStockData(),
                getTimeProfit(selectedDailyCountToggleValue)

            ]);
        };

        fetchData();

        const interval = setInterval(() => {
            if (isStockMarketLive()) {
                fetchData();
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [selectedDailyCountToggleValue]);





    useEffect(() => {
        if (transactionCompleted) {
            getHoldings()
            getTodayStockData()
            getTimeProfit(selectedDailyCountToggleValue)

            setTransactionCompleted(false)
        }
    }, [transactionCompleted])



    return (

        <div className="flex flex-col justify-between items-center p-5 gap-5 max-w-[1366px] mx-auto " id="app-container">

            <div className="flex flex-col lg:flex-row justify-between items-start gap-5 w-full h-full">

                <div className='flex flex-col items-center gap-5 w-full h-full'>

                    <motion.div
                        transition={{ duration: .2 }}
                        initial={{
                            scale: 0.2
                        }}
                        animate={{
                            scale: 1
                        }}
                        className="flex flex-col lg:flex-row justify-center gap-5 w-full h-full">

                        <DonnutCash
                            totalStocksHold={totalStocksHold}
                            selectedDailyCountToggleValue={selectedDailyCountToggleValue}
                            timeProfitLoading={timeProfitLoading}
                            handleToggleChange={handleToggleChange}
                            timeProfit={timeProfit}
                        />

                        <WatchList
                            money={money}
                            todayNums={todayNums}
                            stocksTodayData={stocksTodayData}
                            todayPrices={todayPrices}
                        />




                    </motion.div>

                    <CardsData
                        money={money}
                        worstPerfomer={worstPerfomer}
                        bestPerfomer={bestPerfomer}
                    />

                    <StocksTable
                        holdings={holdings}
                    />

                    <DailyGainLoss
                        selectedDailyCountToggleValue={selectedDailyCountToggleValue}
                        timeProfitLoading={timeProfitLoading}
                        handleToggleChange={handleToggleChange}
                        timeProfit={timeProfit}
                        sectorCount={sectorCount}
                    />

                </div>

                <motion.div
                    transition={{ duration: .2 }}
                    initial={{
                        x: 100
                    }}
                    animate={{
                        x: 0
                    }}
                    className="flex flex-col w-full md:w-fit justify-center items-center">
                    <StockNews
                    />

                    <Divider />

                    <StocksSectors
                        sectorCount={sectorCount} />
                </motion.div>


            </div>

        </div>


    )
}



