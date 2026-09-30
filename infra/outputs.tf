output "app_url" {
  value = "http://${aws_eip.app.public_ip}"
}

output "instance_id" {
  value       = aws_instance.app.id
  description = "aws ssm start-session --target <この値> でログインできる"
}

output "rds_endpoint" {
  value       = aws_db_instance.app.address
  description = "EC2上からpsql等で接続する際のホスト名"
}
