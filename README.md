<h1 align='center'>Muzer</h1>

## Table of contents

1. Clone the repository:
   ```bash
   git clone https://github.com/code100x/muzer.git
   ```
2. Navigate to the project directory:

   ```bash
   cd muzer
   ```

3. Create a `.env` file based on the `.env.example` file and configure the `DATABASE_URL` with your postgreSQL connection string and NEXT_AUTH = by running command in your terminal `openssl rand -base64 32`

4. Install dependencies:
   ```bash
   npm install
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev init
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

We welcome contributions from the community! To contribute to CMS, follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/fooBar`).
3. Make your changes and commit them (`git commit -am 'Add some fooBar'`).
   > Make sure to lint and format your code before commiting
   >
   > - `npm run lint:check` to check for lint errors
   > - `npm run lint:fix` to fix lint errors
   > - `npm run format:check` to format the code
   > - `npm run format:fix` to fix the formatting
4. Push to the branch (`git push origin feature/fooBar`).
5. Create a new Pull Request.

For major changes, please open an issue first to discuss what you would like to change.

Read our [contribution guidelines](./CONTRIBUTING.md) for more details.

## Contributors

<a href="https://github.com/code100x/muzer/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=code100x/muzer&max=400&columns=20" />
</a>
