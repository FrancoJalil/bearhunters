# Generated by Django 5.0.2 on 2024-03-07 21:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("paypal", "0006_remove_paypalproductmodel_price_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="purchase",
            name="price",
            field=models.CharField(default=1, max_length=50),
            preserve_default=False,
        ),
    ]
