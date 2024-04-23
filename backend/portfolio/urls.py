from django.urls import path
from . import views


urlpatterns = [
    path('transactions/', views.transaction_list, name="transactions"),
    path('transactions/<str:ticker>/', views.transaction_detail, name="transactions_detail"),
    path('symbol/<str:ticker>', views.symbol, name="symbol"),
    path('today-stocks-data/', views.today_stocks_data, name="today_stocks_data"),
    path('holding/', views.holding, name="holding"),
    path('keyword-stock/', views.keyword_stock, name="keyword_stock"),
    path('stocks-news/', views.stocks_news, name="stocks_news"),
    path('time-profit/<int:cash_days>', views.time_profit, name="time_profit"),
]

