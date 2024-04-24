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
            <div className="xl:max-w-[300px] flex xl:flex-col gap-5 overflow-x-scroll w-full xl:w-fit xl:overflow-y-scroll xl:overflow-x-hidden xl:h-[100vh] flex-shrink-0 py-5 xl:py-0">
                {
                    stocksNews ?
                        stocksNews.map((stockNews) => (
                            <div key={stockNews.uuid} className='min-w-full snap-center flex flex-col'>

                                <a target='_blank' href={stockNews.link}>

                                    <img className="xl:min-w-[280px] w-full aspect-video object-cover" src={stockNews.thumbnail?.resolutions[0].url} alt="" />
                                    <h3 className='mt-2'>{stockNews.title}</h3>

                                </a>
                                <Divider className='hidden xl:block' />
                            </div>
                        ))
                        :
                        <div className='min-w-full snap-center flex flex-col items-center gap-2'>

                            <Skeleton className="xl:min-w-[280px] w-full aspect-video object-cover" />
                            <Skeleton className="h-[16px] w-[280px]" />

                            <Divider className='hidden xl:block' />

                            <Skeleton className="xl:min-w-[280px] w-full aspect-video object-cover" />

                            <Skeleton className="h-[16px] w-[280px]" />

                            <Divider className='hidden xl:block' />

                            <Skeleton className="xl:min-w-[280px] w-full aspect-video object-cover" />

                            <Skeleton className="h-[16px] w-[280px]" />

                        </div>
                }
            </div>
        </>

    )
}