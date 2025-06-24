# Model Development and Experimental Design – Smart Workplace (Occupant Count Estimation)

## 1. Business Problem

Design a machine learning model that accurately estimates the number of occupants in a workspace using sensor data. The model should enable smart control of HVAC and lighting systems based on real-time and predicted occupancy.

---

## 2. Objective

- Predict the **occupant count** (regression task) from environmental sensor data (temperature, humidity, light, CO₂, sound, etc.)
- Prioritize **low-latency inference**, **accuracy**, and **explainability** for operational deployment in Azure IoT Edge environment.

---

## 3. Target Variable

- **Occupant Count**: A numerical variable indicating how many people are present in the room.

---

## 4. Evaluation Metrics

| Metric         | Reason                                                   |
|----------------|----------------------------------------------------------|
| MAE (Mean Absolute Error) | Easy to interpret in number-of-people units. |
| RMSE (Root Mean Squared Error) | Penalizes large errors more. Helps avoid underestimation/overestimation. |
| R² Score       | Indicates the proportion of variance explained.          |

---

## 5. Decision Criteria

- **MAE ≤ 1.5** is acceptable for real-time estimation.
- **RMSE ≤ 2.0** preferred for safety-critical automation.
- **Inference latency ≤ 150ms** in Edge containerized environment.

---

## 6. Candidate Features

- Temperature, Humidity, Light, CO₂, Sound, Motion
- Time of Day (encoded as cyclical features)
- Room ID / Room Size (optional if multiple rooms)

---

## 7. Preprocessing Variants

| Variant Code | Technique                        | Notes                         |
|--------------|----------------------------------|-------------------------------|
| A1           | Raw normalized features          | MinMax or Standard scaling    |
| A2           | PCA (retain 95% variance)        | Reduce dimensionality         |
| A3           | LDA (if occupancy binned)        | Semi-supervised approach      |
| A4           | Feature Selection (e.g., SHAP)   | Keep top N features           |

---

## 8. Candidate Models

| Model Code | Model Type              | Notes                                  |
|------------|-------------------------|----------------------------------------|
| M1         | Linear Regression       | Baseline model                         |
| M2         | Decision Tree Regressor| Captures non-linear relationships      |
| M3         | Random Forest Regressor| Ensemble, interpretable with SHAP      |
| M4         | XGBoost Regressor      | Handles multicollinearity, robust      |
| M5         | LSTM Neural Network    | For future time-window estimation      |

---

## 9. Experiment Matrix

| ID  | Features | Model | Notes                              |
|-----|----------|--------|------------------------------------|
| E1  | A1       | M1     | Baseline performance               |
| E2  | A1       | M3     | Interpretable, strong accuracy     |
| E3  | A2       | M4     | Lower dimensions, fast inference   |
| E4  | A3       | M2     | Test if LDA improves trees         |
| E5  | A4       | M5     | Time series experiment             |

---

## 10. Hyperparameter Tuning

- Grid search for M1–M4
- Random search or Optuna for M5 (LSTM)
- Evaluation via K-Fold cross-validation (k=5)

---

## 11. Experiment Tracking & Reproducibility

- **Tool**: MLflow Tracking
- **Logged artifacts**:
  - Preprocessing version
  - Model type & parameters
  - Evaluation metrics
  - Git SHA and notebook hash
- **Version Control**: Git + Azure DevOps CI/CD pipelines

---

## 12. Model Registry & Deployment

- **Registry**: MLflow Model Registry (Staging → Production)
- **Model Packaging**: MLflow pyfunc or ONNX (if required by edge)
- **Deployment Target**:
  - Real-time inference: Azure IoT Edge module
  - Batch or scheduled inference: Databricks Job

---

## 13. Final Decision Strategy

- Shortlist top 2 models based on MAE + latency trade-off
- Evaluate on a hold-out month of IoT telemetry
- Run pilot deployment in lab environment before full rollout

---
