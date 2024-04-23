import { Card, DonutChart, Legend } from '@tremor/react';
import { useState } from 'react';
import { DialogInfo } from '../components/DialogInfo';
import { stockGroupBySector } from '../models/responses'

type Props = {
    sectorCount: stockGroupBySector[] | undefined
}
export const StocksSectors = ({sectorCount}: Props) => {

    const [dialogInfo, setDialogInfo] = useState<stockGroupBySector>()
    const [openDialogInfo, setOpenDialogInfo] = useState(false)

    const handleOpenDialogInfo = (info: stockGroupBySector) => {
        setDialogInfo(info)
        setOpenDialogInfo(true)
    }


    return (
        <>
            {
                sectorCount &&

                <Card className='flex lg:w-min lg:min-w-[300px] lg:flex-col items-center justify-center'>


                    <DonutChart
                        className="mb-2"
                        label='sectors'
                        data={sectorCount}
                        variant="donut"
                        onValueChange={(info) => handleOpenDialogInfo(info)}
                        showTooltip={false}

                    />
                    <Legend
                        categories={sectorCount.map(obj => obj.name)}
                        className="max-w-xs"
                    />

                </Card>

            }

            {
                dialogInfo &&
                <DialogInfo
                    info={dialogInfo}
                    open={openDialogInfo}
                    setOpen={setOpenDialogInfo}
                />
            }
        </>
    )
}