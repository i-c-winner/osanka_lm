from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.currency import Currency
from app.schemas.currency import CurrencyResponse

router = APIRouter()

DEFAULT_CURRENCY = CurrencyResponse(k=1, currency="UZS")


@router.get("/", response_model=CurrencyResponse)
async def get_currency(currency: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Currency).where(Currency.currency == currency.upper())
    )
    row = result.scalar_one_or_none()
    if not row:
        return DEFAULT_CURRENCY
    return row
