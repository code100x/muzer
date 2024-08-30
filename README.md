<h1 align='center'>Muzer</h1>

## Table of contents


1. Clone the repository:
   ```bash
   git clone https://github.com/code100x/muzer
   ```
2. Navigate to the project directory:
   ```bash
   cd muzer
   ```
3. Run the following command to start the application:
   ```bash
   docker volume create postgres-data # (optional) run this command if you face any mount volume / volume not exist error
   docker-compose up -d
   ```

### Without Docker

1. clone the repository:
   ```bash
   git clone https://github.com/code100x/muzer
   ```
2. Navigate to the project directory:
   ```bash
   cd muzer
   ```
3. (optional) Start a PostgreSQL database using Docker:
   ```bash
   docker run -d \
       --name muzer-db \
       -e POSTGRES_USER=myuser \
       -e POSTGRES_PASSWORD=mypassword \
       -e POSTGRES_DB=mydatabase \
       -p 5432:5432 \
       postgres
   ```
   based on this command the connection url will be
   ```
   DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase?schema=public
   ```
4. Create a `.env` file based on the `.env.example` file and configure the `DATABASE_URL` with your postgreSQL connection string.
5. Install dependencies:
   ```bash
   pnpm install
   ```
6. Run database migrations:
   ```bash
   pnpm run prisma:migrate
   ```
7. Start the development server:
   ```bash
   pnpm run dev
   ```
## Usage

1. Access the aplication in your browser at `http://localhost:3000`
