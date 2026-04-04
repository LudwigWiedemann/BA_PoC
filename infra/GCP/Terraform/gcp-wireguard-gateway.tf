resource "google_compute_address" "wg_ip" {
  name   = "wireguard-gateway-ip"
  region = var.region
}

resource "google_compute_instance" "wg_gateway" {
  name         = "wireguard-gateway"
  machine_type = "e2-micro"
  zone         = "${var.region}-a"

  can_ip_forward = true

  tags = ["wireguard-gateway"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.subnet.id

    access_config {
      nat_ip = google_compute_address.wg_ip.address
    }
  }
}

resource "google_compute_firewall" "wg_ssh" {
  name    = "allow-wireguard-ssh"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["wireguard-gateway"]
}

resource "google_compute_firewall" "wg_udp" {
  name    = "allow-wireguard-udp"
  network = google_compute_network.vpc.name

  allow {
    protocol = "udp"
    ports    = ["51820"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["wireguard-gateway"]
}