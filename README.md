<h1>Фронтенд для базы OpenPIM для задачи дедупликации данных</h1>
<h2>Зачем это?</h2>
<p>Данный сервис позволяет запустить поиск дубликатов для OpenPIM сервера</p>
<h2>Как запустить</h2>
<ul>
  <li><code>pip install virtualenv</code></li>
  <li><code>virtualenv venv</code></li>
  <li><code>pip install -r requirements.txt</code></li>
  <h3>Запуск фронтенда</h3>
  <li><code>npm install</code></li>
  <li><code>npm start</code></li>
  <h3>Запуск бэкенда</h3>
  <li><code>python backend/main.py</code></li>
  <h3>Запуск celery</h3>
  <li><code>cd backend && celery -A worker.celery worker --loglevel=debug</code></li>
  <h3>Запуск сервера llm</h3>
  <li><code>python llm_server/server.py</code></li>
</ul>
