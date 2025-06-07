This edge-based video analytics solution delivers the following key outcomes:

- **Low Latency Compliance Enforcement**:  
  Real-time video frame processing and event correlation enables immediate detection of PPE violations (e.g., no mask), ensuring rapid incident response and operational safety.

- **Edge-First AI Processing**:  
  Running YOLOv5 inference on edge-deployed GPUs avoids costly cloud round-trips, supporting fast object detection and privacy-aware processing near the data source.

- **Scalability via Event-Driven Microservices**:  
  Kafka-based pub-sub architecture and partitioned processing allow the system to scale with many camera and sensor inputs while preserving event ordering and responsiveness.

- **Contextual Decision Making**:  
  Enriched event streams fuse object detection with door sensor data, enabling intelligent rule evaluation (e.g., deny entry if mask is missing) and automated actuation (e.g., door control).

- **Unified Observability with OpenTelemetry**:  
  The OpenTelemetry Collector ensures consistent collection of logs, metrics, and traces across microservices, enabling centralized monitoring via Azure Monitor, Prometheus, and Grafana.

- **Resilient Edge Storage & Cloud Sync**:  
  Apache Cassandra and MinIO provide fast local storage for real-time analytics and checkpointing, with asynchronous sync to Azure Data Lake for historical analysis and compliance.

- **Secure, Centralized Management**:  
  Azure Arc provides a unified control plane to manage Kubernetes workloads at the edge, enforce policies, and integrate DevOps practices across distributed environments.
