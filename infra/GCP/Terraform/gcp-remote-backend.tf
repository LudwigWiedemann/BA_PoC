terraform {
  backend "gcs" {
    bucket  = "gcp-terraform-state-azure-poc-483517"
    prefix  = "gcp/gke"
  }
}