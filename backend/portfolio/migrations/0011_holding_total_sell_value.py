# Generated by Django 5.0.2 on 2024-04-13 17:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portfolio", "0010_remove_transaction_profit"),
    ]

    operations = [
        migrations.AddField(
            model_name="holding",
            name="total_sell_value",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=50),
        ),
    ]
