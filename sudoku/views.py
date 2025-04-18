from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_duration
from django.utils.timezone import now
from datetime import timedelta

from .forms import RegisterForm, ChangeUsernameForm
from .models import SolvedSudoku, UserSettings

import json
from django.http import JsonResponse

def home(request):
    user_count = User.objects.count()
    solved_count = SolvedSudoku.objects.count()
    user_settings = UserSettings.objects.filter(user=request.user).first() if request.user.is_authenticated else None
    return render(request, "sudoku/home.html", {'user_count': user_count, 'solved_count': solved_count, 'settings': user_settings})

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
    user_settings = UserSettings.objects.filter(user=request.user).first()
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
    return render(request, "sudoku/solve_sudoku.html", {"settings": user_settings})

@login_required
def sudoku_history(request):
    solved = SolvedSudoku.objects.filter(user=request.user).order_by("-date_solved")
    user_settings = UserSettings.objects.filter(user=request.user).first()
    return render(request, "sudoku/history.html", {"solved_puzzles": solved, "settings": user_settings})

@login_required
def remove_sudoku(request, sudoku_id):
    sudoku = get_object_or_404(SolvedSudoku, id=sudoku_id, user=request.user)
    sudoku.delete()  # Delete the Sudoku from the database
    return redirect('history')  # Redirect back to the history page

@login_required
def settings(request):
    user_settings = UserSettings.objects.filter(user=request.user).first()
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            theme = data.get('theme')
            color_scheme = data.get('color_scheme')
            highlight_cells = data.get('highlight_cells')
            highlight_numbers = data.get('highlight_numbers')
            auto_check = data.get('auto_check')

            settings, created = UserSettings.objects.get_or_create(user=request.user)
            settings.theme = theme
            settings.color_scheme = color_scheme
            settings.highlight_cells = highlight_cells
            settings.highlight_numbers = highlight_numbers
            settings.auto_check = auto_check
            settings.save()

            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return render(request, "sudoku/settings.html", {'settings': user_settings})

@login_required
def change_username(request):
    if request.method == 'POST':
        form = ChangeUsernameForm(request.POST)
        if form.is_valid():
            new_username = form.cleaned_data['new_username']

            # Update the username (ensure it's unique and valid)
            user = request.user
            user.username = new_username
            user.save()

            return redirect('change_username_done')
    else:
        form = ChangeUsernameForm()

    return render(request, 'settings/change_username.html', {'form': form})

@login_required
def change_username_done(request):
    return render(request, 'settings/change_username_done.html')

@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()

            # Keeps user logged in after password change
            update_session_auth_hash(request, user)
            return redirect('change_password_done')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'settings/change_password.html', {'form': form})

@login_required
def change_password_done(request):
    return render(request, 'settings/change_password_done.html')

@login_required
def delete_account(request):
    if request.method == 'POST':
        request.user.delete()
        return redirect('home')
