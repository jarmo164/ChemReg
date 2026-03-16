FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

COPY . .
RUN chmod +x gradlew
RUN ./gradlew build -x test
RUN cp /app/build/libs/*SNAPSHOT.jar /app/app.jar || cp /app/build/libs/*.jar /app/app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
