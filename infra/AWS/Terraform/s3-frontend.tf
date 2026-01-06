resource "aws_s3_bucket" "frontend" {
  bucket        = "aws-baseline-bachelor-frontend-eu-central-1"
  force_destroy = true # löscht auch Dateien beim terraform destroy (für PoC praktisch)

  tags = {
    Project = "aws-baseline"
    App     = "frontend"
  }
}

# Statisches Website-Hosting aktivieren (Index-Datei)
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # SPA: bei 404 trotzdem index.html liefern
  }
}

# Public Access für Website erlauben (nur für Demo/PoC okay)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket-Policy: öffentliche GETs auf Objekte erlauben
data "aws_iam_policy_document" "frontend_bucket_policy" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.frontend.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket_policy.json
}

# Praktischer Output für Terraform
output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "frontend_website_endpoint" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}