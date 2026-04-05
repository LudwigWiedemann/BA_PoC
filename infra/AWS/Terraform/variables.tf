variable "region" {
  type        = string
  default     = "eu-central-1"
}

variable "key_name" {
  description = "SSH Key Pair Name"
  type        = string
  default     = "aws_wireguard-key"
}