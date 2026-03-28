terraform {
  backend "s3" {
    bucket         = "aws-poc-terraform-state-065875800629"
    key            = "aws/eks/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}