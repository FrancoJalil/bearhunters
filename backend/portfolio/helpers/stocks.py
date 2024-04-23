import requests
from functools import lru_cache
from django.db.models import Sum
from datetime import timedelta
import yfinance as yf
from ..models import Holding
from django.utils import timezone
from collections import defaultdict
from datetime import datetime
import datetime as dt


user_agent_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
    }

def get_sp500_current_price():
    response = requests.get("https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?events=capitalGain%7Cdiv%7Csplit&formatted=true&includeAdjustedClose=true&interval=1d&symbol=%5EGSPC&userYfid=true&range=1d&lang=en-US&region=US", headers=user_agent_headers)
    data = response.json()

    return data["chart"]["result"][0]["meta"]["regularMarketPrice"]


def get_first_price_sp500(first_day, data):
    if isinstance(first_day, dt.date):
        first_day = dt.datetime.combine(first_day, dt.datetime.min.time())


    timestamps = data["chart"]["result"][0]["timestamp"]
    close_prices = data["chart"]["result"][0]["indicators"]["quote"][0]["close"]
    
    target_timestamp = int(first_day.timestamp())

    if target_timestamp not in timestamps:
        closest_timestamp = None
        for ts in timestamps:
            date = datetime.fromtimestamp(ts).date()
            if date <= first_day.date():
                if closest_timestamp is None or date > closest_timestamp:
                    closest_timestamp = date
                    cuca = ts
        closest_index = timestamps.index(cuca)

    else:
        closest_index = timestamps.index(target_timestamp)

    closest_price = close_prices[closest_index]

    return closest_price


def get_sp500_data(first_day, current_date, cash_days):
    sp500_percents = {}

    url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC"
    params = {
        "events": "capitalGain,div,split",
        "formatted": "true",
        "includeAdjustedClose": "true",
        "interval": "1d",
        "symbol": "%5EGSPC",
        "userYfid": "true",
        "range": f"{cash_days+15}d",
        "lang": "en-US",
        "region": "US",
    }
    response = requests.get(url, params=params, headers=user_agent_headers)
    data = response.json()
    first_price = get_first_price_sp500(first_day, data)
    first_day_datetime = datetime.combine(first_day, datetime.min.time())
    current_date_datetime = datetime.combine(current_date, datetime.min.time())
    
    dic = data["chart"]["result"][0]["indicators"]["quote"][0]["close"][15:]
    previous_price = first_price

    for i, date_timestamp in enumerate(data["chart"]["result"][0]["timestamp"][15:]):
        date = datetime.fromtimestamp(date_timestamp)
        if date >= first_day_datetime and date < current_date_datetime:
            price = dic[i]
            if price is None:
                sp500_percents[date.strftime('%Y-%m-%d')] = (previous_price - first_price) / first_price * 100
            else:
                percent = (price - first_price) / first_price * 100
                sp500_percents[date.strftime('%Y-%m-%d')] = percent
                previous_price = price
        elif current_date_datetime not in data["chart"]["result"][0]["timestamp"] and i == len(data["chart"]["result"][0]["timestamp"][14:])-1:
            price = get_sp500_current_price()
            percent = (price - first_price) / first_price * 100
            sp500_percents[date.strftime('%Y-%m-%d')] = percent
    return sp500_percents


@lru_cache(maxsize=124)
def get_logo_id(symbol):
    response = requests.get(f"https://symbol-search.tradingview.com/symbol_search/v3/?text={symbol.split('.')[0]}&hl=1&exchange=&lang=en&search_type=stocks&domain=production&sort_by_country=US&logoUrl=true")
    if response.status_code == 200:
        data = response.json()
        return data['symbols'][0].get('logoid', None)
    else:
        return None


def get_news_for_ticker(ticker_symbol, max_news=2):
    ticker = yf.Ticker(ticker_symbol)
    news = []
    seen_uuids = set()

    for new in ticker.get_news()[:max_news]:
        if new.get("thumbnail") and new["uuid"] not in seen_uuids and new['thumbnail']['resolutions'][0]['width'] > 100:
            news.append(new)
            seen_uuids.add(new["uuid"])

    return news
    

def get_stock_info(ticker):
    try:
        symbol = yf.Ticker(ticker)
        info = symbol.info
        return {
            'symbol': info['symbol'],
            'long_name': info['longName'],
            'current_price': info['currentPrice']
        }
    except:
        return None


def get_holding_data(holding):
    ticker = yf.Ticker(holding.symbol)
    stock_info = ticker.get_info()
    
    logo_id = get_logo_id(holding.symbol)

    return {
        'symbol': holding.symbol,
        'current_price': float(stock_info['currentPrice']),
        'avg_price': holding.avg_price,
        'quantity': holding.quantity,
        'previous_close': stock_info['previousClose'],
        'all_time_profit_hold': holding.all_time_profit,
        'sector': stock_info['sector'],
        'total_buy': holding.total_buy,
        'total_buy_spent': holding.total_buy_spent,
        'total_sell_value': holding.total_sell_value,
        'logo_id': logo_id
    }


def get_stock_symbols(keyword):
    url = f"https://query1.finance.yahoo.com/v1/finance/search?q={keyword}&quotesCount=4&enableCb=false&enableNews=false&enableResearchReports=false&newsCount=0&enableLogoUrl=true"
    response = requests.get(url, headers=user_agent_headers)
    data = response.json()
    symbols = [
        {
            'symbol': symbol_data.get('symbol', ''),
            'description': symbol_data.get('shortname', ''),
            'exchange': symbol_data.get('exchDisp', ''),
            'logo_url': symbol_data.get('logoUrl', ''),
        }
        for symbol_data in data.get('quotes', [])
        if symbol_data.get('symbol')
    ]
    return symbols


def get_sum_all_time_profits(user):
    
    sum_all_time_profits = Holding.objects.filter(user=user).aggregate(Sum('all_time_profit'))['all_time_profit__sum']
    return sum_all_time_profits or 0


def get_stock_data(symbol):
    ticker = yf.Ticker(symbol)
    stock_info = ticker.get_info()
    logo_id = get_logo_id(symbol)
    
    current_date = timezone.now().date()
    
    previous_close = stock_info['previousClose']
    today_hourly_prices = list(ticker.history(start=current_date, interval="1h")['Close'])
    if today_hourly_prices and today_hourly_prices[0] is not None:
        today_hourly_prices.insert(0, previous_close)
    return {
        'symbol': symbol,
        'description': stock_info['shortName'],
        'previous_close': previous_close,
        'current_price': stock_info['currentPrice'],
        'today_hourly_prices': today_hourly_prices,
        'logo_id': logo_id
    }


def get_close_prices_current_stocks(user, days, days_ago, current_date):
    
    user_holdings = Holding.objects.filter(user=user)
    symbols = set(holding.symbol for holding in user_holdings)
    symbol_prices = defaultdict(dict)

    for symbol in symbols:
    
        ticker = yf.Ticker(symbol)
        price = ticker.history(start=days_ago, end=current_date+timedelta(days=1))
        previous_close = None
        
        for date in days:
            try:
                close_price = price.loc[date["date"]]['Close']
                symbol_prices[symbol][date["date"]] = round(close_price, 2)
                previous_close = close_price 
            except KeyError:  
                if previous_close is not None:
                    symbol_prices[symbol][date["date"]] = previous_close

    return symbol_prices


def get_daily_user_cash_data(days, user_transactions, symbol_prices, cash_days_user, sp500_percents):
    test_i_money = 0
    nowyes = False
    done = False
    dif = 0
    total_buy_cost1 = 0
    
    for i, day in enumerate(days):
        day_date = day['date']
        total_money = 0
        cucu = 0
        invested_money = 0
        total_buy_cost2 = 0
        test_money = 0
        
        for transaction in user_transactions:
            transaction_date = transaction.transaction_date.strftime('%Y-%m-%d')
            if transaction_date <= day_date:
                sp = symbol_prices[transaction.symbol].get(day_date, None)
                if sp:
                    if transaction.transaction_type == "buy":
                        total_money += round(float(transaction.quantity), 2) * sp
                        invested_money += round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                    
                    else:
                        total_money -= round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                        invested_money -= round(float(transaction.quantity), 2) * round(float(transaction.price), 2)

                else:
                    if i == 0:
                        x = datetime.strptime(day_date, '%Y-%m-%d')
                        
                        while True:
                            try:
                                sp = yf.Ticker(transaction.symbol).history(start=x-timedelta(days=1), end=x)['Close'].iloc[0]
                                break
                            except:
                                x = x - timedelta(days=1)

                        if transaction.transaction_type == "buy":
                            total_money += round(float(transaction.quantity), 2) * sp

                            invested_money += round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                        else:
                            total_money -= round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                            invested_money -= round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                    else:
                        total_money = days[i-1]['money']
                        invested_money = days[i-1]['invested_money']
                    
            test_money = total_money
            if transaction_date == day_date:
                if transaction.transaction_type == "buy":
                        sp = symbol_prices[transaction.symbol].get(day_date, None)
                        total_buy_cost1 += round(float(transaction.quantity), 2) * sp
                        if done:
                            test_money -= round(float(transaction.quantity), 2) * sp
                            test_money += round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                            total_buy_cost2 += round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                            cucu +=  round(round(float(transaction.price), 2)*round(float(transaction.quantity), 2) - sp * round(float(transaction.quantity), 2), 2)
                        else:
                            total_buy_cost2 += round(float(transaction.quantity), 2) * round(float(transaction.price), 2) 
                else:
                    total_buy_cost1 += round(float(transaction.quantity), 2) * sp
                    
                    test_money -= round(float(transaction.quantity), 2) * round(float(transaction.price), 2)
                    test_i_money -= round(float(transaction.quantity), 2) * round(float(transaction.price), 2)


        day['money'] = total_money
        day['invested_money'] = invested_money
        
        
        if test_money != 0 and done == False: 
            total_buy_cost2 = 0
            if cash_days_user == 0:
                test_i_money = invested_money - total_buy_cost2
            else:
                test_i_money = test_money - total_buy_cost2
            done = True
            
        if done == True:

            if cash_days_user == 0:
                test_i_money += total_buy_cost2
                dif = (test_money - test_i_money) / test_i_money * 100
            else:
                test_i_money += total_buy_cost2
                dif = (test_money - test_i_money) / test_i_money * 100
            
                test_i_money += cucu

            nowyes = True
        else:
            dif = 0

        if invested_money != 0 and nowyes:
            day['daily_gain_loss'] = dif
        
        if day_date in sp500_percents and sp500_percents[day_date] is not None:
            day['sp500_daily_gain_loss'] = sp500_percents[day_date]
        else:

            if i == 0:
                x = datetime.strptime(day_date, '%Y-%m-%d')
                day['sp500_daily_gain_loss'] = 0

            else:
                day['sp500_daily_gain_loss'] = days[i-1]['sp500_daily_gain_loss']


