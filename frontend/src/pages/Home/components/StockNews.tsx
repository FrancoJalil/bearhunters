import { urlBase } from '@/utils/variables';
import { Divider } from '@tremor/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    stockNewsItem
} from '../models/responses'
import { Skeleton } from '@/components/ui/skeleton';



export const StockNews = () => {


    const [stocksNews, setStocksNews] = useState<stockNewsItem[]>();

    const getStockNews = async () => {
        const response = await axios.get(urlBase + "/portfolio/stocks-news/");
        setStocksNews(response.data.stocks_news);

    };

    useEffect(() => {
        getStockNews();
    }, []);



    return (
        <>
            <div className="lg:max-w-[300px] flex lg:flex-col gap-5 overflow-x-scroll w-full lg:w-fit lg:overflow-y-scroll lg:overflow-x-hidden lg:h-[100vh] flex-shrink-0 py-5 lg:py-0 md:px-5">
                {
                    stocksNews ?
                        stocksNews.map((stockNews) => (
                            <div key={stockNews.uuid} className='min-w-full snap-center flex flex-col'>

                                <a target='_blank' href={stockNews.link}>

                                    <img className="lg:min-w-[280px] w-full aspect-video object-cover" src={stockNews.thumbnail?.resolutions[0].url} alt="" />
                                    <h3 className='mt-2'>{stockNews.title}</h3>

                                </a>
                                <Divider className='hidden lg:block' />
                            </div>
                        ))
                        :
                        <div className='min-w-full snap-center flex flex-col items-center gap-2'>

                            <Skeleton className="lg:min-w-[280px] w-full aspect-video object-cover" />
                            <Skeleton className="h-[16px] w-[280px]" />

                            <Divider className='hidden lg:block' />

                            <Skeleton className="lg:min-w-[280px] w-full aspect-video object-cover" />

                            <Skeleton className="h-[16px] w-[280px]" />

                            <Divider className='hidden lg:block' />

                            <Skeleton className="lg:min-w-[280px] w-full aspect-video object-cover" />

                            <Skeleton className="h-[16px] w-[280px]" />

                        </div>
                }
            </div>
        </>

    )
}