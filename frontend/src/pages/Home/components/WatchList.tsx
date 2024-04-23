import { Badge, Card, SparkAreaChart } from '@tremor/react';
import { AddTransaction } from './AddTransaction';
import { cutText, isStockMarketLive } from '../utils/calculations';
import {

    todayStock,
    myMoney,
    todayNums,
    todayPrices,


} from '../models/responses'

import { classNames } from "../utils/classNames"
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RiRecordCircleFill } from '@remixicon/react';

type Props = {
    money: myMoney | undefined
    todayNums: todayNums | undefined
    stocksTodayData: todayStock[] | undefined
    todayPrices: todayPrices
}

export const WatchList = ({ money, todayNums, stocksTodayData, todayPrices }: Props) => {
    const prevMoney = useRef<number | undefined>(undefined);
    const prevStockPrices = useRef<{ [key: string]: number }>({});
    const [animationColorMoney, setAnimationColorMoney] = useState<'green' | 'red' | undefined>(undefined);
    const [stockPriceAnimations, setStockPriceAnimations] = useState<{ [key: string]: 'green' | 'red' | undefined }>({});
    const [, setStockPriceAnimationTimers] = useState<{ [key: string]: ReturnType<typeof setTimeout> | null }>({});

    

    useEffect(() => {
        if (money) {
            if (prevMoney.current === undefined) {
                prevMoney.current = money.totalCurrentValue;
            } else {
                if (money.totalCurrentValue > prevMoney.current) {


                    setAnimationColorMoney('green');
                } else if (money.totalCurrentValue < prevMoney.current) {


                    setAnimationColorMoney('red');
                }
                prevMoney.current = money.totalCurrentValue;
            }
        }
    }, [money]);

    useEffect(() => {
        const newStockPriceAnimations: { [key: string]: 'green' | 'red' | undefined } = {};
        if (stocksTodayData) {
            stocksTodayData.forEach((item) => {
                const currentPrice = parseFloat(item.current_price);
                const symbol = item.symbol;

                if (!isNaN(currentPrice) && prevStockPrices.current[symbol] !== undefined) {
                    const prevPrice = prevStockPrices.current[symbol];

                    if (currentPrice > prevPrice) {
                        newStockPriceAnimations[symbol] = 'green';
                    } else if (currentPrice < prevPrice) {
                        newStockPriceAnimations[symbol] = 'red';
                    }
                }

                prevStockPrices.current[symbol] = currentPrice;
            });
        }
        setStockPriceAnimations(newStockPriceAnimations);
    }, [stocksTodayData]);

    useEffect(() => {
        let timeoutMoney: ReturnType<typeof setTimeout>;
        if (animationColorMoney) {
            timeoutMoney = setTimeout(() => {
                setAnimationColorMoney(undefined);
            }, 1000);
        }

        const newStockPriceAnimationTimers: { [key: string]: ReturnType<typeof setTimeout> | null } = {};

        Object.entries(stockPriceAnimations).forEach(([symbol, color]) => {
            if (color) {
                newStockPriceAnimationTimers[symbol] = setTimeout(() => {
                    setStockPriceAnimations((prevAnimations) => ({
                        ...prevAnimations,
                        [symbol]: undefined,
                    }));
                }, 1000);
            } else {
                newStockPriceAnimationTimers[symbol] = null;
            }
        });

        setStockPriceAnimationTimers(newStockPriceAnimationTimers);

        return () => {
            clearTimeout(timeoutMoney);
            Object.values(newStockPriceAnimationTimers).forEach((timer) => {
                if (timer) {
                    clearTimeout(timer);
                }
            });
        };
    }, [animationColorMoney, stockPriceAnimations]);

    return (
        <Card className="sm:mx-auto sm:max-w-md h-[70vh] overflow-y-scroll">
            <span className="flex items-center justify-between">
                <div className='flex gap-2 items-center'>

                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                        Watchlist
                    </p>

                    {
                        isStockMarketLive() ?

                            <Badge icon={RiRecordCircleFill}>live</Badge>
                            :
                            <Badge color={"gray"} icon={RiRecordCircleFill}>close</Badge>

                    }

                </div>

                <AddTransaction
                />

            </span>
            <span className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {

                    money ?
                        <motion.span
                            animate={{
                                color: animationColorMoney === 'green' ? '#10b981' : animationColorMoney === 'red' ? '#ef4444' : undefined,
                            }}
                            transition={{ duration: 0.2 }}
                            className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong"
                        >
                            {'$' + money?.totalCurrentValue?.toFixed(2)}
                        </motion.span>
                        :
                        <span className='flex items-center'>
                            <Skeleton className="h-[36px] w-[200px]" />
                        </span>
                }
            </span>
            <span className="flex mt-1 text-tremor-default font-medium">
                {
                    todayNums ?
                        <span className={classNames(
                            todayNums?.changeType === 'positive'
                                ? 'text-emerald-700 dark:text-emerald-500 '
                                : 'text-red-700 dark:text-red-500',
                        )}>

                            {todayNums.changeType === 'positive' ?
                                '+' : '-'
                            }
                            ${todayNums.priceChange} ({todayNums.percentChange}%)

                        </span>
                        :
                        <>
                            <Skeleton className="h-[20px] w-[122px]" />
                        </>
                }
                <span className="ml-1 font-normal text-tremor-content dark:text-dark-tremor-content">
                    Today
                </span>
            </span>
            <ul role="list" className="mt-8 space-y-8">
                {
                    stocksTodayData ? stocksTodayData.map((item: todayStock) => (

                        <li
                            key={item.symbol}
                            className="flex items-center justify-between space-x-6"
                        >
                            <div className="truncate">
                                <p className="truncate text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong flex gap-2">
                                    {
                                        item.logo_id ?
                                            <img width={20} src={`https://s3-symbol-logo.tradingview.com/${item.logo_id}.svg`} alt="" />
                                            :
                                            <span className='w-[20px] h-[20px] bg-slate-500'></span>
                                    }

                                    {item.symbol}
                                </p>
                                <p className="truncate text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                                    {cutText(item.description)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">

                                <SparkAreaChart
                                    data={todayPrices[item.symbol]}
                                    index={"index"}
                                    categories={["price"]}
                                    showGradient={true}
                                    curveType='linear'
                                    showAnimation={true}
                                    colors={
                                        item.changeType === 'positive' ? ['emerald'] : ['red']
                                    }
                                    className="h-10  flex-none lg:max-w-34"
                                />

                                <div className="w-14 text-right sm:w-16">
                                    <motion.p
                                        animate={{
                                            color: stockPriceAnimations[item.symbol] === 'green' ? '#10b981' : stockPriceAnimations[item.symbol] === 'red' ? '#ef4444' : undefined,
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                        ${Number(item.current_price).toFixed(2)}
                                    </motion.p>
                                    <p
                                        className={classNames(
                                            item.changeType === 'positive'
                                                ? 'text-emerald-700 dark:text-emerald-500 '
                                                : 'text-red-700 dark:text-red-500',
                                            'text-tremor-label font-medium',
                                        )}
                                    >
                                        {item.changeType === 'positive' &&
                                            '+'
                                        }
                                        {item.change}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))
                        :
                        <div className='flex items-center justify-between space-x-6'>
                            <>
                                <Skeleton className="h-[40px] w-[122px]" />
                                <Skeleton className="h-[40px] w-[122px]" />
                                <Skeleton className="h-[40px] w-[122px]" />
                            </>
                        </div>
                }
            </ul>
        </Card>

    )
}