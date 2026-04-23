FROM gradle:8.14-jdk21 AS build
WORKDIR /app

COPY build.gradle settings.gradle ./
COPY src ./src

RUN gradle clean bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/build/libs/*.jar tingeso-1-backend.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/my-spring-boot-app.jar"]