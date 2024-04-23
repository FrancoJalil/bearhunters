import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { urlBase } from "@/utils/variables";
import axios from "axios";
import { DisplayTransactions } from "./DisplayTransactions";
import { useContext, useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteModal } from "./DeleteModal";
import { TransactionContext, TransactionContextType } from "@/contexts/TransactionContext";
import {
    calculateProfitLossPercentage,
    calculateVariation1d,
    calculateProfitInDollars,
    calculateProfitLossDollars,
    determineChangeType,
    adjustNegativeValues
} from "../utils/calculations"
import {
    holding
} from '../models/responses'

import { classNames } from "../utils/classNames"
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const MotionTableRow = motion(TableRow)

type Props = {
    holdings: holding[] | undefined
}

export const StocksTable = ({ holdings }: Props) => {

    const { setTransactionCompleted } = useContext(TransactionContext) as TransactionContextType

    const [isLoading, setIsLoading] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
    const [openDisplayTransactions, setOpenDisplayTransactions] = useState(false)
    const [symbol, setSymbol] = useState('')

    const [sortColumn, setSortColumn] = useState('symbol');
    const [sortDirection, setSortDirection] = useState('asc');

    const prevStockPrices = useRef<{ [key: string]: number }>({});
    const [stockPriceAnimations, setStockPriceAnimations] = useState<{ [key: string]: 'green' | 'red' | undefined }>({});
    const [, setStockPriceAnimationTimers] = useState<{ [key: string]: ReturnType<typeof setTimeout> | null }>({});
    useEffect(() => {
        const newStockPriceAnimations: { [key: string]: 'green' | 'red' | undefined } = {};
        if (holdings) {
            holdings.forEach((item) => {
                const currentPrice = item.current_price;
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
    }, [holdings])

    useEffect(() => {
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
            Object.values(newStockPriceAnimationTimers).forEach((timer) => {
                if (timer) {
                    clearTimeout(timer);
                }
            });
        };
    }, [stockPriceAnimations])


    const handleSort = (column: string) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortHoldings = (holdings: holding[]) => {
        return holdings.sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case 'symbol':
                    comparison = a.symbol.localeCompare(b.symbol);
                    break;
                case 'quantity':
                    comparison = Number(a.quantity) - Number(b.quantity);
                    break;
                case 'current_price':
                    comparison = Number(a.current_price) - Number(b.current_price);
                    break;
                case 'avg_price':
                    comparison = Number(a.avg_price) - Number(b.avg_price);
                    break;
                case '1d':
                    const oneDayChangeA = calculateVariation1d(a)
                    const oneDayChangeB = calculateVariation1d(b)
                    comparison = oneDayChangeA - oneDayChangeB
                    break;
                case 'profit_loss':
                    const profitLossA = calculateProfitLossPercentage(a);
                    const profitLossB = calculateProfitLossPercentage(b);
                    comparison = profitLossA - profitLossB;
                    break;
                case 'holdings':
                    const holdingsValueA = Number(a.current_price) * Number(a.quantity);
                    const holdingsValueB = Number(b.current_price) * Number(b.quantity);
                    comparison = holdingsValueA - holdingsValueB;
                    break;
                default:
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    const sortedHoldings = sortHoldings(holdings || []);



    const displayTransactions = async (symbol: string) => {
        setOpenDisplayTransactions(true)
        setSymbol(symbol)
    }

    const handleOpenDeleteHoldingModal = (symbol: string) => {
        setSymbol(symbol)
        setOpenDeleteModal(true)
    }

    const handleConfirmDeleteHolding = async () => {
        setIsLoading(true)

        try {
            await axios.delete(urlBase + '/portfolio/holding/', {
                data: {
                    symbol: symbol,
                }
            })

            setOpenDeleteModal(false)
            setTransactionCompleted(true)
        } finally {
            setIsLoading(false)
        }
    }




    return (
        <Table>
            <DisplayTransactions
                symbol={symbol}
                open={openDisplayTransactions}
                setOpenDisplayTransactions={setOpenDisplayTransactions}
            />

            <TableHeader>
                <TableRow>
                    <TableHead onClick={() => handleSort('symbol')} className="w-[120px] hover:underline">Symbol</TableHead>
                    <TableHead onClick={() => handleSort('quantity')} className="hover:underline">Quantity</TableHead>
                    <TableHead onClick={() => handleSort('current_price')} className="hover:underline">Last Price</TableHead>
                    <TableHead onClick={() => handleSort('1d')} className="hover:underline">1d</TableHead>
                    <TableHead onClick={() => handleSort('avg_price')} className="hover:underline">Avg. Buy Price</TableHead>
                    <TableHead onClick={() => handleSort('profit_loss')} className="hover:underline">Profit/Loss</TableHead>
                    <TableHead onClick={() => handleSort('holdings')} className="hover:underline">Holdings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    holdings !== undefined && holdings?.length > 0 ?
                        sortedHoldings.map((holding) => {

                            let profitLossPercentage = calculateProfitLossPercentage(holding);
                            let variation1d = calculateVariation1d(holding);
                            let variation1dChangeType = variation1d >= 0 ? 'positive' : 'negative';
                            let profit = calculateProfitInDollars(holding);

                            let profitLossDollars = calculateProfitLossDollars(holding, profit);

                            let changeType = determineChangeType(profitLossPercentage, profitLossDollars);

                            profitLossPercentage = adjustNegativeValues(profitLossPercentage);
                            profitLossDollars = adjustNegativeValues(profitLossDollars);
                            variation1d = adjustNegativeValues(variation1d);


                            return (
                                <MotionTableRow
                                    className="hover:bg-transparent"
                                    key={holding.symbol}
                                    animate={{
                                        backgroundColor: stockPriceAnimations[holding.symbol] === 'green' ? 'rgba(16, 185, 129, 0.2)' : stockPriceAnimations[holding.symbol] === 'red' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                                    }}
                                    transition={{ duration: 0.2 }}
                                >

                                    <TableCell className="font-medium">
                                        <span className="flex gap-2 items-center">
                                            {
                                                holding.logo_id ?
                                                    <img width={20} src={`https://s3-symbol-logo.tradingview.com/${holding.logo_id}.svg`} alt="" />
                                                    :
                                                    <div className='w-[20px] h-[20px] bg-slate-500'></div>
                                            }
                                            {holding.symbol}
                                        </span>
                                    </TableCell>
                                    <TableCell>{holding.quantity}</TableCell>
                                    <TableCell

                                        className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                                    >${Number(holding.current_price).toFixed(2)}</TableCell>
                                    <TableCell className={classNames(
                                        variation1dChangeType === 'positive'
                                            ? 'text-emerald-700 dark:text-emerald-500 '
                                            : 'text-red-700 dark:text-red-500',
                                        'text-tremor-label font-medium',
                                    )}>
                                        {variation1d.toFixed(2)}%
                                    </TableCell>
                                    <TableCell>${Number(holding.avg_price).toFixed(2)}</TableCell>
                                    <TableCell className={classNames(
                                        changeType === 'positive'
                                            ? 'text-emerald-700 dark:text-emerald-500 '
                                            : 'text-red-700 dark:text-red-500',
                                        'text-tremor-label font-medium',
                                    )}>
                                        <div className="flex flex-col">
                                            <span>${profitLossDollars.toFixed(2)}</span>
                                            <span >{profitLossPercentage.toFixed(2)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>${(Number(holding.quantity) * Number(holding.current_price)).toFixed(2)}</span>
                                            <span className="">{holding.quantity} {holding.symbol}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" className="h-8 w-8 p-0">


                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="h-8 w-8 p-0 flex items-center justify-center">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => displayTransactions(holding.symbol)}>View transactions</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleOpenDeleteHoldingModal(holding.symbol)}>Delete all</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </Button>
                                    </TableCell>
                                </MotionTableRow>
                            );
                        })
                        : holdings?.length === 0 ?
                            <span className="w-full italic text-tremor-content dark:text-dark-tremor-content">
                                No data to show
                            </span>
                            :
                            <TableRow>

                                <TableCell className="font-medium">
                                    <>
                                        <Skeleton className="h-[16px] w-[70px]" />
                                    </>
                                </TableCell>
                                <TableCell>
                                    <>
                                        <Skeleton className="h-[16px] w-[30px]" />
                                    </>
                                </TableCell>
                                <TableCell>
                                    <>
                                        <Skeleton className="h-[16px] w-[50px]" />
                                    </>
                                </TableCell>
                                <TableCell>
                                    <>
                                        <Skeleton className="h-[16px] w-[35px]" />
                                    </>
                                </TableCell>
                                <TableCell>
                                    <>
                                        <Skeleton className="h-[16px] w-[60px]" />
                                    </>
                                </TableCell>
                                <TableCell>
                                    <>
                                        <Skeleton className="h-[16px] w-[50px]" />
                                    </>

                                </TableCell>
                                <TableCell>
                                    <>
                                        <Skeleton className="h-[16px] w-[70px]" />
                                    </>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <>
                                            <Skeleton className="h-[16px] w-[20px]" />
                                        </>
                                    </div>
                                </TableCell>
                            </TableRow>
                }

            </TableBody>


            {/*
           
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3}>Total Revenue</TableCell>
                            <TableCell className="text-right">+$2,500.00</TableCell>
                        </TableRow>
                    </TableFooter>
                    */}
            <DeleteModal
                onConfirm={handleConfirmDeleteHolding}
                open={openDeleteModal}
                setOpen={setOpenDeleteModal}
                message={"Delete all transactions: " + symbol}
                isLoading={isLoading}
            />

        </Table>
    )
}
