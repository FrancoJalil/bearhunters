# Generated by Django 5.0.2 on 2024-04-22 22:04

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portfolio", "0013_rename_percent_change_sp500data_price"),
    ]

    operations = [
        migrations.DeleteModel(
            name="SP500Data",
        ),
    ]
