import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { stockGroupBySector } from "../models/responses"


type Props = {
    info: stockGroupBySector
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DialogInfo = ({ info, open, setOpen }: Props) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogContent className="sm:max-w-[425px] max-h-[50%] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>Sector: {info.name}</DialogTitle>

                </DialogHeader>
                <div className="grid gap-4 py-4">


                        <div className="flex flex-col text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong gap-4">

                            {

                                info.stocks.map(stock => (
                                    <>
                                        <div className="flex gap-2">
                                            {
                                                stock.logo_id ?
                                                    <img width={20} src={`https://s3-symbol-logo.tradingview.com/${stock.logo_id}.svg`} alt="" />
                                                    :
                                                    <div className='w-[20px] h-[20px] bg-slate-500'></div>
                                            }

                                            {stock.name}

                                        </div>
                                    </>
                                ))

                            }

                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}
