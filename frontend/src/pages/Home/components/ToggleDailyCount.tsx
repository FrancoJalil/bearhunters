
import { Icons } from '@/components/ui/icons';
import { cash_days } from '../models/responses'
import { Toggle } from '@/components/ui/toggle';

type Props = {
    selectedDailyCountToggleValue: cash_days
    timeProfitLoading: boolean
    handleToggleChange: (value: cash_days) => void
    timeProfitLoaded: boolean
}

export const ToggleDailyCount = ({selectedDailyCountToggleValue, timeProfitLoading, handleToggleChange, timeProfitLoaded}: Props) => {
   
    return (
        <div className={`flex gap-2 items-center ${ !timeProfitLoaded && "pointer-events-none"}`}>
            <Toggle
                pressed={selectedDailyCountToggleValue === 1}
                disabled={timeProfitLoading}
                aria-label="Toggle 24h"
                onClick={() => handleToggleChange(1)}
            >
                24h
            </Toggle>
            <Toggle
                pressed={selectedDailyCountToggleValue === 7}
                disabled={timeProfitLoading}
                aria-label="Toggle 7d"
                onClick={() => handleToggleChange(7)}
            >
                7d
            </Toggle>
            <Toggle
                pressed={selectedDailyCountToggleValue === 30}
                disabled={timeProfitLoading}
                aria-label="Toggle 30d"
                onClick={() => handleToggleChange(30)}
            >
                30d
            </Toggle>
            <Toggle
                pressed={selectedDailyCountToggleValue === 0}
                disabled={timeProfitLoading}
                aria-label="Toggle TODO"
                onClick={() => handleToggleChange(0)}
            >
                TODO
            </Toggle>

            { timeProfitLoading && <Icons.spinner className="flex items-center animate-spin" />}
        </div>
    )
}
