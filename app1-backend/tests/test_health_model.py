# 健康检查与模型元信息端点测试
def test_health_reports_ml_reachable(client, stub_client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "ml_model_reachable": True}


def test_health_reports_ml_unreachable(client, stub_client):
    stub_client.reachable = False
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "ml_model_reachable": False}


def test_model_info_proxy(client):
    resp = client.get("/api/model-info")
    assert resp.status_code == 200
    body = resp.json()
    assert body["algorithm"] == "LinearRegression"
    assert body["r2_score"] == 0.91
    assert len(body["coefficients"]) == 7
