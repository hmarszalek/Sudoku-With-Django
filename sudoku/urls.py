from django.urls import path
from . import views
from .views import home, register_view, login_view, logout_view, solve_sudoku

urlpatterns = [
    path("", home, name="home"),
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("solve_sudoku/", solve_sudoku, name="solve_sudoku"),
]
