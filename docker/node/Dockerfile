FROM node:23-bookworm

RUN apt-get update && \
    apt-get install -y p7zip-full && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

