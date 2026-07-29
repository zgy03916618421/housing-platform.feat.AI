# ── 构建层：Maven + JDK 21 ──
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# 先拷贝 pom 离线依赖（利用 Docker Layer Cache）
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# 再拷贝源码构建（测试在 CI/本地跑，镜像构建跳过）
COPY src ./src
RUN mvn -q -B package -DskipTests

# ── 运行层：仅 JRE ──
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/app2-backend-0.1.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
