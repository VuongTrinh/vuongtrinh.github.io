## Azure Application Services
- **Azure App Service**: Hosts shared and dedicated tenant applications with auto-scale enabled for high availability.
- **Deployment Slots**: Used for zero-downtime deployments and staged rollouts.
- **App Configuration**: Centralized feature flag and configuration management for all tenants.
- **Private Endpoints**: App Services connected to Azure VNet for secure internal API access.

## Azure Networking & Ingress
- **Azure Application Gateway (WAF SKU)**: Entry point for all HTTP traffic with:
  - Host-based and path-based routing
  - SSL termination and certificate management
  - Built-in Web Application Firewall (WAF)
- **Azure DNS**: Supports BYOD domains and internal DNS zones.
- **Azure Front Door (Planned)**: Future roadmap for global routing and performance optimization.

## Azure Identity & Security
- **Azure AD B2C**: Customer identity and access management (CIAM) with support for social and local accounts.
- **Azure Key Vault**: Stores app secrets, connection strings, and SSL certificates.
- **Managed Identity**: App Services use system-assigned identities to securely access Azure resources.

## Azure Data Platform
- **Azure SQL Database**:
  - Shared-database tenants use **Row-Level Security (RLS)** enforced via `SESSION_CONTEXT()` in EF Core
  - Growth and Enterprise tenants can opt for dedicated databases
- **Elastic Pools**: Used for cost-optimized scaling and per-tenant resource isolation
- **Query Store**: Enables per-tenant usage metering and analytics for billing
- **Azure Cache for Redis**:
  - Caches tenant routing/catalog metadata
  - Acts as a session state provider for high-throughput scenarios

## Azure Storage & Assets
- **Azure Blob Storage**:
  - Used for media uploads (product images, banners)
  - Organized per tenant with access scoped via Shared Access Signatures (SAS)
- **Azure Content Delivery Network (CDN)**: Delivers static assets with low latency.

## Observability & Monitoring
- **Azure Application Insights**:
  - Distributed tracing, performance metrics, custom events enriched with tenant context
  - Live Metrics Stream used during incident response
- **Log Analytics & Azure Monitor**:
  - Aggregates logs across services
  - Custom KQL dashboards for per-tenant telemetry and health
- **Azure Advisor & Cost Management**:
  - Used to monitor performance bottlenecks and optimize spend per tier

## Azure DevOps & Automation
- **Azure DevOps Pipelines**:
  - CI/CD for all services with Bicep-based IaC
  - Secrets integrated via Key Vault task binding
- **Container Registries (Planned)**:
  - Investigating Azure Container Registry and App Service for Containers as a future-proofing strategy
