FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and explicitly add Rollup's musl binary.
# npm can skip this optional package on Alpine, which breaks Vite at runtime.
RUN npm install --include=optional && \
    npm install --no-save @rollup/rollup-linux-x64-musl@$(node -p "require('./node_modules/rollup/package.json').optionalDependencies['@rollup/rollup-linux-x64-musl']")

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"]
