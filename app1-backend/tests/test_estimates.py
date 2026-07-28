# 估算端点测试：单条、批量、分页、详情
import uuid

from tests.conftest import SAMPLE_FEATURES


def test_create_single_estimate(client):
    resp = client.post("/api/estimates", json=[SAMPLE_FEATURES])
    assert resp.status_code == 201
    body = resp.json()
    assert len(body["estimates"]) == 1
    record = body["estimates"][0]
    assert record["prediction"] == 100000.0 + 1550  # stub 的预测逻辑
    assert record["features"] == SAMPLE_FEATURES
    assert record["batch_id"] == body["batch_id"]
    assert uuid.UUID(record["id"])  # 合法 UUID


def test_create_batch_estimates_share_batch_id(client):
    other = {**SAMPLE_FEATURES, "square_footage": 2000}
    resp = client.post("/api/estimates", json=[SAMPLE_FEATURES, other])
    assert resp.status_code == 201
    body = resp.json()
    assert len(body["estimates"]) == 2
    # 同一批请求共享 batch_id（对比视图分组的依据）
    assert all(e["batch_id"] == body["batch_id"] for e in body["estimates"])
    assert body["estimates"][1]["prediction"] == 100000.0 + 2000


def test_list_estimates_pagination(client):
    client.post("/api/estimates", json=[SAMPLE_FEATURES] * 3)

    page1 = client.get("/api/estimates", params={"limit": 2, "offset": 0})
    assert page1.status_code == 200
    body1 = page1.json()
    assert body1["total"] == 3
    assert len(body1["items"]) == 2

    page2 = client.get("/api/estimates", params={"limit": 2, "offset": 2})
    body2 = page2.json()
    assert body2["total"] == 3
    assert len(body2["items"]) == 1


def test_list_estimates_invalid_pagination_params(client):
    resp = client.get("/api/estimates", params={"limit": 0})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


def test_get_estimate_by_id(client):
    created = client.post("/api/estimates", json=[SAMPLE_FEATURES]).json()
    estimate_id = created["estimates"][0]["id"]

    resp = client.get(f"/api/estimates/{estimate_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == estimate_id


def test_get_estimate_not_found(client):
    resp = client.get(f"/api/estimates/{uuid.uuid4()}")
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "NOT_FOUND"
