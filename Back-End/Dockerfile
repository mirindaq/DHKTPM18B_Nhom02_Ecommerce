FROM maven:3.9.9-amazoncorretto-21-al2023 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests

FROM amazoncorretto:21-al2023
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads
RUN mkdir -p /app/logs

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]