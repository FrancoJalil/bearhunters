from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Transaction, Holding
from .serializers import TransactionSerializer, UpdateTransactionSerializer, StockSerializer
from helpers.handle_errors import raise_400_HTTP_if_serializer_invalid
import yfinance as yf
import concurrent.futures
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from .helpers.stocks import get_sp500_data, get_stock_info, get_holding_data, get_stock_symbols, get_sum_all_time_profits, get_stock_data, get_close_prices_current_stocks, get_daily_user_cash_data
from datetime import timedelta




@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transaction_list(request):

    if request.method == 'GET':
        transactions = Transaction.objects.filter(user=request.user).order_by('transaction_date')

        paginator = PageNumberPagination()
        paginator.page_size = request.GET.get('page_size', 10)
        user_purchases_page = paginator.paginate_queryset(transactions, request)

        serializer = TransactionSerializer(user_purchases_page, many=True)
        return paginator.get_paginated_response(serializer.data)
        
    
    elif request.method == 'POST':
        serializer = TransactionSerializer(data=request.data, context={'user': request.user})
        raise_400_HTTP_if_serializer_invalid(serializer)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def transaction_detail(request, ticker):
    ticker = ticker.upper()

    if request.method == 'GET':
        transactions = Transaction.objects.filter(user=request.user, symbol=ticker).order_by('-transaction_date')

        paginator = PageNumberPagination()
        paginator.page_size = request.GET.get('page_size', 10)
        user_purchases_page = paginator.paginate_queryset(transactions, request)

        serializer = TransactionSerializer(user_purchases_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    
    elif request.method == 'DELETE':
        transaction_id = request.data.get("transactionId")
        transaction = Transaction.objects.filter(id=transaction_id).first()
        if not transaction:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'PUT':
        transaction_id = request.data.get("transactionId")
        transaction = Transaction.objects.filter(user=request.user, id=transaction_id, symbol=ticker).first()
        serializer = UpdateTransactionSerializer(transaction, data=request.data)

        raise_400_HTTP_if_serializer_invalid(serializer)
        serializer.save()
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stocks_news(request):

    news = list()
    seen_uuids = set()

    holdings = Holding.objects.filter(user=request.user, quantity__gt=0).values("symbol")
    
    def get_news_for_ticker(ticker_symbol):
        ticker = yf.Ticker(ticker_symbol.split('.')[0])
        for new in ticker.get_news()[:2]:
            if new.get("thumbnail") and new["uuid"] not in seen_uuids and new['thumbnail']['resolutions'][0]['width'] > 100:
                news.append(new)
                seen_uuids.add(new["uuid"])

    if not holdings:
        get_news_for_ticker('^GSPC')
    else:
        for stock in holdings:
            get_news_for_ticker(stock['symbol'].split('.')[0])

    return Response({"stocks_news": news})


@api_view(['GET'])
def symbol(request, ticker):
    stock_info = get_stock_info(ticker)
    if stock_info:
        serializer = StockSerializer(data=stock_info)
        if serializer.is_valid():
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'msg': 'Invalid symbol.'}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_stocks_data(request):
    symbols = Holding.objects.filter(user=request.user, quantity__gt=0).values_list('symbol', flat=True)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(get_stock_data, symbol) for symbol in symbols]
        today_stocks_data = [future.result() for future in concurrent.futures.as_completed(futures)]
    return Response({"stocks": today_stocks_data})


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def holding(request):
    user = request.user
    if request.method == 'GET':
        holdings = Holding.objects.filter(user=user)
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(get_holding_data, holding) for holding in holdings]
            holdings_list = [future.result() for future in concurrent.futures.as_completed(futures)]

        return Response({"holdings": holdings_list}, status=200)
    elif request.method == 'DELETE':
        symbol = request.data.get("symbol")
        holding = Holding.objects.filter(user=user, symbol=symbol).first()
        holding.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def keyword_stock(request):
    if request.method == 'GET':
        keyword = request.GET.get('keyword', '')
        if keyword:
            symbols = get_stock_symbols(keyword)
            return Response(symbols)
    return Response()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def time_profit(request, cash_days=30):

    cash_days_user = int(cash_days)
    current_date = timezone.now().date()

    if int(cash_days) == 0:
        first_transaction = Transaction.objects.filter(user=request.user).order_by('transaction_date').first()
        
        if first_transaction:
            transaction_days = first_transaction.transaction_date - timedelta(days=1)
            cash_days = (current_date - transaction_days).days
        else:
            cash_days = 1

    days_ago = current_date - timedelta(days=cash_days)
    
    user_transactions = Transaction.objects.filter(user=request.user)


    days = [{"date": (current_date - timedelta(days=i)).strftime("%Y-%m-%d"), 
             "money": 0, 
             "invested_money": 0, 
             "daily_gain_loss": 0, 
             "sp500_daily_gain_loss": 0,
             "sp500_daily_percents": 0,
             } for i in range(cash_days, -1, -1)]


    symbol_prices = get_close_prices_current_stocks(user=request.user, days=days, days_ago=days_ago, current_date=current_date)
    
    sp500_percents = get_sp500_data(days_ago, current_date, int(cash_days))

    get_daily_user_cash_data(days, user_transactions, symbol_prices, cash_days_user, sp500_percents)

    return Response(days)


