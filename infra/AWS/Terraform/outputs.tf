output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "ingress_hostname" {
  description = "Hostname des AWS Load Balancers"
  value       = data.kubernetes_service.nginx_ingress.status[0].load_balancer[0].ingress[0].hostname
}