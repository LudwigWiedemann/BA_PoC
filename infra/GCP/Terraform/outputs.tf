
output "gke_cluster_name" {
  value = google_container_cluster.gke.name
}

output "frontend_bucket_name" {
  value = google_storage_bucket.frontend.name
}

output "ingress_ip" {
  description = "Externe IP des NGINX Ingress Load Balancers"
  value       = data.kubernetes_service.nginx_ingress.status[0].load_balancer[0].ingress[0].ip
  sensitive   = false
}