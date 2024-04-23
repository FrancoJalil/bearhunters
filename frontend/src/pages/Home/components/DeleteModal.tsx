import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Button as TremorButton } from '@tremor/react';


type Props = {
    onConfirm: () => void
    isLoading: boolean
    message: string
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}


export const DeleteModal = ({ open, setOpen, onConfirm, message, isLoading }: Props) => {


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{message}</DialogTitle>
                    <DialogDescription>
                        ¿Are you sure?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex w-full sm:justify-between gap-5">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <TremorButton variant="secondary" color="red" onClick={onConfirm} loading={isLoading}>Delete</TremorButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}