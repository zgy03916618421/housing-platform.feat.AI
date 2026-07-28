# 请求 schema：镜像 Task 1 ML 容器的 7 字段约束（以 Task 1 代码为准）
from datetime import UTC, datetime
from typing import Annotated

from pydantic import BaseModel, Field

CURRENT_YEAR = datetime.now(UTC).year


class PropertyFeatures(BaseModel):
    """单个属性的全部输入特征（与 ML 容器 /predict 契约中的对象同构）。"""

    square_footage: int = Field(
        gt=0,
        description="House area in square feet",
        examples=[1550],
    )
    bedrooms: int = Field(
        ge=1,
        le=20,
        description="Number of bedrooms",
        examples=[3],
    )
    bathrooms: float = Field(
        ge=0.5,
        le=20,
        description="Number of bathrooms",
        examples=[2.5],
    )
    year_built: int = Field(
        ge=1800,
        le=CURRENT_YEAR,
        description="Year the house was built",
        examples=[1997],
    )
    lot_size: int = Field(
        gt=0,
        description="Lot size in square feet",
        examples=[6800],
    )
    distance_to_city_center: float = Field(
        ge=0,
        description="Distance to city center (miles)",
        examples=[4.1],
    )
    school_rating: float = Field(
        ge=0,
        le=10,
        description="Nearby school rating",
        examples=[7.6],
    )


# 数组契约：单条估算 = 1 元素数组，对比视图 = N 元素数组（与 ML 容器 /predict 同构）
EstimateBatchParam = Annotated[list[PropertyFeatures], Field(min_length=1)]
