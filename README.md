# cotton_yield_prediction

## Introduction

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

## Maintenance

**Branching Strategy:**

* **dev branches:** These branches are used for active development. Each microservice will have its own dev branch, e.g., `dev_data_fetcher` for the `data_fetcher` microservice.
* **main branch:** This branch represents the stable state of the codebase. Only merged and tested code from dev branches should be merged into the main branch.

**Code Review and Merging:**

* Before merging any code into the main branch, ensure it has been thoroughly reviewed by at least one other team member.
* Use a pull request or merge request process to facilitate code review and discussion.

**Testing:**

* Implement a comprehensive testing strategy, including unit tests, integration tests, and end-to-end tests.
* Regularly run tests to catch and fix issues early in the development process.

**Documentation:**

* Maintain clear and up-to-date documentation for all components of the project.
* Include instructions for setting up the development environment, running the project, and contributing to the codebase.


**Code Quality:**

* Adhere to coding standards and conventions to ensure code readability and maintainability.
* Use tools like linters and formatters to automatically enforce coding standards.
