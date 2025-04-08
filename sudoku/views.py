from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_duration
from datetime import timedelta
from django.http import JsonResponse
from .forms import RegisterForm
from .models import SolvedSudoku
import json
from django.utils.timezone import now

def home(request):
    return render(request, "sudoku/home.html")

def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")
    else:
        form = UserCreationForm()
    return render(request, "sudoku/register.html", {"form": form})

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect("home")
    else:
        form = AuthenticationForm()
    return render(request, "sudoku/login.html", {"form": form})

def logout_view(request):
    logout(request)
    return redirect("home")

@login_required
def solve_sudoku(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get("name")
            board = data.get("board")
            solution = data.get("solution")
            time = data.get("time")
            date_solved = data.get("date_solved")

            sudoku = SolvedSudoku.objects.create(
                user=request.user,
                name=name,
                board=board,
                solution=solution,
                time=time,
            )
            return JsonResponse({"message": "Solved Sudoku saved successfully!"})
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
    return render(request, "sudoku/solve_sudoku.html")

@login_required
def sudoku_history(request):
    solved = SolvedSudoku.objects.filter(user=request.user).order_by("-date_solved")
    return render(request, "sudoku/history.html", {"solved_puzzles": solved})

@login_required
def remove_sudoku(request, sudoku_id):
    sudoku = get_object_or_404(SolvedSudoku, id=sudoku_id, user=request.user)
    sudoku.delete()  # Delete the Sudoku from the database
    return redirect('history')  # Redirect back to the history page

@login_required
def settings(request):
    return render(request, "sudoku/settings.html")