from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.schedule import ClassSchedule

router = APIRouter()

class ClassInput(BaseModel):
    course_name: str
    course_code: str
    professor: str = None
    location: str = None
    day_of_week: str
    start_time: str
    end_time: str

@router.get("/schedule")
def get_schedule(db: Session = Depends(get_db)):
    classes = db.query(ClassSchedule).all()
    return [
        {
            "id": c.id,
            "course_name": c.course_name,
            "course_code": c.course_code,
            "professor": c.professor,
            "location": c.location,
            "day_of_week": c.day_of_week,
            "start_time": c.start_time,
            "end_time": c.end_time
        }
        for c in classes
    ]

@router.post("/schedule")
def add_class(data: ClassInput, db: Session = Depends(get_db)):
    new_class = ClassSchedule(**data.dict())
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return {"message": "Class added", "id": new_class.id}

@router.delete("/schedule/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    c = db.query(ClassSchedule).filter(ClassSchedule.id == class_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(c)
    db.commit()
    return {"message": "Class deleted"}
