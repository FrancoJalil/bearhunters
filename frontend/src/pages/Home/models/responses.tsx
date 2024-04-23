export type userData = {
    email: string
    tokens: number
    verified: boolean
}

export type holding = {
    symbol: string
    current_price: number
    previous_close: number
    quantity: number
    price: number
    avg_price: number
    sector: string
    all_time_profit_hold: number
    total_buy_spent: number
    total_sell_value: number
    total_buy: number
    logo_id: string
}

export type todayNums = {
    priceChange: string
    percentChange: string
    changeType: string
}

export type todayStock = {
    symbol: string
    description: string
    current_price: string
    previous_close: string
    change?: string
    changeType?: string
    logo_id: string
    today_hourly_prices: number[]
}

export type perfomerStock = {
    symbol: string;
    priceUp: number;
    percentUp: number;
    changeType: 'positive' | 'negative'
}

export type myMoney = {
    totalInitialInvestment: number
    totalCurrentValue: number
    totalDifference: number
    totalPercentageChange: number
    changeType: 'positive' | 'negative'
}

export type HoldingValue = {
    name: string
    value: number
}

export interface Stock {
    symbol: string
    long_name: string
    current_price: string
}

export type transaction = {
    id: number;
    symbol: string;
    quantity: string;
    price: string;
    transaction_date: string;
    created_at: string;
    updated_at: string;
    transaction_type: 'buy' | 'sell';
}


export type stockSearch = {
    symbol: string
    description: string
    exchange: string
}

export type stockNewsItem = {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number;
    type: string;
    thumbnail: {
        resolutions: Array<{ url: string }>;
    }
}

export type stockImage = {
    name: string
    logo_id: string
}

export type stockGroupBySector = {
    name: string
    value: number
    stocks: stockImage[]
}


export type timeProfit = {
    date: string
    money: number
    invested_money: number
    daily_gain_loss: number
    sp500_daily_gain_loss: number
}

export type cash_days = 30 | 7 | 1 | 0


export type todayPrices = {
    [symbol: string]: { index: number; price: number }[]
}