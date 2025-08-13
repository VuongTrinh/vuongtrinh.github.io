## Client Layer (Tenant Access)
Serves as a **secure, unified entry point** for tenant traffic, supporting three customer types: **Internet-based, subscription-based, and on-premises tenants**.

- **Internet-based Tenants:**  
  - Access via **Azure Application Gateway with WAF** for secure public connectivity  

- **Subscription-based Tenants:**  
  - Connect from isolated Azure subscriptions and VNets  
  - Use **Azure Private Link Endpoint (PLE)** for private network access  

- **On-Premises Tenants:**  
  - Access through **hybrid connectivity** (VPN or ExpressRoute) securely bridging their network to Azure  

---

## Network Ingress & Connectivity Layer
Terminates inbound traffic securely and routes it to internal workloads while maintaining **network isolation**, leveraging a **hub-and-spoke architecture**.

- **Hub Network:**  
  - Centralized point for shared services such as APIM, Application Gateway, and monitoring  

- **Spoke Networks:**  
  - VNet connected to the hub via **VNet peering**  
  - Maintains network isolation and secure routing  

- **Azure Private Link Service (PLS):**  
  - Exposes **APIM privately** for subscription-based and on-premises tenants  
  - Ensures traffic stays within Microsoft’s backbone  

- **Azure Application Gateway (WAF):**  
  - Handles TLS termination for Internet-based tenants  
  - Routes requests securely to APIM through an **internal load balancer**  

---

## API Gateway Layer (Azure API Management)
Acts as the **central API control plane**, enforcing security policies, tenant awareness, and dynamic routing.

- **Internal VNet Deployment:** APIM is not publicly accessible; accepts traffic only from Application Gateway or PLS  
- **Tenant Resolution Policies:**  
  - Internet-based: Extract tenant ID from JWT tokens  
  - Subscription/on-premises: Identify tenant from source IP or Private Endpoint context  
- **Dynamic Routing:** Directs requests to the appropriate microservice based on tenant identity  

---

## Application Layer (Microservices on AKS)
Hosts **tenant-aware business logic** in a secure, isolated environment.

- **Azure Kubernetes Service (AKS):**  
  - Microservices deployed per namespace for tenant isolation  
  - Implements **Zero Trust** with service mesh (mTLS, traffic policies, observability)  
  - Uses **Azure Workload Identity** for secure access to Azure resources  

- **Tenant Context Propagation:** Microservices apply tenant-specific logic from APIM-resolved tenant IDs  

---

## Data Layer (Tenant-Isolated Storage)
Provides **scalable, secure, and isolated storage** per tenant.

- **Azure Cosmos DB for PostgreSQL (Flexible Server):**  
  - Shared tables with `tenant_id` column, enforced with **Row-Level Security (RLS)**  
  - Tenant-aware sharding and data colocation for performance  
  - VNet-integrated and accessible only from AKS  

---

## Management & Operations Layer
Enables **secure, automated lifecycle management, monitoring, and tenant provisioning**.

- **Azure DevOps & APIOps:** IaC for environment setup and APIM configuration  
- **Azure Monitor & Log Analytics:** Centralized observability for APIs, microservices, networking, and databases  
- **Azure Key Vault:** Secure storage for secrets, API keys, and certificates  
- **Azure Service Catalog & Managed Applications:** Automates tenant provisioning, including PLE deployments  
- **Private DNS & Domain Management:** Ensures reliable resolution across VNets  
