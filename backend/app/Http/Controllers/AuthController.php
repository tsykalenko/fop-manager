<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Вхід у систему
    public function login(Request $request)
    {
        // 1. Валідація
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Шукаємо користувача
        $user = User::where('email', $request->email)->first();

        // 3. Перевіряємо пароль
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Невірний логін або пароль.'],
            ]);
        }

        // 4. Створюємо токен (це і є "ключ" до дверей)
        // Ми видаляємо старі токени, щоб був тільки один активний сеанс (безпека)
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Віддаємо фронтенду токен і роль
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // <--- Найважливіше для нас!
            ]
        ]);
    }

    // Вихід (знищення токена)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}