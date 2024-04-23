from rest_framework import serializers
import yfinance as yf
from django.utils import timezone
from .models import Transaction, Holding

class TransactionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Transaction
        fields = ('id', 'price', 'symbol', 'transaction_date', 'transaction_type', 'quantity')
        read_only_fields= ["user"]
        labels = {
            'symbol': 'Symbol',
            'quantity': 'Quantity',
            'price': 'Price',
            'transaction_date': 'Transaction Date',
            'transaction_type': 'Transaction Type',
        }
        
    def validate_symbol(self, value):
        try:
            stock = yf.Ticker(value)
            stock.get_info()['symbol']

        except:
            raise serializers.ValidationError("Invalid symbol.")

        return value

    def validate_transaction_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("The transaction date cannot be in the future.")
        
        return value
    
    def validate_transaction_type(self, value):
        user = self.context['user']
        symbol = self.initial_data.get('symbol')
        quantity = self.initial_data.get('quantity')

        if value == 'sell':
            user_holding = Holding.objects.filter(user=user, symbol=symbol).first()
            if not user_holding or int(user_holding.quantity) < int(quantity):
                raise serializers.ValidationError("You don't have enough shares to sell.")

        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['user']
        return super().create(validated_data)

class UpdateTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['quantity', 'price']
    
    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        
        return value
    
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        
        return value

class StockSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    long_name = serializers.CharField()
    current_price = serializers.FloatField()