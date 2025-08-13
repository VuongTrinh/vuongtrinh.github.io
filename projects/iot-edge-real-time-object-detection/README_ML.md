# Workplace Compliance AI Edge Solution
## 1. Project Overview
**Objective:**  
Develop a low-latency AI solution to monitor workplace compliance behaviors (e.g., mask wearing) using real-time video streams at the edge. The system must support:
- Edge-based inference for latency-sensitive detection
- Centralized model training and evaluation
- Multi-camera, multi-tenant deployment
- Secure, scalable Azure Arc-based deployment

## 2. Problem Formulation
### Task Type
- **Classification (Binary/Multiclass):** Mask vs No-Mask
- **Object Detection (YOLO):** Localize people and detect compliance in real-time
### Target Output
- Bounding boxes with class labels (e.g., `person`, `mask`, `no-mask`)
- Confidence scores

## 3. Data Preparation
### 🛠️ Preprocessing
- Frame extraction (1 FPS)
- Image resizing to 640×640
- Label annotation in YOLO format
### 📈 Augmentations
- Random flip, scale, crop, color jitter, mosaic (YOLO-specific)
- Domain randomization for synthetic data

## 4. Hyperparameter Tuning
### General Hyperparameters

| Hyperparameter       | Purpose / Effect                                         |
| -------------------- | -------------------------------------------------------- |
| Learning rate        | Step size for gradient descent; critical for convergence |
| Optimizer            | SGD, Adam — controls weight updates                      |
| Batch size           | Number of images per gradient update                     |
| Epochs               | Number of training passes over the dataset               |
| L1/L2 regularization | Prevents overfitting; controls weight growth             |
| Dropout rate         | Reduces overfitting by randomly zeroing activations      |

### YOLO-Specific Hyperparameters

| Hyperparameter           | Purpose / Effect                                              |
| ------------------------ | ------------------------------------------------------------- |
| Input image size         | Resolution affects small object detection                     |
| Anchors per scale        | Number of predefined boxes per grid cell                      |
| Anchor dimensions        | Width & height priors for each anchor; affects box regression |
| Depth / width multiplier | Scale backbone & head size (YOLOv5s/m/l/x)                    |
| NMS IoU threshold        | Determines which overlapping boxes are kept                   |
| Objectness threshold     | Minimum confidence for predicted box                          |
| Data augmentations       | Mosaic, flips, color jitter — improves robustness             |

---

## 5. Experimental Design
### Baseline
- Pretrained YOLOv5s on COCO
- Fine-tuned on MAFA + synthetic data
### Model Iterations

| Version | Change                         | Reason                          |
| ------- | ------------------------------ | ------------------------------- |
| v1      | Baseline pretrained YOLOv5s    | Establish benchmark             |
| v2      | Add synthetic dataset          | Improve mask variation coverage |
| v3      | Optimize anchor box dimensions | Boost detection performance     |
| v4      | Pruned model for edge          | Fit within Jetson/Triton limits |
| v5      | Quantized + ONNX export        | Edge deployment optimization    |

## 6. Training Configuration

| Item              | Setting                      |
| ----------------- | ---------------------------- |
| Optimizer         | SGD with momentum            |
| Learning Rate     | One-cycle LR scheduler       |
| Batch Size        | 16                           |
| Epochs            | 100                          |
| Loss Functions    | GIoU Loss, BCE, CE Loss      |
| Early Stopping    | mAP@0.5:0.95 stagnation      |
| Framework         | PyTorch + Ultralytics YOLOv5 |
| Training Platform | Azure ML + GPU compute       |

## 7. Metrics and Evaluation
### Training Metrics
- `box_loss`, `obj_loss`, `cls_loss`
### Evaluation Metrics

| Metric       | Meaning                              |
| ------------ | ------------------------------------ |
| mAP@0.5      | Localization + detection (IoU ≥ 0.5) |
| mAP@0.5:0.95 | Stricter detection (COCO-style)      |
| Precision    | True positive ratio                  |
| Recall       | Coverage of actual positives         |
| FPS (Edge)   | Real-time readiness check            |

## 8. Edge Deployment
### Edge Deployment
- Containerized inference service on **Jetson/Triton devices**
- Deployed via **K3s lightweight Kubernetes** cluster
- Connected to **Azure Arc** for centralized monitoring, updates, and telemetry
- Multi-tenant support and real-time video ingestion from **customer RTSP/ONVIF cameras**

## 9. Risk Mitigation

| Risk                          | Mitigation Strategy                         |
| ----------------------------- | ------------------------------------------- |
| Real-time latency >500ms      | Model pruning + quantization                |
| Unbalanced dataset            | Synthetic data generation + class weights   |
| Privacy & compliance          | Face anonymization + secure labeling        |
| Drift due to new environments | Scheduled retraining with customer feedback |

## 10. Future Enhancements
- Multi-class PPE detection (hard hats, safety vests)
- Transformer-based detection models (YOLOv8n, DETR variants)
- Self-supervised adaptation at edge
- Federated learning for on-device model updates
