from cloudflare_client import r2, BUCKET_NAME

response = r2.head_bucket(
    Bucket=BUCKET_NAME
)

print("Connected to Cloudflare R2!")