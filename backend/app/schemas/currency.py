from pydantic import BaseModel


class CurrencyResponse(BaseModel):
    k:        int
    currency: str

    class Config:
        from_attributes = True
