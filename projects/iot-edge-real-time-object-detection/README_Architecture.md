# Solution Architecture
This solution implements a real-time, event-driven video stream processing system at the edge using microservices deployed on an Azure Arc-enabled Kubernetes cluster. It is designed for low-latency, scalable AI-powered video analytics (e.g., mask detection), deployed at the edge to ensure workplace safety in industrial environments by monitoring mask compliance, detecting violations in real time, and triggering immediate safety actions."

## Device Layer (Video + Sensor Sources)
- **IP Cameras** stream live video over RTSP.
- **Door Sensors** emit telemetry over MQTT.

## Ingestion & Messaging Layer (Event-Driven Backbone)
- Frame Segmenter Service: captures RTSP video streams and segments them into individual frames or frame batches, publishing them to the `video.frames` Kafka topic for downstream AI processing.
- Door Telemetry Service: collects telemetry from door sensors and publishes events to `sensors.telemetry` Kafka topics for real-time monitoring and processing.
- **Kafka** using a **publish-subscribe model**, supports many cameras and doors at scale, Kafka topics are **partitioned** to handle parallel event streams efficiently.

## Real-Time Processing Layer (Spark + AI Inference)
Event-driven microservices process streaming data in real time:
- **Apache Spark Structured Streaming**:
  - Consumes data from `video.frames` and `doors.telemetry` topics.
  - Joins and enriches video frames with contextual sensor and door telemetry.
  - Stateful per-partition processing enables correlation of events per device.
- **Real-time Object Detection Service**:
  - GPU-enabled microservice running YOLOv5 models on video frames.
  - Produces detection results (objects, bounding boxes, confidence scores) sent to `inference.results` Kafka topic.
- **Event Enricher**:
  - Correlates object detection results with sensor metadata.
  - Assigns classifications, tags, and contextual information for downstream processing.
- **Alert Service with Rule Engine**:
  - Subscribes to `inference.results` and `doors.telemetry`.
  - Evaluates predefined rules (e.g., PPE violations(mask detection), unauthorized access).
  - Emits alert events to the `alerts` topic when rules are triggered.
- **Door Control Service**:
  - Listens to alerts and contextual data.
  - Sends commands (open/close) to doors via the `door.commands` Kafka topic or IoT Hub.
  - Implements logic like "close door if no mask detected; open door only for mask-wearing individuals."
- **Real-Time Dashboard Service**:
  - Subscribes to alert and inference streams.
  - Visualizes key events, metrics, and system status for operators.
  - Supports live monitoring and incident response.

## Persistence Layer (Edge DB & Archival)
- **Apache Cassandra** (deployed in edge cluster):
  - Stores structured raw and enriched data (inference events, raw telemetry, etc.).
  - Enables fast time-series queries and local analytics.
- **MinIO** (edge cluster):
  - Object storage for large data (video frames, backups).
  - Stores Spark streaming checkpoints.
  - Syncs asynchronously to cloud and manages local storage cleanup.
- **Cloud Sync**:
  - Enriched data is synced asynchronously to **Azure Data Lake Storage Gen2** for:
    - Historical analytics
    - Model retraining
    - Compliance and auditing

## Control Plane & Orchestration
- **Kubernetes (edge-located k3s clusters)**:
  - Hosts microservices as independent containers.
  - Provides autoscaling, resource isolation, and rolling updates.

- **Azure Arc-enabled Kubernetes**:
  - Centralized policy management, monitoring, and CI/CD pipelines for the edge Kubernetes cluster.

- **Monitoring Stack**:
  - **OpenTelemetry Collector** serves as a telemetry pipeline that standardizes metric, log, and trace collection across services before forwarding data to **Azure Monitor** and Prometheus-compatible backends.
