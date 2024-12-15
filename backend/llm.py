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


def llm_request(prompt):
    messages = [
        {"role": "system", "content:": "Ты система поиска дубликатов в НСИ системах. У нас могут быть одни и те же элементы под разными записями, основная цель их найти. После каждого шага проверяй себя. Выполняй все задачи в соотвествии с запросом пользователя и находи дубликаты. Все найденые дубликаты возвращай в виде списка в JSON формате. Не добавляй спец. символы в ответ."},
        {"role": "user", "content": prompt},
    ]
    formatted_prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(formatted_prompt, return_tensors="pt")
    attention_mask = inputs["attention_mask"]
    outputs = model.generate(
        inputs['input_ids'].to(device), 
        attention_mask=attention_mask,
        pad_token_id=tokenizer.eos_token_id,
        max_new_tokens = 1000,
        do_sample = True,
        temperature = 0.01
    )
    #decoded = tokenizer.batch_decode(outputs)
    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return decoded

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
    attention_mask = inputs["attention_mask"]
    outputs = model.generate(
        inputs['input_ids'].to(device), 
        attention_mask=attention_mask,
        pad_token_id=tokenizer.eos_token_id,
        max_new_tokens = 2000,
        do_sample = True,
        temperature = temp
    )
    #decoded = tokenizer.batch_decode(outputs)
    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return decoded.replace(prompt, "")

def process_scanning():
    _item = request.input_item
    _id = request.input_id
    _items = request.input_items # [[id, name]]
    _temp = request.temp
    _items_processed = process_scan_hnsw_list(_items)
    _promt = f''' У меня есть список предметов, и мне нужно найти схожие по смыслу и значению дубликаты по сравнению с эталонным предметом. 
            Эталонный предмет имеет следующие характеристики:
            - ID: {_id}
            - Название: '{_item}'

            Вот список предметов для сравнения:
            {_items_processed}

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