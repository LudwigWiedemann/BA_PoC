resource "google_container_cluster" "gke" {
  name     = "gcp-managed-kubernetes"
  location = var.region

  deletion_protection = false

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  remove_default_node_pool = true
  initial_node_count       = 1

  node_config {
    service_account = var.gcp_service_account_email
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

resource "google_compute_firewall" "allow_cockroach_nodeport_from_aws_wg" {
  name    = "allow-cockroach-nodeport-from-aws-wg"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["32057"]
  }

  source_ranges = [
    "10.0.0.0/16",
    "10.255.0.0/30"
  ]
}