from django.db import models
from user.models import CustomUser
from django.db.models import Avg
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.db.models import Sum

# Create your models here.

class Transaction(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    transaction_type = models.CharField(max_length=10, choices=(
        ('buy', 'Buy'),
        ('sell', 'Sell')
    ))

    def __str__(self):
        return f"{self.user} | {self.transaction_type} | {self.symbol} | {self.created_at}"

    
class Holding(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=50, decimal_places=2)
    total_buy = models.DecimalField(max_digits=50, decimal_places=2, default=0)
    avg_price = models.DecimalField(max_digits=50, decimal_places=2)
    all_time_profit = models.DecimalField(max_digits=50, decimal_places=2, default=0)
    total_buy_spent = models.DecimalField(max_digits=50, decimal_places=2, default=0)
    total_sell_value = models.DecimalField(max_digits=50, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):
        return f"{self.user} | {self.symbol} | {self.quantity}"



@receiver(post_save, sender=Transaction)
def update_holding(sender, instance, created, **kwargs):
    if created:
        user_holdings = Holding.objects.filter(user=instance.user, symbol=instance.symbol)
        if user_holdings.exists():
            user_holding = user_holdings.first()
            if instance.transaction_type == 'buy':
                
                total_quantity = user_holding.total_buy + instance.quantity
                total_value = ((user_holding.total_buy * user_holding.avg_price) + (instance.quantity * instance.price))
                
                user_holding.avg_price = total_value / total_quantity

                user_holding.quantity += instance.quantity
                user_holding.total_buy += instance.quantity
                user_holding.total_buy_spent += instance.quantity * instance.price
                user_holding.save()
            elif instance.transaction_type == 'sell':
                if user_holding.quantity >= instance.quantity:

                    total_quantity = user_holding.quantity - instance.quantity
                    user_holding.quantity = total_quantity
                    
                    user_holding.all_time_profit = float(user_holding.all_time_profit) + float(instance.quantity) * (float(instance.price) - float(user_holding.avg_price))
                    user_holding.total_sell_value += instance.quantity * instance.price
                    
                    user_holding.save()

        else:
            if instance.transaction_type == 'buy':
                Holding.objects.create(
                    user=instance.user,
                    symbol=instance.symbol,
                    quantity=instance.quantity,
                    total_buy=instance.quantity,
                    avg_price=instance.price,  
                    total_buy_spent=instance.quantity * instance.price

                )

from django.db.models.signals import pre_save
@receiver(pre_save, sender=Transaction)
def update_holding_on_edit(sender, instance, **kwargs):
    try:
        old_instance = Transaction.objects.get(id=instance.id)
    except Transaction.DoesNotExist:
        return
    

    if old_instance.quantity != instance.quantity or \
       old_instance.price != instance.price or \
       old_instance.transaction_type != instance.transaction_type:
        update_holding_on_transaction_change(old_instance, instance)

    
from django.db.models.signals import pre_delete

@receiver(pre_delete, sender=Transaction)
def update_holding_on_delete(sender, instance, **kwargs):
    update_holding_on_transaction_change(instance, None)


def update_holding_on_transaction_change(old_transaction, new_transaction):
    user_holdings = Holding.objects.filter(user=old_transaction.user, symbol=old_transaction.symbol)
    if user_holdings.exists():
        user_holding = user_holdings.first()
        if old_transaction.transaction_type == 'buy':
            user_holding.quantity -= old_transaction.quantity
            user_holding.total_buy -= old_transaction.quantity
            user_holding.total_buy_spent -= old_transaction.quantity * old_transaction.price

            
            

        elif old_transaction.transaction_type == 'sell':
            user_holding.quantity += old_transaction.quantity
            user_holding.all_time_profit -= old_transaction.quantity * (old_transaction.price - user_holding.avg_price)
            user_holding.total_sell_value -= old_transaction.quantity * old_transaction.price

        if new_transaction is None:
            user_holding.save()
            return
        
        if new_transaction.transaction_type == 'buy':
            total_quantity = user_holding.total_buy + new_transaction.quantity
            total_value = user_holding.total_buy_spent + (new_transaction.quantity * new_transaction.price)
            user_holding.avg_price = total_value / total_quantity

            user_holding.quantity += new_transaction.quantity
            user_holding.total_buy += new_transaction.quantity
            user_holding.total_buy_spent += new_transaction.quantity * new_transaction.price

        elif new_transaction.transaction_type == 'sell':
            if user_holding.quantity >= new_transaction.quantity:
                user_holding.quantity -= new_transaction.quantity
                user_holding.all_time_profit += new_transaction.quantity * (new_transaction.price - user_holding.avg_price)
                user_holding.total_sell_value += new_transaction.quantity * new_transaction.price


        if user_holding.quantity > 0:
            user_holding.avg_price = user_holding.total_buy_spent / user_holding.total_buy
        else:
            user_holding.delete()
        user_holding.save()


@receiver(pre_delete, sender=Holding)
def delete_related_transactions(sender, instance, **kwargs):
    
    pre_delete.disconnect(update_holding_on_delete, sender=Transaction)

    Transaction.objects.filter(user=instance.user, symbol=instance.symbol).delete()

    pre_delete.connect(update_holding_on_delete, sender=Transaction)
 