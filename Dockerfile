# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set build-time arguments for environment variables
# You might need to pass these during the docker build command, e.g.,
# docker build --build-arg NEXT_PUBLIC_APP_URL=http://example.com -t my-app .
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
# Add other build-time environment variables needed by `next build` here
# ARG ANOTHER_ENV_VAR
# ENV ANOTHER_ENV_VAR=$ANOTHER_ENV_VAR

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
# Expose the port the app runs on
EXPOSE 3000

# Set runtime arguments for environment variables
# You might need to pass these during the docker run command, e.g.,
# docker run -p 3000:3000 -e NEXT_PUBLIC_APP_URL=http://example.com my-app
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
# Add other runtime environment variables needed by the application here
# ARG ANOTHER_RUNTIME_ENV_VAR
# ENV ANOTHER_RUNTIME_ENV_VAR=$ANOTHER_RUNTIME_ENV_VAR

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
#COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
#COPY --from=builder /app/node_modules ./node_modules
#COPY --from=builder /app/package.json ./package.json
#COPY --from=builder /app/public ./public # Copy public assets if needed
# Copy next.config.ts if it exists and is needed at runtime
#COPY --from=builder /app/next.config.ts ./next.config.ts

# Switch to the non-root user
USER nextjs

# Command to run the application
CMD ["npm", "start"] 
