import psycopg2
import json
from psycopg2.extras import RealDictCursor

# connect to database
conn = psycopg2.connect(
    database="openpim", user='test1', password='123', host='localhost', port= '5432'
)

conn.autocommit = True
cursor = conn.cursor(cursor_factory=RealDictCursor)


def find_duplicates(name):
    embedding = embedding_model.encode(name)
    vec = ','.join(map(str, embedding))
    request = f'''SELECT id, name FROM public.items ORDER BY feature_name <=> '[{vec}]' AND "LIMIT 10";'''
    cursor.execute(request)
    result = cursor.fetchall()

    unparse = []
    for index, names in result:
        # Извлекаем первое значение из словаря (можно изменить ключ, если нужно)
        name = next(iter(names.values()))
        unparse.append([index, name])

def list_tables():
    cursor.execute('''SELECT DISTINCT "typeIdentifier","name"->>'ru' as "name" FROM items;''')
    result = cursor.fetchall()
    ans = []
    for row in result:
        ans.append(dict(row))
    return ans

def delete_items_by_ids(item_ids: list[int]):
    try:
        delete_query = """
            DELETE FROM public.items 
            WHERE id = ANY(%s)
            RETURNING id;
        """
        cursor.execute(delete_query, (item_ids,))
        deleted_items = cursor.fetchall()
        conn.commit()
        return deleted_items
    except Exception as e:
        conn.rollback()
        raise e