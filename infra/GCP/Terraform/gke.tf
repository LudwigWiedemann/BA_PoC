resource "google_container_cluster" "gke" {
  name     = "gcp-managed-kubernetes"
  location = var.region

  deletion_protection = false

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  remove_default_node_pool = true
  initial_node_count       = 1

  node_config {
    disk_size_gb = 20           # Default is 100GB; lowering this prevents the quota error
    disk_type    = "pd-standard" # Use HDD (standard) instead of SSD to use a different quota
  }

  networking_mode = "VPC_NATIVE"

  ip_allocation_policy {}
}

resource "google_container_node_pool" "default" {
  name       = "default-pool"
  location   = var.region
  cluster    = google_container_cluster.gke.name
  node_count = 2

  node_config {
    machine_type = "e2-small"
    disk_type = "pd-standard"
    disk_size_gb = 20
    service_account = var.gcp_service_account_email

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}