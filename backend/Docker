# Use official Java runtime as base image
FROM eclipse-temurin:21-jdk-alpine

# Set working directory in container
WORKDIR /app

# Copy the Maven build JAR into the container
COPY target/Finylitics-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot app will run on
EXPOSE 8080

# Environment variables (optional defaults)
ENV SPRING_PROFILES_ACTIVE=prod

# Run the Spring Boot JAR
ENTRYPOINT ["java","-jar","/app/app.jar"]