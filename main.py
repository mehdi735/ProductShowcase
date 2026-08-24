from fastapi import Depends, File, FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db, Product, ProductFeature, ProductImage, Base, engine
from typing import List
import os
import uuid
import json

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class ProductCreate(BaseModel):
    name: str
    features: list[str]
    explanation: str
    images_urls: list[str]

@app.get("/products")
def get_all_product(db:Session=Depends(get_db)):
    product = db.query(Product).all()
    product_feature = db.query(ProductFeature).all()
    product_image = db.query(ProductImage).all()

    return {"product": product, "product_feature": product_feature, "product_image": product_image}

@app.get("/products/{id}")
def get_product_by_id(id:int, db:Session=Depends(get_db)):
    product = db.query(Product).filter_by(id=id).first()
    product_feature = db.query(ProductFeature).filter_by(product_id=id).all()
    product_image = db.query(ProductImage).filter_by(product_id=id).all()

    return {"product": product, "product_feature": product_feature, "product_image": product_image}

@app.post("/products")
def post_product(product_string:str=Form(...), image_files:List[UploadFile]=File(...), db:Session=Depends(get_db)):
    product = ProductCreate(**json.loads(product_string))
    new_product = Product(name=product.name, explanation=product.explanation)
    db.add(new_product)
    db.commit()

    os.makedirs("static/images", exist_ok=True)

    for feature in product.features:
        new_feature = ProductFeature(name=feature, product_id=new_product.id)
        db.add(new_feature)

    for image in image_files:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"/static/images/{filename}"

        with open(path, "wb") as i:
            i.write(image.file.read())

        product_image = ProductImage(image_url=path, product_id=new_product.id)
        db.add(product_image)

    db.commit()

    return {"message": f"created {product.name}"}

@app.delete("/products")
def delete_all_product(db:Session=Depends(get_db)):
    db.query(Product).delete()
    db.query(ProductFeature).delete()
    db.query(ProductImage).delete()
    db.commit()
    return {"message": "deleted all"}

@app.post("/test")
def test(t:str=Form(...), db:Session=Depends(get_db)):
    return t