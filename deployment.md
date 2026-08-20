# GCP Deployment Guide

This guide provides the necessary `gcloud` commands to provision the Cloud SQL database and deploy the Card Dispute Portal to Google Cloud Run.

## 1. Set Project and Enable APIs

```bash
# Set your GCP Project
gcloud config set project [YOUR_PROJECT_ID]

# Enable necessary APIs
gcloud services enable run.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com
```

## 2. Provision Cloud SQL (PostgreSQL)

```bash
# Create a PostgreSQL 15 instance
gcloud sql instances create card-dispute-db \
    --database-version=POSTGRES_15 \
    --cpu=1 \
    --memory=3840MB \
    --region=us-central1

# Set the postgres user password
gcloud sql users set-password postgres \
    --instance=card-dispute-db \
    --password=[YOUR_DB_PASSWORD]

# Create the application database
gcloud sql databases create card_dispute \
    --instance=card-dispute-db
```

## 3. Build the Container Image

```bash
# Submit a build to Cloud Build using the multi-stage Dockerfile
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/card-dispute-portal
```

## 4. Deploy to Cloud Run

```bash
# Deploy the image to Cloud Run, connecting it to the Cloud SQL instance
gcloud run deploy card-dispute-portal \
    --image gcr.io/[YOUR_PROJECT_ID]/card-dispute-portal \
    --region us-central1 \
    --allow-unauthenticated \
    --add-cloudsql-instances [YOUR_PROJECT_ID]:us-central1:card-dispute-db \
    --set-env-vars SPRING_DATASOURCE_URL=jdbc:postgresql:///card_dispute?cloudSqlInstance=[YOUR_PROJECT_ID]:us-central1:card-dispute-db&socketFactory=com.google.cloud.sql.postgres.SocketFactory \
    --set-env-vars SPRING_DATASOURCE_USERNAME=postgres \
    --set-env-vars SPRING_DATASOURCE_PASSWORD=[YOUR_DB_PASSWORD]
```
