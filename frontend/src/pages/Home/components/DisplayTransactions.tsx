
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { urlBase } from "@/utils/variables"
import axios from "axios"
import { useContext, useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteModal } from "./DeleteModal"
import { EditTransaction } from "./EditTransaction"
import { TransactionContext, TransactionContextType } from "@/contexts/TransactionContext"

import {
    transaction
} from '../models/responses'
import { Skeleton } from "@/components/ui/skeleton"



type Props = {
    symbol: string
    open: boolean
    setOpenDisplayTransactions: React.Dispatch<React.SetStateAction<boolean>>
    quantity: number | undefined
}

export const DisplayTransactions = ({ open, symbol, quantity, setOpenDisplayTransactions }: Props) => {

    const { transactionCompleted, setTransactionCompleted } = useContext(TransactionContext) as TransactionContextType


    const [transactions, setTransactions] = useState<transaction[]>()
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [transaction, setTransaction] = useState<transaction | undefined>()

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10; // Tamaño de la página

    const getTransactions = async () => {
        const response = await axios.get(urlBase + '/portfolio/transactions/' + symbol, {
            params: {
                page: currentPage,
                page_size: pageSize
            }
        })
        const { results, count } = response.data;
        setTransactions(results);
        const totalPages = Math.ceil(count / pageSize);
        setTotalPages(totalPages);

    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOpenDeleteTransactionModal = (current_transaction: transaction) => {
        setOpenDeleteModal(true)
        setTransaction(current_transaction)

    }

    const handleConfirmDeleteTransaction = async () => {

        setIsLoading(true)

        try {


            await axios.delete(urlBase + '/portfolio/transactions/' + transaction?.symbol, {
                data: {
                    transactionId: transaction?.id,
                }
            })

            setOpenDeleteModal(false)
            setTransactionCompleted(true)

        } finally {
            setIsLoading(false)
        }



    }

    const handleOpenEditTransactionModal = (current_transaction: transaction) => {
        setTransaction(current_transaction)
        setOpenEditModal(true)
    }

    useEffect(() => {
        if (open || transactionCompleted) {
            getTransactions()
        } else if (!open) {
            setTransactions([])
        }
    }, [open, transactionCompleted])

    useEffect(() => {
        getTransactions();
    }, [currentPage]);

    return (
        <Drawer open={open} onOpenChange={setOpenDisplayTransactions}>
            <DrawerContent className="sm:px-5 w-full h-full">


                <DrawerHeader className="flex justify-center w-full">
                    <DrawerTitle>{symbol} Transactions</DrawerTitle>
                    <DrawerDescription>({transactions?.length})</DrawerDescription>
                </DrawerHeader>
                <Table className="mx-auto lg:max-w-[75.5%] overflow-scroll h-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {
                            transactions ?
                                transactions.map(transaction => {
                                    return (


                                            <TableRow key={transaction.id} >
                                                <TableCell>{transaction.symbol}</TableCell>
                                                <TableCell>${transaction.price}</TableCell>
                                                <TableCell>{transaction.quantity}</TableCell>
                                                <TableCell>{transaction.transaction_type}</TableCell>
                                                <TableCell>{transaction.transaction_date}</TableCell>
                                                <TableCell className="flex justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleOpenEditTransactionModal(transaction)}>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleOpenDeleteTransactionModal(transaction)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>


                                            </TableRow>


                                    )
                                })

                                :

                                <TableRow>

                                    <TableCell className="font-medium">
                                        <Skeleton className="h-[25px] w-[65px]" />

                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-[25px] w-[55px]" />

                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-[25px] w-[35px]" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-[25px] w-[30px]" />

                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-[25px] w-[80px]" />
                                    </TableCell>

                                    <TableCell className="flex justify-end">
                                        <Skeleton className="h-[25px] w-[30px]" />
                                    </TableCell>
                                </TableRow>

                        }
                    </TableBody>
                </Table>

                <DrawerFooter className="flex flex-row justify-center items-center">
                    <div className="flex gap-2 items-center">
                        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
                        <span>(Page {currentPage} of {totalPages})</span>
                    </div>
                    <DrawerClose>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>

            <DeleteModal
                onConfirm={handleConfirmDeleteTransaction}
                isLoading={isLoading}
                open={openDeleteModal}
                setOpen={setOpenDeleteModal}
                message="Delete transaction"
            />

            <EditTransaction
                open={openEditModal}
                setOpen={setOpenEditModal}
                transaction={transaction}
            />

        </Drawer>
    )
}
