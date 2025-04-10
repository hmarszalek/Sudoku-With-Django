from django.urls import path
from . import views
from .views import home, register_view, login_view, logout_view, solve_sudoku, sudoku_history
from .views import settings, change_username, delete_account, change_password, change_password_done
from django.contrib.auth import views as auth_views

urlpatterns = [
    path("", home, name="home"),
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("solve_sudoku/", solve_sudoku, name="solve_sudoku"),
    path("history/", sudoku_history, name="history"),
    path('remove_sudoku/<int:sudoku_id>/', views.remove_sudoku, name='remove_sudoku'),
    path("settings/", settings, name="settings"),
    path('settings/change-username/', views.change_username, name='change_username'),
    path('settings/change-username/done', views.change_username_done, name='change_username_done'),
    path('settings/change-password/', views.change_password, name='change_password'),
    path('settings/change-password/done/', views.change_password_done, name='change_password_done'),
    path('settings/delete-account/', views.delete_account, name='delete_account'),
]
