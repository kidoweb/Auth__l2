
import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

async function displayUserProfile(user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('email').textContent = userData.email;
        const regDate = userData.registrationDate?.toDate();
        document.getElementById('registration-date').textContent = regDate ? regDate.toLocaleDateString() : "Не указано";
        document.getElementById('fullname').textContent = userData.fullname || "Не указано";
        document.getElementById('nickname').textContent = userData.nickname || "Не указано";
        document.getElementById('phone').textContent = userData.phone || "Не указано";
        document.getElementById('gender').textContent = userData.gender || "Не указано";
        document.getElementById('avatar').src = userData.avatarUrl || "https://via.placeholder.com/100";
    } else {
        console.log("Данные пользователя не найдены.");
    }
}

document.getElementById('edit-profile-btn').addEventListener('click', () => {
    document.getElementById('edit-form').classList.remove('hidden');
    document.getElementById('edit-profile-btn').classList.add('hidden');

    const fullname = document.getElementById('fullname').textContent;
    const nickname = document.getElementById('nickname').textContent;
    const phone = document.getElementById('phone').textContent;
    const gender = document.getElementById('gender').textContent;
    const avatarUrl = document.getElementById('avatar').src;

    document.getElementById('new-fullname').value = fullname !== "Не указано" ? fullname : "";
    document.getElementById('new-nickname').value = nickname !== "Не указано" ? nickname : "";
    document.getElementById('new-phone').value = phone !== "Не указано" ? phone : "";
    document.getElementById('new-gender').value = ["Мужской", "Женский", "Другой"].includes(gender) ? gender : "";
    document.getElementById('new-avatar-url').value = avatarUrl !== "https://via.placeholder.com/100" ? avatarUrl : "";
});

document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('edit-form').classList.add('hidden');
    document.getElementById('edit-profile-btn').classList.remove('hidden');
    document.getElementById('profile-edit-form').reset();
});

document.getElementById('save-changes-btn').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Пользователь не авторизован.");
        return;
    }

    const newFullname = document.getElementById('new-fullname').value.trim();
    const newNickname = document.getElementById('new-nickname').value.trim();
    const newPhone = document.getElementById('new-phone').value.trim();
    const newGender = document.getElementById('new-gender').value;
    const newAvatarUrl = document.getElementById('new-avatar-url').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword || confirmNewPassword) {
        if (newPassword !== confirmNewPassword) {
            alert('Новые пароли не совпадают!');
            return;
        }
    }

    const fieldsToCheck = { newNickname, newPhone, newAvatarUrl };
    for (const [key, value] of Object.entries(fieldsToCheck)) {
        if (/\s/.test(value)) {
            alert(`Поле "${key}" не должно содержать пробелы!`);
            return;
        }
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const updates = {
            fullname: newFullname || "",
            nickname: newNickname || "",
            phone: newPhone || "",
            gender: newGender || "",
            avatarUrl: newAvatarUrl || "",
            updatedAt: serverTimestamp()
        };

        Object.keys(updates).forEach(key => {
            if (!updates[key]) {
                delete updates[key];
            }
        });

        await updateDoc(userRef, updates);
        if (newPassword) {
            await updatePassword(user, newPassword);
        }

        alert('Изменения успешно сохранены!');
        document.getElementById('edit-form').classList.add('hidden');
        document.getElementById('edit-profile-btn').classList.remove('hidden');
        displayUserProfile(user); 
    } catch (error) {
        console.error("Ошибка обновления профиля:", error);
        alert(error.message);
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert('Вы успешно вышли из аккаунта.');
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Ошибка выхода:", error);
        alert(error.message);
    });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserProfile(user);
    } else {
        window.location.href = "login.html";
    }
});
