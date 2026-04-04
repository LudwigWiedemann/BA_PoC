resource "google_storage_bucket" "frontend" {
  name     = "gcp-baseline-bachelor-frontend"
  location = "EU"

  # Erlaubt das Löschen des Buckets, auch wenn noch Dateien darin sind
  force_destroy = true 


  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_binding" "public" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"

  members = [
    "allUsers"
  ]
}

output "frontend_bucket_name" {
  value = google_storage_bucket.frontend.name
}

output "frontend_website_url" {
  value = "http://storage.googleapis.com/${google_storage_bucket.frontend.name}/index.html"
}