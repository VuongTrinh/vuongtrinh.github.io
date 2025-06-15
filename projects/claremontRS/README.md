# Multi-Tenant E-Commerce Recommendation System
This project showcases an end-to-end, multi-tenant recommendation system designed for a SaaS-based e-commerce platform. It enables real-time feedback ingestion, personalized recommendations using matrix factorization (ALS), and scalable model training pipelines using Azure-native services.
The system supports thousands of tenants — ranging from startups to large enterprises — with logical data isolation, hybrid cold/warm recommendation strategies, and a transparent feedback loop.

## Key Objectives
- Real-time implicit feedback capture (views, cart, purchase,...)
- Multi-tenant support with partitioned processing
- Scalable ALS model training with Azure ML & Spark
- Hybrid recommendation strategy: ALS for warm-start, Vector Similarity Search for cold-start
- Low-latency recommendation delivery using Redis
- Feedback loop integration via Function App + SAS tokens

## Technologies Used
- **Azure Event Hub** – Ingests user behavior events at scale
- **Azure Stream Analytics** – Applies event weighting and real-time transformation
- **Azure Data Lake Storage (ADLS)** – Stores raw and transformed feedback per tenant
- **Azure Synapse Analytics (Spark Pool)** – Loads data and orchestrates training
- **Azure Machine Learning** – Manages training, evaluation, and model registry
- **Azure Function App** – Issues feedback tokens, stores events, and coordinates model publishing
- **Azure Redis Cache** – Stores latent factors for fast lookup
- **Azure Table Storage** – Tenant-specific storage for user/item vectors
