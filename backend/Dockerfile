# Stage 1: Build the Spring Boot app
FROM maven:3.9.4-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first (cacheable layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the JAR
RUN mvn clean package -DskipTests

# Stage 2: Run the app
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/Finylitics-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Environment variable for Spring profile
ENV SPRING_PROFILES_ACTIVE=prod

# Run the app
ENTRYPOINT ["java","-jar","/app/app.jar"]