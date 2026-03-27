output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}