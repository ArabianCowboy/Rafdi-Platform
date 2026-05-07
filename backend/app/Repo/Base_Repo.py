from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional
from sqlalchemy.orm import Session

T = TypeVar("T")


class BaseRepo(ABC, Generic[T]):

    def __init__(self, db: Session):
        self.db = db

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[T]:
        pass

    @abstractmethod
    def get_all(self) -> list[T]:
        pass

    @abstractmethod
    def add(self, obj) -> T:
        pass

    @abstractmethod
    def update(self, id: int, obj) -> Optional[T]:
        pass

    @abstractmethod
    def delete(self, id: int) -> None:
        pass
