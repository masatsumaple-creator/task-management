variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "my_ip_cidr" {
  type        = string
  description = "アクセスを許可する自分のグローバルIP(例: 203.0.113.5/32)"
}

variable "budget_email" {
  type        = string
  description = "予算超過の通知先メールアドレス"
}

variable "repo_url" {
  type    = string
  default = "https://github.com/masatsumaple-creator/task-management.git"
}

variable "repo_branch" {
  type    = string
  default = "main"
}
