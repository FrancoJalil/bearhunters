import { AreaChart } from '@tremor/react';
import {
    timeProfit,
    cash_days,
    stockGroupBySector
} from '../models/responses'

type Props = {
    selectedDailyCountToggleValue: cash_days
    timeProfitLoading: boolean
    handleToggleChange: (value: cash_days) => void
    timeProfit: timeProfit[] | undefined
    sectorCount: stockGroupBySector[] | undefined
}

import {
    chartDataLoader,
    dataFormatterTwo
} from "../utils/formatters"
import { ToggleDailyCount } from './ToggleDailyCount';

export const DailyGainLoss = ({ selectedDailyCountToggleValue, timeProfitLoading, handleToggleChange, timeProfit, sectorCount }: Props) => {
    return (
        <div className="flex flex-col w-full">
            
            <ToggleDailyCount
                selectedDailyCountToggleValue={selectedDailyCountToggleValue}
                timeProfitLoading={timeProfitLoading}
                handleToggleChange={handleToggleChange}
                timeProfitLoaded={timeProfit ? true : false}
            />

            {
                timeProfit && sectorCount ?

                    <AreaChart
                        className="h-80"
                        data={timeProfit}
                        index="date"
                        categories={['daily_gain_loss', 'sp500_daily_gain_loss']}
                        colors={['indigo', 'cyan']}
                        valueFormatter={dataFormatterTwo}
                        yAxisWidth={60}
                        onValueChange={(v) => console.log(v)}
                        showAnimation={true}
                    />
                    :
                    <AreaChart
                        className="h-80 opacity-50 pointer-events-none"
                        data={chartDataLoader}
                        index="date"
                        categories={['daily_gain_loss', 'sp500_daily_gain_loss']}
                        colors={['indigo', 'cyan']}
                        valueFormatter={dataFormatterTwo}
                        yAxisWidth={60}
                        onValueChange={(v) => console.log(v)}
                    />


            }
        </div>
    )
}