# ---- Stage 1: Build ----
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Install Maven directly (since .mvn wrapper dir is not present)
RUN apk add --no-cache maven

# Copy pom first (layer caching for dependencies)
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src src
RUN mvn clean package -DskipTests -B

# ---- Stage 2: Run ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Create upload directory
RUN mkdir -p uploads/receipts

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
