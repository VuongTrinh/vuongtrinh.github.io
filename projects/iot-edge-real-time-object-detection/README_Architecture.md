## IoT Edge Computing

- Deploys containerized workloads on **edge-located Kubernetes clusters** managed via **Azure Arc-enabled Kubernetes**.
- Enables centralized policy enforcement, GitOps-based deployment, and health monitoring from the Azure cloud.
- Supports low-latency processing by running inference and microservices close to data sources.

---

## Big Data Stream Processing

- Uses **Apache Kafka** for high-throughput ingestion of video stream metadata and events at the edge.
- Processes streaming data in real-time with **Apache Spark Structured Streaming** deployed on Kubernetes clusters.
- Persists analytics results and telemetry data in **Cassandra** for fast, scalable access.

---

## Real-time AI Object Detection at the Edge

- Runs optimized deep learning model **YOLOv5** on GPU-enabled edge clusters for immediate inference.
- Integrates inference outputs with event-driven microservices to trigger downstream workflows.

---

## Hybrid Edge-to-Cloud Architecture with Offline Resiliency

- Employs **MinIO** as object store at the edge to buffer data during connectivity loss.
- Synchronizes buffered data and telemetry with cloud storage once network access is restored.
- Ensures continuous operation in disconnected or intermittently connected environments.

---

## GitOps

- Packages each service, including AI inference and messaging brokers, as containers for consistency and portability.
- Uses **Flux** to automate deployments and version control across distributed edge sites.
- Supports incremental updates and rollbacks for high availability and resilience.

---

## MLOps 

- Leverages **Azure Machine Learning** for centralized model training, validation, versioning, and registry.
- Deploys models seamlessly to edge clusters via **Azure Arc**, maintaining consistency across locations.
- Monitors model performance and facilitates retraining workflows to ensure ongoing accuracy.
