resource "aws_security_group" "wg_gateway_sg" {
  name        = "wg-gateway-sg"
  description = "WireGuard Gateway SG"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "WireGuard"
    from_port   = 51820
    to_port     = 51820
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "ICMP from GCP"
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = [
      "10.20.0.0/16"
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "wg_gateway" {
  ami = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  subnet_id     = module.vpc.public_subnets[0]

  vpc_security_group_ids = [aws_security_group.wg_gateway_sg.id]

  associate_public_ip_address = true

  key_name = var.key_name

  source_dest_check = false

  tags = {
    Name = "wireguard-gateway"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true

  owners = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_route" "to_gcp" {
  count                  = length(module.vpc.private_route_table_ids)
  route_table_id         = module.vpc.private_route_table_ids[count.index]
  destination_cidr_block = "10.20.0.0/16"
  network_interface_id   = aws_instance.wg_gateway.primary_network_interface_id
}

resource "aws_route" "to_gcp_wg_net" {
  count                  = length(module.vpc.private_route_table_ids)
  route_table_id         = module.vpc.private_route_table_ids[count.index]
  destination_cidr_block = "10.255.0.0/30"
  network_interface_id   = aws_instance.wg_gateway.primary_network_interface_id
}

resource "aws_route" "to_gcp_pods" {
  count                  = length(module.vpc.private_route_table_ids)
  route_table_id         = module.vpc.private_route_table_ids[count.index]
  destination_cidr_block = "10.56.0.0/14"
  network_interface_id   = aws_instance.wg_gateway.primary_network_interface_id
}