// Check if user is already logged in
if (localStorage.getItem('currentUser') || localStorage.getItem('rememberUser')) {
    window.location.href = 'index.html';
}

// Handle Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Save current user
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (remember) {
                localStorage.setItem('rememberUser', 'true');
            }
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            alert('Email atau password salah!');
        }
    });
}

// Handle Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            alert('Password dan konfirmasi password tidak cocok!');
            return;
        }

        if (password.length < 6) {
            alert('Password minimal 6 karakter!');
            return;
        }

        // Retrieve users and check for duplicates
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === email)) {
            alert('Email sudah terdaftar!');
            return;
        }

        // Save new user
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Registrasi berhasil! Silakan login.');
        window.location.href = 'login.html';
    });
}