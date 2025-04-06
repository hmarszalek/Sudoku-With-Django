from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

def get_empty_board():
    return [[0]*9 for _ in range(9)]

class SolvedSudoku(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    board = models.JSONField(default=get_empty_board)
    solution = models.JSONField(default=get_empty_board)
    time = models.CharField(max_length=100)
    date_solved = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name}-{self.user.username}"