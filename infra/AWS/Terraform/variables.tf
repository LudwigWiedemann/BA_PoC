variable "region" {
  type        = string
  default     = "eu-central-1"
}

variable "key_name" {
  description = "SSH Key Pair Name"
  type        = string
  default     = "aws_wireguard-key"
}

variable "gcp_pods_secondary_range" {
  description = "Secondary pod CIDR range of the GCP GKE cluster"
  type        = string
  default     = "10.172.0.0/14"
}

variable "gcp_wg_public_ip" {
  description = "Public IP of the GCP WireGuard gateway"
  type        = string
}