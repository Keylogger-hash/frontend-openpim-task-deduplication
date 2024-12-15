import os
import time
import requests
from celery import Celery

celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379")
celery.conf.broker_connection_retry_on_startup = True

def get_result(task_id: str):
    c = celery.AsyncResult(task_id)
    return c
import json 

def fix_json(data):
    fixed_data = []
    for k,input_data in data.items():
        for name, dup in input_data.items():
            print(dup)
            dup = json.loads(dup)
            fixed_data.append({
                'id':k,
                'name':name,
                'duplicates':dup
            })
    return fixed_data
    # return fixed_data
def count_unique_duplicates(data):
    total_unique_duplicates = 0
    
    for item in data:
        # Создаем множество для хранения уникальных ID дубликатов
        unique_duplicates = set()
        
        # Добавляем ID дубликатов в множество, пропуская основной элемент
        for duplicate in item['duplicates'][1:]:  # Пропускаем первый элемент (основной)
            duplicate_id = str(duplicate[0])  # Преобразуем ID в строку для единообразия
            unique_duplicates.add(duplicate_id)
        
        # Добавляем количество уникальных дубликатов для текущего элемента
        total_unique_duplicates += len(unique_duplicates)
        
        # Можно также вывести информацию по каждому элементу
        print(f"Элемент {item['name']} (ID: {item['id']}) имеет {len(unique_duplicates)} уникальных дубликатов")
    
    return total_unique_duplicates
@celery.task(bind=True)
def scan_database_task(self):
    try:
        response = requests.post('http://localhost:8000/scan-hnsw',json={'limit':10})
        data = response.json()
        data = data['response'][:5]
        ans = []
        resp_data = {}
        for input in data:
            input_id = input['id']
            input_item = input['name']
            input_duplicates = input['duplicates']
            input_data = {    
                'input_item': input_item, 
                'input_id': input_id,
                'input_items': input_duplicates,
                'temp': 0.1
            }
            r = requests.post('http://localhost:8000/scan-hnsw-llm',json=input_data)
            input_data = r.json()
            fixed_json = fix_json(input_data)
            ans.append(*fixed_json)
        total_unique_duplicates = count_unique_duplicates(ans)
        resp_data['result'] = ans 
        resp_data['total_count'] = total_unique_duplicates
        return resp_data  
    except requests.RequestException as e:
        # Обработка ошибок / Error handling
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
