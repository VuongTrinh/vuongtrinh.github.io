This project uses **Alternating Least Squares (ALS)** for collaborative filtering, leveraging **Azure Machine Learning** for scalable training, evaluation, and deployment. A hybrid approach handles both warm-start and cold-start recommendation scenarios.

## Model: ALS (Alternating Least Squares)

ALS is a matrix factorization algorithm that learns latent features for users and items based on implicit interactions (e.g., views, cart additions, purchases). The interaction matrix is weighted to reflect user engagement intensity.

### Event Weighting (Implicit Feedback)

| Event Type        | Weight |
| -----------       | ------ |
| View              | 1      |
| Add to Cart       | 3      |
| Purchase          | 5      |

These weights are applied in **Azure Stream Analytics**, before storing events in **Azure Data Lake Storage (ADLS)** in Parquet format.

## Training Workflow

1. **Data Aggregation**
   - Synapse Spark jobs filter and aggregate tenant-specific interactions from ADLS.
   - Only tenants with sufficient interaction volume are included in ALS training.

2. **Model Training via Azure ML**
   - For each tenant, a job is submitted to Azure ML via its SDK.
   - Azure ML runs ALS training code (via PySpark or MLflow) using Spark-compatible compute.
   - Model metrics are logged and used for evaluation.

3. **Model Registry**
   - Each ALS model (per tenant) is versioned and stored in the **Azure ML Model Registry**.
   - Metadata includes tenant ID, training date, evaluation metrics, and model type.

4. **Model Promotion & Evaluation**
After training, models are evaluated using the following metrics:

| Metric                              | Description                                                 |
| -----------------------------       | ----------------------------------------------------------- |
| RMSE (Root Mean Square Error)       | Measures accuracy of predicted interaction scores           |
| Mean Average Precision (MAP)        | Evaluates ranking quality of top-N recommendations          |
| Coverage                            | Measures diversity and item distribution in recommendations |

Promotion logic is as follows:

- Models with acceptable RMSE and high MAP are promoted.
- The latest promoted model’s **latent factors (user/item vectors)** are exported and stored in **Azure Table Storage** (flattened, key-based lookup)

5. **Serving via Redis**
   - Promoted model vectors are pushed to **Azure Redis Cache** under tenant-specific namespaces.
   - The application queries Redis for real-time recommendations.

## Model Parallelism & Scalability
- A pool of parallel training jobs (e.g., max 100 concurrent jobs) is maintained to prevent compute overcommitment.
- Tenants are processed in batches based on priority or data availability.

| Feature                 | Strategy                                  |
| -----------------       | ----------------------------------------- |
| Job Distribution        | Batched training via Azure ML SDK         |
| Compute Isolation       | Auto-scale Azure ML compute clusters      |
| Model Reuse             | Warm-start via previous model version     |
| Failover Handling       | Retry logic + fallback to last good model |

## Cold Start Strategy

Tenants or users without sufficient interaction data are served using **vector similarity search**. This uses Lucene-style indexing based on item metadata (category, brand, etc.).

When user data becomes sufficient, the system automatically switches to ALS-based personalized recommendations.

## Security
- Azure ML uses **Managed Identity** to securely access:
  - ADLS for training data
  - Table Storage for model output
- SAS tokens are issued only for specific write operations during feedback ingestion.
