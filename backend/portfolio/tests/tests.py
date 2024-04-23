from user.tests.setup import SetUpAuthUser
from faker import Faker
from django.urls import reverse
from rest_framework import status
fake = Faker()

class TestTransaction(SetUpAuthUser):

    def setUp(self):
        super().setUp()

        self.transactions_url = reverse("transactions")


    def test_create_transaction_success(self):

        valid_data = {
            'symbol': 'AAPL',
            'quantity': 10,
            'price': 150.0,
            'transaction_type': 'buy',
            'transaction_date': '2024-02-23'
        }

        response = self.client.post(self.transactions_url, headers=self.headers, data=valid_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_transaction_failure_invalid_symbol(self):

        invalid_symbol_data = {
            'symbol': 'INVALID_SYMBOL',
            'quantity': 10,
            'price': 150.0,
            'transaction_type': 'buy',
            'transaction_date': '2024-03-23'
        }

        response = self.client.post(self.transactions_url, headers=self.headers, data=invalid_symbol_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("msg"), "Invalid field 'Symbol': Invalid symbol.")
        
    def test_create_transaction_failure_invalid_date(self):

        invalid_symbol_data = {
            'symbol': 'AAPL', 
            'quantity': 10,
            'price': 150.0,
            'transaction_type': 'buy',
            'transaction_date': '3000-03-23'
        }

        response = self.client.post(self.transactions_url, headers=self.headers, data=invalid_symbol_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("msg"), "Invalid field 'Transaction date': The transaction date cannot be in the future.")
        
