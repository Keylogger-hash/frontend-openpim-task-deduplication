from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline, BitsAndBytesConfig
import torch
from sentence_transformers import SentenceTransformer
import sys
import psycopg2
import pandas as pd
import json
from fastapi.middleware.cors import CORSMiddleware
import json 
# Подключаемся к тестовой БД.
conn = psycopg2.connect(
    database="openpim", user='test1', password='123', host='127.0.0.1', port= '5432'
)

conn.autocommit = True
cursor = conn.cursor()

# Конфиг квантизации, позволяющий уменьшить размер модели.
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

# Создаем модель
model_name = "mistralai/Mistral-Nemo-Instruct-2407"
model = AutoModelForCausalLM.from_pretrained(model_name, quantization_config=quantization_config)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Создаем эмбеддинг модель
embedding_model = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L6-v2')

# Инициализация FastAPI
app = FastAPI()
device = "cuda:0"
app.add_middleware(
    CORSMiddleware,
    allow_origins='*',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Определение модели для входящих данных
class AskRequest(BaseModel):
    input: str
    max_new_tokens: int = 100

# Определение модели для эмбединга
class EmbdRequest(BaseModel):
    input: str

# Определение модели для поиска дубликатов
class DuplicateRequest(BaseModel):
    input: str
    limit: int = 10

#
class ScanRequest(BaseModel):
    limit: int = 10 # Определяет сколько "похожих" записей будет получено из бд.

#
class ScanItemResult(BaseModel):
    input_item: str
    input_id: int
    input_items: list # [[id, name]] format
    temp: float = 0.3


# '''Из списка слов [вода, минералка, мин.вода, песок, собака, водка]
#  выбери те, которые могут быть схожи по значению и смыслу со словом
#  [минеральная вода]. Для каждого слова напиши только 'Да' или 'Нет'.'''

# поиск дубликатов по базе
def find_duplicates(name,limit):
    embedding = embedding_model.encode(name)
    vec = ','.join(map(str, embedding))
    request = f'''SELECT id, name FROM public.items ORDER BY feature_name <=> '[{vec}]' LIMIT {limit};'''
    cursor.execute(request)
    result = cursor.fetchall()

    unparse = []
    for index, names in result:
        # Извлекаем первое значение из словаря (можно изменить ключ, если нужно)
        name = next(iter(names.values()))
        unparse.append([index, name])

    return unparse

def llm_request(prompt):
    messages = [
        {"role": "system", "content:": "Ты система поиска дубликатов в НСИ системах. У нас могут быть одни и те же элементы под разными записями, основная цель их найти. После каждого шага проверяй себя. Выполняй все задачи в соотвествии с запросом пользователя и находи дубликаты. Все найденые дубликаты возвращай в виде списка в JSON формате. Не добавляй спец. символы в ответ."},
        {"role": "user", "content": prompt},
    ]
    formatted_prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(formatted_prompt, return_tensors="pt").input_ids.to(device)
    attention_mask = inputs["attention_mask"]
    outputs = model.generate(
        inputs, 
        attention_mask=attention_mask,
        pad_token_id=tokenizer.eos_token_id,
        max_new_tokens = 1000,
        do_sample = True,
        temperature = 0.01
    )
    #decoded = tokenizer.batch_decode(outputs)
    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return decoded

def find_original_names():
    request = '''SELECT DISTINCT ON (name) id, name FROM public.items;'''
    cursor.execute(request)
    result = cursor.fetchall()

    unparse = []
    for index, names in result:
        name = next(iter(names.values()))
        unparse.append([index, name])

    return unparse

def process_scan_hnsw_list(lst):
    result = ""
    for i in range(len(lst)):
        result += '''{0}. ID:{1}, Название: "{2}" \n'''.format(i+1, int(lst[i][0]), lst[i][1])
    return result

def process_scan_llm(prompt, temp):
    messages = [
        #{"role": "system", "content:": "Ты система поиска дубликатов. У нас могут быть одни и те же элементы под разными записями, основная цель их найти. Не добавляй спец. символы в ответ."},
        {"role": "user", "content": prompt},
    ]
    formatted_prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(formatted_prompt, return_tensors="pt")
    inputs_ids = inputs['input_ids'].to(device)
    attention_mask = inputs["attention_mask"].to(device)
    outputs = model.generate(
        inputs_ids, 
        attention_mask=attention_mask,
        pad_token_id=tokenizer.eos_token_id,
        max_new_tokens = 2000,
        do_sample = True,
        temperature = temp
    )
    #decoded = tokenizer.batch_decode(outputs)
    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return decoded.replace(prompt, "")

@app.post("/duplication")
async def duplication_handler(request: DuplicateRequest):
    # ищем похожие слова
    input_word = request.input
    limit = request.limit

    search_result = find_duplicates(input_word, limit)

    # получаем список слов
    # list_of_names = []
    # for i,n in search_result:
    #     list_of_names.append('{0}'.format(n))

    prompt = '''Из списка элементов {0}, найди все записи, которые могут содержать схожее по значению и смыслу слово '{1}', и верни их в формате JSON в их исходном виде. Не добавляй никаких дополнительных комментариев или объяснений.'''.format(search_result, input_word)
    print("> ", prompt)
    result = llm_request(prompt)

    return {"response": result.replace(prompt, "")}

@app.post("/embd")
async def embd_handler(request: EmbdRequest):
    input_text = request.input
    result = embedding_model.encode(input_text)
    return {"response": str(result)}

# Определение функции для обработки запросов
@app.post("/ask")
async def ask_handler(request: AskRequest):
    input_text = request.input
    max_new_tokens = request.max_new_tokens

    inputs = tokenizer(input_text, return_tensors="pt")
    
    outputs = model.generate(**inputs.to(device), 
        max_new_tokens=max_new_tokens,
        pad_token_id=tokenizer.eos_token_id)
    response_text = tokenizer.batch_decode(outputs, skip_special_tokens=True)
    return {"response": response_text[0].replace(input_text, "")}

# Сканирование всей базы данных.
@app.post("/scan")
async def scan_handler(request: ScanRequest):
    limit = request.limit
    scan_results = {}

    # Получаем все уникальные записи из базы.
    uniq_values = find_original_names()
    # Проводим над каждой записью поиск дубликатов.
    for i in range(0, len(uniq_values)):
        _id = uniq_values[i][0]
        name = uniq_values[i][1]
        search_result = find_duplicates(name, limit)
        prompt = '''Из списка элементов {0}, найди все записи, которые могут содержать схожее по значению и смыслу слово '{1}', и верни их в формате JSON в их исходном виде. Не добавляй никаких дополнительных комментариев или объяснений.'''.format(search_result, name)
        print("> ", prompt)
        result = llm_request(prompt).replace(prompt, "")
        scan_results.update({_id: { name: result }})

    return {"response": str(scan_results)}

# Находит оригинальные значения в бд и находит самые похожие результаты.
@app.post("/scan-hnsw")
async def scan_hnsw_handler(limit: int = 10):
    scan_results = [] 
    uniq_values = find_original_names()  # Получаем все уникальные записи из базы.
    
    for i in range(0, len(uniq_values)):
        _id = uniq_values[i][0]
        _name = uniq_values[i][1]
        search_result = find_duplicates(_name,limit)
        tmp_res = {}
        tmp_res['id'] = _id
        tmp_res['name'] = _name 
        tmp_res['duplicates'] = search_result
        scan_results.append(tmp_res)

    return {"response": scan_results}

# Проверяет запись с помощью llm.
@app.post("/scan-hnsw-llm")
async def scan_hnsw_llm_handler(request: ScanItemResult):
    _item = request.input_item
    _id = request.input_id
    _items = request.input_items # [[id, name]]
    _temp = request.temp
    _items_processed = process_scan_hnsw_list(_items)
    _promt = ''' У меня есть список предметов, и мне нужно найти схожие по смыслу и значению дубликаты по сравнению с эталонным предметом. 
            Эталонный предмет имеет следующие характеристики:
            - ID: {0}
            - Название: '{1}'

            Вот список предметов для сравнения:
            {2}

            Пожалуйста, просмотрите список и верните все предметы, которые совпадают с эталонным предметом, в формате:
            [[<ID>, "<Название>"], ...]

            Давай подумаем шаг за шагом. Название предмета может включать различные свойства. Также учитывай схожесть свойств.
            Всегда учитывай схожесть названия по смыслу и значению. Даже если название предмета отличается в орфографии или имеет незначительные различия, пожалуйста, рассмотри этот предмет.
            Верни только ответ.
            '''.format(_id, _item, _items_processed)
#Верни только ответ, без рассуждений.
#У меня есть список предметов, и мне нужно найти как полные дубликаты, так и схожие по смыслу и значению дубликаты по сравнению с эталонным предметом.
    print(_item, _id, _items, _temp, _promt)
    
    _result = process_scan_llm(_promt, _temp)
    print(">", _result)
    return {_id : {_item : _result}}

# Запуск приложения
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
