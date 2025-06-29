The architecture implements an end-to-end feedback-to-recommendation lifecycle tailored for multi-tenant e-commerce platforms.

## High-Level Flow

1. **User Interaction**
   - Front-end app captures behavior events (view, cart, purchase,...)
   - Events are POSTed via Azure Function with SAS token validation

2. **Real-Time Ingestion**
   - Azure Event Hub collects events across all opted-in tenants (round-robin partitioning)
   - Azure Stream Analytics consumes Event Hub, applies event weights, and writes to ADLS in tenant-specific folders

3. **Data Lake Storage (ADLS)**
   - Events stored in partitioned Parquet files by tenant → `adls://<container>/feedback/tenantA/{yyyy}/{MM}/{dd}/...`
     
4. **Model Training (Azure Synapse + Azure ML)**
   - Synapse Spark reads data from ADLS
   - For each tenant:
     - Launches Azure ML training job (ALS-based)
     - Evaluates model; stores latent vectors (userFactors/itemFactors) in Azure Table Storage

## Supporting Tools

- **Azure Key Vault**: Protects SAS signing secrets
- **Managed Identity**: Used for secure access between services
- **Azure Automation Runbook**: Rotates secrets and triggers retraining workflows

## Scalability & Isolation

| Layer           | Multi-Tenant Strategy                                 |
| --------------- | ----------------------------------------------------- |
| Event Ingestion | Shared Event Hub, tenant ID in payload                |
| Data Lake       | Tenant folder partitioning                            |
| Model Training  | Per-tenant ALS models via parallel ML jobs            |
| Redis Cache     | Namespaced keys per tenant                            |
| Vector Storage  | SQL Elastic Pool (1 DB per tenant or shared with RLS) |

## Security

- SAS token lifecycle managed with Azure Key Vault and TTL enforcement
- All services use **Managed Identity** with RBAC
- Data movement across services is encrypted (HTTPS/SSL)
