# Layered Architecture: Azure Multi-Tenant SaaS Solution

---

## 1. Client Layer (Tenant Access)

**Purpose**: Acts as the unified entry point for tenant traffic — securely supporting both B2B (private) and B2C (public) access patterns.

- **B2B Customers**
  - Connect from isolated Azure subscriptions and VNets
  - Use **Azure Private Link Endpoint (PLE)** to establish secure, private connectivity
- **B2C Customers**
  - Access platform via **Azure Application Gateway** with **WAF**

**Request Flow**:  
Tenant request → Ingress channel (Private Link or App Gateway)

## 2. Network Ingress & Connectivity Layer

**Purpose**: Securely terminates inbound traffic and connects it to internal workloads.

- **Azure Private Link Service (PLS)**
  - Exposes APIM to B2B customers over Private Link
  - Ensures traffic stays within Microsoft’s backbone
- **Azure Application Gateway (WAF)**
  - Handles TLS termination for public clients
  - Routes requests to APIM via internal IP

**Request Flow**:  
Ingress channel → **Azure API Management (APIM)** (via Internal Load Balancer)

## 3. API Gateway Layer (Azure API Management)

**Purpose**: Central control plane for all APIs with full multi-tenant awareness and policy enforcement.

- **Azure API Management (APIM)** in **Internal VNet Mode**
  - Not publicly accessible; receives traffic only from App Gateway or PLS
- **Custom Tenant Resolution Policy**
  - **B2C**: Extracts `tenant_id` from JWT token
  - **B2B**: Identifies tenant from source IP or Private Endpoint context
- **Tenant-Based Routing**
  - APIM dynamically routes requests based on resolved tenant context

**Request Flow**:  
APIM → resolves tenant context → forwards request to backend (AKS)

## 4. Application Layer (Microservices on AKS)

**Purpose**: Hosts the multi-tenant business logic and tenant-aware services.

- **Azure Kubernetes Service (AKS)**
  - Microservices deployed in **separate namespaces**.
  - Implements **Zero Trust Architecture**:
    - **Service Mesh** (mTLS, traffic policies, observability)
    - **Azure Workload Identity** for secure Azure resource access
- **Tenant Context Propagation**
  - Microservices receive resolved tenant ID from APIM
  - Handle logic accordingly per tenant

**Request Flow**:  
APIM → AKS Ingress or Service → Microservice → Access data

## 5. Data Layer (Tenant-Isolated Storage)

**Purpose**: Provides scalable, secure data storage with strong tenant isolation.

- **Azure Cosmos DB for PostgreSQL (Flexible Server)**
  - Single database with **shared tables** containing `tenant_id`
  - **Row-Level Security (RLS)** ensures strict data isolation
  - **Tenant-aware sharding and colocation** improve performance
  - **Integrated into VNet**, accessible only from AKS

**Request Flow**:  
AKS → SQL query with tenant context → RLS enforces visibility

## 6. Management & Operations Layer

**Purpose**: Enables secure lifecycle management, automation, and observability.

- **Azure DevOps**
  - Infrastructure as Code (IaC) and APIM configuration via APIOps
- **Azure Monitor & Log Analytics**
  - Centralized observability for APIM, AKS, networking, and databases
- **Azure Key Vault**
  - Secure storage for secrets, API keys, and certificates
- **Azure Service Catalog + Managed Applications**
  - Automated tenant provisioning (e.g., PLE deployment, tenant config)
- **Private DNS & Domain Management**
  - Ensures correct name resolution across VNet scopes
