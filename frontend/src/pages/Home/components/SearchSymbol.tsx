import { useToast } from "@/components/ui/use-toast";
import { urlBase } from "@/utils/variables";
import { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cutText } from "../utils/calculations";


import {
  stockSearch,
  Stock
} from '../models/responses'




type Props = {
  handleChangePrice: (price: number) => void
  stock: Stock | undefined
  setStock: React.Dispatch<React.SetStateAction<Stock | undefined>>
  setStockSearchIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export const SearchSymbol = ({ handleChangePrice, stock, setStock, setStockSearchIsLoading }: Props) => {
  const { toast } = useToast()
  const [stockInfo, setStockInfo] = useState('')
  const [stockInput, setStockInput] = useState('')
  const [stockIsSelected, setStockIsSelected] = useState<boolean>(false)
  const [stocksIsLoading, setStocksIsLoading] = useState<boolean>(false)

  const mockApiSearch = async (searchQuery: string) => {
    setStocksIsLoading(true);

    try {
      if (searchQuery === "") {
        setStock(undefined);
        setStocksIsLoading(false);
        return [];
      }

      const response = await fetch(urlBase + "/portfolio/keyword-stock/?keyword=" + searchQuery);
      if (response.ok) {
        const data: stockSearch[] = await response.json();
        setStocksIsLoading(false);
        return data;
      } else {
        setStocksIsLoading(false);
        return [];
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setStocksIsLoading(false);
      return [];
    }
  };

  const handleSetStock = async (result: string) => {
    setStockSearchIsLoading(true)
    try {
      const response = await fetch(urlBase + "/portfolio/symbol/" + result);
      if (!response.ok) {
        throw new Error()
      }
      const data = await response.json();
      setStock(data);
      handleChangePrice(data.current_price)
      setStockInfo(data.long_name)
    } catch {
      toast({
        title: "Error",
        description: "Invalid symbol.",
        duration: 2000
      })
      setStockInfo('')
    }
    setStockSearchIsLoading(false)
  }

  const handleSelectStock = async (result: string) => {
    setStockIsSelected(true)
    //setCommandInput("")
    
    setStockInput(result)
    handleSetStock(result)
    
  }

  const [commandInput, setCommandInput] = useState<string>("")
  const [results, setResults] = useState<stockSearch[]>([])


  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(async () => {
      const data = await mockApiSearch(commandInput);
      setResults(data);
    }, 300);

    setTimeoutId(newTimeoutId);
    !stockIsSelected && setStockInput(commandInput);
  }, [commandInput]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);



  const handleOnFocusSearch = () => {
    setStockIsSelected(false)
  }



  return (
    <div>
      <div className="relative">
        <Command className="rounded-lg border shadow-md" shouldFilter={false}>
          <CommandInput
            className="text-md py-0"
            autoFocus={true}
            placeholder="Type symbol..."
            value={stockInput}
            onValueChange={setCommandInput}
            onFocus={handleOnFocusSearch}
          />
          <CommandList className="mt-10 absolute w-full bg-stone-900 max-h-[280px] z-10">
            {Array.isArray(results) && results.length > 0 && stockInput.length !== 0 && !stockIsSelected ? (
              <>
                <CommandEmpty>
                  {results.length === 0 ? "No results found." : "Loading..."}
                </CommandEmpty>
                <CommandGroup>
                  {
                    !stocksIsLoading &&
                      results.map((result: stockSearch) => (
                        <div key={result.symbol + result.description + result.exchange} onClick={() => handleSelectStock(result.symbol)} className="hover:bg-stone-800 cursor-pointer">
                          <CommandItem key={result.symbol} value={result.symbol}>
                            <div className="flex justify-between w-full">
                              <span className="flex gap-2">
                                <span>{cutText(result.symbol, 8)}</span>
                                <span>{cutText(result.description)}</span>
                              </span>

                              <span className="flex gap-2">
                                {result.exchange && cutText(result.exchange)}


                              </span>
                            </div>
                          </CommandItem>
                        </div>
                      ))
                  }
                </CommandGroup>
              </>
            ) : undefined}
          </CommandList>
        </Command>
      </div>
      <p className={`${stock === undefined ? 'pointer-events-none hidden' : undefined} text-[14px] text-muted-foreground italic`}>*{stockInfo}</p>
    </div>
  )
}