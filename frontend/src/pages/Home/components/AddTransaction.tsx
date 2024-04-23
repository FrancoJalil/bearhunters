// 'use client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { SearchSymbol } from './SearchSymbol';
import { useContext, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button as TremorButton, Card as TremorCard } from '@tremor/react';
import { urlBase } from '@/utils/variables';
import axios from "axios"
import { TransactionContext, TransactionContextType } from '@/contexts/TransactionContext';


import {
    Stock
} from '../models/responses'
import { Icons } from '@/components/ui/icons';





export const AddTransaction = () => {

    const { setTransactionCompleted } = useContext(TransactionContext) as TransactionContextType


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [stockSearchIsLoading, setStockSearchIsLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [stock, setStock] = useState<Stock | undefined>(undefined);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [currentPrice, setCurrentPrice] = useState<number | undefined>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [transactionType, setTransactionType] = useState<string>("buy");
    const [selectedTab, setSelectedTab] = useState("buy");

    const handleChangeTotal = () => {
        setTotal(currentPrice ? quantity * currentPrice : 0)
    }

    const handleChangePrice = (price: number) => {
        if (!isNaN(price)) {
            setCurrentPrice(price);
        } else {
            setCurrentPrice(undefined)
        }
    };

    const handleChangeQuantity = (value: number) => {
        setQuantity(value)
    }

    useEffect(() => {
        handleChangeTotal()
    }, [quantity, currentPrice])

    const CloseDialog = () => {
        setOpen(false)
    }

    const handleSubmit = async () => {

        setIsLoading(true)
        try {
            const response = await axios.post(urlBase + '/portfolio/transactions/', {
                symbol: stock?.symbol,
                quantity,
                price: currentPrice,
                transaction_date: date?.toISOString().slice(0, 10),
                transaction_type: transactionType
            })

            if (response.status === 201) {
                CloseDialog()
                setTransactionCompleted(true)
            }
        } catch {
        }

        setIsLoading(false)

    }

    useEffect(() => {
        if (!open) {
            // Restablecer los estados cuando el diálogo se cierre
            setStock(undefined);
            setDate(undefined);
            setCurrentPrice(0);
            setQuantity(1);
            setTotal(0);
            setTransactionType("buy")
            setSelectedTab("buy")
        }
    }, [open]);

    useEffect(() => {
        setTransactionType(selectedTab === "buy" ? "buy" : "sell");
    }, [selectedTab]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <TremorButton variant="secondary">
                    + Add
                </TremorButton>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] flex flex-col justify-center items-center gap-5">

                <DialogHeader>
                    <DialogTitle>Add transaction</DialogTitle>
                </DialogHeader>

                <Tabs value={selectedTab} className="w-full" onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-2" >
                        <TabsTrigger value="buy">Buy</TabsTrigger>
                        <TabsTrigger value="sell">Sell</TabsTrigger>
                    </TabsList>

                    <TabsContent value="buy" className='w-full'>
                        <SearchSymbol
                            stock={stock}
                            setStock={setStock}
                            handleChangePrice={handleChangePrice}
                            setStockSearchIsLoading={setStockSearchIsLoading}
                        />
                        {
                            stockSearchIsLoading && !stock &&
                            <Icons.spinner className="w-full mt-5 animate-spin" />
                        }
                        <Card className={`border-none w-full ${stock === undefined ? 'pointer-events-none hidden' : ''}`}>

                            <CardContent className="space-y-4 w-full px-0 py-2">

                                <div className='flex gap-5 w-full'>
                                    <div className="space-y-1">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            placeholder="0"
                                            value={quantity}
                                            onChange={(e) => handleChangeQuantity(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="price">Price per stock</Label>
                                        <Input
                                            id="price"
                                            value={currentPrice}
                                            type='number'
                                            onChange={(e) => handleChangePrice(parseFloat(e.target.value))} />
                                    </div>
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus

                                        />
                                    </PopoverContent>
                                </Popover>
                                <TremorCard
                                    decoration="top"
                                    decorationColor="indigo"
                                >
                                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">Total invested</p>
                                    <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">${total.toFixed(2)}</p>
                                </TremorCard>
                            </CardContent>
                        </Card>
                    </TabsContent>



                    <TabsContent value="sell" className='w-full'>
                        <SearchSymbol
                            stock={stock}
                            setStock={setStock}
                            handleChangePrice={handleChangePrice}
                            setStockSearchIsLoading={setStockSearchIsLoading}
                        />
                        {
                            stockSearchIsLoading && !stock &&
                            <Icons.spinner className="w-full mt-5 animate-spin" />
                        }


                        <Card className={`border-none w-full ${stock === undefined ? 'pointer-events-none hidden' : ''}`}>

                            <CardContent className="space-y-4 w-full px-0 py-2">

                                <div className='flex gap-5 w-full'>
                                    <div className="space-y-1">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            value={quantity}
                                            placeholder="0" onChange={(e) => handleChangeQuantity(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="price">Price per stock</Label>
                                        <Input
                                            id="price"
                                            value={currentPrice}
                                            type='number'
                                            onChange={(e) => handleChangePrice(parseFloat(e.target.value))} />
                                    </div>
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <TremorCard
                                    decoration="top"
                                    decorationColor="indigo"
                                >
                                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">Total invested</p>
                                    <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">${total.toFixed(2)}</p>
                                </TremorCard>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <TremorButton className={`${stock === undefined ? 'pointer-events-none hidden' : undefined}`} loading={isLoading} type="submit" onClick={() => handleSubmit()}>Add transaction</TremorButton>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

