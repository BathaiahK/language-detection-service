from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str = None
    price: float


@app.get("/")
async def root():
    return {"message": "Hello from FastAPI backend"}


@app.post("/items/")
async def create_item(item: Item):
    return {"item": item, "status": "created"}
