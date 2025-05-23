FROM node:22.12.0 AS base

# Define build arguments
ARG USER_ID
ARG GROUP_ID

# Define environment variables
ENV USER_ID=$USER_ID
ENV GROUP_ID=$GROUP_ID
RUN userdel -r node

# Set user and group of working directory
RUN if [ ! $(getent group "${GROUP_ID}") ]; then \
	addgroup --gid ${GROUP_ID} node; \
	fi
RUN adduser --disabled-password --gecos '' --uid ${USER_ID} --gid ${GROUP_ID} next
RUN mkdir -p /home/next/app/ && chown -R ${USER_ID}:${GROUP_ID} /home/next/app/

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.

WORKDIR /home/next/app/

USER ${USER_ID}:${GROUP_ID}