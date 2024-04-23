# Generated by Django 5.0.2 on 2024-04-10 16:09

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portfolio", "0008_holding_total_buy_spent"),
    ]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="profit",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
