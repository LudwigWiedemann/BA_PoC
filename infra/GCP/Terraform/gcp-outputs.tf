
output "gke_cluster_name" {
  value = google_container_cluster.gke.name
}

output "gcp_frontend_bucket_name" {
  value = google_storage_bucket.frontend.name
}

output "ingress_ip" {
  description = "Externe IP des NGINX Ingress Load Balancers"
  value       = data.kubernetes_service.nginx_ingress.status[0].load_balancer[0].ingress[0].ip
  sensitive   = false
}

output "wg_gateway_public_ip" {
  value = google_compute_instance.wg_gateway.network_interface[0].access_config[0].nat_ip
}

output "wg_gateway_private_ip" {
  value = google_compute_instance.wg_gateway.network_interface[0].network_ip
}