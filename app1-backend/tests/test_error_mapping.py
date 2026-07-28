# ML 容器集成错误映射测试：503 不可达 / 502 上游错误
from tests.conftest import (
    SAMPLE_FEATURES,
    ModelResponseError,
    ModelUnavailableError,
)


def test_ml_unavailable_maps_to_503(client, stub_client):
    stub_client.predict_error = ModelUnavailableError("ML 模型容器不可达")
    resp = client.post("/api/estimates", json=[SAMPLE_FEATURES])
    assert resp.status_code == 503
    assert resp.json()["error"]["code"] == "MODEL_UNAVAILABLE"


def test_ml_error_response_maps_to_502(client, stub_client):
    stub_client.predict_error = ModelResponseError(500, "Internal Server Error")
    resp = client.post("/api/estimates", json=[SAMPLE_FEATURES])
    assert resp.status_code == 502
    error = resp.json()["error"]
    assert error["code"] == "MODEL_ERROR"
    assert "HTTP 500" in error["message"]


def test_failed_prediction_is_not_persisted(client, stub_client):
    stub_client.predict_error = ModelUnavailableError("ML 模型容器不可达")
    client.post("/api/estimates", json=[SAMPLE_FEATURES])
    listed = client.get("/api/estimates").json()
    assert listed["total"] == 0  # 预测失败不应留下历史记录


def test_model_info_proxy_error_maps_to_502(client, stub_client):
    stub_client.info_error = ModelResponseError(500, "boom")
    resp = client.get("/api/model-info")
    assert resp.status_code == 502
    assert resp.json()["error"]["code"] == "MODEL_ERROR"
