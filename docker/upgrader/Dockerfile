FROM hlohaus789/g4f:latest-slim

USER root

RUN apt-get update && \
    apt-get install -y binutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
