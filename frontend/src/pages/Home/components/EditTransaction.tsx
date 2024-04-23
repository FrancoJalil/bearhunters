import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button as TremorButton } from '@tremor/react';
import { useContext, useEffect, useState } from "react";
import { urlBase } from "@/utils/variables";
import axios from "axios";
import { TransactionContext, TransactionContextType } from "@/contexts/TransactionContext";
import {
    transaction
} from '../models/responses'

type Props = {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    transaction: transaction | undefined
}

export const EditTransaction = ({ open, setOpen, transaction }: Props) => {

    const { setTransactionCompleted } = useContext(TransactionContext) as TransactionContextType

    const [quantity, setQuantity] = useState('')
    const [price, setPrice] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const onConfirm = async () => {

        setIsLoading(true)

        try {


            await axios.put(urlBase + "/portfolio/transactions/" + transaction?.symbol + "/",
                {
                    transactionId: transaction?.id,
                    price: price,
                    quantity: quantity,
                }
            )
            setTransactionCompleted(true)
            setOpen(false)
        } finally {
            setIsLoading(false)
        }


    }

    useEffect(() => {
        if (transaction) {
          setQuantity(transaction.quantity);
          setPrice(transaction.price);
        }
      }, [transaction]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit transaction: {transaction?.symbol}</DialogTitle>
                    <DialogDescription>
                        Click confirm when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantity
                        </Label>
                        <Input
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="col-span-3"
                        />

                        <Label htmlFor="Symbol" className="text-right">
                            Price
                        </Label>
                        <Input
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter className="flex w-full sm:justify-between gap-5">

                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <TremorButton loading={isLoading} variant="primary" onClick={onConfirm}>Confirm</TremorButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}