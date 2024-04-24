import { Skeleton } from '@/components/ui/skeleton';
import { BadgeDelta, Card } from '@tremor/react';
import {
    perfomerStock,
    myMoney
} from "../models/responses"
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MotionCard = motion(Card)

type Props = {
    bestPerfomer: perfomerStock | undefined
    worstPerfomer: perfomerStock | undefined
    money: myMoney | undefined

}
export const CardsData = ({ bestPerfomer, worstPerfomer, money }: Props) => {


    const [prevTotalPercentageChange, setprevTotalPercentageChange] = useState<number | undefined>(undefined);
    const [, setPrevAnimationColorMoney] = useState<'green' | 'red' | undefined>(undefined);
    const [animationColorMoney, setAnimationColorMoney] = useState<'green' | 'red' | undefined>(undefined);

    useEffect(() => {
        if (money) {
            if (prevTotalPercentageChange === undefined) {
                setprevTotalPercentageChange(money.totalPercentageChange);
            } else {
                if (money.totalPercentageChange > prevTotalPercentageChange) {
                    setAnimationColorMoney('green');
                } else if (money.totalPercentageChange < prevTotalPercentageChange) {
                    setAnimationColorMoney('red');
                }
                setprevTotalPercentageChange(money.totalPercentageChange);
            }
        }
    }, [money, prevTotalPercentageChange]);

    useEffect(() => {
        if (animationColorMoney) {
            const timeout = setTimeout(() => {
                setPrevAnimationColorMoney(animationColorMoney);
                setAnimationColorMoney(undefined);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [animationColorMoney]);

    const isPositive = (num: number) => {
        return num >= 0
    }


    return (
        <div className='flex flex-col md:flex-row gap-5 w-full'>
            {

                <>
                    <MotionCard
                        transition={{ duration: .2 }}
                        initial={{
                            scale: 0.2
                        }}
                        animate={{
                            scale: 1
                        }}

                    >
                        <span className="text-tremor-default text-tremor-content dark:text-dark-tremor-content gap-2 flex flex-col items-start justify-between">
                            <div className='flex gap-2 justify-between w-full'>
                                <span>Best Perfomer:</span>
                                <span>
                                    {
                                        bestPerfomer ?
                                            <BadgeDelta deltaType={isPositive(bestPerfomer.percentUp) ? 'increase' : 'decrease'} isIncreasePositive={true}>
                                                {bestPerfomer.symbol}
                                            </BadgeDelta>
                                            :
                                            bestPerfomer === undefined && money?.totalInitialInvestment === 0 ?
                                                null
                                                :
                                                <Skeleton className="h-[16px] w-[65px]" />

                                    }
                                </span>
                            </div>
                            <div className='flex w-full justify-between gap-1'>
                                <span>

                                    {
                                        bestPerfomer ?
                                            <span className='text-lg'>

                                                {

                                                    <BadgeDelta deltaType={isPositive(bestPerfomer.percentUp) ? "moderateIncrease" : "moderateDecrease"} isIncreasePositive={true}>
                                                        {
                                                            bestPerfomer.percentUp !== undefined ? (isPositive(bestPerfomer.priceUp) ? `+${bestPerfomer.percentUp.toFixed(2)}%` : `${bestPerfomer.percentUp.toFixed(2)}%`) : ""
                                                        }
                                                    </BadgeDelta>

                                                }
                                            </span>
                                            :
                                            bestPerfomer === undefined && money?.totalInitialInvestment === 0 ?
                                                null
                                                :
                                                <Skeleton className="h-[24px] w-[65px]" />

                                    }


                                </span>
                                <span>
                                    {
                                        bestPerfomer ?
                                            <span className='text-lg'>
                                                {
                                                    <BadgeDelta deltaType={isPositive(bestPerfomer.priceUp) ? "moderateIncrease" : "moderateDecrease"} isIncreasePositive={true}>
                                                        {
                                                            bestPerfomer.priceUp !== undefined ? (isPositive(bestPerfomer.priceUp) ? `+$${bestPerfomer.priceUp.toFixed(2)}` : `-$${(bestPerfomer.priceUp * (-1)).toFixed(2)}`) : ""

                                                        }
                                                    </BadgeDelta>
                                                }
                                            </span>
                                            :
                                            bestPerfomer === undefined && money?.totalInitialInvestment === 0 ?
                                                <p>No data to show</p>
                                                :
                                                <Skeleton className="h-[24px] w-[65px]" />

                                    }


                                </span>
                            </div>

                        </span>
                    </MotionCard>

                    <MotionCard
                        transition={{ duration: .2, delay: .1 }}
                        initial={{
                            scale: 0.2
                        }}
                        animate={{
                            scale: 1
                        }}
                    >
                        <span className="text-tremor-default text-tremor-content dark:text-dark-tremor-content gap-2 flex flex-col items-start justify-between">
                            <div className='flex gap-2 justify-between w-full'>
                                <span>Worst Perfomer:</span>
                                <span>
                                    {
                                        worstPerfomer ?
                                            <BadgeDelta deltaType={isPositive(worstPerfomer.percentUp) ? 'increase' : 'decrease'} isIncreasePositive={true}>
                                                {
                                                    worstPerfomer.symbol
                                                }
                                            </BadgeDelta>

                                            :
                                            worstPerfomer === undefined && money?.totalInitialInvestment === 0 ?
                                                null
                                                :
                                                <Skeleton className="h-[24px] w-[65px]" />

                                    }
                                </span>
                            </div>
                            <div className='flex gap-1 justify-between w-full'>

                                <span>
                                    {
                                        worstPerfomer ?
                                            <BadgeDelta deltaType={isPositive(worstPerfomer.priceUp) ? "moderateIncrease" : "moderateDecrease"} isIncreasePositive={true}>
                                                {worstPerfomer?.percentUp !== undefined ? (worstPerfomer.changeType === 'positive' ? `+${worstPerfomer.percentUp.toFixed(2)}%` : `${worstPerfomer.percentUp.toFixed(2)}%`) : ""}                                    </BadgeDelta>

                                            :
                                            worstPerfomer === undefined && money?.totalInitialInvestment === 0 ?
                                                null
                                                :
                                                <Skeleton className="h-[24px] w-[65px]" />

                                    }

                                </span>

                                <span>
                                    {
                                        worstPerfomer ?

                                            <BadgeDelta deltaType={isPositive(worstPerfomer.priceUp) ? "moderateIncrease" : "moderateDecrease"} isIncreasePositive={true}>
                                                {worstPerfomer.priceUp !== undefined ? (worstPerfomer.changeType === 'positive' ? `+$${worstPerfomer.priceUp.toFixed(2)}` : `-$${(worstPerfomer.priceUp * (-1)).toFixed(2)}`) : ""}
                                            </BadgeDelta>

                                            :
                                            worstPerfomer === undefined && money?.totalInitialInvestment === 0 ?
                                                <p>No data to show</p>
                                                :
                                                <Skeleton className="h-[24px] w-[65px]" />

                                    }


                                </span>

                            </div>

                        </span>
                    </MotionCard>

                    <MotionCard
                        transition={{ duration: .2, delay: .2 }}
                        initial={{
                            scale: 0.2
                        }}
                        animate={{
                            scale: 1
                        }}
                    >
                        <span className="text-tremor-default text-tremor-content dark:text-dark-tremor-content gap-2 flex flex-col items-start justify-between">
                            <span>All Time Profit:</span>
                            <div className='flex flex-col lg:flex-row sm:items-start  gap-1 items-center justify-between w-full'>

                                <motion.span
                                    animate={{
                                        color: animationColorMoney === 'green' ? '#10b981' : animationColorMoney === 'red' ? '#ef4444' : undefined,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="text-lg text-white"
                                >
                                    {
                                        money ?
                                            `${money.changeType === 'positive' ? '+' + money.totalPercentageChange?.toFixed(2) + '%' : money?.totalPercentageChange?.toFixed(2) + '%'}`
                                            :
                                            <Skeleton className="h-[20px] w-[70px]" />
                                    }

                                </motion.span>
                                <span>
                                    {
                                        money ?
                                            <BadgeDelta deltaType={money.changeType === 'positive' ? "moderateIncrease" : "moderateDecrease"} isIncreasePositive={isPositive(money.totalDifference)}>
                                                {`${money.changeType === 'positive' ? '+' + '$' + money?.totalDifference?.toFixed(2) : '-' + '$' + money?.totalDifference?.toFixed(2)}`}
                                            </BadgeDelta>
                                            :
                                            <Skeleton className="h-[20px] w-[70px]" />

                                    }
                                </span>

                            </div>
                        </span>
                    </MotionCard>
                </>

            }


        </div>
    )
}