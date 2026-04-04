variable "project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "azure-poc-483517"
}

variable "region" {
  type        = string
  default     = "europe-west1"
}

variable "gcp_service_account_email" {
  type        = string
  description = "Service Account used by GitHub Actions and GKE nodes"
  default = "github-deployer@azure-poc-483517.iam.gserviceaccount.com"
}