from django.contrib import admin
from .models import SolvedSudoku, UserSettings

# Register your models here.
admin.site.register(SolvedSudoku)
admin.site.register(UserSettings)