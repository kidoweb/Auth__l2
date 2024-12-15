// register.js

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Функция для генерации случайного пароля
function generateRandomPassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Обработчик генерации пароля
document.getElementById('generate-password-btn').addEventListener('click', () => {
    const password = generateRandomPassword();
    document.getElementById('password').value = password;
    document.getElementById('confirm-password').value = password;
    updatePasswordStrength(password);
});

// Функция для отображения/скрытия пароля
function togglePasswordVisibility(passwordId, toggleButtonId) {
    const passwordField = document.getElementById(passwordId);
    const toggleButton = document.getElementById(toggleButtonId);
    toggleButton.addEventListener('click', () => {
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;
        // Обновляем иконку глазика
        toggleButton.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

// Включаем функционал для обоих полей пароля
togglePasswordVisibility('password', 'toggle-password');
togglePasswordVisibility('confirm-password', 'toggle-confirm-password');

// Функция для проверки сложности пароля
function checkPasswordStrength(password) {
    const s_letters = "qwertyuiopasdfghjklzxcvbnm"; // Буквы в нижнем регистре
    const b_letters = "QWERTYUIOPLKJHGFDSAZXCVBNM"; // Буквы в верхнем регистре
    const digits = "0123456789"; // Цифры
    const specials = "!@#$%^&*()_-+=\\|/.,:;[]{}"; // Спецсимволы
    let is_s = false, is_b = false, is_d = false, is_sp = false;

    for (let char of password) {
        if (!is_s && s_letters.includes(char)) is_s = true;
        if (!is_b && b_letters.includes(char)) is_b = true;
        if (!is_d && digits.includes(char)) is_d = true;
        if (!is_sp && specials.includes(char)) is_sp = true;
    }

    let rating = 0;
    if (is_s) rating++;
    if (is_b) rating++;
    if (is_d) rating++;
    if (is_sp) rating++;

    let strength = "";
    let color = "";

    if (password.length < 6 && rating < 3) {
        strength = "Простой";
        color = "red";
    } else if (password.length < 6 && rating >= 3) {
        strength = "Средний";
        color = "orange";
    } else if (password.length >= 8 && rating < 3) {
        strength = "Средний";
        color = "orange";
    } else if (password.length >= 8 && rating >= 3) {
        strength = "Сложный";
        color = "green";
    } else if (password.length >= 6 && rating === 1) {
        strength = "Простой";
        color = "red";
    } else if (password.length >= 6 && rating > 1 && rating < 4) {
        strength = "Средний";
        color = "orange";
    } else if (password.length >= 6 && rating === 4) {
        strength = "Сложный";
        color = "green";
    } else {
        strength = "";
    }

    return { strength, color };
}

function updatePasswordStrength(password) {
    const { strength, color } = checkPasswordStrength(password);
    const strengthIndicator = document.getElementById('password-strength');
    strengthIndicator.textContent = strength ? `Сложность пароля: ${strength}` : '';
    strengthIndicator.style.color = color;
}

document.getElementById('password').addEventListener('input', (e) => {
    const password = e.target.value;
    updatePasswordStrength(password);
});

document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const fullname = document.getElementById('fullname').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value;
    const avatarUrl = document.getElementById('avatar-url').value.trim();

    if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }

    const fieldsToCheck = { email, password, confirmPassword, nickname, phone, avatarUrl };
    for (const [key, value] of Object.entries(fieldsToCheck)) {
        if (/\s/.test(value)) {
            alert(`Поле "${key}" не должно содержать пробелы!`);
            return;
        }
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            email: email,
            fullname: fullname || "",
            nickname: nickname || "",
            phone: phone || "",
            gender: gender || "",
            avatarUrl: avatarUrl || "",
            registrationDate: serverTimestamp()
        });

        alert('Регистрация прошла успешно!');
        window.location.href = "profile.html";
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        alert(error.message);
    }
});
