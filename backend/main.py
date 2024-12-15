from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import pydantic
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware
from worker import scan_database_task, get_result
from database import list_tables,delete_items_by_ids
# connect to database

# cursor.execute('''SELECT column_name, data_type
# FROM information_schema.columns
# WHERE table_schema = 'public' AND table_name = 'items';''')
# columns = cursor.fetchall()


app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.mount("/static", StaticFiles(directory="static"), name="static")


# templates = Jinja2Templates(directory="templates")

class Table(pydantic.BaseModel):
    value: str|None
    label: str|None

@app.get("/tables")
def list_tables_1():
    ans = list_tables()
    print(ans)
    return [Table(value=row['typeIdentifier'],label=row['name']) for row in ans]

@app.post('/tasks')
def run_tasks():
    task = scan_database_task.delay()
    return {"task_id": task.id}
import json 

@app.get("/tasks/{task_id}")
def get_status(task_id):
    task_result = get_result(task_id)
    result = {
        "task_id": task_id,
        "task_status": task_result.status,
        "task_result": task_result.result
    }
    return result
from typing import List
@app.post("/delete-items")
async def delete_items(items_to_delete:list[int]):
    try:
        delete_items_by_ids([items_to_delete])
        # # Формируем SQL запрос для удаления
        # delete_query = """
        #     DELETE FROM public.items 
        #     WHERE id = ANY(%s)
        #     RETURNING id;
        # """
        
        # # Выполняем удаление
        # cursor.execute(delete_query, (items_to_delete,))
        # deleted_ids = cursor.fetchall()
        
        return {
            "status": "success"
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8001, reload=True)
