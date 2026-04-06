module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "aws-managed-kubernetes"
  cluster_version = "1.30"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 2
      desired_size = 2

      instance_types = ["t3.small"]
      capacity_type  = "ON_DEMAND"
    }
  }

  enable_irsa = true

  enable_cluster_creator_admin_permissions = true

  tags = {
    Project = "aws-baseline"
  }
}

resource "aws_security_group_rule" "allow_cockroach_from_wg" {
  type              = "ingress"
  from_port         = 26257
  to_port           = 26257
  protocol          = "tcp"

  security_group_id = module.eks.node_security_group_id

  cidr_blocks       = [
    "10.0.0.0/16",
    "10.20.0.0/16",
    "10.255.0.0/30"
  ]

  description       = "Allow CockroachDB from WireGuard Gateway"
}