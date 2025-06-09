// script.js atualizado

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Tema escuro/salvo
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    themeToggle?.addEventListener('click', () => {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    const loginForm = document.getElementById('login-form');
    const toggleRegisterBtn = document.getElementById('toggle-register');
    const confirmPasswordContainer = document.getElementById('confirm-password-container');
    const loginSubmitBtn = document.getElementById('login-submit');
    const loginError = document.getElementById('login-error');

    let isRegisterMode = false;

    toggleRegisterBtn?.addEventListener('click', () => {
        isRegisterMode = !isRegisterMode;
        confirmPasswordContainer.classList.toggle('hidden', !isRegisterMode);
        loginSubmitBtn.textContent = isRegisterMode ? 'Cadastrar' : 'Entrar';
        toggleRegisterBtn.textContent = isRegisterMode ? 'Já tem conta? Entrar' : 'Novo aqui? Cadastre-se';
        loginError.classList.add('hidden');
    });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        loginError.classList.add('hidden');

        if (isRegisterMode) {
            if (password !== confirmPassword) {
                loginError.textContent = 'As senhas não coincidem!';
                loginError.classList.remove('hidden');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Usuário', email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar');

                alert('Cadastro realizado com sucesso! Faça login.');
                isRegisterMode = false;
                confirmPasswordContainer.classList.add('hidden');
                loginSubmitBtn.textContent = 'Entrar';
                toggleRegisterBtn.textContent = 'Novo aqui? Cadastre-se';
                loginForm.reset();
            } catch (err) {
                loginError.textContent = err.message;
                loginError.classList.remove('hidden');
            }
        } else {
            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Erro ao fazer login');

                localStorage.setItem('currentUser', JSON.stringify({
                    email: data.email,
                    name: data.name,
                    token: data.token,
                    type: data.email === 'admin@mategaucho.com' ? 'admin' : 'client'
                }));

                updateAuthUI();
                showHome();
                alert('Login bem-sucedido!');
            } catch (err) {
                loginError.textContent = err.message;
                loginError.classList.remove('hidden');
            }
        }
    });

    function updateAuthUI() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const authButtons = document.getElementById('auth-buttons');
        const userActions = document.getElementById('user-actions');
        const usernameDisplay = document.getElementById('username-display');
        const adminPanel = document.getElementById('admin-panel');

        if (currentUser) {
            authButtons?.classList.add('hidden');
            userActions?.classList.remove('hidden');
            usernameDisplay.textContent = currentUser.email;
            currentUser.type === 'admin' ? adminPanel?.classList.remove('hidden') : adminPanel?.classList.add('hidden');
        } else {
            authButtons?.classList.remove('hidden');
            userActions?.classList.add('hidden');
            adminPanel?.classList.add('hidden');
        }
    }

    window.logout = function () {
        localStorage.removeItem('currentUser');
        updateAuthUI();
        showLogin();
        alert('Você foi desconectado.');
    }

    function showLogin() {
        document.getElementById('login-screen')?.classList.remove('hidden');
        document.getElementById('main-store')?.classList.add('hidden');
        document.getElementById('about-section')?.classList.add('hidden');
    }

    function showHome() {
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('main-store')?.classList.remove('hidden');
    }

    updateAuthUI();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser ? showHome() : showLogin();
});
