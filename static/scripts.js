var usersPerPage = 10; // Количество пользователей на странице
var currentPage = 0;    // Текущая страница
var totalPages = 0;     // Общее количество страниц
var originalRowCount = 10; // Исходное количество строк в таблице
var sessionTimeout;
var lastActivityTime;

function addUser() {
    // Получаем имя пользователя и пароль из формы
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    // Проверяем, если пользователь уже существует
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/user_list", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var userList = JSON.parse(xhr.responseText).users;
            if (userList.includes(username)) {
                alert("Пользователь с таким именем уже существует.");
            } else {
                // Проверяем, совпадают ли пароли
                if (password !== confirmPassword) {
                    alert("Пароли не совпадают.");
                    return;
                }

                // Если пользователя не существует и пароли совпадают, отправляем данные формы на сервер для добавления
                var xhrAddUser = new XMLHttpRequest();
                xhrAddUser.open("POST", "/add_user", true);
                xhrAddUser.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhrAddUser.onreadystatechange = function() {
                    if (xhrAddUser.readyState === 4 && xhrAddUser.status === 200) {
                        // Показываем всплывающее окно с результатом добавления пользователя
                        alert(JSON.parse(xhrAddUser.responseText).message);
                        // Очищаем поля ввода
                        document.getElementById("username").value = "";
                        document.getElementById("password").value = "";
                        document.getElementById("confirmPassword").value = "";
                        // Обновляем список пользователей на странице
                        showUserList(currentPage);
                    }
                };
                xhrAddUser.send("username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password));
            }
        }
    };
    xhr.send();
}

function deleteUser() {
    // Получаем все чекбоксы пользователей
    var checkboxes = document.getElementsByName("userCheckbox");
    // Создаем массив для хранения имен пользователей, выбранных для удаления
    var usersToDelete = [];
    // Проверяем, есть ли выбранные пользователи
    var usersSelected = false;
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            usersSelected = true;
            usersToDelete.push(checkboxes[i].value);
        }
    }
    if (!usersSelected) {
        alert("Выберите пользователей для удаления.");
        return;
    }
    // Запрашиваем подтверждение удаления у пользователя
    var confirmation = confirm("Вы уверены, что хотите удалить выбранных пользователей?");
    if (confirmation) {
        // Если пользователь подтвердил удаление, отправляем запрос на сервер для удаления пользователей
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/delete_users", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Показываем всплывающее окно с результатом удаления пользователей
                alert(JSON.parse(xhr.responseText).message);
                // Перезагружаем текущую страницу списка пользователей
                showUserList(currentPage);
            }
        };
        xhr.send(JSON.stringify(usersToDelete));
    } else {
        // Если пользователь отказался от удаления, снимаем все чекбоксы
        for (var j = 0; j < checkboxes.length; j++) {
            checkboxes[j].checked = false;
        }
    }
}

function showUserList(page) {
    console.log("Current page:", currentPage);
    console.log("Total pages:", totalPages);
    // Получаем строку поиска из поля ввода
    var searchQuery = document.getElementById("searchInput").value.toLowerCase();

    // Отправляем запрос на сервер для получения списка пользователей
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/user_list", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var userList = JSON.parse(xhr.responseText).users;
            console.log("User list before filtering:", userList);
            // Фильтруем список пользователей по введенному тексту
            var filteredList = userList.filter(function(user) {
                return user.toLowerCase().includes(searchQuery);
            });
            console.log("Filtered user list:", filteredList);
            filteredList.sort();
            totalPages = Math.ceil(filteredList.length / 10);
            currentPage = Math.min(currentPage, totalPages - 1); // При фильтрации переключаем currentPage, если он больше общего количества страниц
            console.log("Updated current page:", currentPage);
            console.log("Updated total pages:", totalPages);
            var startIndex = currentPage * 10;
            var endIndex = Math.min((currentPage + 1) * 10, filteredList.length); // Учитываем случай, когда пользователей меньше, чем 10 на странице
            // Создаем HTML для текстовой таблицы
            var tableHtml = "<table class='center' border='1'><tr><th>Имя пользователя</th><th>Удалить</th></tr>";
            for (var i = startIndex; i < endIndex; i++) {
                var username = filteredList[i] ? filteredList[i] : "";
                // Добавляем чекбокс только если есть значение имени пользователя
                if (username !== "") {
                    tableHtml += "<tr><td>" + username + "</td><td><input type='checkbox' name='userCheckbox' value='" + username + "'></td></tr>";
                } else {
                    tableHtml += "<tr><td></td><td></td></tr>"; // Добавляем пустую строку вместо чекбокса
                }
            }
            tableHtml += "</table>";
            // Выводим таблицу пользователей в элементе <div id="userList">
            document.getElementById("userList").innerHTML = tableHtml;
            // Обновляем отображение номера текущей страницы и общего количества страниц
            document.getElementById("pageInfo").innerHTML = "Страница " + (currentPage + 1) + " из " + totalPages;
        }
    };
    xhr.send();
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        showUserList(currentPage);
    }
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        showUserList(currentPage);
    }
}

// Функция для сброса таймера
function resetSessionTimeout() {
    clearTimeout(sessionTimeout); // Сбрасываем предыдущий таймер
    // Устанавливаем новый таймер на 30 минут
    sessionTimeout = setTimeout(logoutUser, 30 * 60 * 1000); // 30 минут в миллисекундах
}

// Функция для выхода из учетной записи пользователя
function logoutUser() {
    // Реализуйте здесь код для выхода из учетной записи, например, перенаправление на страницу выхода
    window.location.href = "/logout"; // Пример перенаправления на страницу выхода
}

// Обработчик события перед выгрузкой страницы
window.addEventListener("unload", function(event) {
    // Сохраняем текущее время в localStorage перед выгрузкой страницы
    localStorage.setItem("lastActivityTime", Date.now());
});

// Проверяем localStorage при загрузке страницы
document.addEventListener("DOMContentLoaded", function(event) {
    var lastActivityTimestamp = localStorage.getItem("lastActivityTime");
    if (lastActivityTimestamp) {
        var elapsedTime = Date.now() - parseInt(lastActivityTimestamp);
        // Проверяем, прошло ли более 30 минут с момента последней активности
        if (elapsedTime >= 30 * 60 * 1000) {
            // Если прошло, вызываем функцию выхода пользователя
            logoutUser();
        } else {
            // Если не прошло, пересчитываем таймер
            resetSessionTimeout();
        }
    } else {
        // Если нет данных о времени последней активности, пересчитываем таймер
        resetSessionTimeout();
    }
});

// Устанавливаем обработчики событий для сброса таймера
document.addEventListener("mousemove", resetSessionTimeout); // Обновляем таймер при движении мыши
document.addEventListener("keypress", resetSessionTimeout); // Обновляем таймер при нажатии клавиш
document.addEventListener("scroll", resetSessionTimeout); // Обновляем таймер при прокрутке страницы
