## Key Features

- **Private Link Integration**: Tenants connect privately without traversing the public internet.
- **Multi-Tenant API Gateway**: Azure API Management securely brokers traffic to tenant-isolated services.
- **RBAC and AAD Integration**: Supports enterprise identity via Azure Active Directory and per-tenant RBAC.
- **Tenant Onboarding Automation**: Deploy new tenant services via automated ARM/Bicep pipelines.
- **Data Isolation**: Enforced through tenant-level Cosmos DB for PostgreSQL logical isolation.
- **Secure by Design**: End-to-end TLS, mTLS between services, and zero-trust boundaries.
