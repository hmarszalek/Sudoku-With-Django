# Generated by Django 4.2.20 on 2025-04-06 21:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sudoku', '0002_alter_solvedsudoku_board_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='solvedsudoku',
            name='time',
            field=models.CharField(default=0, max_length=100),
            preserve_default=False,
        ),
    ]
