## Client Layer (Tenant Access)  
Serves as the unified, secure entry point for tenant traffic, accommodating both B2B (private) and B2C (public) access models.
- **B2B Customers:**  
  - Connect from isolated Azure subscriptions and VNets  
  - Use **Azure Private Link Endpoint (PLE)** for secure, private network connectivity  
- **B2C Customers:**  
  - Access the platform via **Azure Application Gateway** with Web Application Firewall (WAF) for public internet access  

## Network Ingress & Connectivity Layer  
Securely terminates inbound traffic and routes it to internal workloads while maintaining network isolation.
- **Azure Private Link Service (PLS):**  
  - Exposes Azure API Management (APIM) privately to B2B customers  
  - Ensures traffic remains within Microsoft’s secure backbone network  
- **Azure Application Gateway (WAF):**  
  - Handles TLS termination for public-facing clients  
  - Routes requests securely to APIM via an internal load balancer  

## API Gateway Layer (Azure API Management)  
Acts as the central API control plane with multi-tenant awareness, enforcing security policies and routing logic.
- **APIM deployed in Internal VNet Mode:**  
  - Not publicly accessible; accepts traffic only from Application Gateway or Private Link Service  
- **Tenant Resolution Policies:**  
  - **B2C:** Extract tenant ID from JWT tokens  
  - **B2B:** Identify tenant based on source IP or Private Endpoint context  
- **Dynamic Tenant-Based Routing:** Routes each request to the appropriate backend service based on resolved tenant identity 

## Application Layer (Microservices on AKS)  
Hosts tenant-aware business logic and microservices within a secure, isolated environment.
- **Azure Kubernetes Service (AKS):**  
  - Deploys one microservice per namespace, isolating tenants logically  
  - Implements Zero Trust principles with service mesh for mTLS, traffic policies, and observability  
  - Uses Azure Workload Identity for secure Azure resource access  
- **Tenant Context Propagation:**  
  - Microservices receive resolved tenant ID from APIM and apply tenant-specific logic 

## Data Layer (Tenant-Isolated Storage)  
Provides scalable, secure, and strongly isolated data storage per tenant.
- **Azure Cosmos DB for PostgreSQL (Flexible Server):**  
  - Single database instance with shared tables that include a `tenant_id` column  
  - Enforces strict tenant isolation with **Row-Level Security (RLS)**  
  - Uses tenant-aware sharding and data colocation for optimized performance  
  - Integrated into VNet and accessible only from AKS services  

## Management & Operations Layer  
Enables secure, automated lifecycle management, monitoring, and tenant provisioning.
- **Azure DevOps:**  
  - Infrastructure as Code (IaC) for environment setup and APIM configuration via APIOps  
- **Azure Monitor & Log Analytics:**  
  - Centralized observability for APIM, AKS, networking, and database performance  
- **Azure Key Vault:**  
  - Securely stores secrets, API keys, and certificates  
- **Azure Service Catalog & Managed Applications:**  
  - Automates tenant provisioning including PLE deployments and configuration  
- **Private DNS & Domain Management:**  
  - Ensures reliable name resolution across virtual network scopes  

