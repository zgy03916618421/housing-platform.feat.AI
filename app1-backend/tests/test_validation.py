# 服务端校验测试：镜像 Task 1 的 7 字段约束在本服务边界生效，且错误为统一格式
import pytest

from tests.conftest import SAMPLE_FEATURES


def _post(client, **overrides):
    payload = {**SAMPLE_FEATURES, **overrides}
    return client.post("/api/estimates", json=[payload])


@pytest.mark.parametrize(
    ("override", "field"),
    [
        ({"square_footage": 0}, "square_footage"),     # 必须 > 0
        ({"bedrooms": 0}, "bedrooms"),                 # 必须 ≥ 1
        ({"bedrooms": 21}, "bedrooms"),                # 必须 ≤ 20
        ({"bathrooms": 0.4}, "bathrooms"),             # 必须 ≥ 0.5
        ({"year_built": 1799}, "year_built"),          # 必须 ≥ 1800
        ({"year_built": 2100}, "year_built"),          # 必须 ≤ 当前年份
        ({"lot_size": -1}, "lot_size"),                # 必须 > 0
        ({"distance_to_city_center": -0.1}, "distance_to_city_center"),  # 必须 ≥ 0
        ({"school_rating": 10.5}, "school_rating"),    # 必须 ≤ 10
    ],
)
def test_invalid_field_rejected_with_unified_error(client, override, field):
    resp = _post(client, **override)
    assert resp.status_code == 422
    error = resp.json()["error"]
    assert error["code"] == "VALIDATION_ERROR"
    # details 中指出了出错字段与原因
    assert any(d["field"] and d["field"].endswith(field) for d in error["details"])


def test_missing_field_rejected(client):
    payload = {k: v for k, v in SAMPLE_FEATURES.items() if k != "bedrooms"}
    resp = client.post("/api/estimates", json=[payload])
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


def test_empty_batch_rejected(client):
    resp = client.post("/api/estimates", json=[])
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"
