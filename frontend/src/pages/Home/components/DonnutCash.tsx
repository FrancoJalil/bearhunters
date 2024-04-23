import { AreaChart, Card, DonutChart } from '@tremor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chartDataLoader, dataFormatter } from "../utils/formatters";
import { HoldingValue, timeProfit, cash_days } from '../models/responses';
import { ToggleDailyCount } from './ToggleDailyCount';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const DonnutMotion = motion(DonutChart);
const AreaChartMotion = motion(AreaChart);

type Props = {
    totalStocksHold: HoldingValue[] | undefined;
    selectedDailyCountToggleValue: cash_days;
    timeProfitLoading: boolean;
    handleToggleChange: (value: cash_days) => void;
    timeProfit: timeProfit[] | undefined;
};

export const DonnutCash = ({ totalStocksHold, selectedDailyCountToggleValue, timeProfitLoading, handleToggleChange, timeProfit }: Props) => {
    const stocksColors = useMemo(() => {
        return [...Array(totalStocksHold?.length || 1).fill("skyBlue stroke-skyBlueStroke").flatMap(color => [color])];
    }, [totalStocksHold]);

    return (
        <Card className="flex flex-col items-center h-[70vh] lg:mx-0 lg:max-w-none sm:mx-auto sm:max-w-md overflow-y-hidden">
            <Tabs className="w-full space-y-6 h-full" defaultValue="donnut">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="donnut">Stocks</TabsTrigger>
                    <TabsTrigger value="cash">Cash</TabsTrigger>
                </TabsList>

                <TabsContent value="donnut" className="w-full h-full">
                    {totalStocksHold ? (
                        <DonnutMotion
                            className="h-[80%] w-full"
                            transition={{ duration: 0.2 }}
                            initial={{ scale: 0.2 }}
                            animate={{ scale: 1 }}
                            index="name"
                            data={totalStocksHold}
                            variant="pie"
                            valueFormatter={dataFormatter}
                            showAnimation={false}
                            onValueChange={(v) => console.log(v)}
                            colors={stocksColors}
                        />
                    ) : (
                        <DonnutMotion
                            className="h-[80%] opacity-50 w-full"
                            data={[{ name: 'Ticker', value: 1 }]}
                            variant="pie"
                            valueFormatter={dataFormatter}
                            showAnimation={false}
                            colors={stocksColors}
                        />
                    )}
                </TabsContent>

                <TabsContent value="cash" className={`w-full h-full`}>
                    <div className="flex flex-col w-full h-full">
                        <ToggleDailyCount
                            selectedDailyCountToggleValue={selectedDailyCountToggleValue}
                            timeProfitLoading={timeProfitLoading}
                            handleToggleChange={handleToggleChange}
                            timeProfitLoaded={timeProfit ? true : false}
                        />

                        {timeProfit ? (
                            <AreaChartMotion
                                transition={{ duration: 0.2 }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-[80%] w-full"
                                data={timeProfit}
                                index="date"
                                categories={['money', 'invested_money']}
                                colors={['indigo', 'rose']}
                                valueFormatter={dataFormatter}
                                onValueChange={(v) => console.log(v)}
                                yAxisWidth={60}
                                showAnimation
                            />
                        ) : (
                            <AreaChart
                                className="h-[80%] opacity-50 w-full pointer-events-none"
                                aria-disabled
                                data={chartDataLoader}
                                index="date"
                                categories={['...']}
                                colors={['indigo', 'rose']}
                                valueFormatter={dataFormatter}
                                yAxisWidth={60}
                            />
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </Card>
    );
};