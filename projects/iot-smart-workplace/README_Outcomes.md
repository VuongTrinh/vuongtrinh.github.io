The solution architecture for this IoT and ML-driven multi-tenant system was guided by the following design principles and goals, each realized through careful service selection, modular design, and operational strategies:

## **Scalability**

- **Multi-Tenant Edge-to-Cloud** architecture supports onboarding of multiple independent tenants, each with isolated telemetry streams and provisioning via **Azure IoT Hub + DPS**.
- **Delta Lake** and **Azure Data Explorer (ADX)** enable horizontal scaling for both historical analytics and real-time querying.
- **Azure Databricks** processes high-velocity sensor data using **structured streaming**, allowing scale-out transformation and machine learning pipelines.

## **Security and Isolation**

- Each tenant is provisioned securely using **Azure DPS** and device-specific **X.509 certificates**.
- **Row-Level Security (RLS)** is enforced at the Delta and ADX layers to ensure data segregation across tenants.
- **Azure IoT Edge** modules enable secure uplink communication with offline buffering at the **LoRaWAN Gateway**.

## **Intelligent Insights**

- **Per-tenant XGBoost models** dynamically infer occupancy using **Pandas UDFs**, allowing runtime selection by `tenant_id`.
- A **global LSTM model**, trained on cross-tenant temporal trends, improves generalized predictions and anomaly detection.
- Forecasting and utilization reports are delivered through APIs backed by **Azure Functions**, enabling integration with tenant dashboards.

## **MLOps Excellence**

- All models and pipelines are tracked using **MLflow** within **Databricks**.
- Model lifecycle—from experimentation to deployment—is managed via **Model Registry** and **Databricks Workflows**.
- Real-time and batch scoring results are stored in **Delta Lake** and **ADX**, and exposed through serverless APIs.

## **Modularity and Extensibility**

- Each architectural layer (edge, ingestion, processing, ML, API) is **loosely coupled** to allow independent upgrades and module replacements.
- **Serverless APIs** abstract internal services, supporting use cases such as space optimization, anomaly alerts, and real-time dashboards.
- The system is adaptable to other IoT scenarios, including energy metering, environmental monitoring, and predictive maintenance.
