## Solution Architecture

![Architecture Diagram](architecture.png)

The architecture is built around a hub-spoke network topology:

- **Hub**: Hosts shared services such as Azure API Management, Azure DNS, and Private Link Services.
- **Spokes**: Each tenant has a dedicated spoke with isolated compute and data resources.
- **Ingress**: API calls from tenants enter through APIM, validated with mTLS and routed to tenant-specific services via Private Link.
- **Egress**: Outbound traffic from tenant workloads is controlled via NSGs and route tables.
- **Identity**: Uses Azure AD B2B to federate tenant identities, scoped by tenant ID in JWT claims.

The solution uses Bicep modules to automate provisioning.
