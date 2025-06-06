This solution implements a full MLOps pipeline using **Azure Machine Learning** to retrain, evaluate, and deploy updated YOLO-based models for mask detection at the edge. The pipeline is tightly integrated with the edge architecture and supports continuous model improvement with robust monitoring and rollback.

## MLOps Architecture Components

| Component                            | Role                                          |
| --------------------------------     | --------------------------------------------- |
| **Azure ML Pipelines**               | Automate retraining steps                     |
| **Model Registry**                   | Track versions and metadata                   |
| **Azure DevOps**                     | CI/CD for retraining pipeline                 |
| **Azure Container Registry**         | Store YOLO inference containers               |
| **Arc-enabled Kubernetes**           | Hosts edge inference containers               |
| **Azure Monitor**                    | Monitor inference performance and model drift |
| **Azure Data Lake Storage Gen2**     | Store datasets, outputs, and logs             |

## End-to-End pipeline

### 1. Data Collection from Edge
- Inference results (`inference.results` Kafka topic) and raw video frames are stored in:
  - **Cassandra** (structured, hot-store)
  - **MinIO** (for video frames, labels, and backups)
- At scheduled intervals or via event-driven pipelines, data from both Cassandra and MinIO is synchronized and ingested into **Azure Data Lake Storage Gen2**

### 2. Azure ML Training Pipeline
The pipeline is orchestrated in **Azure Machine Learning** and includes:
| Step                       | Description                                        |
| ----------------------     | -------------------------------------------------- |
| **Preprocessing**          | Convert labeled data into YOLOv5-compatible format |
| **Training**               | Run YOLOv5 training using updated data             |
| **Evaluation**             | Compute mAP, precision, recall, and loss metrics   |
| **Model Registration**     | Register trained model in Azure ML Model Registry  |
| **Approval Gate**          | Approvement before deployment                      |

Retraining Triggers
| Trigger Type            | Example                                    |
| -------------------     | ------------------------------------------ |
| **Scheduled**           | Weekly retraining jobs                     |
| **Drift Detection**     | Significant drop in accuracy or confidence |
| **Data Thresholds**     | New labeled data > N examples              |
| **Manual**              | Human-in-the-loop retraining trigger       |

### 3. Model Deployment to Edge
| Stage                      | Tool/Service                                                                               |
| ----------------------     | ------------------------------------------------------------------------------------------ |
| **Packaging**              | Build inference container using latest YOLO model                                          |
| **Container Registry**     | Push image to Azure Container Registry (ACR)                                               |
| **Edge Deployment**        | Use **Azure Arc** + **GitOps** or Azure ML Edge deployments to roll out to remote clusters |
| **Canary Rollout**         | Deploy to test pods/namespaces before cluster-wide rollout                                 |

## 4. Monitoring the Model Lifecycle
- **Training Metrics**: Tracked in Azure ML Experiments
- **Deployment Health**: Monitored via Azure Monitor (Arc)
- **Inference Telemetry**: Logged in Cassandra + sent to Azure Monitor
- **Drift Detection**: Triggered by model performance drops or data anomalies
