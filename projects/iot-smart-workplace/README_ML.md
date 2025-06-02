The project leverages a rich dataset of approximately 20,000 data points gathered from tenant-specific LoRaWAN sensors monitoring environmental conditions and occupancy patterns.

- **Exploratory Data Analysis (EDA)** was performed to evaluate missing data patterns, seasonal fluctuations, sensor correlation heatmaps, and anomaly detection. This provided a statistical foundation for downstream feature design and model strategy.

- **Feature engineering** introduced domain-informed transformations such as **rolling window aggregates** (mean, std, delta over past 5- and 15-minute intervals), **hour-of-day encodings**, and **device type embeddings**.

- **Dimensionality reduction** applied **Linear Discriminant Analysis (LDA)** bringing features from ~25 dimensions down to 5, with >85% variance retention.

- Baseline models including **Linear Regression** (RMSE ~5.8, MAE ~4.3), **Decision Trees** (RMSE ~5.1, MAE ~3.9), and **K-Nearest Neighbors (KNN)** (RMSE ~5.0, MAE ~3.8) are initially developed to establish performance benchmarks quickly. These interpretable models provide valuable insights into the predictive power of the engineered features.

- Advanced models are deployed: **XGBoost** (RMSE ~3.9, MAE ~2.8) captures complex, non-linear feature interactions specific to each tenant, while a global **Long Short-Term Memory (LSTM)** neural network (RMSE ~3.5, MAE ~2.5) exploits temporal dependencies across the multi-tenant dataset for improved occupant forecasting.

- **Model validation** is achieved through **10-fold cross-validation (k=10)**, balancing bias and variance effectively on the 20,000-sample dataset. This technique ensures robust performance estimates and minimizes overfitting risks.

- **Hyperparameter tuning** is conducted using MLflow’s experiment tracking capabilities. Example hyperparameters tuned include:

  - For **XGBoost**:
    - `max_depth`: 3 to 10 (optimal found: 6)
    - `learning_rate`: 0.01 to 0.3 (optimal found: 0.1)
    - `n_estimators`: 100 to 500 (optimal found: 250)
    - `subsample`: 0.6 to 1.0 (optimal found: 0.8)
  - For **LSTM**:
    - Number of layers: 1 to 3 (optimal found: 2)
    - Number of units per layer: 50 to 200 (optimal found: 128)
    - Dropout rate: 0.1 to 0.5 (optimal found: 0.3)
    - Learning rate: 0.0001 to 0.01 (optimal found: 0.001)
    - Batch size: 32 to 128 (optimal found: 64)

- **MLOps with Databricks & MLflow**: Implemented full-cycle MLOps practices using Databricks and MLflow—including experiment tracking, model registry, and pipeline automation with Delta Live Tables and Databricks Workflows. Both global LSTM models and tenant-specific XGBoost models are trained and served within Databricks. Inference is performed using Pandas UDFs with dynamic model selection based on `tenant_id`, enabling scalable, production-grade predictions across the multi-tenant environment.
