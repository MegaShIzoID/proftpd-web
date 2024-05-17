import os
from flask import Flask, render_template, request, session, redirect, url_for, jsonify

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.template_folder = '/srv/ftp/web/templates'
app.static_folder = '/srv/ftp/web/static'

# Проверка правильности логина и пароля
def check_login(username, password):
    # Простая проверка логина и пароля
    return username == 'admin' and password == 'password'

# Функция для добавления виртуального пользователя в ProFTPD и создания папки для него
import os
import pexpect

def add_ftp_user(username, password):
    # Создаем папку для пользователя
    user_folder = f'/srv/ftp/users/{username}'
    os.makedirs(user_folder, exist_ok=True)

    # Устанавливаем права доступа для папки пользователя
    os.chmod(user_folder, 0o770)
    os.chown(user_folder, 115, 65534)  # UID и GID пользователя ftp

    # Создаем нового виртуального пользователя
    try:
        child = pexpect.spawn('ftpasswd --passwd --name={} --uid=115 --home={} --shell=/bin/false --file=/etc/proftpd/ftpd.passwd'.format(username, user_folder))
        child.expect('Password:')
        child.sendline(password)
        child.expect('Re-type password:')
        child.sendline(password)
        child.expect(pexpect.EOF)
    except pexpect.ExceptionPexpect as e:
        print("Ошибка при выполнении команды fpasswd:")
        print(e)

def get_user_list():
    user_list = []
    with open('/etc/proftpd/ftpd.passwd', 'r') as file:
        for line in file:
            username = line.split(':')[0]
            user_list.append(username)
    return user_list

def delete_users(usernames):
    # Открываем файл для чтения и записи
    with open('/etc/proftpd/ftpd.passwd', 'r') as file:
        lines = file.readlines()
    # Удаляем строки для выбранных пользователей
    lines = [line for line in lines if not any(line.startswith(username + ':') for username in usernames)]
    # Перезаписываем файл с обновленными данными
    with open('/etc/proftpd/ftpd.passwd', 'w') as file:
        file.writelines(lines)

@app.route('/')
def index():
    if 'username' in session:
        return render_template('index.html')
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if check_login(username, password):
            session['username'] = username
            return redirect(url_for('index'))
        else:
            return 'Неправильный логин или пароль'
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/add_user', methods=['POST'])
def add_user():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'Необходимо войти в систему'})
    username = request.form['username']
    password = request.form['password']
    add_ftp_user(username, password)
    return jsonify({'status': 'success', 'message': 'Виртуальный пользователь добавлен успешно!'})

@app.route('/user_list')
def user_list():
    return jsonify({'users': get_user_list()})


@app.route('/delete_users', methods=['POST'])
def delete_user():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'Необходимо войти в систему'})
    usernames = request.json  # Получаем список пользователей для удаления
    delete_users(usernames)
    return jsonify({'status': 'success', 'message': 'Пользователи успешно удалены!'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
