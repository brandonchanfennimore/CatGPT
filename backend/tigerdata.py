import asyncpg
import asyncio
import os

CONNECTION = os.getenv("CONNECTION_STRING")


async def main():
    conn = await asyncpg.connect(CONNECTION)
    extensions = await conn.fetch("select extname, extversion from pg_extension")
    for extension in extensions:
        print(extension)
    await conn.close()

asyncio.run(main())