output "gke_endpoint" {
  value     = google_container_cluster.gke.endpoint
  sensitive = true
}

output "gke_cluster_name" {
  value = google_container_cluster.gke.name
}

output "frontend_bucket_name" {
  value = google_storage_bucket.frontend.name
}