<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Створюємо Власника (Адміна)
        User::create([
            'name' => 'Адмін',
            'email' => 'tsykalenko.oleksii@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 2. Створюємо Продавця
        User::create([
            'name' => 'Продавець 1',
            'email' => 'seller1@fop.com',
            'password' => Hash::make('password1'),
            'role' => 'seller',
        ]);
        
        // Можна додати ще одного продавця для тесту
        User::create([
            'name' => 'Продавець 2',
            'email' => 'seller2@fop.com',
            'password' => Hash::make('password2'), 
            'role' => 'seller',
        ]);
    }
}