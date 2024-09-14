# cotton_yield_prediction

This project focuses on the development of a website designed to empower farmers with data-driven insights into their cotton yield. By leveraging the power of machine learning (ML) and satellite imagery, users can gain valuable predictions about their harvests.

**Functionality:**

1. **Interactive Farm Marking:** Users can conveniently mark the location of their farm directly on a map.
2. **Satellite Image Retrieval:** The backend seamlessly retrieves historical satellite images specific to the marked farm location.
3. **ML-Powered Yield Prediction:** A robust ML pipeline analyzes the retrieved satellite imagery, ultimately generating a predicted cotton yield for the farm.

**Microservice Architecture:**

The project adopts a microservice architecture for enhanced maintainability and scalability. Each essential functionality resides within a dedicated folder:

- **data_manager:** Efficiently handles data storage and retrieval tasks.
- **data_fetcher:** Meticulously fetches relevant historical satellite images.
- **ml_analytics:** Encompasses the core ML model for analyzing imagery and predicting yield.
- **job_runner:** Orchestrates the execution of the entire workflow, ensuring seamless operation.
