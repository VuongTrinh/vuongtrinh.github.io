## Edge Layer
- **LoRaWAN Gateway with Raspberry Pi 3** running **Azure IoT Edge Runtime**
- **Azure IoT Edge modules** handle LoRaWAN message decoding, metadata enrichment, and secure upstream communication via MQTT to **Azure IoT Hub**.
- The edge stack supports local datastore, local processing, offline buffering, and retry logic to ensure reliable operation even during intermittent cloud connectivity.

## Cloud Ingestion Layer
- **Azure IoT Hub (Multi-Region)** serves as the secure and scalable cloud gateway for all IoT devices. IoT Hub scales horizontally by adding **Throughput Units**, each allowing ingress of up to 1 MB/sec or 1000 messages/sec. This dynamic scaling supports fluctuating IoT workloads across tenants while maintaining SLA-backed performance and reliability.
- Secure device-to-cloud communication: Devices are automatically provisioned using **Azure Device Provisioning Service (DPS)**, which assigns each tenant's devices to the nearest IoT Hub instance. DPS also enforces **mutual TLS (mTLS)** using **X.509 certificates** for secure, zero-touch onboarding. All telemetry is sent using per-device identity with certificate-based authentication, ensuring trusted and encrypted device-to-cloud communication.
- IoT Hub uses routing rules to forward telemetry to a centralized **Azure Event Hub**, which acts as a **shared message broker** for all tenants. This decouples the ingestion layer from downstream processing and allows Databricks to consume multi-tenant data streams in a scalable and unified way.

## Data Processing Layer
- **Azure Databricks Structured Streaming** ingests real-time telemetry routed from Azure Event Hub. The streaming jobs follows the **Lambda Architecture** paradigm with **Batch Layer** process and clean raw sensor data then stored in **Delta Lake** and **Speed Layer** streamed processed data to Azure Event Hub, which feeds serving layer.
- Implements scalable feature engineering and transformation logic on streaming and batch data, preparing datasets for downstream hybrid Machine Learning pipeline: A global **LSTM Model** learns general temporal patterns from aggregated multi-tenant time-series data, capturing occupant behavior and environmental trends across all tenants. Tenant-Specific **XGBoost Models** are trained on enriched tenant-level data to capture local variations and improve prediction accuracy with personalized adjustments. Tenants with insufficient historical data for reliable local training automatically default to predictions from the global LSTM model, ensuring a smooth onboarding experience.

## Data Storage Layer
- **Azure Data Lake Storage Gen2 (ADLS)** acts as the unified storage layer for all tenants' telemetry and processed data using **Delta Lake**, leveraged **Medallion Architecture (Bronze → Silver → Gold)** to structure data processing in incremental refinement layers. All tenant data is ingested into a single **Delta table**, partitioned by `tenant_id` and optimized with **Z-ordering** by `tenant_id`, `timestamp`, and `device_id` to enable fast tenant-scoped filtering such as “last x minutes” queries in dashboards.
- **Azure Data Explorer (ADX)** serves as the real-time analytics and serving layer, optimized for high-performance, low-latency queries enabling responsive dashboards, alerting, and interactive analytics across tenants, implemented **data retention policies** that automatically purge or archive older data, ensuring the speed layer holds only recent, relevant data.
- This separation aligns with a **Lambda Architecture** approach, balancing real-time insights with comprehensive historical analysis.

### Data Serving Layer
- A shared frontend application is hosted on **Azure App Service** behind **Azure Application Gateway**
- A shared orchestrator **Azure Function App** serves as the API gateway and orchestrator, receives frontend requests and routes them to the correct tenant’s **Azure Durable Entity Functions**.
- Each tenant is represented by two durable entity functions: one entity handles **real-time queries** against **Azure Data Explorer (ADX)**, the other one handles reporting and analytics.
